import { supabase } from "../../shared/database/supabase.js";

export const uploadProductImage = async (base64, filename) => {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const ext = base64.match(/^data:image\/(\w+);base64,/)?.[1] ?? "jpg";
  const path = `products/${filename}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: `image/${ext}`, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

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
  const { name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture } = product;

  const { data, error } = await supabase
    .from("products")
    .insert({ name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateProduct = async (id, product) => {
  const { name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture } = product;

  const { data, error } = await supabase
    .from("products")
    .update({ name, category, dish_type, batch_solid_count, unit_solid, batch_liquid_volume, unit_liquid, notes, picture })
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