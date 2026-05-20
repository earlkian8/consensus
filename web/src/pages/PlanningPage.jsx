import { Badge } from "@/components/shadcnUI/badge";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
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
        <div id="page-planning" className={`page ${active ? "active" : ""}`}>
            <div className="page-header">
                <div className="page-title">Production plans</div>
                <Button className="btn btn-green btn-sm" type="button" onClick={onOpenNewPlanModal}>
                    + New plan
                </Button>
            </div>
            <div className="page-sub">
                Create named plans and choose which products to include. Each plan tracks
                AI suggested changes over time.
            </div>

            {products.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">[?]</div>
                    <div className="empty-title">No products yet</div>
                    <div className="empty-sub">Go to the Products tab first.</div>
                    <Button
                        className="btn btn-green"
                        style={{ marginTop: "10px" }}
                        type="button"
                        onClick={onGoToProducts}
                    >
                        Go to Products -&gt;
                    </Button>
                </div>
            ) : plans.length === 0 ? (
                <div className="empty">
                    <div className="empty-icon">[+]</div>
                    <div className="empty-title">No plans yet</div>
                    <div className="empty-sub">
                        Click "+ New plan" to create your first production plan.
                    </div>
                </div>
            ) : (
                <div id="plans-list">
                    {plans.map((plan) => {
                        const totalItems = plan.items.length;
                        const hasAI = plan.items.some((item) => item.aiQty !== null);
                        const sessionCount = plan.sessions.length;
                        const adjustedCount = plan.items.filter(
                            (item) => item.aiDir === "down" || item.aiDir === "up"
                        ).length;
                        const isActive =
                            session && session.planId === plan.id && session.status === "active";

                        return (
                            <div
                                className={`plan-card fade-in ${activePlanId === plan.id ? "active-plan" : ""
                                    }`}
                                id={`pc-card-${plan.id}`}
                                key={plan.id}
                            >
                                <div
                                    className="plan-card-header"
                                    onClick={() => onTogglePlan(plan.id)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div
                                        className="plan-letter"
                                        style={{ background: plan.color }}
                                    >
                                        {planLetters[(plan.id - 1) % planLetters.length]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="plan-name">{plan.name}</div>
                                        <div className="plan-meta">
                                            {totalItems} products - ends {formatTimeTo12Hour(plan.endTime)}
                                            {isActive && (
                                                <Badge className="badge b-green">Active</Badge>
                                            )}
                                            {!isActive && sessionCount > 0 && (
                                                <Badge className="badge b-gray">
                                                    {sessionCount} session{sessionCount > 1 ? "s" : ""}
                                                </Badge>
                                            )}
                                            {hasAI && (
                                                <Badge className="badge b-purple">
                                                    {adjustedCount} AI change{adjustedCount !== 1 ? "s" : ""}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`plan-chevron ${activePlanId === plan.id ? "open" : ""
                                            }`}
                                    >
                                    <CircleFadingArrowUp />   
                                    </span>
                                </div>
                                <div
                                    className={`plan-body ${activePlanId === plan.id ? "open" : ""
                                        }`}
                                    id={`pb-${plan.id}`}
                                >
                                    <div className="section-label" style={{ marginTop: 0 }}>
                                        Products in this plan
                                    </div>
                                    <table className="pp-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th style={{ textAlign: "right" }}>Qty</th>
                                                <th>Unit</th>
                                                <th>Adjust / AI rec</th>
                                                <th style={{ textAlign: "center" }}>History</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plan.items.map((item) => {
                                                const product = productsById.get(item.productId);
                                                if (!product) {
                                                    return null;
                                                }
                                                const showAI = item.aiQty !== null;
                                                const aiTag = showAI ? (
                                                    <span
                                                        className={`ai-rec-tag ${{
                                                            down: "ai-rec-down",
                                                            up: "ai-rec-up",
                                                            same: "ai-rec-same",
                                                        }[item.aiDir]
                                                            }`}
                                                    >
                                                        AI {item.aiDir}: {item.aiQty}
                                                    </span>
                                                ) : null;
                                                const historyDots = (item.aiHistory || [])
                                                    .slice(-5)
                                                    .map((dir, index) => (
                                                        <span
                                                            key={`${item.productId}-${index}`}
                                                            className={`chg-indicator ${dir === "down"
                                                                ? "chg-down"
                                                                : dir === "up"
                                                                    ? "chg-up"
                                                                    : "chg-same"
                                                                }`}
                                                        />
                                                    ));

                                                return (
                                                    <tr key={item.productId}>
                                                        <td>
                                                            <b>{product.name}</b>{" "}
                                                            <span
                                                                style={{
                                                                    fontSize: "10px",
                                                                    color: "var(--text-t)",
                                                                }}
                                                            >
                                                                {product.cat}
                                                            </span>
                                                        </td>
                                                        <td style={{ textAlign: "right" }}>
                                                            {item.qty}
                                                        </td>
                                                        <td style={{ textAlign: "right" }}>{product.unit}</td>
                                                        <td>
                                                            <Input
                                                                className="qty-input"
                                                                type="number"
                                                                min="1"
                                                                value={item.qty}
                                                                onChange={(event) =>
                                                                    onUpdatePlanQty(
                                                                        plan.id,
                                                                        product.id,
                                                                        Number(event.target.value)
                                                                    )
                                                                }
                                                            />
                                                            {aiTag}
                                                        </td>
                                                        <td style={{ textAlign: "center" }}>
                                                            {historyDots.length > 0 ? (
                                                                historyDots
                                                            ) : (
                                                                <span
                                                                    style={{
                                                                        color: "var(--text-t)",
                                                                        fontSize: "10px",
                                                                    }}
                                                                >
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {hasAI && (
                                        <div className="ai-plan-note">
                                            AI has recommended changes for this plan. Adjusted
                                            quantities are shown above.
                                        </div>
                                    )}
                                    <div className="plan-actions">
                                        {!isActive ? (
                                            <Button
                                                className="btn btn-green"
                                                type="button"
                                                onClick={() => onProceedWithPlan(plan.id)}
                                            >
                                                Proceed with {plan.name}
                                            </Button>
                                        ) : (
                                            <Button className="btn" type="button" disabled>
                                                Session already active
                                            </Button>
                                        )}
                                        <Button
                                            className="btn btn-coral btn-sm"
                                            type="button"
                                            onClick={() => onDeletePlan(plan.id)}
                                        >
                                            Delete plan
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
