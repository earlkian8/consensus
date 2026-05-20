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
    units,
    conditions,
    onAuditEntryChange,
    onRunAI,
    onGoToPlanning,
}) {
    return (
        <div className={`max-w-215 mx-auto px-4 py-6 pb-10 ${active ? "block" : "hidden"}`}>
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
                            <div className="text-xl font-bold text-foreground">{auditStats.planned || "-"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Total planned</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-destructive">{auditStats.excess || "-"}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Total excess</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-amber-600">{`${auditStats.pct}%`}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Waste rate</div>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {session.items.map((item) => {
                            const product = productsById.get(item.productId);
                            if (!product) return null;
                            const entry = auditEntries[product.id] || {
                                excessQty: "",
                                unit: product.unit,
                                condition: conditions[0],
                            };

                            return (
                                <Card className="p-0 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300" key={product.id}>
                                    <div className="flex items-center gap-2.5 p-2.5 bg-secondary/50 border-b">
                                        <div className="flex-1">
                                            <div className="text-[13px] font-bold text-foreground">{product.name}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                Planned: {item.qty} {product.unit}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                            Planned: {item.qty}
                                        </Badge>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-background">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-semibold text-muted-foreground">Excess amount</label>
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
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-semibold text-muted-foreground">Unit</label>
                                            <select
                                                className="h-8.5 text-[13px] px-2.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={entry.unit}
                                                onChange={(event) =>
                                                    onAuditEntryChange(product.id, { unit: event.target.value }, product.unit)
                                                }
                                            >
                                                {units.map((unit) => (
                                                    <option key={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-semibold text-muted-foreground">Condition</label>
                                            <select
                                                className="h-8.5 text-[13px] px-2.5 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={entry.condition}
                                                onChange={(event) =>
                                                    onAuditEntryChange(product.id, { condition: event.target.value }, product.unit)
                                                }
                                            >
                                                {conditions.map((condition) => (
                                                    <option key={condition}>{condition}</option>
                                                ))}
                                            </select>
                                        </div>
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