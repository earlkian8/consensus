export const buildAIResults = (auditRows) => {
    let totalPlanned = 0;
    let totalExcess = 0;
    let totalSaved = 0;
    let adjustedCount = 0;
    const recommendations = [];
    const suggestions = [];
    const rows = [];
    const chartData = [];

    auditRows.forEach((entry) => {
        totalPlanned += entry.planned;
        totalExcess += entry.excess;
        const pct = entry.planned > 0 ? Math.round((entry.excess / entry.planned) * 100) : 0;
        let newQty = entry.planned;
        let dir = "same";

        if (pct >= 25) {
            newQty = Math.max(1, Math.round(entry.planned * 0.75));
            dir = "down";
            adjustedCount += 1;
            totalSaved += Math.round((entry.planned - newQty) * entry.cost);
            recommendations.push(
                `${entry.name} had ${pct}% excess - reduce by about 25% next run (${entry.planned} -> ${newQty} ${entry.excUnit}).`
            );
        } else if (pct >= 12) {
            newQty = Math.max(1, Math.round(entry.planned * 0.9));
            dir = "down";
            adjustedCount += 1;
            totalSaved += Math.round((entry.planned - newQty) * entry.cost);
            recommendations.push(
                `${entry.name} had ${pct}% excess - reduce by about 10% (${entry.planned} -> ${newQty} ${entry.excUnit}).`
            );
        } else if (pct === 0 && entry.planned > 0) {
            newQty = Math.round(entry.planned * 1.07);
            dir = "up";
            recommendations.push(
                `${entry.name} sold out - add about 7% buffer (${entry.planned} -> ${newQty} ${entry.excUnit}).`
            );
        } else {
            recommendations.push(
                `${entry.name} is within range (${pct}% excess) - keep the same quantity.`
            );
        }

        suggestions.push({
            productId: entry.productId,
            newQty,
            dir,
        });
        rows.push({
            name: entry.name,
            planned: entry.planned,
            newQty,
            unit: entry.excUnit,
            dir,
        });
        chartData.push({
            name: entry.name,
            planned: entry.planned,
            excess: entry.excess,
        });
    });

    const wastePct = totalPlanned > 0 ? Math.round((totalExcess / totalPlanned) * 100) : 0;
    recommendations.push(
        `Overall waste rate: ${wastePct}%. SDG 12 target is 10% or lower. ${
            wastePct <= 10 ? "On track." : "Keep reducing to reach the goal."
        }`
    );

    return {
        wastePct,
        adjustedCount,
        totalSaved,
        recommendations,
        suggestions,
        rows,
        chartData,
    };
};
