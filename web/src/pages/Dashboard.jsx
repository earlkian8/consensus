import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import {
    AiInsightsPage,
    AuditPage,
    PlanningPage,
    ProductsPage,
    SessionPage,
} from "@/pages";
import EndSessionModal from "@/components/modals/EndSessionModal";
import NewPlanModal from "@/components/modals/NewPlanModal";
import { SileoToastProvider, fireToast } from "@/components/sileo/SileoToast";
import {
    CONDITIONS,
    DEFAULT_PRODUCTS,
    DISH_TYPES,
    DISPOSITIONS,
    PLAN_COLORS,
    PLAN_LETTERS,
    PRODUCT_CATEGORIES,
} from "@/lib/consensus-data";
import { buildAIResults } from "@/lib/consensus-ai";
import { api } from "@/lib/api";

function Dashboard() {
    const [page, setPage] = useState("products");
    const [products, setProducts] = useState([]);
    const [plans, setPlans] = useState([]);
    const [activePlanId, setActivePlanId] = useState(null);
    const [session, setSession] = useState(null);
    const [newPlanOpen, setNewPlanOpen] = useState(false);
    const [createProductOpen, setCreateProductOpen] = useState(false);
    const [endModalOpen, setEndModalOpen] = useState(false);
    const [newPlanName, setNewPlanName] = useState("");
    const [newPlanEndTime, setNewPlanEndTime] = useState("17:00");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [productDraft, setProductDraft] = useState({
        name: "",
        image: "",
        category: PRODUCT_CATEGORIES[0],
        dish_type: "",
        batch_solid_count: "",
        batch_liquid_volume: "",
        unit_solid: null,
        unit_liquid: null,
        price_per_portion: "",
        notes: "",
    });
    const [auditEntries, setAuditEntries] = useState({});
    const [auditDisposition, setAuditDisposition] = useState(DISPOSITIONS[0]);
    const [auditNotes, setAuditNotes] = useState("");
    const [aiStatus, setAiStatus] = useState("empty");
    const [aiResults, setAiResults] = useState(null);
    const [applyNoteVisible, setApplyNoteVisible] = useState(false);

    const nextProdId = useRef(1);
    const nextPlanId = useRef(1);
    const aiTimerRef = useRef(null);
    const sessionEndRef = useRef(null);

    useEffect(() => {
        api.getProducts()
            .then((data) => {
                setProducts(data.map(mapProduct));
            })
            .catch(() => fireToast("error", { title: "Failed to load products" }));
    }, []);

    const mapProduct = (p) => ({
        id: p.id,
        name: p.name,
        cat: p.category ?? "Main dish",
        dish_type: p.dish_type,
        batch_solid_count: p.batch_solid_count,
        batch_liquid_volume: p.batch_liquid_volume,
        unit_solid: p.unit_solid,
        unit_liquid: p.unit_liquid,
        unit: p.unit_solid || p.unit_liquid || "pieces",
        qty: p.batch_solid_count || p.batch_liquid_volume || 0,
        notes: p.notes || "",
        image: p.picture || "",
        cost: 0,
    });

    const productsById = useMemo(() => {
        const map = new Map();
        products.forEach((product) => map.set(product.id, product));
        return map;
    }, [products]);

    const chartConfig = useMemo(
        () => ({
            planned: {
                label: "Planned",
                colors: { light: ["#1D9E75", "#0F6E56"] },
            },
            excess: {
                label: "Excess",
                colors: { light: ["#D85A30", "#F0997B"] },
            },
        }),
        []
    );

    useEffect(() => {
        return () => {
            if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
            if (sessionEndRef.current) clearTimeout(sessionEndRef.current);
        };
    }, []);

    const gotoPage = (nextPage) => setPage(nextPage);

    const updateProductDraft = (key, value) => {
        setProductDraft((prev) => ({ ...prev, [key]: value }));
    };

    const EMPTY_DRAFT = {
        name: "", image: "", category: PRODUCT_CATEGORIES[0], dish_type: "",
        batch_solid_count: "", batch_liquid_volume: "", unit_solid: null, unit_liquid: null,
        price_per_portion: "", notes: "",
    };

    const openCreateProductModal = () => {
        setProductDraft(EMPTY_DRAFT);
        setCreateProductOpen(true);
    };

    const closeCreateProductModal = () => setCreateProductOpen(false);

    const buildPayload = async (draft, dt) => {
        const defaultSolidUnit = dt === "SOUP_STEW" ? null : dt === "DRY_SCOOPED" ? "scoops" : "pieces";
        const unit_solid = dt === "SOUP_STEW" ? null : (draft.unit_solid || defaultSolidUnit);
        const unit_liquid = (dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP") ? "liters" : null;
        let picture = null;
        if (draft.image && draft.image.startsWith("data:")) {
            const { url } = await api.uploadProductImage(draft.image, draft.name.trim());
            picture = url;
        } else if (draft.image) {
            picture = draft.image;
        }
        return {
            name: draft.name.trim(),
            category: draft.category || PRODUCT_CATEGORIES[0],
            dish_type: dt,
            batch_solid_count: unit_solid ? (Number(draft.batch_solid_count) || null) : null,
            batch_liquid_volume: unit_liquid ? (Number(draft.batch_liquid_volume) || null) : null,
            unit_solid,
            unit_liquid,
            notes: draft.notes.trim() || null,
            picture,
        };
    };

    const addProduct = () => {
        const name = productDraft.name.trim();
        if (!name) {
            fireToast("error", { title: "Product name missing", description: "Add a name before saving a product." });
            return false;
        }
        if (!productDraft.dish_type) {
            fireToast("error", { title: "Dish type required", description: "Select a dish type before saving." });
            return false;
        }
        const dt = productDraft.dish_type;
        // Optimistic product with _saving flag
        const tempId = `temp-${Date.now()}`;
        const unit_solid = dt === "SOUP_STEW" ? null : (productDraft.unit_solid || (dt === "DRY_SCOOPED" ? "scoops" : "pieces"));
        const unit_liquid = (dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP") ? "liters" : null;
        const optimistic = {
            id: tempId,
            name,
            cat: productDraft.category || PRODUCT_CATEGORIES[0],
            dish_type: dt,
            batch_solid_count: Number(productDraft.batch_solid_count) || null,
            batch_liquid_volume: Number(productDraft.batch_liquid_volume) || null,
            unit_solid,
            unit_liquid,
            unit: unit_solid || unit_liquid || "pieces",
            qty: Number(productDraft.batch_solid_count) || Number(productDraft.batch_liquid_volume) || 0,
            notes: productDraft.notes.trim() || "",
            image: productDraft.image || "",
            cost: 0,
            _saving: true,
        };
        setProducts((prev) => [...prev, optimistic]);
        setProductDraft(EMPTY_DRAFT);
        return buildPayload({ ...productDraft, name }, dt)
            .then((payload) => api.createProduct(payload))
            .then((p) => {
                setProducts((prev) => prev.map((prod) => prod.id === tempId ? mapProduct(p) : prod));
                fireToast("success", { title: "Product added", description: `${name} is ready for planning.` });
            })
            .catch((err) => {
                setProducts((prev) => prev.filter((prod) => prod.id !== tempId));
                fireToast("error", { title: "Failed to create product", description: err.message });
            });
    };

    const deleteProduct = (id) => {
        api.deleteProduct(id)
            .then(() => {
                setProducts((prev) => prev.filter((p) => p.id !== id));
                setPlans((prev) =>
                    prev.map((plan) => ({ ...plan, items: plan.items.filter((item) => item.productId !== id) }))
                );
                fireToast("success", { title: "Product removed", description: "Removed from catalog and any linked plans." });
            })
            .catch((err) => fireToast("error", { title: "Failed to delete product", description: err.message }));
    };

    const editProduct = (id) => {
        const product = productsById.get(id);
        if (!product) return;
        setProductDraft({
            name: product.name,
            image: product.image || "",
            category: product.cat || PRODUCT_CATEGORIES[0],
            dish_type: product.dish_type || "",
            batch_solid_count: product.batch_solid_count ? String(product.batch_solid_count) : "",
            batch_liquid_volume: product.batch_liquid_volume ? String(product.batch_liquid_volume) : "",
            unit_solid: product.unit_solid || null,
            unit_liquid: product.unit_liquid || null,
            price_per_portion: product.cost ? String(product.cost) : "",
            notes: product.notes || "",
            _editId: id,
        });
        setCreateProductOpen(true);
    };

    const saveEditedProduct = () => {
        const name = productDraft.name.trim();
        if (!name || !productDraft.dish_type) return false;
        const dt = productDraft.dish_type;
        const editId = productDraft._editId;
        // Optimistic update
        const unit_solid = dt === "SOUP_STEW" ? null : (productDraft.unit_solid || (dt === "DRY_SCOOPED" ? "scoops" : "pieces"));
        const unit_liquid = (dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP") ? "liters" : null;
        const optimistic = {
            id: editId,
            name,
            cat: productDraft.category || PRODUCT_CATEGORIES[0],
            dish_type: dt,
            batch_solid_count: Number(productDraft.batch_solid_count) || null,
            batch_liquid_volume: Number(productDraft.batch_liquid_volume) || null,
            unit_solid,
            unit_liquid,
            unit: unit_solid || unit_liquid || "pieces",
            qty: Number(productDraft.batch_solid_count) || Number(productDraft.batch_liquid_volume) || 0,
            notes: productDraft.notes.trim() || "",
            image: productDraft.image || "",
            cost: 0,
            _saving: true,
        };
        setProducts((prev) => prev.map((p) => p.id === editId ? optimistic : p));
        setProductDraft(EMPTY_DRAFT);
        return buildPayload({ ...productDraft, name }, dt)
            .then((payload) => api.updateProduct(editId, payload))
            .then((p) => {
                setProducts((prev) => prev.map((prod) => prod.id === editId ? mapProduct(p) : prod));
                fireToast("success", { title: "Product updated", description: `${name} has been updated.` });
            })
            .catch((err) => {
                fireToast("error", { title: "Failed to update product", description: err.message });
            });
    };

    const openNewPlanModal = () => {
        if (products.length === 0) {
            gotoPage("products");
            fireToast("info", { title: "Add products first", description: "Create products before building a plan." });
            return;
        }
        const nextIndex = plans.length;
        setNewPlanName(`Plan ${PLAN_LETTERS[nextIndex % PLAN_LETTERS.length]}`);
        setNewPlanEndTime("17:00");
        setSelectedProductIds([]);
        setNewPlanOpen(true);
    };

    const toggleProductSelect = (id) => {
        setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
    };

    const toggleSelectAll = () => {
        const allSelected = products.length > 0 && selectedProductIds.length === products.length;
        setSelectedProductIds(allSelected ? [] : products.map((product) => product.id));
    };

    const createPlan = () => {
        if (selectedProductIds.length === 0) {
            fireToast("error", { title: "Select at least one product", description: "Pick products to include in the plan." });
            return;
        }
        const name = newPlanName.trim() || `Plan ${PLAN_LETTERS[plans.length % PLAN_LETTERS.length]}`;
        const endTime = newPlanEndTime || "17:00";
        const color = PLAN_COLORS[plans.length % PLAN_COLORS.length];
        const items = selectedProductIds.map((id) => {
            const product = productsById.get(id);
            return {
                productId: id,
                qty: product ? product.qty : 0,
                ...(product?.unit_liquid ? { liquidQty: product.batch_liquid_volume || 0 } : {}),
                aiQty: null,
                aiDir: "same",
                aiHistory: [],
            };
        });

        const newPlan = { id: nextPlanId.current, name, color, endTime, items, sessions: [] };
        nextPlanId.current += 1;
        setPlans((prev) => [...prev, newPlan]);
        setActivePlanId(newPlan.id);
        setNewPlanOpen(false);
        fireToast("success", { title: "Plan created", description: `${name} is ready to run.` });
    };

    const togglePlanBody = (planId) => setActivePlanId((prev) => (prev === planId ? null : planId));

    const updatePlanQty = (planId, productId, value, field = "qty") => {
        setPlans((prev) =>
            prev.map((plan) => {
                if (plan.id !== planId) return plan;
                return {
                    ...plan,
                    items: plan.items.map((item) => (item.productId === productId ? { ...item, [field]: value } : item)),
                };
            })
        );
    };

    const deletePlan = (id) => {
        if (!window.confirm("Delete this plan?")) return;
        setPlans((prev) => prev.filter((plan) => plan.id !== id));
        setActivePlanId((prev) => (prev === id ? null : prev));
        fireToast("success", { title: "Plan deleted", description: "The plan was removed." });
    };

    const createAuditEntries = (items) => {
        const entries = {};
        items.forEach((item) => {
            const product = productsById.get(item.productId);
            if (!product) return;
            entries[product.id] = {
                excessQty: "",
                unit: product.unit,
                condition: CONDITIONS[0],
                ...(product.unit_liquid ? { excessLiquidQty: "", unitLiquid: product.unit_liquid } : {}),
            };
        });
        return entries;
    };

    const scheduleSessionEnd = (endTime, items) => {
        if (sessionEndRef.current) clearTimeout(sessionEndRef.current);
        const delay = Math.max(0, endTime.getTime() - Date.now());
        sessionEndRef.current = setTimeout(() => {
            setSession((prev) => (prev ? { ...prev, status: "ended", endedAt: new Date() } : prev));
            setAuditEntries(createAuditEntries(items));
            sessionEndRef.current = null;
        }, delay);
    };

    const proceedWithPlan = (planId) => {
        const plan = plans.find((entry) => entry.id === planId);
        if (!plan) return;

        const now = new Date();
        const [endHour, endMinute] = plan.endTime.split(":").map(Number);
        const end = new Date(now);
        end.setHours(endHour, endMinute, 0, 0);
        if (end <= now) end.setDate(end.getDate() + 1);

        const sessionItems = plan.items.map((item) => ({ ...item }));
        setSession({
            planId, planName: plan.name, planColor: plan.color, startTime: now, endTime: end, items: sessionItems, status: "active", endedAt: null,
        });
        setAuditEntries({});
        setAuditDisposition(DISPOSITIONS[0]);
        setAuditNotes("");
        setAiStatus("empty");
        setAiResults(null);
        setApplyNoteVisible(false);
        scheduleSessionEnd(end, sessionItems);
        gotoPage("session");
    };

    const endSessionEarly = () => setEndModalOpen(true);

    const confirmEndSession = () => {
        setEndModalOpen(false);
        if (sessionEndRef.current) {
            clearTimeout(sessionEndRef.current);
            sessionEndRef.current = null;
        }
        if (!session) return;
        setSession((prev) => (prev ? { ...prev, status: "ended", endedAt: new Date() } : prev));
        setAuditEntries(createAuditEntries(session.items));
    };

    const updateAuditEntry = (productId, patch, fallbackUnit) => {
        setAuditEntries((prev) => {
            const product = productsById.get(productId);
            const current = prev[productId] || {
                excessQty: "",
                unit: fallbackUnit,
                condition: CONDITIONS[0],
                ...(product?.unit_liquid ? { excessLiquidQty: "", unitLiquid: product.unit_liquid } : {}),
            };
            return { ...prev, [productId]: { ...current, ...patch } };
        });
    };

    const auditStats = useMemo(() => {
        if (!session || session.status !== "ended") return { planned: 0, plannedLiquid: 0, excess: 0, excessLiquid: 0, pct: 0, pctLiquid: 0 };
        let planned = 0, plannedLiquid = 0, excess = 0, excessLiquid = 0;
        session.items.forEach((item) => {
            const product = productsById.get(item.productId);
            if (!product) return;
            planned += item.qty;
            if (product.unit_liquid) {
                plannedLiquid += item.liquidQty ?? product.batch_liquid_volume ?? 0;
            }
            const entry = auditEntries[product.id];
            excess += Number(entry?.excessQty) || 0;
            excessLiquid += Number(entry?.excessLiquidQty) || 0;
        });
        const pct = planned > 0 ? Math.round((excess / planned) * 100) : 0;
        const pctLiquid = plannedLiquid > 0 ? Math.round((excessLiquid / plannedLiquid) * 100) : 0;
        return { planned, plannedLiquid, excess, excessLiquid, pct, pctLiquid };
    }, [session, productsById, auditEntries]);

    const runAI = () => {
        if (!session || session.status !== "ended") return;
        const auditRows = session.items
            .map((item) => {
                const product = productsById.get(item.productId);
                if (!product) return null;
                const entry = auditEntries[product.id] || { excessQty: "", unit: product.unit, condition: CONDITIONS[0] };
                return {
                    productId: product.id, name: product.name, unit: product.unit, planned: item.qty, excess: Number(entry.excessQty) || 0,
                    excUnit: entry.unit || product.unit, condition: entry.condition, cost: product.cost,
                    ...(product.unit_liquid ? { excessLiquid: Number(entry.excessLiquidQty) || 0, unitLiquid: product.unit_liquid, liquidPlanned: product.batch_liquid_volume || 0 } : {}),
                };
            })
            .filter(Boolean);

        gotoPage("ai");
        setAiStatus("loading");
        setAiResults(null);
        setApplyNoteVisible(false);

        if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
        aiTimerRef.current = setTimeout(() => {
            setAiResults(buildAIResults(auditRows));
            setAiStatus("results");
        }, 1800);
    };

    const applyChanges = () => {
        if (!session || !aiResults) return;
        setPlans((prev) =>
            prev.map((plan) => {
                if (plan.id !== session.planId) return plan;
                const items = plan.items.map((item) => {
                    const suggestion = aiResults.suggestions.find((entry) => entry.productId === item.productId);
                    if (!suggestion) return item;
                    const updatedHistory = [...(item.aiHistory || []), suggestion.dir].slice(-10);
                    const updatedItem = { ...item, aiQty: suggestion.newQty, aiDir: suggestion.dir, aiHistory: updatedHistory };
                    if (suggestion.dir !== "same") updatedItem.qty = suggestion.newQty;
                    // Apply liquid quantity change
                    if (suggestion.newLiquidQty !== undefined && suggestion.liquidDir !== "same") {
                        updatedItem.liquidQty = suggestion.newLiquidQty;
                    }
                    return updatedItem;
                });
                return { ...plan, items, sessions: [...plan.sessions, { date: new Date().toISOString(), wastePct: aiResults.wastePct }] };
            })
        );
        setApplyNoteVisible(true);
        fireToast("success", { title: "Plan updated", description: "AI changes saved to the plan." });
    };

    const dismissAI = () => {
        setAiStatus("empty");
        setAiResults(null);
        setApplyNoteVisible(false);
    };

    return (
        <div className="flex min-h-screen bg-background">
            <SileoToastProvider />
            <Sidebar activePage={page} onNavigate={gotoPage} />
            <div className="flex-1 min-w-0">

            <ProductsPage
                active={page === "products"}
                products={products}
                productDraft={productDraft}
                onDraftChange={updateProductDraft}
                onAddProduct={addProduct}
                onEditProduct={editProduct}
                onSaveEditedProduct={saveEditedProduct}
                onDeleteProduct={deleteProduct}
                createProductOpen={createProductOpen}
                onOpenCreateProduct={openCreateProductModal}
                onCloseCreateProduct={closeCreateProductModal}
                onContinue={() => gotoPage("planning")}
            />

            <PlanningPage
                active={page === "planning"}
                products={products}
                plans={plans}
                activePlanId={activePlanId}
                session={session}
                planLetters={PLAN_LETTERS}
                productsById={productsById}
                onOpenNewPlanModal={openNewPlanModal}
                onTogglePlan={togglePlanBody}
                onUpdatePlanQty={updatePlanQty}
                onProceedWithPlan={proceedWithPlan}
                onDeletePlan={deletePlan}
                onGoToProducts={() => gotoPage("products")}
            />

            <SessionPage
                active={page === "session"}
                session={session}
                productsById={productsById}
                onEndSessionEarly={endSessionEarly}
                onGoToPlanning={() => gotoPage("planning")}
                onGoToAudit={() => gotoPage("audit")}
            />

            <AuditPage
                active={page === "audit"}
                session={session}
                productsById={productsById}
                auditEntries={auditEntries}
                auditStats={auditStats}
                dispositions={DISPOSITIONS}
                conditions={CONDITIONS}
                auditDisposition={auditDisposition}
                auditNotes={auditNotes}
                onAuditEntryChange={updateAuditEntry}
                onDispositionChange={setAuditDisposition}
                onNotesChange={setAuditNotes}
                onRunAI={runAI}
                onGoToPlanning={() => gotoPage("planning")}
            />

            <AiInsightsPage
                active={page === "ai"}
                aiStatus={aiStatus}
                aiResults={aiResults}
                session={session}
                chartConfig={chartConfig}
                applyNoteVisible={applyNoteVisible}
                onGoToAudit={() => gotoPage("audit")}
                onApplyChanges={applyChanges}
                onDismissAI={dismissAI}
            />

            <EndSessionModal
                open={endModalOpen}
                onCancel={() => setEndModalOpen(false)}
                onConfirm={confirmEndSession}
            />

            <NewPlanModal
                open={newPlanOpen}
                products={products}
                selectedProductIds={selectedProductIds}
                planName={newPlanName}
                endTime={newPlanEndTime}
                onChangeName={setNewPlanName}
                onChangeEndTime={setNewPlanEndTime}
                onToggleSelectAll={toggleSelectAll}
                onToggleProduct={toggleProductSelect}
                onClose={() => setNewPlanOpen(false)}
                onCreate={createPlan}
            />
            </div>
        </div>
    );
}

export default Dashboard;