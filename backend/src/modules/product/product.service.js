import { pool } from "../../shared/database/pool.js";

// Products
export const getProducts = async () => {
  const { rows } = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
  return rows;
};

export const createProduct = async (product) => {
  const { name, picture } = product;
  const query = `
    INSERT INTO products (name, picture)
    VALUES ($1, $2)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [name, picture]);
  return rows[0];
};

export const updateProduct = async (id, product) => {
  const { name, picture } = product;
  const query = `
    UPDATE products
    SET name = $1, picture = $2
    WHERE id = $3
    RETURNING *
  `;
  const { rows } = await pool.query(query, [name, picture, id]);
  return rows[0];
};

export const deleteProduct = async (id) => {
  const query = "DELETE FROM products WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

// Production Plans
export const getProductPlanning = async () => {
  const { rows } = await pool.query("SELECT * FROM production_plans ORDER BY date DESC");
  return rows;
};

export const createProductPlanning = async (planning) => {
  const { date, is_ready_analysis } = planning;
  const query = `
    INSERT INTO production_plans (date, is_ready_analysis)
    VALUES ($1, $2)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [date, is_ready_analysis || false]);
  return rows[0];
};

export const updateProductPlanning = async (id, planning) => {
  const { date, is_ready_analysis } = planning;
  const query = `
    UPDATE production_plans
    SET date = $1, is_ready_analysis = $2
    WHERE id = $3
    RETURNING *
  `;
  const { rows } = await pool.query(query, [date, is_ready_analysis, id]);
  return rows[0];
};

export const deleteProductPlanning = async (id) => {
  const query = "DELETE FROM production_plans WHERE id = $1 RETURNING *";
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};
