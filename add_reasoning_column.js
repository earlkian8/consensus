import "dotenv/config";
import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function addColumn() {
  try {
    await client.connect();
    console.log("Connected to database.");
    
    await client.query("ALTER TABLE production_analysis ADD COLUMN IF NOT EXISTS reasoning TEXT;");
    console.log("Column 'reasoning' added successfully (or already exists).");
    
  } catch (err) {
    console.error("Error adding column:", err.message);
  } finally {
    await client.end();
  }
}

addColumn();
