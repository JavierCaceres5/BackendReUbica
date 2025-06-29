import { supabase } from "../config/config.js";
import bcrypt from "bcrypt";

export async function getAllUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUser(user) {
  const { data, error } = await supabase.from("users").insert(user).single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, user) {
  const { data, error } = await supabase
    .from("users")
    .update(user)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  const { data, error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
  return data;
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error) throw error;
  return data;
}

export async function changePassword(email, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createResetToken(email, code) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .insert({
      email,
      code,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getValidResetToken(email, code) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gte('expires_at', now)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markResetTokenAsUsed(tokenId) {
  const { error } = await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('id', tokenId);

  if (error) throw error;
}