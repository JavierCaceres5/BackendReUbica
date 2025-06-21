import { supabase } from "../config/config.js";

export async function getAllEmprendimientos() {
  const { data, error } = await supabase.from("Comercio").select("*");
  if (error) throw error;
  return data;
}

export async function getEmprendimientoById(id) {
  const { data, error } = await supabase
    .from("Comercio")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createEmprendimiento(Emprendimiento) {
  const { data, error } = await supabase
    .from("Comercio")
    .insert(Emprendimiento)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEmprendimiento(id, Emprendimiento) {
  const { data, error } = await supabase
    .from("Comercio")
    .update(Emprendimiento)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  
  return data;
}

export async function deleteEmprendimiento(id) {
  const { data, error } = await supabase.from("Comercio").delete().eq("id", id);
  if (error) throw error;
  return data;
}

export async function searchEmprendimientosByNombre(nombre) {
  if (!nombre) return [];

  const { data, error } = await supabase
    .from("Comercio")
    .select("*")
    .ilike("nombre", `%${nombre}%`);

  if (error) throw error;
  return data;
}

export async function getEmprendimientosByCategoriaPrincipal(categoria) {
  const { data, error } = await supabase
    .from("Comercio")
    .select("*")
    .contains("categoriasPrincipales", [categoria]);

  if (error) throw error;
  return data;
}
