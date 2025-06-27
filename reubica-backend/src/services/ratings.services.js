import { supabase } from '../utils/supabaseClient.js';

export const ratingsService = {
  async getRating(userID, productoID) {
    const { data, error } = await supabase
      .from('Ratings')
      .select('*')
      .eq('userID', userID)
      .eq('productoID', productoID)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createRating({ userID, productoID, comentario, rating }) {
    const { data, error } = await supabase
      .from('Ratings')
      .insert([{ userID, productoID, comentario, rating }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteRating(userID, productoID) {
    const { error } = await supabase
      .from('Ratings')
      .delete()
      .eq('userID', userID)
      .eq('productoID', productoID);
    if (error) throw error;
  }
};
