import { supabase } from "../config/config";

export async function getAllProductos() {
  const { data, error } = await supabase.from("Productos").select("*");
  if (error) throw error;
  return data;
}

export async function getProductoById(id) {
  const { data, error } = await supabase
    .from("Productos")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProducto(Producto) {
  const { data, error } = await supabase
    .from("Productos")
    .insert(Producto)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProducto(id, Producto) {
  const { data, error } = await supabase
    .from("Productos")
    .update(Producto)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  
  return data;
}

export async function deleteProducto(id) {
  const { data, error } = await supabase
    .from("Productos")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return data;
}

export async function searchProductoByNombre(nombre) {
  if (!nombre) return [];

  const { data, error } = await supabase
    .from("Productos")
    .select("*")
    .ilike("nombre", `%${nombre}%`);

  if (error) throw error;
  return data;
}
