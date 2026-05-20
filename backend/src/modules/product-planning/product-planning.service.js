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
  const { date, is_ready_analysis, details } = planning;

  const { data: plan, error: planError } = await supabase
    .from("production_plans")
    .insert({ date, is_ready_analysis: is_ready_analysis ?? false })
    .select()
    .single();

  if (planError) throw planError;

  const { data: planDetails, error: detailsError } = await supabase
    .from("production_details")
    .insert(details.map((d) => ({ pp_fk: plan.id, p_fk: d.p_fk, amount: d.amount, excess: d.excess ?? null })))
    .select();

  if (detailsError) throw detailsError;

  return { ...plan, details: planDetails };
};

export const updateProductDetailExcess = async (planId, details) => {
  // Bulk update each detail's excess
  const updates = await Promise.all(
    details.map(({ id, excess }) =>
      supabase
        .from("production_details")
        .update({ excess })
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
  // Fetch current plan details with product info
  const { data: currentDetails, error: currentError } = await supabase
    .from("production_details")
    .select("p_fk, amount, excess")
    .eq("pp_fk", planId);

  if (currentError) throw currentError;

  const suggestions = await Promise.all(
    currentDetails.map(async ({ p_fk, amount, excess }) => {
      // Fetch last 7 days of history for this product (excluding current plan)
      const { data: history, error: historyError } = await supabase
        .from("production_details")
        .select("amount, excess, production_plans(date)")
        .eq("p_fk", p_fk)
        .not("excess", "is", null)
        .neq("pp_fk", planId)
        .order("created_at", { ascending: false })
        .limit(7);

      if (historyError) throw historyError;

      const sold = parseFloat(amount) - parseFloat(excess);

      let suggested;

      if (!history || history.length === 0) {
        // No history: use today's sold as baseline, nudge up slightly if no excess
        suggested = excess == 0 ? sold * 1.05 : sold;
      } else {
        // Weighted average: more recent days get higher weight
        const entries = [{ amount, excess }, ...history];
        let weightedSum = 0;
        let weightTotal = 0;

        entries.forEach(({ amount: a, excess: e }, i) => {
          const weight = entries.length - i; // most recent = highest weight
          const daySold = parseFloat(a) - parseFloat(e);
          weightedSum += daySold * weight;
          weightTotal += weight;
        });

        const weightedAvg = weightedSum / weightTotal;

        // Excess trend: compare avg excess of recent days
        const avgExcess = entries.reduce((sum, { excess: e }) => sum + parseFloat(e), 0) / entries.length;
        const excessRate = avgExcess / (entries.reduce((sum, { amount: a }) => sum + parseFloat(a), 0) / entries.length);

        if (excessRate > 0.2) {
          // High excess trend (>20% waste) — reduce suggestion
          suggested = weightedAvg * (1 - excessRate * 0.5);
        } else if (parseFloat(excess) === 0) {
          // Zero excess today — might be undersupplying, nudge up
          suggested = weightedAvg * 1.05;
        } else {
          suggested = weightedAvg;
        }
      }

      return { pp_fk: planId, p_fk, suggested_amount: Math.max(0, parseFloat(suggested.toFixed(2))) };
    })
  );

  const { error: insertError } = await supabase
    .from("production_analysis")
    .insert(suggestions);

  if (insertError) throw insertError;
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