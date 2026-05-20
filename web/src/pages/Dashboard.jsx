import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "@/components/layout/Topbar";
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
    DISPOSITIONS,
    PLAN_COLORS,
    PLAN_LETTERS,
    PRODUCT_CATEGORIES,
    PRODUCT_UNITS,
} from "@/lib/consensus-data";
import { buildAIResults } from "@/lib/consensus-ai";

function Dashboard() {
    const [page, setPage] = useState("products");
    const [products, setProducts] = useState(DEFAULT_PRODUCTS);
    const [plans, setPlans] = useState([]);
    const [activePlanId, setActivePlanId] = useState(null);
    const [session, setSession] = useState(null);
    const [timerTick, setTimerTick] = useState(() => Date.now());
    const [newPlanOpen, setNewPlanOpen] = useState(false);
    const [endModalOpen, setEndModalOpen] = useState(false);
    const [newPlanName, setNewPlanName] = useState("");
    const [newPlanEndTime, setNewPlanEndTime] = useState("17:00");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [productDraft, setProductDraft] = useState({
        name: "",
        cat: PRODUCT_CATEGORIES[0],
        qty: "",
        unit: PRODUCT_UNITS[0],
        cost: "",
        notes: "",
    });
    const [auditEntries, setAuditEntries] = useState({});
    const [auditDisposition, setAuditDisposition] = useState(DISPOSITIONS[0]);
    const [auditNotes, setAuditNotes] = useState("");
    const [aiStatus, setAiStatus] = useState("empty");
    const [aiResults, setAiResults] = useState(null);
    const [applyNoteVisible, setApplyNoteVisible] = useState(false);

    const nextProdId = useRef(DEFAULT_PRODUCTS.length + 1);
    const nextPlanId = useRef(1);
    const aiTimerRef = useRef(null);
    const sessionEndRef = useRef(null);

    const productsById = useMemo(() => {
        const map = new Map();
        products.forEach((product) => map.set(product.id, product));
        return map;
    }, [products]);

    const chartConfig = useMemo(
        () => ({
            planned: {
                label: "Planned",
                colors: {
                    light: ["#1D9E75", "#0F6E56"],
                },
            },
            excess: {
                label: "Excess",
                colors: {
                    light: ["#D85A30", "#F0997B"],
                },
            },
        }),
        []
    );

    useEffect(() => {
        if (!session || session.status !== "active") {
            return undefined;
        }

        const interval = setInterval(() => {
            setTimerTick(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [session]);

    useEffect(
        () => () => {
            if (aiTimerRef.current) {
                clearTimeout(aiTimerRef.current);
            }
            if (sessionEndRef.current) {
                clearTimeout(sessionEndRef.current);
            }
        },
        []
    );

    const gotoPage = (nextPage) => {
        setPage(nextPage);
    };

    const updateProductDraft = (key, value) => {
        setProductDraft((prev) => ({ ...prev, [key]: value }));
    };

    const addProduct = () => {
        const name = productDraft.name.trim();
        if (!name) {
            fireToast("error", {
                title: "Product name missing",
                description: "Add a name before saving a product.",
            });
            return;
        }

        const newProduct = {
            id: nextProdId.current,
            name,
            cat: productDraft.cat,
            qty: Number(productDraft.qty) || 10,
            unit: productDraft.unit,
            cost: Number(productDraft.cost) || 0,
            notes: productDraft.notes.trim(),
        };

        nextProdId.current += 1;
        setProducts((prev) => [...prev, newProduct]);
        setProductDraft((prev) => ({
            ...prev,
            name: "",
            qty: "",
            cost: "",
            notes: "",
        }));
        fireToast("success", {
            title: "Product added",
            description: `${name} is ready for planning.`,
        });
    };

    const deleteProduct = (id) => {
        setProducts((prev) => prev.filter((product) => product.id !== id));
        setPlans((prev) =>
            prev.map((plan) => ({
                ...plan,
                items: plan.items.filter((item) => item.productId !== id),
            }))
        );
        fireToast("success", {
            title: "Product removed",
            description: "Removed from catalog and any linked plans.",
        });
    };

    const openNewPlanModal = () => {
        if (products.length === 0) {
            gotoPage("products");
            fireToast("info", {
                title: "Add products first",
                description: "Create products before building a plan.",
            });
            return;
        }

        const nextIndex = plans.length;
        setNewPlanName(`Plan ${PLAN_LETTERS[nextIndex % PLAN_LETTERS.length]}`);
        setNewPlanEndTime("17:00");
        setSelectedProductIds([]);
        setNewPlanOpen(true);
    };

    const toggleProductSelect = (id) => {
        setSelectedProductIds((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const allSelected =
            products.length > 0 && selectedProductIds.length === products.length;
        setSelectedProductIds(allSelected ? [] : products.map((product) => product.id));
    };

    const createPlan = () => {
        if (selectedProductIds.length === 0) {
            fireToast("error", {
                title: "Select at least one product",
                description: "Pick products to include in the plan.",
            });
            return;
        }

        const name =
            newPlanName.trim() ||
            `Plan ${PLAN_LETTERS[plans.length % PLAN_LETTERS.length]}`;
        const endTime = newPlanEndTime || "17:00";
        const color = PLAN_COLORS[plans.length % PLAN_COLORS.length];
        const items = selectedProductIds.map((id) => {
            const product = productsById.get(id);
            return {
                productId: id,
                qty: product ? product.qty : 0,
                aiQty: null,
                aiDir: "same",
                aiHistory: [],
            };
        });

        const newPlan = {
            id: nextPlanId.current,
            name,
            color,
            endTime,
            items,
            sessions: [],
        };

        nextPlanId.current += 1;
        setPlans((prev) => [...prev, newPlan]);
        setActivePlanId(newPlan.id);
        setNewPlanOpen(false);
        fireToast("success", {
            title: "Plan created",
            description: `${name} is ready to run.`,
        });
    };

    const togglePlanBody = (planId) => {
        setActivePlanId((prev) => (prev === planId ? null : planId));
    };

    const updatePlanQty = (planId, productId, value) => {
        setPlans((prev) =>
            prev.map((plan) => {
                if (plan.id !== planId) {
                    return plan;
                }
                return {
                    ...plan,
                    items: plan.items.map((item) =>
                        item.productId === productId ? { ...item, qty: value } : item
                    ),
                };
            })
        );
    };

    const deletePlan = (id) => {
        if (!window.confirm("Delete this plan?")) {
            return;
        }

        setPlans((prev) => prev.filter((plan) => plan.id !== id));
        setActivePlanId((prev) => (prev === id ? null : prev));
        fireToast("success", {
            title: "Plan deleted",
            description: "The plan was removed.",
        });
    };

    const createAuditEntries = (items) => {
        const entries = {};
        items.forEach((item) => {
            const product = productsById.get(item.productId);
            if (!product) {
                return;
            }
            entries[product.id] = {
                excessQty: "",
                unit: product.unit,
                condition: CONDITIONS[0],
            };
        });
        return entries;
    };

    const scheduleSessionEnd = (endTime, items) => {
        if (sessionEndRef.current) {
            clearTimeout(sessionEndRef.current);
        }
        const delay = Math.max(0, endTime.getTime() - Date.now());
        sessionEndRef.current = setTimeout(() => {
            setSession((prev) =>
                prev ? { ...prev, status: "ended", endedAt: new Date() } : prev
            );
            setAuditEntries(createAuditEntries(items));
            sessionEndRef.current = null;
        }, delay);
    };

    const proceedWithPlan = (planId) => {
        const plan = plans.find((entry) => entry.id === planId);
        if (!plan) {
            return;
        }

        const now = new Date();
        const [endHour, endMinute] = plan.endTime.split(":").map(Number);
        const end = new Date(now);
        end.setHours(endHour, endMinute, 0, 0);
        if (end <= now) {
            end.setDate(end.getDate() + 1);
        }

        const sessionItems = plan.items.map((item) => ({ ...item }));
        setSession({
            planId,
            planName: plan.name,
            planColor: plan.color,
            startTime: now,
            endTime: end,
            items: sessionItems,
            status: "active",
            endedAt: null,
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

    const endSessionEarly = () => {
        setEndModalOpen(true);
    };

    const confirmEndSession = () => {
        setEndModalOpen(false);
        if (sessionEndRef.current) {
            clearTimeout(sessionEndRef.current);
            sessionEndRef.current = null;
        }
        if (!session) {
            return;
        }
        setSession((prev) =>
            prev ? { ...prev, status: "ended", endedAt: new Date() } : prev
        );
        setAuditEntries(createAuditEntries(session.items));
    };

    const updateAuditEntry = (productId, patch, fallbackUnit) => {
        setAuditEntries((prev) => {
            const current = prev[productId] || {
                excessQty: "",
                unit: fallbackUnit,
                condition: CONDITIONS[0],
            };
            return {
                ...prev,
                [productId]: {
                    ...current,
                    ...patch,
                },
            };
        });
    };

    const auditStats = useMemo(() => {
        if (!session || session.status !== "ended") {
            return { planned: 0, excess: 0, pct: 0 };
        }

        let planned = 0;
        let excess = 0;

        session.items.forEach((item) => {
            const product = productsById.get(item.productId);
            if (!product) {
                return;
            }
            planned += item.qty;
            const entry = auditEntries[product.id];
            excess += Number(entry?.excessQty) || 0;
        });

        const pct = planned > 0 ? Math.round((excess / planned) * 100) : 0;
        return { planned, excess, pct };
    }, [session, productsById, auditEntries]);

    const runAI = () => {
        if (!session || session.status !== "ended") {
            return;
        }

        const auditRows = session.items
            .map((item) => {
                const product = productsById.get(item.productId);
                if (!product) {
                    return null;
                }
                const entry = auditEntries[product.id] || {
                    excessQty: "",
                    unit: product.unit,
                    condition: CONDITIONS[0],
                };
                return {
                    productId: product.id,
                    name: product.name,
                    unit: product.unit,
                    planned: item.qty,
                    excess: Number(entry.excessQty) || 0,
                    excUnit: entry.unit || product.unit,
                    condition: entry.condition,
                    cost: product.cost,
                };
            })
            .filter(Boolean);

        gotoPage("ai");
        setAiStatus("loading");
        setAiResults(null);
        setApplyNoteVisible(false);

        if (aiTimerRef.current) {
            clearTimeout(aiTimerRef.current);
        }

        aiTimerRef.current = setTimeout(() => {
            setAiResults(buildAIResults(auditRows));
            setAiStatus("results");
        }, 1800);
    };

    const applyChanges = () => {
        if (!session || !aiResults) {
            return;
        }

        setPlans((prev) =>
            prev.map((plan) => {
                if (plan.id !== session.planId) {
                    return plan;
                }

                const items = plan.items.map((item) => {
                    const suggestion = aiResults.suggestions.find(
                        (entry) => entry.productId === item.productId
                    );
                    if (!suggestion) {
                        return item;
                    }

                    const updatedHistory = [...(item.aiHistory || []), suggestion.dir].slice(
                        -10
                    );
                    const updatedItem = {
                        ...item,
                        aiQty: suggestion.newQty,
                        aiDir: suggestion.dir,
                        aiHistory: updatedHistory,
                    };
                    if (suggestion.dir !== "same") {
                        updatedItem.qty = suggestion.newQty;
                    }
                    return updatedItem;
                });

                return {
                    ...plan,
                    items,
                    sessions: [
                        ...plan.sessions,
                        { date: new Date().toISOString(), wastePct: aiResults.wastePct },
                    ],
                };
            })
        );

        setApplyNoteVisible(true);
        fireToast("success", {
            title: "Plan updated",
            description: "AI changes saved to the plan.",
        });
    };

    const dismissAI = () => {
        setAiStatus("empty");
        setAiResults(null);
        setApplyNoteVisible(false);
    };

    const remainingMs =
        session && session.status === "active"
            ? Math.max(0, session.endTime.getTime() - timerTick)
            : 0;
    const totalMs = session
        ? session.endTime.getTime() - session.startTime.getTime()
        : 0;
    const timerFill = totalMs > 0 ? Math.round((remainingMs / totalMs) * 100) : 0;

    return (
        <div className="app-shell">
            <SileoToastProvider position="bottom-right" />
            <Topbar activePage={page} onNavigate={gotoPage} />

            <ProductsPage
                active={page === "products"}
                products={products}
                productDraft={productDraft}
                categories={PRODUCT_CATEGORIES}
                units={PRODUCT_UNITS}
                onDraftChange={updateProductDraft}
                onAddProduct={addProduct}
                onDeleteProduct={deleteProduct}
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
                remainingMs={remainingMs}
                timerFill={timerFill}
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
                units={PRODUCT_UNITS}
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
    );
}

export default Dashboard;
