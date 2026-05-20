import { supabase } from "../../shared/database/supabase.js";

export const getLatestProductPlanning = async () => {
  const { data, error } = await supabase
    .from("production_plans")
    .select("*, production_details(*)")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

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
    .maybeSingle();

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
    .maybeSingle();

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
        .maybeSingle()
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

  const allFilled = allDetails.length > 0 && allDetails.every((d) => d.excess !== null);

  if (allFilled) {
    const { error: updatePlanError } = await supabase
      .from("production_plans")
      .update({ is_ready_analysis: true })
      .eq("id", planId);

    if (updatePlanError) throw updatePlanError;

    await runAnalysis(planId);
  }

  return { updated: updates.map((r) => r.data).filter(Boolean), is_ready_analysis: allFilled };
};

import * as analysisService from "../analysis/analysis.service.js";

const runAnalysis = async (planId) => {
  // 1. Fetch current plan details and product names
  const { data: currentDetails, error: currentError } = await supabase
    .from("production_details")
    .select("p_fk, amount, liquid_amount, excess, products(name)")
    .eq("pp_fk", planId);

  if (currentError) throw currentError;

  const { data: plan, error: planError } = await supabase
    .from("production_plans")
    .select("date")
    .eq("id", planId)
    .maybeSingle();

  if (planError) throw planError;
  if (!plan) {
    console.warn(`[runAnalysis] Plan ${planId} not found, skipping analysis.`);
    return;
  }

  console.log("[runAnalysis] Using Python AI Model for planId:", planId);

  // 2. Map details to the format expected by analysisService
  const productsToPredict = currentDetails.map(d => ({
    id: d.p_fk,
    name: d.products.name
  }));

  // 3. Call the Python Model Service
  const recommendations = await analysisService.getRecommendations(plan.date, productsToPredict);

  // 4. Map recommendations back to production_analysis format
  const suggestions = recommendations.map(rec => {
    const detail = currentDetails.find(d => d.p_fk === rec.productId);
    
    // If AI fails, fallback to current amount (safety)
    const suggested = rec.suggestedAmount || parseFloat(detail.amount);
    
    // Maintain liquid scaling logic proportional to solid suggestion
    const suggested_liquid = detail.liquid_amount != null
      ? parseFloat(detail.amount) > 0
        ? parseFloat(detail.liquid_amount) * (suggested / parseFloat(detail.amount))
        : parseFloat(detail.liquid_amount)
      : null;

    return {
      pp_fk: planId,
      p_fk: rec.productId,
      suggested_amount: Math.max(1, parseFloat(suggested.toFixed(2))),
      suggested_liquid_amount: suggested_liquid != null ? Math.max(0.1, parseFloat(suggested_liquid.toFixed(2))) : null,
    };
  });

  console.log("[runAnalysis] AI suggestions:", JSON.stringify(suggestions));

  // 5. Store results in the database
  const { error: deleteError } = await supabase
    .from("production_analysis")
    .delete()
    .eq("pp_fk", planId);

  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from("production_analysis")
    .insert(suggestions);

  if (insertError) throw insertError;
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
    .maybeSingle();

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
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const deleteProductPlanning = async (id) => {
  const { data, error } = await supabase
    .from("production_plans")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
};