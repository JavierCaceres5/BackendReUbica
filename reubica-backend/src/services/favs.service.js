import { supabase } from "../config/config.js";

export async function favExists({ userID, tipo_objetivo, productoID, emprendimientoID }) {
  const query = supabase
    .from("Favoritos")
    .select("id")
    .eq("userID", userID)
    .eq("tipo_objetivo", tipo_objetivo);

  if (tipo_objetivo === "producto") {
    query.eq("productoID", productoID);
  } else if (tipo_objetivo === "emprendimiento") {
    query.eq("emprendimientoID", emprendimientoID);
  }

  const { data, error } = await query.maybeSingle();
  if (error && error.code !== "PGRST116") throw error; 
  return Boolean(data);
}

export async function createFavorite(userID, tipo_objetivo, productoID, emprendimientoID) {
  const payload = {
    userID,
    tipo_objetivo,
    productoID: tipo_objetivo === "producto" ? productoID : null,
    emprendimientoID: tipo_objetivo === "emprendimiento" ? emprendimientoID : null,
  };

  const { error } = await supabase.from("Favoritos").insert(payload);
  if (error) throw error;
}

export async function deleteFavorite(userID, tipo_objetivo, productoID, emprendimientoID) {
  const query = supabase
    .from("Favoritos")
    .delete()
    .eq("userID", userID)
    .eq("tipo_objetivo", tipo_objetivo);

  if (tipo_objetivo === "producto") {
    query.eq("productoID", productoID);
  } else if (tipo_objetivo === "emprendimiento") {
    query.eq("emprendimientoID", emprendimientoID);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function getFavoritesByUser(userID, tipo_objetivo) {
  const query = supabase
    .from("Favoritos")
    .select("*, Comercio(*), Productos(*)")
    .eq("userID", userID);

  if (tipo_objetivo) {
    query.eq("tipo_objetivo", tipo_objetivo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
