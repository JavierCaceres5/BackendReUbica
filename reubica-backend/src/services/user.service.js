import { supabase } from '../config/config.js'; 

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createUser(user) {
  const { data, error } = await supabase.from('users').insert(user).single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, user) {
  const plainUser = JSON.parse(JSON.stringify(user));
  const res = await supabase
    .from('users')
    .update(plainUser)
    .eq('id', id)
    .select()
    .single();

  if (res.error) throw res.error;
  return res.data;
}


export async function deleteUser(id) {
  const { data, error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
  if (error) throw error;
  return data;
}

export async function logout() {
  try {
    await supabase.auth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
