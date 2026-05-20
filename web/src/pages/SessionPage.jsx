import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { formatDate, formatTime } from "@/lib/consensus-utils";

export default function SessionPage({
    active,
    session,
    productsById,
    onEndSessionEarly,
    onGoToPlanning,
    onGoToAudit,
}) {
    return (
        <div className={`max-w-215 mx-auto px-4 py-6 pb-10 ${active ? "block" : "hidden"}`}>
            {!session && (
                <div className="text-center py-7 px-3.5 text-muted-foreground">
                    <div className="text-3xl mb-2">[!]</div>
                    <div className="text-[13px] font-semibold text-foreground mb-1">No active session</div>
                    <div className="text-[11px] leading-relaxed">
                        Proceed with a plan from the Planning tab to start a session.
                    </div>
                    <Button className="mt-3" type="button" onClick={onGoToPlanning}>
                        Go to Planning -&gt;
                    </Button>
                </div>
            )}

            {session && session.status === "active" && (
                <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-primary">Session running</span>
                        <Badge
                            variant="secondary"
                            className="px-2"
                            style={{ background: `${session.planColor}22`, color: session.planColor }}
                        >
                            {session.planName}
                        </Badge>
                        <Badge variant="secondary" className="bg-secondary text-muted-foreground px-2">
                            {formatDate(session.startTime)}
                        </Badge>
                    </div>

                    <h1 className="text-xl font-bold text-foreground mb-1">{session.planName} - In progress</h1>
                    <p className="text-xs text-muted-foreground mb-4.5 leading-relaxed">
                        Scheduled to end at {formatTime(session.endTime)}. Your kitchen is
                        now serving.
                    </p>

                    <Card className="p-4 mb-4 shadow-sm text-center">
                        <div className="text-[11px] text-muted-foreground mb-1">Scheduled end time</div>
                        <div className="text-4xl font-bold text-foreground tracking-wide tabular-nums py-2 pb-3">
                            {formatTime(session.endTime)}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                            <Button variant="destructive" type="button" onClick={onEndSessionEarly}>
                                End session now
                            </Button>
                            <span className="text-[11px] text-muted-foreground">
                                Auto-ends when the clock hits the scheduled time
                            </span>
                        </div>
                    </Card>

                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-2">
                        Items in this session
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {session.items.map((item) => {
                            const product = productsById.get(item.productId);
                            return (
                                <div className="flex items-center gap-2.5 px-3 py-2.5 border rounded-lg bg-background" key={item.productId}>
                                    <div className="text-[13px] font-semibold flex-[1.8]">
                                        {product ? product.name : "?"}
                                    </div>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        {item.qty} {product ? product.unit : "units"}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {session && session.status === "ended" && (
                <div>
                    <Badge variant="destructive" className="mb-2.5 px-3 py-1 text-xs">Session ended</Badge>
                    <h1 className="text-xl font-bold text-foreground mb-1">{session.planName} - Ended</h1>
                    <p className="text-xs text-muted-foreground mb-4.5 leading-relaxed">
                        Session ended at {formatTime(session.endedAt || new Date())}. Now log
                        your excess.
                    </p>
                    <Card className="p-6 shadow-sm text-center">
                        <div className="text-3xl mb-2">[ ]</div>
                        <div className="text-[13px] font-semibold text-foreground mb-1">Ready for excess audit</div>
                        <div className="text-[11px] text-muted-foreground mb-3.5">
                            Log what was left over from today's production.
                        </div>
                        <Button type="button" onClick={onGoToAudit}>
                            Go to Excess Audit -&gt;
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}