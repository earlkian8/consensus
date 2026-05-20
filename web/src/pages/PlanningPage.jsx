import React, { useState } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { Card } from "@/components/shadcnUI/card";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/shadcnUI/alert-dialog";
import { CircleFadingArrowUp, Trash2, ClipboardList, Package, Zap, Plus } from "lucide-react";

function formatTimeTo12Hour(time24) {
    if (!time24) return "";
    const [hourStr, minuteStr] = time24.split(":");
    let hour = Number(hourStr);
    const minute = minuteStr;
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${period}`;
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
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [proceedConfirmId, setProceedConfirmId] = useState(null);

    const totalProducts = plans.reduce((sum, p) => sum + p.items.length, 0);
    const totalSessions = plans.reduce((sum, p) => sum + p.sessions.length, 0);
    const hasActiveSession = session && session.status === "active";

    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold text-foreground">Production plans</h1>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Create named plans and choose which products to include. Each plan tracks
                AI suggested changes over time.
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
                            <div className="text-[10px] text-muted-foreground">Plan{plans.length !== 1 ? "s" : ""}</div>
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

            {products.length === 0 ? (
                <div className="text-center py-12 px-3.5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4">
                        <Package size={28} className="text-muted-foreground" />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">No products yet</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Add products to your catalog before creating a plan.
                    </div>
                    <Button type="button" onClick={onGoToProducts}>
                        Go to Products →
                    </Button>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-12 px-3.5">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4">
                        <ClipboardList size={28} className="text-primary" />
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">No plans yet</div>
                    <div className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Create your first production plan to start tracking output and AI recommendations.
                    </div>
                    <Button type="button" onClick={onOpenNewPlanModal}>
                        <Plus size={14} />
                        Create first plan
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {plans.map((plan, index) => {
                        const totalItems = plan.items.length;
                        const hasAI = plan.items.some((item) => item.aiQty !== null);
                        const sessionCount = plan.sessions.length;
                        const adjustedCount = plan.items.filter(
                            (item) => item.aiDir === "down" || item.aiDir === "up"
                        ).length;
                        const isActive = session && session.planId === plan.id && session.status === "active";
                        const isLocked = plan.status === "active" || plan.status === "ended";
                        const isOpen = activePlanId === plan.id;

                        return (
                            <Card
                                className={`p-0 overflow-hidden transition-all shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 border-l-4 ${isOpen ? "border-l-primary border-border" : "border-border"}`}
                                style={{ borderLeftColor: plan.color }}
                                key={plan.id}
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
                                            {isActive && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-2 py-0">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1" />
                                                    Active
                                                </Badge>
                                            )}
                                            {!isActive && sessionCount > 0 && (
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
                                                        <th className="text-left py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">Adjust / AI rec</th>
                                                        <th className="text-center py-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">History</th>
                                                    </tr>
                                                </thead>
                                                    {plan.items.map((item, i) => {
                                                        const product = productsById.get(item.productId);
                                                        if (!product) return null;

                                                        const showAI = item.aiQty !== null;
                                                        const aiTag = showAI ? (
                                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm ml-1.5 ${item.aiDir === 'down' ? 'bg-destructive/10 text-destructive' :
                                                                item.aiDir === 'up' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                                                                }`}>
                                                                AI {item.aiDir}: {item.aiQty}
                                                            </span>
                                                        ) : null;

                                                        const historyDots = (item.aiHistory || []).slice(-5).map((dir, index) => (
                                                            <span
                                                                key={`${item.productId}-${index}`}
                                                                className={`inline-block w-2 h-2 rounded-full mx-0.5 ${dir === "down" ? "bg-destructive" :
                                                                    dir === "up" ? "bg-primary" : "bg-muted-foreground/40"
                                                                    }`}
                                                            />
                                                        ));

                                                        return (
                                                            <tbody key={item.productId} className="group/row hover:bg-secondary/40 transition-colors">
                                                                <tr className={!product.unit_liquid && i !== plan.items.length - 1 ? "border-b border-secondary" : ""}>
                                                                    <td className="py-2 px-2 align-middle" rowSpan={product.unit_liquid ? 2 : 1}>
                                                                        <b className="font-bold">{product.name}</b>{" "}
                                                                        <span className="text-[10px] text-muted-foreground">{product.cat}</span>
                                                                    </td>
                                                                    <td className="py-2 px-2 align-middle text-right">{item.qty}</td>
                                                                    <td className="py-2 px-2 align-middle">{product.unit_solid || product.unit}</td>
                                                                    <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                                        <Input
                                                                            className="w-17.5 h-7 text-xs text-right inline-flex bg-background"
                                                                            type="number"
                                                                            min="1"
                                                                            disabled={isLocked}
                                                                            value={item.qty}
                                                                            onChange={(e) => onUpdatePlanQty(plan.id, product.id, Number(e.target.value))}
                                                                        />
                                                                        {aiTag}
                                                                    </td>
                                                                    <td className="py-2 px-2 align-middle text-center" rowSpan={product.unit_liquid ? 2 : 1}>
                                                                        {historyDots.length > 0 ? historyDots : <span className="text-muted-foreground text-[10px]">-</span>}
                                                                    </td>
                                                                </tr>
                                                                {product.unit_liquid && (
                                                                    <tr className={i !== plan.items.length - 1 ? "border-b border-secondary" : ""}>
                                                                        <td className="py-2 px-2 align-middle text-right">{item.liquidQty ?? product.batch_liquid_volume ?? 0}</td>
                                                                        <td className="py-2 px-2 align-middle">{product.unit_liquid}</td>
                                                                        <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                                            <Input
                                                                                className="w-17.5 h-7 text-xs text-right inline-flex bg-background"
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.1"
                                                                                disabled={isLocked}
                                                                                value={item.liquidQty ?? product.batch_liquid_volume ?? 0}
                                                                                onChange={(e) => onUpdatePlanQty(plan.id, product.id, Number(e.target.value), "liquidQty")}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        );
                                                    })}
                                            </table>
                                        </div>
                                        {hasAI && (
                                            <div className="mt-2 p-2 bg-primary/10 rounded-lg text-[11px] text-teal-900">
                                                AI has recommended changes for this plan. Adjusted quantities are shown above.
                                            </div>
                                        )}
                                        <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
                                            {!isActive ? (
                                                <Button type="button" onClick={() => setProceedConfirmId(plan.id)}>
                                                    Proceed with {plan.name}
                                                </Button>
                                            ) : (
                                                <Button disabled type="button">Session already active</Button>
                                            )}
                                            <Button variant="destructive" size="sm" type="button" onClick={() => setDeleteConfirmId(plan.id)} className="gap-1.5">
                                                <Trash2 size={13} />
                                                Delete plan
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
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
                        <AlertDialogAction
                            onClick={() => {
                                onProceedWithPlan(proceedConfirmId);
                                setProceedConfirmId(null);
                            }}
                        >
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
                        <AlertDialogAction
                            variant="destructive"
                            onClick={() => {
                                onDeletePlan(deleteConfirmId);
                                setDeleteConfirmId(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}