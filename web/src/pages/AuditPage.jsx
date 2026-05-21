import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function AuditPage({
    active,
    session,
    productsById,
    auditEntries,
    auditStats,
    conditions,
    onAuditEntryChange,
    onRunAI,
    onGoToPlanning,
}) {
    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            {!session || session.status !== "ended" ? (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[ ]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No ended session</div>
                    <div className="text-[11px] leading-relaxed">Start and end a session first.</div>
                    <Button className="mt-3" type="button" onClick={onGoToPlanning}>
                        Go to Planning -&gt;
                    </Button>
                </div>
            ) : (
                <div>
                    <h1 className="text-xl font-bold text-foreground mb-1">Excess audit</h1>
                    <p className="text-xs text-muted-foreground mb-4.5 leading-relaxed">
                        Logging excess for: {session.planName}
                    </p>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-foreground">
                                {auditStats.planned || "-"}
                                {auditStats.plannedLiquid > 0 && (
                                    <span className="text-sm font-medium ml-1">+ {auditStats.plannedLiquid}L</span>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Total planned</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-destructive">
                                {auditStats.excess || "-"}
                                {auditStats.excessLiquid > 0 && (
                                    <span className="text-sm font-medium ml-1">+ {auditStats.excessLiquid}L</span>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Total excess</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-amber-600">
                                {`${auditStats.pct}%`}
                                {auditStats.plannedLiquid > 0 && (
                                    <span className="text-sm font-medium ml-1">/ {auditStats.pctLiquid}%</span>
                                )}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                                Waste rate{auditStats.plannedLiquid > 0 ? " (solid / liquid)" : ""}
                            </div>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {session.items.map((item) => {
                            const product = productsById.get(item.productId);
                            if (!product) return null;
                            const entry = auditEntries[product.id] || {
                                excessQty: "",
                                unit: product.unit,
                                condition: "Repurposable",
                            };

                            const isStewOnly = product.dish_type === "SOUP_STEW";
                            const hasLiquid = product.unit_liquid && !isStewOnly;

                            return (
                                <Card className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300" key={product.id}>
                                    <div className="flex items-center gap-2.5 p-2.5 bg-secondary/50 border-b">
                                        <div className="flex-1">
                                            <div className="text-[13px] font-bold text-foreground">{product.name}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Planned: {item.qty} {product.unit_solid || product.unit}
                                                {hasLiquid && (
                                                    <> + {item.liquidQty ?? product.batch_liquid_volume ?? 0} {product.unit_liquid}</>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                                {item.qty} {product.unit_solid || product.unit}
                                            </Badge>
                                            {hasLiquid && (
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {item.liquidQty ?? product.batch_liquid_volume ?? 0} {product.unit_liquid}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-wrap items-end gap-3 bg-background">
                                        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                            <label className="text-[11px] font-semibold text-muted-foreground">
                                                Excess {product.unit_solid || product.unit}
                                            </label>
                                            <Input
                                                className="h-8.5 text-[13px] bg-background"
                                                type="number"
                                                min="0"
                                                value={entry.excessQty}
                                                onChange={(event) =>
                                                    onAuditEntryChange(product.id, { excessQty: event.target.value }, product.unit)
                                                }
                                                placeholder="0"
                                            />
                                        </div>
                                        {hasLiquid && (
                                            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                                                <label className="text-[11px] font-semibold text-muted-foreground">
                                                    Excess {product.unit_liquid}
                                                </label>
                                                <Input
                                                    className="h-8.5 text-[13px] bg-background"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={entry.excessLiquidQty || ""}
                                                    onChange={(event) =>
                                                        onAuditEntryChange(product.id, { excessLiquidQty: event.target.value }, product.unit)
                                                    }
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 cursor-pointer py-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                                                checked={entry.condition === "Repurposable"}
                                                onChange={(event) =>
                                                    onAuditEntryChange(
                                                        product.id,
                                                        { condition: event.target.checked ? "Repurposable" : "Must discard" },
                                                        product.unit
                                                    )
                                                }
                                            />
                                            <span className="text-[11px] font-semibold text-muted-foreground">Can be repurposed</span>
                                        </label>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    <Button className="w-full mt-4 font-semibold" type="button" onClick={onRunAI}>
                        Analyze with AI and get recommendations -&gt;
                    </Button>
                </div>
            )}
        </div>
    );
}
