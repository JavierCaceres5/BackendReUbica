import { supabase } from "../config/config.js";

export async function getRating(userID, productoID) {
  const { data, error } = await supabase
    .from("Ratings")
    .select("*")
    .eq("userID", userID)
    .eq("productoID", productoID)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createRating({ userID, productoID, comentario, rating }) {
  const { data, error } = await supabase
    .from("Ratings")
    .insert([{ userID, productoID, comentario, rating }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRating(userID, productoID) {
  const { error } = await supabase
    .from("Ratings")
    .delete()
    .eq("userID", userID)
    .eq("productoID", productoID);
  if (error) throw error;
}

export async function getRatingsByProductoID(productoID) {
  const { data, error } = await supabase
    .from('Ratings')
    .select('*')
    .eq("productoID", productoID);

  if (error) throw error;
  return data;
}


