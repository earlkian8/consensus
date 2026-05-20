import React, { useState } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { Card } from "@/components/shadcnUI/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/shadcnUI/sheet";
import { CircleFadingArrowUp, History } from "lucide-react";

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

function PlanCard({ plan, index, planLetters, session, productsById, activePlanId, onTogglePlan, onUpdatePlanQty, onProceedWithPlan, onDeletePlan, readonly }) {
    const totalItems = plan.items.length;
    const isActive = session && session.planId === plan.id && session.status === "active";
    const isLocked = plan.status === "active" || plan.status === "ended" || readonly;
    const isOpen = activePlanId === plan.id;

    return (
        <Card className={`p-0 overflow-hidden transition-colors shadow-sm ${isOpen ? "border-primary" : "border-border"}`} key={plan.id}>
            <div
                className="flex items-center gap-2.5 p-3.5 cursor-pointer hover:bg-secondary/50 select-none"
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
                        {totalItems} products - ends {formatTimeTo12Hour(plan.endTime)}
                        {isActive && <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-2 py-0">Active</Badge>}
                        {plan.status === "ended" && <Badge variant="secondary" className="bg-secondary text-muted-foreground text-[10px] px-2 py-0">Ended</Badge>}
                        {plan.date && <span className="text-[10px] text-muted-foreground">{plan.date}</span>}
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
                            <tbody>
                                {plan.items.map((item, i) => {
                                    const product = productsById.get(item.productId);
                                    if (!product) return null;
                                    const hasLiquid = product.unit_liquid && item.liquidQty != null;
                                    return (
                                        <React.Fragment key={item.productId}>
                                            <tr className={i !== plan.items.length - 1 && !hasLiquid ? "border-b border-secondary" : ""}>
                                                <td className="py-2 px-2 align-middle" rowSpan={hasLiquid ? 2 : 1}>
                                                    <b className="font-bold">{product.name}</b>{" "}
                                                    <span className="text-[10px] text-muted-foreground">{product.cat}</span>
                                                </td>
                                                <td className="py-2 px-2 align-middle text-right">{item.qty}</td>
                                                <td className="py-2 px-2 align-middle">{product.unit_solid || product.unit}</td>
                                                {!readonly && (
                                                    <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                        <Input
                                                            className="w-17.5 h-7 text-xs text-right inline-flex bg-background"
                                                            type="number"
                                                            min="1"
                                                            disabled={isLocked}
                                                            value={item.qty}
                                                            onChange={(e) => onUpdatePlanQty(plan.id, product.id, Number(e.target.value))}
                                                        />
                                                    </td>
                                                )}
                                                {plan.status === "ended" && (
                                                    <td className="py-2 px-2 align-middle text-right text-destructive font-semibold" rowSpan={hasLiquid ? 2 : 1}>
                                                        {item.excess ?? "-"}
                                                    </td>
                                                )}
                                            </tr>
                                            {hasLiquid && (
                                                <tr className={i !== plan.items.length - 1 ? "border-b border-secondary" : ""}>
                                                    <td className="py-2 px-2 align-middle text-right">{item.liquidQty}</td>
                                                    <td className="py-2 px-2 align-middle">{product.unit_liquid}</td>
                                                    {!readonly && (
                                                        <td className="py-2 px-2 align-middle whitespace-nowrap">
                                                            <Input
                                                                className="w-17.5 h-7 text-xs text-right inline-flex bg-background"
                                                                type="number"
                                                                min="0"
                                                                step="0.1"
                                                                disabled={isLocked}
                                                                value={item.liquidQty}
                                                                onChange={(e) => onUpdatePlanQty(plan.id, product.id, Number(e.target.value), "liquidQty")}
                                                            />
                                                        </td>
                                                    )}
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!readonly && (
                        <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
                            {!isActive && plan.status === "idle" ? (
                                <Button type="button" onClick={() => onProceedWithPlan(plan.id)}>
                                    Proceed with {plan.name}
                                </Button>
                            ) : isActive ? (
                                <Button disabled type="button">Session in progress</Button>
                            ) : plan.status === "ended" ? (
                                <Button disabled type="button">Session ended</Button>
                            ) : null}
                            <Button variant="destructive" size="sm" type="button" onClick={() => onDeletePlan(plan.id)}>
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

    const activePlans = plans.filter((p) => p.status !== "ended");
    const endedPlans = plans.filter((p) => p.status === "ended");
    const latestPlan = activePlans[activePlans.length - 1] ?? null;
    const latestIndex = plans.indexOf(latestPlan);

    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold text-foreground">Production plans</h1>
                <div className="flex items-center gap-2">
                    {plans.length > 0 && (
                        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" variant="outline" type="button">
                                    <History size={14} className="mr-1.5" /> History {endedPlans.length > 0 ? `(${endedPlans.length})` : ""}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Plan history</SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-3">
                                    {endedPlans.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <div className="text-[13px] font-semibold text-foreground mb-1">No ended plans yet</div>
                                            <div className="text-[11px]">Completed plans will appear here.</div>
                                        </div>
                                    ) : endedPlans.map((plan) => (
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
                        + New plan
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4.5 leading-relaxed">
                Create named plans and choose which products to include. Each plan tracks
                AI suggested changes over time.
            </p>

            {products.length === 0 ? (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[?]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No products yet</div>
                    <div className="text-[11px] leading-relaxed">Go to the Products tab first.</div>
                    <Button className="mt-3" type="button" onClick={onGoToProducts}>Go to Products &gt;</Button>
                </div>
            ) : !latestPlan ? (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[+]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No active plans</div>
                    <div className="text-[11px] leading-relaxed">Click "+ New plan" to create your next production plan.</div>
                </div>
            ) : (
                <PlanCard
                    plan={latestPlan}
                    index={latestIndex}
                    planLetters={planLetters}
                    session={session}
                    productsById={productsById}
                    activePlanId={activePlanId}
                    onTogglePlan={onTogglePlan}
                    onUpdatePlanQty={onUpdatePlanQty}
                    onProceedWithPlan={onProceedWithPlan}
                    onDeletePlan={onDeletePlan}
                    readonly={false}
                />
            )}
        </div>
    );
}
