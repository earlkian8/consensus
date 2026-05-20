import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import {
    Bar,
    EvilBarChart,
    Grid,
    Legend,
    Tooltip,
    XAxis,
    YAxis,
} from "@/components/evilcharts/charts/bar-chart";

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
    return (
        <div className={`max-w-215 mx-auto px-4 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            {aiStatus === "empty" && (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[ ]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No analysis yet</div>
                    <div className="text-[11px] leading-relaxed">Complete an excess audit first.</div>
                    <Button className="mt-3" type="button" onClick={onGoToAudit}>
                        Go to Audit -&gt;
                    </Button>
                </div>
            )}

            {aiStatus === "loading" && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mt-2.5">
                    <div className="text-[10px] font-bold text-teal-700 tracking-widest uppercase flex items-center gap-1.5 mb-2.5">
                        Analyzing excess patterns...
                    </div>
                    <div className="flex gap-1 items-center py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-0" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150" />
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300" />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-destructive">{aiResults.wastePct}%</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Waste rate today</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-amber-600">{aiResults.adjustedCount}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Items to adjust</div>
                        </Card>
                        <Card className="p-3 bg-secondary/50 border-none">
                            <div className="text-xl font-bold text-primary">PHP {aiResults.totalSaved.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">Est. savings</div>
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
                            These changes will be saved to the plan and shown as AI
                            recommendations next time you open it.
                        </div>
                        <div className="flex flex-col gap-1.5 mb-3">
                            {aiResults.rows.map((row) => (
                                <div className="flex items-center gap-2.5 px-3 py-2 border rounded-lg bg-background" key={row.name}>
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
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <Button type="button" onClick={onApplyChanges}>
                                Apply changes to plan
                            </Button>
                            <Button variant="outline" type="button" onClick={onDismissAI}>
                                Keep original
                            </Button>
                        </div>
                    </Card>

                    {applyNoteVisible && (
                        <div className="text-center text-[11px] text-primary font-bold mt-2">
                            Changes saved - visible in Planning tab under your plan.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}