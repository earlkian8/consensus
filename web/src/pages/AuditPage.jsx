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
    dispositions,
    units,
    conditions,
    auditDisposition,
    auditNotes,
    onAuditEntryChange,
    onDispositionChange,
    onNotesChange,
    onRunAI,
    onGoToPlanning,
}) {
    return (
        <div id="page-audit" className={`page ${active ? "active" : ""}`}>
            {!session || session.status !== "ended" ? (
                <div className="empty">
                    <div className="empty-icon">[ ]</div>
                    <div className="empty-title">No ended session</div>
                    <div className="empty-sub">Start and end a session first.</div>
                    <Button
                        className="btn btn-green"
                        style={{ marginTop: "10px" }}
                        type="button"
                        onClick={onGoToPlanning}
                    >
                        Go to Planning -&gt;
                    </Button>
                </div>
            ) : (
                <div id="audit-content">
                    <div className="page-title">Excess audit</div>
                    <div className="page-sub">Logging excess for: {session.planName}</div>
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-num">{auditStats.planned || "-"}</div>
                            <div className="stat-lbl">Total planned</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num" style={{ color: "var(--coral)" }}>
                                {auditStats.excess || "-"}
                            </div>
                            <div className="stat-lbl">Total excess</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num" style={{ color: "var(--amber)" }}>
                                {`${auditStats.pct}%`}
                            </div>
                            <div className="stat-lbl">Waste rate</div>
                        </div>
                    </div>
                    <div id="audit-items">
                        {session.items.map((item) => {
                            const product = productsById.get(item.productId);
                            if (!product) {
                                return null;
                            }
                            const entry = auditEntries[product.id] || {
                                excessQty: "",
                                unit: product.unit,
                                condition: conditions[0],
                            };

                            return (
                                <div className="audit-item fade-in" key={product.id}>
                                    <div className="audit-head">
                                        <div style={{ flex: 1 }}>
                                            <div className="audit-name">{product.name}</div>
                                            <div className="audit-planned">
                                                Planned: {item.qty} {product.unit}
                                            </div>
                                        </div>
                                        <Badge className="badge b-green">Planned: {item.qty}</Badge>
                                    </div>
                                    <div className="audit-body">
                                        <div className="field">
                                            <label>Excess amount</label>
                                            <Input
                                                className="field-input"
                                                type="number"
                                                min="0"
                                                value={entry.excessQty}
                                                onChange={(event) =>
                                                    onAuditEntryChange(
                                                        product.id,
                                                        { excessQty: event.target.value },
                                                        product.unit
                                                    )
                                                }
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Unit</label>
                                            <select
                                                value={entry.unit}
                                                onChange={(event) =>
                                                    onAuditEntryChange(
                                                        product.id,
                                                        { unit: event.target.value },
                                                        product.unit
                                                    )
                                                }
                                            >
                                                {units.map((unit) => (
                                                    <option key={unit}>{unit}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Condition</label>
                                            <select
                                                value={entry.condition}
                                                onChange={(event) =>
                                                    onAuditEntryChange(
                                                        product.id,
                                                        { condition: event.target.value },
                                                        product.unit
                                                    )
                                                }
                                            >
                                                {conditions.map((condition) => (
                                                    <option key={condition}>{condition}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="section-label">Excess disposition</div>
                    <Card className="card">
                        <div className="row">
                            <div className="field">
                                <label>What was done with excess?</label>
                                <select
                                    value={auditDisposition}
                                    onChange={(event) => onDispositionChange(event.target.value)}
                                >
                                    {dispositions.map((option) => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label>Notes</label>
                                <Input
                                    className="field-input"
                                    value={auditNotes}
                                    onChange={(event) => onNotesChange(event.target.value)}
                                    placeholder="e.g. rainy, low footfall"
                                />
                            </div>
                        </div>
                    </Card>
                    <Button
                        className="btn btn-green btn-full"
                        style={{ marginTop: "6px" }}
                        type="button"
                        onClick={onRunAI}
                    >
                        Analyze with AI and get recommendations -&gt;
                    </Button>
                </div>
            )}
        </div>
    );
}
