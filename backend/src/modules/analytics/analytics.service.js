import { supabase } from "../../shared/database/supabase.js";

export const getLatestAnalytics = async () => {
  const { data: latestPlan, error: planError } = await supabase
    .from("production_plans")
    .select("id, date, is_ready_analysis")
    .eq("is_ready_analysis", true)
    .order("date", { ascending: false })
    .limit(1)
    .single();

  if (planError) throw planError;

  const { data, error } = await supabase
    .from("production_analysis")
    .select("*, products(name, picture)")
    .eq("pp_fk", latestPlan.id);

  if (error) throw error;

  return { plan: latestPlan, analysis: data };
};

export const getAnalyticsLogs = async () => {
  const { data, error } = await supabase
    .from("production_analysis")
    .select("*, products(name, picture), production_plans(date, is_ready_analysis)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};
