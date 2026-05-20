import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { formatDate, formatDuration, formatTime } from "@/lib/consensus-utils";

export default function SessionPage({
    active,
    session,
    productsById,
    remainingMs,
    timerFill,
    onEndSessionEarly,
    onGoToPlanning,
    onGoToAudit,
}) {
    return (
        <div id="page-session" className={`page ${active ? "active" : ""}`}>
            {!session && (
                <div className="empty">
                    <div className="empty-icon">[!]</div>
                    <div className="empty-title">No active session</div>
                    <div className="empty-sub">
                        Proceed with a plan from the Planning tab to start a session.
                    </div>
                    <Button
                        className="btn btn-green"
                        style={{ marginTop: "10px" }}
                        type="button"
                        onClick={onGoToPlanning}
                    >
                        Go to Planning -&gt;
                    </Button>
                </div>
            )}

            {session && session.status === "active" && (
                <div id="session-active">
                    <div className="session-status">
                        <span className="status-dot" />
                        <span className="session-running">Session running</span>
                        <Badge
                            className="badge"
                            style={{
                                background: `${session.planColor}22`,
                                color: session.planColor,
                            }}
                        >
                            {session.planName}
                        </Badge>
                        <Badge className="badge b-gray">{formatDate(session.startTime)}</Badge>
                    </div>
                    <div className="page-title">{session.planName} - In progress</div>
                    <div className="page-sub">
                        Scheduled to end at {formatTime(session.endTime)}. Your kitchen is
                        now serving.
                    </div>
                    <Card className="card">
                        <div className="timer-label">Time remaining until scheduled end</div>
                        <div className="timer-display">{formatDuration(remainingMs)}</div>
                        <div className="timer-bar">
                            <div className="timer-fill" style={{ width: `${timerFill}%` }} />
                        </div>
                        <div className="timer-actions">
                            <Button className="btn btn-coral" type="button" onClick={onEndSessionEarly}>
                                End session now
                            </Button>
                            <span className="timer-note">or wait for scheduled end</span>
                        </div>
                    </Card>
                    <div className="section-label">Items in this session</div>
                    <div id="session-plan-list">
                        {session.items.map((item) => {
                            const product = productsById.get(item.productId);
                            return (
                                <div className="prod-row" key={item.productId}>
                                    <div className="pr-name">{product ? product.name : "?"}</div>
                                    <Badge className="badge b-green">
                                        {item.qty} {product ? product.unit : "units"}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {session && session.status === "ended" && (
                <div id="session-ended">
                    <Badge className="badge b-coral session-ended">Session ended</Badge>
                    <div className="page-title">{session.planName} - Ended</div>
                    <div className="page-sub">
                        Session ended at {formatTime(session.endedAt || new Date())}. Now log
                        your excess.
                    </div>
                    <Card className="card session-ended-card">
                        <div className="session-ended-icon">[ ]</div>
                        <div className="session-ended-title">Ready for excess audit</div>
                        <div className="session-ended-sub">
                            Log what was left over from today's production.
                        </div>
                        <Button className="btn btn-green" type="button" onClick={onGoToAudit}>
                            Go to Excess Audit -&gt;
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}
