import React from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { Card } from "@/components/shadcnUI/card";
import { CircleFadingArrowUp } from "lucide-react";

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
    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold text-foreground">Production plans</h1>
                <Button size="sm" type="button" onClick={onOpenNewPlanModal}>
                    + New plan
                </Button>
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
                    <Button className="mt-3" type="button" onClick={onGoToProducts}>
                        Go to Products -&gt;
                    </Button>
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[+]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No plans yet</div>
                    <div className="text-[11px] leading-relaxed">
                        Click "+ New plan" to create your first production plan.
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {plans.map((plan) => {
                        const totalItems = plan.items.length;
                        const hasAI = plan.items.some((item) => item.aiQty !== null);
                        const sessionCount = plan.sessions.length;
                        const adjustedCount = plan.items.filter(
                            (item) => item.aiDir === "down" || item.aiDir === "up"
                        ).length;
                        const isActive = session && session.planId === plan.id && session.status === "active";
                        const isOpen = activePlanId === plan.id;

                        return (
                            <Card
                                className={`p-0 overflow-hidden transition-colors shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 ${isOpen ? "border-primary" : "border-border"}`}
                                key={plan.id}
                            >
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
                                        {planLetters[(plan.id - 1) % planLetters.length]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-foreground">{plan.name}</div>
                                        <div className="text-[11px] text-muted-foreground flex flex-wrap gap-1.5 items-center mt-0.5">
                                            {totalItems} products - ends {formatTimeTo12Hour(plan.endTime)}
                                            {isActive && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary text-[10px] px-2 py-0">Active</Badge>
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
                                                <tbody>
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
                                                            <React.Fragment key={item.productId}>
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
                                                                                value={item.liquidQty ?? product.batch_liquid_volume ?? 0}
                                                                                onChange={(e) => onUpdatePlanQty(plan.id, product.id, Number(e.target.value), "liquidQty")}
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {hasAI && (
                                            <div className="mt-2 p-2 bg-primary/10 rounded-lg text-[11px] text-teal-900">
                                                AI has recommended changes for this plan. Adjusted quantities are shown above.
                                            </div>
                                        )}
                                        <div className="mt-3.5 flex flex-col sm:flex-row gap-2">
                                            {!isActive ? (
                                                <Button type="button" onClick={() => onProceedWithPlan(plan.id)}>
                                                    Proceed with {plan.name}
                                                </Button>
                                            ) : (
                                                <Button disabled type="button">Session already active</Button>
                                            )}
                                            <Button variant="destructive" size="sm" type="button" onClick={() => onDeletePlan(plan.id)}>
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
        </div>
    );
}