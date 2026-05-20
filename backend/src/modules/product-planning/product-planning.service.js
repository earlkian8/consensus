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
    .insert(details.map((d) => ({ pp_fk: plan.id, p_fk: d.p_fk, excess: d.excess ?? null })))
    .select();

  if (detailsError) throw detailsError;

  return { ...plan, details: planDetails };
};

export const updateProductDetailExcess = async (id, excess) => {
  const { data, error } = await supabase
    .from("production_details")
    .update({ excess })
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