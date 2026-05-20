import { supabase } from "../../shared/database/supabase.js";

export const getProductPlanning = async () => {
  const { data, error } = await supabase
    .from("production_plans")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

export const createProductPlanning = async (planning) => {
  const { date, is_ready_analysis } = planning;

  const { data, error } = await supabase
    .from("production_plans")
    .insert({ date, is_ready_analysis: is_ready_analysis ?? false })
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