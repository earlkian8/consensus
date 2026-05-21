    import React, { useEffect, useState } from "react";
import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { api } from "@/lib/api";
import {
    Bar,
    EvilBarChart,
    Grid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from "@/components/evilcharts/charts/bar-chart";
import { History, TrendingDown, TrendingUp, Minus } from "lucide-react";

export default function AiInsightsPage({
    active,
    aiStatus,
    aiResults,
    session,
    chartConfig,
    applyNoteVisible,
    onGoToAudit,
    onApplyChanges,
    onDismissAI,
}) {
    const [historyLogs, setHistoryLogs] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (active && showHistory && historyLogs.length === 0) {
            api.getAnalyticsLogs()
                .then((data) => setHistoryLogs(data))
                .catch(() => {});
        }
    }, [active, showHistory]);

    return (
        <div className={`max-w-6xl mx-auto px-6 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            {aiStatus === "empty" && (
                <div>
                    <div className="text-center py-7 px-3.5 text-muted-foreground">
                        <div className="text-3xl mb-2">[ ]</div>
                        <div className="text-[13px] font-semibold text-foreground mb-1">No analysis yet</div>
                        <div className="text-[11px] leading-relaxed">Complete an excess audit first.</div>
                        <Button className="mt-3" type="button" onClick={onGoToAudit}>
                            Go to Audit -&gt;
                        </Button>
                    </div>

                    {/* History toggle when no active analysis */}
                    <div className="mt-6 border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="gap-1.5"
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History size={14} />
                            {showHistory ? "Hide" : "View"} AI History
                        </Button>
                        {showHistory && <HistorySection logs={historyLogs} />}
                    </div>
                </div>
            )}

            {aiStatus === "loading" && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-2.5">
                    <div className="text-[10px] font-bold text-teal-700 tracking-widest uppercase flex items-center gap-1.5 mb-2.5">
                        Analyzing excess patterns...
                    </div>
                    <div className="flex gap-1 items-center py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                    </div>
                    <div className="text-[11px] text-teal-700 mt-1">Comparing with your plan quantities...</div>
                </div>
            )}

            {aiStatus === "results" && aiResults && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <h1 className="text-xl font-bold text-foreground mb-1">AI recommendations</h1>
                    <p className="text-xs text-muted-foreground mb-4.5 leading-relaxed">
                        Based on today's session: {session?.planName}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-destructive">{aiResults.wastePct}%</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Waste rate today</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-amber-600">{aiResults.adjustedCount}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Items to adjust</div>
                        </Card>
                    </div>

                    {aiResults.chartData.length > 0 && (
                        <Card className="p-4 mb-2.5 shadow-sm">
                            <div className="text-[13px] font-semibold text-foreground mb-0.5">Planned vs excess</div>
                            <div className="text-[11px] text-muted-foreground mb-3">
                                A quick look at planned output versus leftover items.
                            </div>
                            <div className="h-60 mt-2">
                                <EvilBarChart
                                    config={chartConfig}
                                    data={aiResults.chartData}
                                    barCategoryGap={18}
                                    className="h-full"
                                    backgroundVariant="tiny-checkers"
                                >
                                    <Grid />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend variant="rounded-square" align="right" />
                                    <Bar dataKey="planned" variant="gradient" />
                                    <Bar dataKey="excess" variant="hatched" />
                                </EvilBarChart>
                            </div>
                        </Card>
                    )}

                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-2.5 mb-4">
                        <div className="text-[10px] font-bold text-teal-700 tracking-widest uppercase mb-2.5">
                            Recommendations
                        </div>
                        <div className="flex flex-col">
                            {aiResults.recommendations.map((text, index) => (
                                <div className="flex gap-2 py-1.5 border-b border-primary/20 last:border-b-0" key={`${text}-${index}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <div className="text-xs text-teal-900 leading-relaxed">{text}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-2">
                        Suggested quantities for next run
                    </div>
                    <Card className="p-4 shadow-sm">
                        <div className="text-[11px] text-muted-foreground mb-3">
                            Choose to apply AI-optimized quantities or keep your original plan.
                        </div>
                        <div className="flex flex-col gap-1.5 mb-3">
                            {aiResults.rows.map((row) => (
                                <React.Fragment key={row.name}>
                                    <div className="flex items-center gap-2.5 px-3 py-2 border rounded-lg bg-background">
                                        <div className="text-xs font-semibold flex-[1.5]">{row.name}</div>
                                        <div className="text-xs flex-1 text-right text-muted-foreground">
                                            {row.planned} {"->"} <b className="text-foreground">{row.newQty}</b> {row.unit}
                                        </div>
                                        <div>
                                            <Badge
                                                variant="secondary"
                                                className={`${row.dir === "down" ? "bg-destructive/10 text-destructive" :
                                                    row.dir === "up" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                                                    }`}
                                            >
                                                {row.dir}
                                            </Badge>
                                        </div>
                                    </div>
                                    {row.newLiquidQty != null && row.unitLiquid && (
                                        <div className="flex items-center gap-2.5 px-3 py-2 border rounded-lg bg-background ml-4">
                                            <div className="text-xs font-semibold flex-[1.5] text-muted-foreground">{row.name} (liquid)</div>
                                            <div className="text-xs flex-1 text-right text-muted-foreground">
                                                {row.plannedLiquid} {"->"} <b className="text-foreground">{row.newLiquidQty}</b> {row.unitLiquid}
                                            </div>
                                            <div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${row.liquidDir === "down" ? "bg-destructive/10 text-destructive" :
                                                        row.liquidDir === "up" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                                                        }`}
                                                >
                                                    {row.liquidDir}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <Button type="button" onClick={onApplyChanges}>
                                Apply AI changes to next plan
                            </Button>
                            <Button variant="outline" type="button" onClick={onDismissAI}>
                                Keep original quantities
                            </Button>
                        </div>
                    </Card>

                    {applyNoteVisible && (
                        <div className="text-center text-[11px] text-primary font-bold mt-2">
                            Changes saved - new plan created in Planning tab.
                        </div>
                    )}

                    {/* History section */}
                    <div className="mt-6 border-t pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="gap-1.5"
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History size={14} />
                            {showHistory ? "Hide" : "View"} AI History
                        </Button>
                        {showHistory && <HistorySection logs={historyLogs} />}
                    </div>
                </div>
            )}
        </div>
    );
}

function HistorySection({ logs }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="mt-4 text-center py-6 text-muted-foreground">
                <div className="text-xs">No AI history yet. Run your first analysis to see logs here.</div>
            </div>
        );
    }

    // Group logs by plan date
    const grouped = {};
    logs.forEach((log) => {
        const date = log.production_plans?.date || "Unknown";
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(log);
    });

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Previous AI Analyses
            </div>
            {Object.entries(grouped)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, items]) => (
                    <Card key={date} className="p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-foreground">{date}</div>
                            <Badge variant="secondary" className="text-[10px]">
                                {items.length} product{items.length !== 1 ? "s" : ""}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1">
                            {items.map((item) => {
                                const name = item.products?.name || item.p_fk;
                                const suggested = Math.round(Number(item.suggested_amount));
                                const suggestedLiquid = item.suggested_liquid_amount != null
                                    ? Number(Number(item.suggested_liquid_amount).toFixed(1))
                                    : null;

                                return (
                                    <div key={item.id || `${item.p_fk}-${date}`} className="flex items-center gap-2 px-2 py-1.5 rounded bg-secondary/40">
                                        <span className="text-xs font-medium flex-1">{name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Suggested: <b className="text-foreground">{suggested}</b>
                                            {suggestedLiquid != null && (
                                                <> + <b className="text-foreground">{suggestedLiquid}L</b></>
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ))}
        </div>
    );
}
