import { neon } from "@neondatabase/serverless";

// Neon provides a serverless Postgres client that works in edge/serverless environments.
// DATABASE_URL is set in your .env.local (locally) and Vercel environment variables (production).
const sql = neon(process.env.DATABASE_URL!);

export default sql;

// ── Schema (run once via `npm run db:init`) ──────────────────────────────────
// CREATE TABLE pastes (
//   id          SERIAL PRIMARY KEY,
//   slug        TEXT UNIQUE NOT NULL,        -- short random ID used in the URL
//   title       TEXT,
//   content     TEXT NOT NULL,
//   created_at  TIMESTAMPTZ DEFAULT NOW(),
//   expires_at  TIMESTAMPTZ,                 -- NULL = never expires
//   max_views   INTEGER,                     -- NULL = unlimited views
//   view_count  INTEGER DEFAULT 0
// );

export type Paste = {
  id: number;
  slug: string;
  title: string | null;
  content: string;
  created_at: string;
  expires_at: string | null;
  max_views: number | null;
  view_count: number;
};

export async function getPasteBySlug(slug: string): Promise<Paste | null> {
  const rows = await sql`
    SELECT * FROM pastes WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as Paste) ?? null;
}

export async function incrementViewCount(slug: string): Promise<void> {
  await sql`
    UPDATE pastes SET view_count = view_count + 1 WHERE slug = ${slug}
  `;
}

export async function createPaste(data: {
  slug: string;
  title: string | null;
  content: string;
  expires_at: string | null;
  max_views: number | null;
}): Promise<Paste> {
  const rows = await sql`
    INSERT INTO pastes (slug, title, content, expires_at, max_views)
    VALUES (${data.slug}, ${data.title}, ${data.content}, ${data.expires_at}, ${data.max_views})
    RETURNING *
  `;
  return rows[0] as Paste;
}

// Returns true if the paste is still valid (not expired by time or views)
export function isPasteValid(paste: Paste): boolean {
  if (paste.expires_at && new Date(paste.expires_at) < new Date()) return false;
  if (paste.max_views !== null && paste.view_count > paste.max_views) return false;
  return true;
}
