import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../shared/database/pool.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (email, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const query = `
    INSERT INTO "user" (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at
  `;
  
  const { rows } = await pool.query(query, [email, passwordHash]);
  return rows[0];
};

export const login = async (email, password) => {
  const query = 'SELECT * FROM "user" WHERE email = $1';
  const { rows } = await pool.query(query, [email]);
  const user = rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    },
    token
  };
};
