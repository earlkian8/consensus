import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../shared/database/supabase.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (email, password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("user")
    .insert({ email, password_hash: passwordHash })
    .select("id, email, created_at")
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const login = async (email, password) => {
  const { data: user, error } = await supabase
    .from("user")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    token,
  };
};