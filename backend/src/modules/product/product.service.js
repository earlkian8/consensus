import { supabase } from "../../shared/database/supabase.js";

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const createProduct = async (product) => {
  const { name, picture } = product;

  const { data, error } = await supabase
    .from("products")
    .insert({ name, picture })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id, product) => {
  const { name, picture } = product;

  const { data, error } = await supabase
    .from("products")
    .update({ name, picture })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};