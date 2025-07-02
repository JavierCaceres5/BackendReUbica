import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(user, process.env.SUPABASE_JWT_SECRET, { expiresIn: "7d" });
}
