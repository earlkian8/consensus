import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const isFresh = process.argv.includes("--fresh");

const client = new Client({
  connectionString: process.env.DB_URL,
});

const schema = readFileSync(
  join(__dirname, "schema.sql"),
  "utf-8"
);

await client.connect();

if (isFresh) {
  const { rows } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  );

  for (const { tablename } of rows) {
    await client.query(
      `DROP TABLE IF EXISTS "${tablename}" CASCADE`
    );
  }

  console.log("Dropped all tables.");
}

await client.query(schema);

console.log("Migration complete.");

await client.end();