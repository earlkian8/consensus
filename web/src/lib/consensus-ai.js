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

        // Handle liquid component for SOLID_IN_SOUP products
        if (entry.unitLiquid && entry.excessLiquid !== undefined) {
            const liquidPlanned = entry.liquidPlanned || 0;
            let newLiquidQty = liquidPlanned;
            let liquidDir = "same";

            if (liquidPlanned > 0) {
                const liquidPct = Math.round((entry.excessLiquid / liquidPlanned) * 100);
                if (liquidPct >= 25) {
                    newLiquidQty = Math.max(0.5, Math.round(liquidPlanned * 0.75 * 10) / 10);
                    liquidDir = "down";
                    recommendations.push(
                        `${entry.name} soup had ${liquidPct}% excess - reduce liquid by about 25% (${liquidPlanned} -> ${newLiquidQty} ${entry.unitLiquid}).`
                    );
                } else if (liquidPct >= 12) {
                    newLiquidQty = Math.max(0.5, Math.round(liquidPlanned * 0.9 * 10) / 10);
                    liquidDir = "down";
                    recommendations.push(
                        `${entry.name} soup had ${liquidPct}% excess - reduce liquid by about 10% (${liquidPlanned} -> ${newLiquidQty} ${entry.unitLiquid}).`
                    );
                } else if (liquidPct === 0) {
                    newLiquidQty = Math.round(liquidPlanned * 1.07 * 10) / 10;
                    liquidDir = "up";
                }
            }

            // Add liquid suggestion to the same product entry
            suggestions[suggestions.length - 1].newLiquidQty = newLiquidQty;
            suggestions[suggestions.length - 1].liquidDir = liquidDir;

            rows.push({
                name: `${entry.name} (soup)`,
                planned: liquidPlanned,
                newQty: newLiquidQty,
                unit: entry.unitLiquid,
                dir: liquidDir,
            });
        }

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
