import { supabase } from "../../shared/database/supabase.js";

export const getLatestProductPlanning = async () => {
  const { data, error } = await supabase
    .from("production_plans")
    .select("*, production_details(*)")
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const getProductPlanningLogs = async () => {
  const { data, error } = await supabase
    .from("production_plans")
    .select("*, production_details(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

export const createProductPlanning = async (planning) => {
  const { name, date, end_time, is_ready_analysis, details } = planning;

  const { data: plan, error: planError } = await supabase
    .from("production_plans")
    .insert({ name, date, end_time: end_time ?? null, is_ready_analysis: is_ready_analysis ?? false })
    .select()
    .single();

  if (planError) throw planError;

  const { data: planDetails, error: detailsError } = await supabase
    .from("production_details")
    .insert(details.map((d) => ({ pp_fk: plan.id, p_fk: d.p_fk, amount: d.amount, liquid_amount: d.liquid_amount ?? null, excess: d.excess ?? null })))
    .select();

  if (detailsError) throw detailsError;

  return { ...plan, details: planDetails };
};

export const updateProductDetailAmount = async (detailId, amount) => {
  const { data, error } = await supabase
    .from("production_details")
    .update({ amount })
    .eq("id", detailId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProductDetailExcess = async (planId, details) => {
  // Bulk update each detail's excess
  const updates = await Promise.all(
    details.map(({ id, excess, condition }) =>
      supabase
        .from("production_details")
        .update({ excess, condition: condition ?? null })
        .eq("id", id)
        .select()
        .single()
    )
  );

  const failed = updates.find((r) => r.error);
  if (failed) throw failed.error;

  // Check if all details for this plan have excess filled
  const { data: allDetails, error: checkError } = await supabase
    .from("production_details")
    .select("excess")
    .eq("pp_fk", planId);

  if (checkError) throw checkError;

  const allFilled = allDetails.every((d) => d.excess !== null);

  if (allFilled) {
    const { error: updatePlanError } = await supabase
      .from("production_plans")
      .update({ is_ready_analysis: true })
      .eq("id", planId);

    if (updatePlanError) throw updatePlanError;

    await runAnalysis(planId);
  }

  return { updated: updates.map((r) => r.data), is_ready_analysis: allFilled };
};

const runAnalysis = async (planId) => {
  const { data: currentDetails, error: currentError } = await supabase
    .from("production_details")
    .select("p_fk, amount, liquid_amount, excess")
    .eq("pp_fk", planId);

  if (currentError) throw currentError;

  console.log("[runAnalysis] planId:", planId);
  console.log("[runAnalysis] currentDetails:", JSON.stringify(currentDetails));

  const suggestions = await Promise.all(
    currentDetails.map(async ({ p_fk, amount, liquid_amount, excess }) => {
      const { data: history, error: historyError } = await supabase
        .from("production_details")
        .select("amount, liquid_amount, excess")
        .eq("p_fk", p_fk)
        .not("excess", "is", null)
        .neq("pp_fk", planId)
        .order("created_at", { ascending: false })
        .limit(7);

      if (historyError) throw historyError;

      console.log(`[runAnalysis] p_fk=${p_fk} amount=${amount} liquid=${liquid_amount} excess=${excess} history=${JSON.stringify(history)}`);

      const calcSuggested = (amt, exc, hist) => {
        const fAmt = parseFloat(amt);
        const fExc = parseFloat(exc || 0);
        const sold = fAmt - fExc;

        if (!hist || hist.length === 0) {
          // No history: nudge up 5% if zero excess (sold out), else use sold
          return fExc === 0 ? Math.round(fAmt * 1.05) : Math.max(1, sold);
        }

        // Weighted average of sold across history (most recent = highest weight)
        const entries = [{ a: fAmt, e: fExc }, ...hist.map((h) => ({
          a: parseFloat(h.amount || 0),
          e: parseFloat(h.excess || 0),
        }))];

        let weightedSum = 0, weightTotal = 0;
        entries.forEach(({ a, e }, i) => {
          const weight = entries.length - i;
          weightedSum += (a - e) * weight;
          weightTotal += weight;
        });
        const weightedAvg = weightedSum / weightTotal;

        const avgExcess = entries.reduce((s, { e }) => s + e, 0) / entries.length;
        const avgAmt = entries.reduce((s, { a }) => s + a, 0) / entries.length;
        const excessRate = avgAmt > 0 ? avgExcess / avgAmt : 0;

        if (excessRate > 0.2) return weightedAvg * (1 - excessRate * 0.5);
        if (fExc === 0) return weightedAvg * 1.05;
        return weightedAvg;
      };

      const suggested = calcSuggested(amount, excess, history);

      // For liquid: scale proportionally to the solid suggestion ratio
      // (no separate liquid excess tracked)
      const suggested_liquid = liquid_amount != null
        ? parseFloat(amount) > 0
          ? parseFloat(liquid_amount) * (suggested / parseFloat(amount))
          : parseFloat(liquid_amount)
        : null;

      return {
        pp_fk: planId,
        p_fk,
        suggested_amount: Math.max(1, parseFloat(suggested.toFixed(2))),
        suggested_liquid_amount: suggested_liquid != null ? Math.max(0.1, parseFloat(suggested_liquid.toFixed(2))) : null,
      };
    })
  );

  console.log("[runAnalysis] suggestions:", JSON.stringify(suggestions));

  const { error: insertError } = await supabase
    .from("production_analysis")
    .delete()
    .eq("pp_fk", planId);

  if (insertError) throw insertError;

  const { error: insertError2 } = await supabase
    .from("production_analysis")
    .insert(suggestions);

  if (insertError2) throw insertError2;
};

export const updatePlanStatus = async (id, status) => {
  const patch = { status };
  if (status === "active") patch.started_at = new Date().toISOString();
  if (status === "ended") patch.ended_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("production_plans")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProductPlanning = async (id, planning) => {
  const { date, is_ready_analysis } = planning;

  const { data, error } = await supabase
    .from("production_plans")
    .update({ date, is_ready_analysis })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProductPlanning = async (id) => {
  const { data, error } = await supabase
    .from("production_plans")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};