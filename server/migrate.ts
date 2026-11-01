import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

// Additive, re-runnable migrations applied at startup, so a deploy can't run ahead of its database
// (inserts list every schema column and fail with 42703 if one is missing).
// profiles.sql is not re-runnable (it creates triggers on auth.users) and stays a manual step.
const MIGRATIONS = [
  {
    file: 'add_owner_id_columns.sql',
    sql: `alter table public.products add column if not exists owner_id uuid;
alter table public.ingredients add column if not exists owner_id uuid;`,
  },
  {
    file: 'add_manufacturing_columns.sql',
    sql: `alter table public.products
  add column if not exists manufacturing_location text,
  add column if not exists manufacturing_address text,
  add column if not exists manufacturing_city text,
  add column if not exists manufacturing_state text,
  add column if not exists manufacturing_country text,
  add column if not exists manufacturing_postal_code text,
  add column if not exists manufacturing_latitude text,
  add column if not exists manufacturing_longitude text,
  add column if not exists latitude text,
  add column if not exists longitude text;`,
  },
  {
    file: 'add_ingredients_and_scans.sql',
    sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredient_ids integer[];
CREATE TABLE IF NOT EXISTS scans (
  id serial PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  source text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scans_product_id_idx ON scans(product_id);`,
  },
  {
    file: 'add_qr_url_column.sql',
    sql: `alter table public.products add column if not exists qr_url text;`,
  },
];

export async function ensureSchema(url = process.env.DATABASE_URL) {
  if (!url) return;
  const sql = postgres(url, { max: 1, onnotice: () => {}, ssl: 'require' });
  try {
    for (const migration of MIGRATIONS) {
      let content = migration.sql;
      try {
        const filePath = path.join(process.cwd(), 'server', 'db', migration.file);
        if (fs.existsSync(filePath)) {
          content = fs.readFileSync(filePath, 'utf8');
        }
      } catch {
        // Fall back to inlined SQL on serverless environments
      }
      await sql.unsafe(content);
    }
    console.log('Database schema is up to date');
  } catch (err: any) {
    console.warn('Schema migration warning:', err?.message || err);
  } finally {
    await sql.end();
  }
}
