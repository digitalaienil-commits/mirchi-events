import { Pool, types, type QueryResultRow } from "pg";

// Return DATE columns as plain "YYYY-MM-DD" strings instead of JS Dates (avoids timezone shifts).
types.setTypeParser(types.builtins.DATE, (value) => value);

const globalForDb = globalThis as unknown as { pgPool?: Pool };

// One pool per process; reused across hot reloads in development.
export const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Serverless (Vercel) runs many small instances; keep each one's pool small.
    max: process.env.VERCEL ? 3 : 10,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
