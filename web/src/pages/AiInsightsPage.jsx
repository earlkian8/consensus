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
        <div id="page-ai" className={`page ${active ? "active" : ""}`}>
            {aiStatus === "empty" && (
                <div className="empty">
                    <div className="empty-icon">[ ]</div>
                    <div className="empty-title">No analysis yet</div>
                    <div className="empty-sub">Complete an excess audit first.</div>
                    <Button
                        className="btn btn-green"
                        style={{ marginTop: "10px" }}
                        type="button"
                        onClick={onGoToAudit}
                    >
                        Go to Audit -&gt;
                    </Button>
                </div>
            )}
            {aiStatus === "loading" && (
                <div className="ai-box">
                    <div className="ai-label">Analyzing excess patterns...</div>
                    <div className="ai-thinking">
                        <div className="dot-anim" />
                        <div className="dot-anim" />
                        <div className="dot-anim" />
                    </div>
                    <div className="ai-subtle">Comparing with your plan quantities...</div>
                </div>
            )}
            {aiStatus === "results" && aiResults && (
                <div id="ai-results" className="fade-in">
                    <div className="page-title">AI recommendations</div>
                    <div className="page-sub">Based on today's session: {session?.planName}</div>
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="stat-num" style={{ color: "var(--coral)" }}>
                                {aiResults.wastePct}%
                            </div>
                            <div className="stat-lbl">Waste rate today</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num" style={{ color: "var(--amber)" }}>
                                {aiResults.adjustedCount}
                            </div>
                            <div className="stat-lbl">Items to adjust</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-num" style={{ color: "var(--green)" }}>
                                PHP {aiResults.totalSaved.toLocaleString()}
                            </div>
                            <div className="stat-lbl">Est. savings</div>
                        </div>
                    </div>
                    {aiResults.chartData.length > 0 && (
                        <Card className="card ai-chart-card">
                            <div className="card-title">Planned vs excess</div>
                            <div className="card-sub">
                                A quick look at planned output versus leftover items.
                            </div>
                            <div className="ai-chart">
                                <EvilBarChart
                                    config={chartConfig}
                                    data={aiResults.chartData}
                                    barCategoryGap={18}
                                    className="evil-chart"
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
                    <div className="ai-box">
                        <div className="ai-label">Recommendations</div>
                        <div id="ai-reco-list">
                            {aiResults.recommendations.map((text, index) => (
                                <div className="ai-item" key={`${text}-${index}`}>
                                    <div className="ai-dot" />
                                    <div className="ai-text">{text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="section-label">Suggested quantities for next run</div>
                    <Card className="card">
                        <div className="card-sub" style={{ marginBottom: "11px" }}>
                            These changes will be saved to the plan and shown as AI
                            recommendations next time you open it.
                        </div>
                        <div id="tomorrow-plan">
                            {aiResults.rows.map((row) => (
                                <div className="result-row" key={row.name}>
                                    <div className="result-name">{row.name}</div>
                                    <div className="result-val">
                                        {row.planned} {"->"} <b>{row.newQty}</b> {row.unit}
                                    </div>
                                    <div>
                                        <Badge
                                            className={`badge ${{
                                                    down: "b-coral",
                                                    up: "b-green",
                                                    same: "b-gray",
                                                }[row.dir]
                                                }`}
                                        >
                                            {row.dir}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="ai-actions">
                            <Button className="btn btn-green" type="button" onClick={onApplyChanges}>
                                Apply changes to plan
                            </Button>
                            <Button className="btn" type="button" onClick={onDismissAI}>
                                Keep original
                            </Button>
                        </div>
                    </Card>
                    {applyNoteVisible && (
                        <div className="apply-note">
                            Changes saved - visible in Planning tab under your plan.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
