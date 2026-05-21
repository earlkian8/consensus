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
        // ⚠️ Watch out: Strict guard clause. 
        // If the primary planned quantity is 0 or missing, it is NOT in this session.
        // This prevents default liquid volumes from sneaking inactive products into recommendations.
        if (!entry.planned || entry.planned <= 0) {
            return;
        }

        const suggestion = { productId: entry.productId };

        // 1. Process Solid Components
        totalPlanned += entry.planned;
        totalExcess += entry.excess || 0;
        const pct = Math.round(((entry.excess || 0) / entry.planned) * 100);
        let newQty = entry.planned;
        let dir = "same";

        if (pct >= 25) {
            newQty = Math.max(1, Math.round(entry.planned * 0.75));
            dir = "down";
            adjustedCount += 1;
            totalSaved += Math.round((entry.planned - newQty) * (entry.cost || 0));
            recommendations.push(
                `${entry.name} had ${pct}% excess - reduce by about 25% next run (${entry.planned} -> ${newQty} ${entry.excUnit}).`
            );
        } else if (pct >= 12) {
            newQty = Math.max(1, Math.round(entry.planned * 0.9));
            dir = "down";
            adjustedCount += 1;
            totalSaved += Math.round((entry.planned - newQty) * (entry.cost || 0));
            recommendations.push(
                `${entry.name} had ${pct}% excess - reduce by about 10% (${entry.planned} -> ${newQty} ${entry.excUnit}).`
            );
        } else if (pct === 0) {
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

        suggestion.newQty = newQty;
        suggestion.dir = dir;

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
            excess: entry.excess || 0,
        });

        // 2. Process Liquid Components (Only if the solid part was actually planned)
        if (entry.unitLiquid && entry.liquidPlanned > 0 && entry.excessLiquid !== undefined) {
            const liquidPlanned = entry.liquidPlanned;
            const liquidExcess = entry.excessLiquid || 0;
            const liquidPct = Math.round((liquidExcess / liquidPlanned) * 100);
            let newLiquidQty = liquidPlanned;
            let liquidDir = "same";

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
                recommendations.push(
                    `${entry.name} soup sold out - add about 7% buffer (${liquidPlanned} -> ${newLiquidQty} ${entry.unitLiquid}).`
                );
            } else {
                recommendations.push(
                    `${entry.name} soup is within range (${liquidPct}% excess) - keep the same quantity.`
                );
            }

            suggestion.newLiquidQty = newLiquidQty;
            suggestion.liquidDir = liquidDir;

            rows.push({
                name: `${entry.name} (soup)`,
                planned: liquidPlanned,
                newQty: newLiquidQty,
                unit: entry.unitLiquid,
                dir: liquidDir,
            });
            
            chartData.push({
                name: `${entry.name} (soup)`,
                planned: liquidPlanned,
                excess: liquidExcess,
            });
        }

        suggestions.push(suggestion);
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