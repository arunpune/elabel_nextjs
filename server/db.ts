import pkg from 'pg';
const { Pool } = pkg;

const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

// Add error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Export query helper
export default {
  query: (text: string, params: any[]) => pool.query(text, params),
};
