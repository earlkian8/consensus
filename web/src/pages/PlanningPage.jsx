import React, { useState, useMemo } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { Card } from "@/components/shadcnUI/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/shadcnUI/sheet";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/shadcnUI/alert-dialog";
import {
    CircleFadingArrowUp, History, Plus, ClipboardList, Package, Zap, Trash2,
} from "lucide-react";

function formatTimeTo12Hour(time24) {
    if (!time24) return "";
    const [hourStr, minuteStr] = time24.split(":");
    let hour = Number(hourStr);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minuteStr} ${period}`;
}

function PlanCard({ plan, index, planLetters, session, productsById, activePlanId, onTogglePlan, onUpdatePlanQty, onProceedWithPlan, onDeletePlan, readonly, onConfirmProceed, onConfirmDelete }) {
    const totalItems = plan.items.length;
    const isActive = session && session.planId === plan.id && session.status === "active";
    const isLocked = plan.status === "active" || plan.status === "ended" || readonly;
    const isOpen = activePlanId === plan.id;
    const hasAI = plan.items.some((item) => item.aiQty !== null);
    const adjustedCount = plan.items.filter((item) => item.aiDir === "down" || item.aiDir === "up").length;
    const sessionCount = plan.sessions?.length || 0;

    return (
        <Card
            className={`p-0 overflow-hidden transition-all shadow-sm border-l-4 ${isOpen ? "border-border" : "border-border"}`}
            style={{ borderLeftColor: plan.color }}
        >
            <div
                className="flex items-center gap-2.5 p-3.5 cursor-pointer hover:bg-secondary/50 select-none transition-colors"
                onClick={() => onTogglePlan(plan.id)}
                role="button"
                tabIndex={0}
            >
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-[15px] font-extrabold text-white shrink-0"
                    style={{ background: plan.color }}
                >
                    {planLetters[index % planLetters.length]}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-foreground">{plan.name}</div>
                    <div className="text-[11px] text-muted-foreground flex flex-wrap gap-1.5 items-center mt-0.5">
                        {totalItems} product{totalItems !== 1 ? "s" : ""} · ends {formatTimeTo12Hour(plan.endTime)}
                        {plan.date && <span className="text-[10px]">{plan.date}</span>}
                        {isActive && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-2 py-0">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1" />
                                Active
                            </Badge>
                        )}
                        {plan.status === "ended" && (
                            <Badge variant="secondary" className="bg-secondary text-muted-foreground text-[10px] px-2 py-0">Ended</Badge>
                        )}
                        {!readonly && sessionCount > 0 && plan.status !== "ended" && (
                            <Badge variant="secondary" className="bg-secondary text-muted-foreground text-[10px] px-2 py-0">
                                {sessionCount} session{sessionCount > 1 ? "s" : ""}
                            </Badge>
                        )}
                        {hasAI && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0">
                                {adjustedCount} AI change{adjustedCount !== 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>
                </div>
                <CircleFadingArrowUp className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="border-t border-border p-3.5 animate-in slide-in-from-top-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                        Products in this plan
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Product</th>
                                    <th className="text-right py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Qty</th>
                                    <th className="text-left py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Unit</th>
                                    {!readonly && <th className="text-left py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Adjust</th>}
                                    {plan.status === "ended" && <th className="text-right py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Excess</th>}
                                </tr>
                            </thead>
                            {plan.items.map((item, i) => {
                                const product = productsById.get(item.productId);
                                if (!product) return null;
                                const hasLiquid = product.unit_liquid && item.liquidQty != null;
                                const isLast = i === plan.items.length - 1;

                                const showAI = item.aiQty !== null;
                                const aiTag = showAI ? (
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ml-1.5 ${item.aiDir === 'down' ? 'bg-destructive/10 text-destructive' :
                                        item.aiDir === 'up' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                                        }`}>
                                        AI {item.aiDir}: {Math.round(item.aiQty)}
                                    </span>
                                ) : null;

                                return (
                                    <tbody key={item.productId} className="hover:bg-secondary/40 transition-colors">
                                        <tr className={!hasLiquid && !isLast ? "border-b border-secondary" : ""}>
                                            <td className="py-2 px-2 align-middle" rowSpan={hasLiquid ? 2 : 1}>
                                                <b className="font-bold">{product.name}</b>{" "}
                                                <span className="text-[10px] text-muted-foreground">{product.cat}</span>
                                            </td>
                                            <td className="py-2 px-2 align-middle text-right">{Math.round(item.qty)}</td>
                                            <td className="py-2 px-2 align-middle">{product.unit_solid || product.unit}</td>
                                            {!readonly && (
                                                <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                    <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                                                        <button
                                                            type="button"
                                                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                                                            disabled={isLocked || item.qty <= 1}
                                                            onClick={() => onUpdatePlanQty(plan.id, product.id, Math.max(1, Math.round(item.qty) - 1))}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-10 h-7 flex items-center justify-center text-xs font-semibold text-foreground border-x border-border bg-background">
                                                            {Math.round(item.qty)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                                                            disabled={isLocked}
                                                            onClick={() => onUpdatePlanQty(plan.id, product.id, Math.round(item.qty) + 1)}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {aiTag}
                                                </td>
                                            )}
                                            {plan.status === "ended" && (
                                                <td className="py-2 px-2 align-middle text-right text-destructive font-semibold" rowSpan={hasLiquid ? 2 : 1}>
                                                    {item.excess ?? "-"}
                                                </td>
                                            )}
                                        </tr>
                                        {hasLiquid && (
                                            <tr className={!isLast ? "border-b border-secondary" : ""}>
                                                <td className="py-2 px-2 align-middle text-right">{item.liquidQty}</td>
                                                <td className="py-2 px-2 align-middle">{product.unit_liquid}</td>
                                                {!readonly && (
                                                    <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                        <div className="inline-flex items-center border border-border rounded-lg overflow-hidden">
                                                            <button
                                                                type="button"
                                                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                                                                disabled={isLocked || item.liquidQty <= 0}
                                                                onClick={() => onUpdatePlanQty(plan.id, product.id, Math.max(0, (item.liquidQty ?? 0) - 0.5), "liquidQty")}
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-10 h-7 flex items-center justify-center text-xs font-semibold text-foreground border-x border-border bg-background">
                                                                {item.liquidQty}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-40"
                                                                disabled={isLocked}
                                                                onClick={() => onUpdatePlanQty(plan.id, product.id, (item.liquidQty ?? 0) + 0.5, "liquidQty")}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        )}
                                    </tbody>
                                );
                            })}
                        </table>
                    </div>

                    {hasAI && (
                        <div className="mt-2 p-2 bg-primary/10 rounded-lg text-[11px] text-primary">
                            AI has recommended changes for this plan. Adjusted quantities are shown above.
                        </div>
                    )}

                    {!readonly && (
                        <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
                            {plan.status === "idle" && !isActive && (
                                <Button type="button" onClick={() => onConfirmProceed ? onConfirmProceed(plan.id) : onProceedWithPlan(plan.id)}>
                                    Proceed with {plan.name}
                                </Button>
                            )}
                            {isActive && <Button disabled type="button">Session in progress</Button>}
                            {plan.status === "ended" && <Button disabled type="button">Session ended</Button>}
                            <Button variant="destructive" size="sm" type="button" onClick={() => onConfirmDelete ? onConfirmDelete(plan.id) : onDeletePlan(plan.id)} className="gap-1.5">
                                <Trash2 size={13} />
                                Delete plan
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

export default function PlanningPage({
    active,
    products,
    plans,
    activePlanId,
    session,
    planLetters,
    productsById,
    onOpenNewPlanModal,
    onTogglePlan,
    onUpdatePlanQty,
    onProceedWithPlan,
    onDeletePlan,
    onGoToProducts,
}) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [proceedConfirmId, setProceedConfirmId] = useState(null);

    const activePlan = plans.find((p) => session && session.planId === p.id && session.status === "active");
    const latestIdlePlan = [...plans].reverse().find((p) => p.status === "idle");
    const currentPlan = activePlan || latestIdlePlan || null;
    const currentIndex = currentPlan ? plans.indexOf(currentPlan) : 0;

    const historyPlans = plans.filter((p) => p !== currentPlan);

    const totalProducts = plans.reduce((sum, p) => sum + p.items.length, 0);
    const totalSessions = plans.reduce((sum, p) => sum + (p.sessions?.length || 0), 0);

    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold text-foreground">Production plans</h1>
                <div className="flex items-center gap-2">
                    {plans.length > 0 && (
                        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" variant="outline" type="button">
                                    <History size={14} className="mr-1.5" />
                                    History{historyPlans.length > 0 ? ` (${historyPlans.length})` : ""}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-4">
                                <SheetHeader className="mb-4 p-0">
                                    <SheetTitle>Plan history</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-3">
                                    {historyPlans.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <div className="text-[13px] font-semibold text-foreground mb-1">No history yet</div>
                                            <div className="text-[11px]">Previous plans will appear here.</div>
                                        </div>
                                    ) : historyPlans.map((plan) => (
                                        <PlanCard
                                            key={plan.id}
                                            plan={plan}
                                            index={plans.indexOf(plan)}
                                            planLetters={planLetters}
                                            session={session}
                                            productsById={productsById}
                                            activePlanId={activePlanId}
                                            onTogglePlan={onTogglePlan}
                                            onUpdatePlanQty={onUpdatePlanQty}
                                            onProceedWithPlan={onProceedWithPlan}
                                            onDeletePlan={onDeletePlan}
                                            readonly
                                        />
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                    <Button size="sm" type="button" onClick={onOpenNewPlanModal}>
                        <Plus size={14} />
                        New plan
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Create named plans and choose which products to include. Each plan tracks AI suggested changes over time.
            </p>

            {/* Summary Stats */}
            {plans.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                            <ClipboardList size={18} className="text-primary" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">{plans.length}</div>
                            <div className="text-[10px] text-muted-foreground">Total plan{plans.length !== 1 ? "s" : ""}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                            <Package size={18} className="text-accent-foreground" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">{totalProducts}</div>
                            <div className="text-[10px] text-muted-foreground">Total items</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100">
                            <Zap size={18} className="text-purple-700" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">{totalSessions}</div>
                            <div className="text-[10px] text-muted-foreground">Session{totalSessions !== 1 ? "s" : ""} run</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {products.length === 0 ? (
                <div className="text-center py-12 px-3.5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4">
                        <Package size={28} className="text-muted-foreground" />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">No products yet</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Add products to your catalog before creating a plan.
                    </div>
                    <Button type="button" onClick={onGoToProducts}>Go to Products →</Button>
                </div>
            ) : !currentPlan ? (
                <div className="text-center py-12 px-3.5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4">
                        <ClipboardList size={28} className="text-primary" />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">No active plans</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Create a new production plan to start a session.
                    </div>
                    <Button type="button" onClick={onOpenNewPlanModal}>
                        <Plus size={14} />
                        Create plan
                    </Button>
                </div>
            ) : (
                <PlanCard
                    plan={currentPlan}
                    index={currentIndex}
                    planLetters={planLetters}
                    session={session}
                    productsById={productsById}
                    activePlanId={activePlanId}
                    onTogglePlan={onTogglePlan}
                    onUpdatePlanQty={onUpdatePlanQty}
                    onProceedWithPlan={onProceedWithPlan}
                    onDeletePlan={onDeletePlan}
                    readonly={false}
                    onConfirmProceed={(id) => setProceedConfirmId(id)}
                    onConfirmDelete={(id) => setDeleteConfirmId(id)}
                />
            )}

            {/* Proceed confirmation */}
            <AlertDialog open={proceedConfirmId !== null} onOpenChange={(open) => !open && setProceedConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start session?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will begin a production session with this plan. The session will run until the scheduled end time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { onProceedWithPlan(proceedConfirmId); setProceedConfirmId(null); }}>
                            Start session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete plan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the plan and its configuration. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { onDeletePlan(deleteConfirmId); setDeleteConfirmId(null); }}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}