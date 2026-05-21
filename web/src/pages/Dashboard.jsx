import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const mapPlan = (p, index, color) => ({
    id: p.id,
    name: p.name,
    color: color ?? PLAN_COLORS[index % PLAN_COLORS.length],
    endTime: p.end_time ? p.end_time.slice(0, 5) : "17:00",
    date: p.date,
    status: p.status ?? "idle",
    started_at: p.started_at ?? null,
    ended_at: p.ended_at ?? null,
    items: (p.production_details || p.details || []).map((d) => ({
      productId: d.p_fk,
      qty: Number(d.amount),
      liquidQty: d.liquid_amount != null ? Number(d.liquid_amount) : null,
      aiQty: null,
      aiDir: "same",
      aiHistory: [],
      detailId: d.id,
      excess: d.excess,
    })),
    sessions: [],
  });

  useEffect(() => {
    api
      .getProducts()
      .then((data) => setProducts(data.map(mapProduct)))
      .catch(() => fireToast("error", { title: "Failed to load products" }));
    api
      .getPlanLogs()
      .then((data) => {
        const mapped = data.map((p, i) => mapPlan(p, i));
        setPlans(mapped);
        nextPlanId.current = data.length + 1;
        // Restore active session on refresh
        const activePlan = mapped.find((p) => p.status === "active");
        if (activePlan) {
          const now = new Date();
          const [endHour, endMinute] = activePlan.endTime
            .split(":")
            .map(Number);
          const end = new Date(now);
          end.setHours(endHour, endMinute, 0, 0);
          if (end <= now) end.setDate(end.getDate() + 1);
          const sessionItems = activePlan.items.map((item) => ({ ...item }));
          setSession({
            planId: activePlan.id,
            planName: activePlan.name,
            planColor: activePlan.color,
            startTime: activePlan.started_at
              ? new Date(activePlan.started_at)
              : now,
            endTime: end,
            items: sessionItems,
            status: "active",
            endedAt: null,
          });
          setActivePlanId(activePlan.id);
          scheduleSessionEnd(end, sessionItems);
          gotoPage("session");
        }
        // Restore ended session awaiting audit
        const endedPlan = mapped.find((p) => p.status === "ended");
        if (!activePlan && endedPlan) {
          const sessionItems = endedPlan.items.map((item) => ({ ...item }));
          setSession({
            planId: endedPlan.id,
            planName: endedPlan.name,
            planColor: endedPlan.color,
            startTime: endedPlan.started_at
              ? new Date(endedPlan.started_at)
              : new Date(),
            endTime: new Date(),
            items: sessionItems,
            status: "ended",
            endedAt: endedPlan.ended_at
              ? new Date(endedPlan.ended_at)
              : new Date(),
          });
          setActivePlanId(endedPlan.id);
          setAuditEntries(createAuditEntriesFromItems(sessionItems));
        }
      })
      .catch(() => fireToast("error", { title: "Failed to load plans" }));
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
    [],
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
  };

  const openCreateProductModal = () => {
    setProductDraft(EMPTY_DRAFT);
    setCreateProductOpen(true);
  };

  const closeCreateProductModal = () => setCreateProductOpen(false);

  const buildPayload = async (draft, dt) => {
    const defaultSolidUnit =
      dt === "SOUP_STEW" ? null : dt === "DRY_SCOOPED" ? "scoops" : "pieces";
    const unit_solid =
      dt === "SOUP_STEW" ? null : draft.unit_solid || defaultSolidUnit;
    const unit_liquid =
      dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP" ? "liters" : null;
    let picture = null;
    if (draft.image && draft.image.startsWith("data:")) {
      const { url } = await api.uploadProductImage(
        draft.image,
        draft.name.trim(),
      );
      picture = url;
    } else if (draft.image) {
      picture = draft.image;
    }
    return {
      name: draft.name.trim(),
      category: draft.category || PRODUCT_CATEGORIES[0],
      dish_type: dt,
      batch_solid_count: unit_solid
        ? Number(draft.batch_solid_count) || null
        : null,
      batch_liquid_volume: unit_liquid
        ? Number(draft.batch_liquid_volume) || null
        : null,
      unit_solid,
      unit_liquid,
      notes: draft.notes.trim() || null,
      picture,
    };
  };

  const addProduct = () => {
    const name = productDraft.name.trim();
    if (!name) {
      fireToast("error", {
        title: "Product name missing",
        description: "Add a name before saving a product.",
      });
      return false;
    }
    if (!productDraft.dish_type) {
      fireToast("error", {
        title: "Dish type required",
        description: "Select a dish type before saving.",
      });
      return false;
    }
    const dt = productDraft.dish_type;
    const tempId = `temp-${Date.now()}`;
    const unit_solid =
      dt === "SOUP_STEW"
        ? null
        : productDraft.unit_solid ||
          (dt === "DRY_SCOOPED" ? "scoops" : "pieces");
    const unit_liquid =
      dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP" ? "liters" : null;
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
      qty:
        Number(productDraft.batch_solid_count) ||
        Number(productDraft.batch_liquid_volume) ||
        0,
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
        setProducts((prev) =>
          prev.map((prod) => (prod.id === tempId ? mapProduct(p) : prod)),
        );
        fireToast("success", {
          title: "Product added",
          description: `${name} is ready for planning.`,
        });
      })
      .catch((err) => {
        setProducts((prev) => prev.filter((prod) => prod.id !== tempId));
        fireToast("error", {
          title: "Failed to create product",
          description: err.message,
        });
      });
  };

  const deleteProduct = (id) => {
    api
      .deleteProduct(id)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setPlans((prev) =>
          prev.map((plan) => ({
            ...plan,
            items: plan.items.filter((item) => item.productId !== id),
          })),
        );
        fireToast("success", {
          title: "Product removed",
          description: "Removed from catalog and any linked plans.",
        });
      })
      .catch((err) =>
        fireToast("error", {
          title: "Failed to delete product",
          description: err.message,
        }),
      );
  };

  const editProduct = (id) => {
    const product = productsById.get(id);
    if (!product) return;
    setProductDraft({
      name: product.name,
      image: product.image || "",
      category: product.cat || PRODUCT_CATEGORIES[0],
      dish_type: product.dish_type || "",
      batch_solid_count: product.batch_solid_count
        ? String(product.batch_solid_count)
        : "",
      batch_liquid_volume: product.batch_liquid_volume
        ? String(product.batch_liquid_volume)
        : "",
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
    const unit_solid =
      dt === "SOUP_STEW"
        ? null
        : productDraft.unit_solid ||
          (dt === "DRY_SCOOPED" ? "scoops" : "pieces");
    const unit_liquid =
      dt === "SOUP_STEW" || dt === "SOLID_IN_SOUP" ? "liters" : null;
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
      qty:
        Number(productDraft.batch_solid_count) ||
        Number(productDraft.batch_liquid_volume) ||
        0,
      notes: productDraft.notes.trim() || "",
      image: productDraft.image || "",
      cost: 0,
      _saving: true,
    };
    setProducts((prev) => prev.map((p) => (p.id === editId ? optimistic : p)));
    setProductDraft(EMPTY_DRAFT);
    return buildPayload({ ...productDraft, name }, dt)
      .then((payload) => api.updateProduct(editId, payload))
      .then((p) => {
        setProducts((prev) =>
          prev.map((prod) => (prod.id === editId ? mapProduct(p) : prod)),
        );
        fireToast("success", {
          title: "Product updated",
          description: `${name} has been updated.`,
        });
      })
      .catch((err) => {
        fireToast("error", {
          title: "Failed to update product",
          description: err.message,
        });
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
    setSelectedProductIds(products.map((p) => p.id));
    setNewPlanOpen(true);
  };

  const toggleProductSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    const allSelected =
      products.length > 0 && selectedProductIds.length === products.length;
    setSelectedProductIds(
      allSelected ? [] : products.map((product) => product.id),
    );
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
    const today = new Date().toISOString().split("T")[0];
    const items = selectedProductIds.map((id) => {
      const product = productsById.get(id);
      return {
        productId: id,
        qty: product ? product.qty : 0,
        ...(product?.unit_liquid
          ? { liquidQty: product.batch_liquid_volume || 0 }
          : {}),
        aiQty: null,
        aiDir: "same",
        aiHistory: [],
      };
    });
    const tempId = `temp-${Date.now()}`;
    const optimisticPlan = {
      id: tempId,
      name,
      color,
      endTime,
      date: today,
      items,
      sessions: [],
      _saving: true,
    };
    setPlans((prev) => [...prev, optimisticPlan]);
    setActivePlanId(tempId);
    setNewPlanOpen(false);
    api
      .createPlan({
        name,
        date: today,
        end_time: endTime,
        details: items.map((item) => {
          const product = productsById.get(item.productId);
          return {
            p_fk: item.productId,
            amount: item.qty,
            liquid_amount: product?.unit_liquid
              ? (item.liquidQty ?? product.batch_liquid_volume ?? null)
              : null,
          };
        }),
      })
      .then((p) => {
        const realPlan = mapPlan(p, plans.length, color);
        setPlans((prev) =>
          prev.map((pl) => (pl.id === tempId ? realPlan : pl)),
        );
        setActivePlanId(realPlan.id);
        fireToast("success", {
          title: "Plan created",
          description: `${name} is ready to run.`,
        });
      })
      .catch((err) => {
        setPlans((prev) => prev.filter((pl) => pl.id !== tempId));
        setActivePlanId(null);
        fireToast("error", {
          title: "Failed to create plan",
          description: err.message,
        });
      });
  };

  const togglePlanBody = (planId) =>
    setActivePlanId((prev) => (prev === planId ? null : planId));

  const qtyDebounceRef = useRef({});

  const updatePlanQty = (planId, productId, value, field = "qty") => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          items: plan.items.map((item) =>
            item.productId === productId ? { ...item, [field]: value } : item,
          ),
        };
      }),
    );
    if (field === "qty") {
      const plan = plans.find((p) => p.id === planId);
      const item = plan?.items.find((i) => i.productId === productId);
      if (!item?.detailId) return;
      const key = item.detailId;
      if (qtyDebounceRef.current[key])
        clearTimeout(qtyDebounceRef.current[key]);
      qtyDebounceRef.current[key] = setTimeout(() => {
        api
          .updateDetailAmount(item.detailId, value)
          .catch(() =>
            fireToast("error", { title: "Failed to save quantity" }),
          );
      }, 600);
    }
  };

  const deletePlan = (id) => {
    setPlans((prev) => prev.filter((plan) => plan.id !== id));
    setActivePlanId((prev) => (prev === id ? null : prev));
    api
      .deletePlan(id)
      .then(() =>
        fireToast("success", {
          title: "Plan deleted",
          description: "The plan was removed.",
        }),
      )
      .catch((err) => {
        fireToast("error", {
          title: "Failed to delete plan",
          description: err.message,
        });
        api
          .getPlanLogs()
          .then((data) => setPlans(data.map((p, i) => mapPlan(p, i))));
      });
  };

  const createAuditEntriesFromItems = (items) => {
    const entries = {};
    items.forEach((item) => {
      const product = productsById.get(item.productId);
      if (!product) return;
      entries[product.id] = {
        excessQty: "",
        unit: product.unit,
        condition: CONDITIONS[0],
        ...(product.unit_liquid
          ? { excessLiquidQty: "", unitLiquid: product.unit_liquid }
          : {}),
      };
    });
    return entries;
  };

  const createAuditEntries = (items) => createAuditEntriesFromItems(items);

  const scheduleSessionEnd = (endTime, items) => {
    if (sessionEndRef.current) clearTimeout(sessionEndRef.current);
    const delay = Math.max(0, endTime.getTime() - Date.now());
    sessionEndRef.current = setTimeout(() => {
      setSession((prev) => {
        if (!prev) return prev;
        const endedAt = new Date();
        api.updatePlanStatus(prev.planId, "ended").catch(() => {});
        setPlans((p) =>
          p.map((pl) =>
            pl.id === prev.planId
              ? { ...pl, status: "ended", ended_at: endedAt.toISOString() }
              : pl,
          ),
        );
        setAuditEntries(createAuditEntries(prev.items));
        return { ...prev, status: "ended", endedAt };
      });
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
      planId,
      planName: plan.name,
      planColor: plan.color,
      startTime: now,
      endTime: end,
      items: sessionItems,
      status: "active",
      endedAt: null,
    });
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, status: "active", started_at: now.toISOString() }
          : p,
      ),
    );
    setAuditEntries({});
    setAuditDisposition(DISPOSITIONS[0]);
    setAuditNotes("");
    setAiStatus("empty");
    setAiResults(null);
    setApplyNoteVisible(false);
    scheduleSessionEnd(end, sessionItems);
    gotoPage("session");
    api
      .updatePlanStatus(planId, "active")
      .catch((err) =>
        fireToast("error", {
          title: "Failed to save session status",
          description: err.message,
        }),
      );
  };

  const endSessionEarly = () => setEndModalOpen(true);

  const confirmEndSession = () => {
    setEndModalOpen(false);
    if (sessionEndRef.current) {
      clearTimeout(sessionEndRef.current);
      sessionEndRef.current = null;
    }
    if (!session) return;
    const endedAt = new Date();
    setSession((prev) => (prev ? { ...prev, status: "ended", endedAt } : prev));
    setPlans((prev) =>
      prev.map((p) =>
        p.id === session.planId
          ? { ...p, status: "ended", ended_at: endedAt.toISOString() }
          : p,
      ),
    );
    setAuditEntries(createAuditEntries(session.items));
    api
      .updatePlanStatus(session.planId, "ended")
      .then(() =>
        console.log(
          "[session end] status updated to ended for",
          session.planId,
        ),
      )
      .catch((err) =>
        fireToast("error", {
          title: "Failed to save session end status",
          description: err.message,
        }),
      );
  };

  const updateAuditEntry = (productId, patch, fallbackUnit) => {
    setAuditEntries((prev) => {
      const product = productsById.get(productId);
      const current = prev[productId] || {
        excessQty: "",
        unit: fallbackUnit,
        condition: CONDITIONS[0],
        ...(product?.unit_liquid
          ? { excessLiquidQty: "", unitLiquid: product.unit_liquid }
          : {}),
      };
      return { ...prev, [productId]: { ...current, ...patch } };
    });
  };

  const auditStats = useMemo(() => {
    if (!session || session.status !== "ended")
      return {
        planned: 0,
        plannedLiquid: 0,
        excess: 0,
        excessLiquid: 0,
        pct: 0,
        pctLiquid: 0,
      };
    let planned = 0,
      plannedLiquid = 0,
      excess = 0,
      excessLiquid = 0;
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
    const pctLiquid =
      plannedLiquid > 0 ? Math.round((excessLiquid / plannedLiquid) * 100) : 0;
    return { planned, plannedLiquid, excess, excessLiquid, pct, pctLiquid };
  }, [session, productsById, auditEntries]);

  const runAI = () => {
    if (!session || session.status !== "ended") return;

    const plan = plans.find((p) => p.id === session.planId);
    if (!plan) return;

    const details = plan.items
      .filter((item) => item.detailId)
      .map((item) => {
        const entry = auditEntries[item.productId] || {};
        return {
          id: item.detailId,
          excess: Number(entry.excessQty) || 0,
          condition: entry.condition || CONDITIONS[0],
        };
      });

    if (details.length === 0) {
      fireToast("error", { title: "No details to submit" });
      return;
    }

    gotoPage("ai");
    setAiStatus("loading");
    setAiResults(null);
    setApplyNoteVisible(false);

    api
      .submitExcess(session.planId, details)
      .then(() => {
        return api.getLatestAnalytics(session.planId);
      })
      .then(({ plan: analysisPlan, analysis }) => {
        // ⚠️ Filter out backend analysis for products NOT in this current session
        const relevantAnalysis = analysis.filter((a) =>
          session.items.some((i) => i.productId === a.p_fk),
        );

        const rows = relevantAnalysis.map((a) => {
          const product = productsById.get(a.p_fk);
          const sessionItem = session.items.find((i) => i.productId === a.p_fk);
          const planned = sessionItem?.qty ?? 0;
          const plannedLiquid = sessionItem?.liquidQty ?? null;

          // PRIORITIZE Backend Suggestion
          const suggested =
            a.suggested_amount !== undefined
              ? Math.round(Number(a.suggested_amount))
              : planned;
          const suggestedLiquid =
            a.suggested_liquid_amount != null
              ? Number(Number(a.suggested_liquid_amount).toFixed(1))
              : plannedLiquid;

          const dir =
            suggested > planned ? "up" : suggested < planned ? "down" : "same";
          const liquidDir =
            suggestedLiquid != null && plannedLiquid != null
              ? suggestedLiquid > plannedLiquid
                ? "up"
                : suggestedLiquid < plannedLiquid
                  ? "down"
                  : "same"
              : null;
          return {
            productId: a.p_fk,
            name: product?.name ?? a.p_fk,
            planned,
            newQty: suggested,
            unit: product?.unit_solid || product?.unit || "units",
            dir,
            plannedLiquid,
            newLiquidQty: suggestedLiquid,
            unitLiquid: product?.unit_liquid ?? null,
            liquidDir,
            detailId: null,
          };
        });

        const totalPlanned = rows.reduce((s, r) => s + r.planned, 0);
        const totalExcess = session.items.reduce((s, item) => {
          const entry = auditEntries[item.productId] || {};
          return s + (Number(entry.excessQty) || 0);
        }, 0);
        const wastePct =
          totalPlanned > 0 ? Math.round((totalExcess / totalPlanned) * 100) : 0;
        const adjustedCount = rows.filter((r) => r.dir !== "same").length;

        const recommendations = relevantAnalysis.map((a) => {
          const r = rows.find((row) => row.productId === a.p_fk);
          if (a.reasoning) return a.reasoning;
          if (r.dir === "down")
            return `${r.name}: reduce from ${r.planned} to ${r.newQty} ${r.unit}.`;
          if (r.dir === "up")
            return `${r.name}: increase from ${r.planned} to ${r.newQty} ${r.unit}.`;
          return `${r.name}: keep at ${r.planned} ${r.unit}.`;
        });
        recommendations.push(
          `Overall waste rate: ${wastePct}%. SDG 12 target is 10% or lower. ${
            wastePct <= 10 ? "On track." : "Keep reducing to reach the goal."
          }`,
        );

        const chartData = session.items.map((item) => {
          const product = productsById.get(item.productId);
          const entry = auditEntries[item.productId] || {};
          return {
            name: product?.name ?? item.productId,
            planned: item.qty,
            excess: Number(entry.excessQty) || 0,
          };
        });

        setAiResults({
          wastePct,
          adjustedCount,
          totalSaved: 0,
          recommendations,
          suggestions: rows.map((r) => ({
            productId: r.productId,
            newQty: r.newQty,
            dir: r.dir,
          })),
          rows,
          chartData,
          sourcePlanId: session.planId,
          sourcePlanName: session.planName,
          sourcePlanEndTime: plan.endTime,
        });
        setAiStatus("results");
      })
      .catch((err) => {
        setAiStatus("empty");
        gotoPage("audit");
        fireToast("error", {
          title: "Failed to submit excess",
          description: err.message,
        });
      });
  };

  const createNextPlan = (useAI) => {
    if (!aiResults) return;
    const today = new Date().toISOString().split("T")[0];
    const color = PLAN_COLORS[plans.length % PLAN_COLORS.length];

    let cleanName = (aiResults.sourcePlanName || "Next Plan")
      .replace(/(?:\s*\(next\))+$/gi, "")
      .trim();
    const versionMatch = cleanName.match(/^(.*?)(?:\s*\(v(\d+)\))?$/i);
    const baseName = versionMatch[1].trim();
    const currentVersion = versionMatch[2] ? parseInt(versionMatch[2], 10) : 1;
    const name = `${baseName} (v${currentVersion + 1})`;

    const endTime = aiResults.sourcePlanEndTime || "17:00";
    const details = aiResults.rows
      .filter((r) => r.productId && !r.name.endsWith("(soup)"))
      .map((r) => {
        const sessionItem = session?.items.find(
          (i) => i.productId === r.productId,
        );
        const product = productsById.get(r.productId);
        const liquidAmt =
          useAI && r.newLiquidQty != null
            ? r.newLiquidQty
            : (sessionItem?.liquidQty ?? product?.batch_liquid_volume ?? null);
        return {
          p_fk: r.productId,
          amount: Math.max(1, useAI ? r.newQty : r.planned),
          liquid_amount: product?.unit_liquid ? liquidAmt : null,
          _aiQty: useAI && r.dir !== "same" ? r.newQty : null,
          _aiDir: useAI ? r.dir : "same",
        };
      });

    const tempId = `temp-${Date.now()}`;
    const optimisticItems = details.map((d) => ({
      productId: d.p_fk,
      qty: d.amount,
      liquidQty: d.liquid_amount,
      aiQty: d._aiQty,
      aiDir: d._aiDir,
      aiHistory: [],
      detailId: null,
      excess: null,
    }));
    const optimisticPlan = {
      id: tempId,
      name,
      color,
      endTime,
      date: today,
      status: "idle",
      items: optimisticItems,
      sessions: [],
      _saving: true,
    };
    setPlans((prev) => [...prev, optimisticPlan]);
    setApplyNoteVisible(true);

    const apiPayload = details.map(({ p_fk, amount, liquid_amount }) => ({
      p_fk,
      amount,
      liquid_amount,
    }));

    api
      .createPlan({ name, date: today, end_time: endTime, details: apiPayload })
      .then((p) => {
        const realPlan = mapPlan(p, plans.length, color);

        realPlan.items = realPlan.items.map((item) => {
          const opt = optimisticItems.find(
            (o) => o.productId === item.productId,
          );
          return {
            ...item,
            aiQty: opt?.aiQty || null,
            aiDir: opt?.aiDir || "same",
          };
        });

        setPlans((prev) =>
          prev.map((pl) => (pl.id === tempId ? realPlan : pl)),
        );
        setAiStatus("empty");
        setAiResults(null);
        setApplyNoteVisible(false);
        setSession(null);
        gotoPage("planning");
        fireToast("success", {
          title: useAI
            ? "Plan created with AI suggestions"
            : "Plan created with original quantities",
        });
      })
      .catch((err) => {
        setPlans((prev) => prev.filter((pl) => pl.id !== tempId));
        setApplyNoteVisible(false);
        fireToast("error", {
          title: "Failed to create plan",
          description: err.message,
        });
      });
  };

  const applyChanges = () => createNextPlan(true);
  const dismissAI = () => createNextPlan(false);

  return (
    <div className="flex min-h-screen bg-background">
      <SileoToastProvider />
      <Sidebar activePage={page} onNavigate={gotoPage} />
      <div className="flex-1 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {page === "products" && (
              <ProductsPage
                active={true}
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
            )}

            {page === "planning" && (
              <PlanningPage
                active={true}
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
            )}

            {page === "session" && (
              <SessionPage
                active={true}
                session={session}
                productsById={productsById}
                onEndSessionEarly={endSessionEarly}
                onGoToPlanning={() => gotoPage("planning")}
                onGoToAudit={() => gotoPage("audit")}
              />
            )}

            {page === "audit" && (
              <AuditPage
                active={true}
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
            )}

            {page === "ai" && (
              <AiInsightsPage
                active={true}
                aiStatus={aiStatus}
                aiResults={aiResults}
                session={session}
                chartConfig={chartConfig}
                applyNoteVisible={applyNoteVisible}
                onGoToAudit={() => gotoPage("audit")}
                onApplyChanges={applyChanges}
                onDismissAI={dismissAI}
              />
            )}
          </motion.div>
        </AnimatePresence>

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
