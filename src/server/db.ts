import { neon } from "@neondatabase/serverless";
import type { DailyCuration, FashionNewsItem, MoodboardItem } from "../types.js";

type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;
let schemaReady = false;
let moodboardSchemaReady = false;
let fallbackNewsItems: FashionNewsItem[] = [];
let fallbackCurations: DailyCuration[] = [];
let fallbackMoodboards = new Map<string, MoodboardItem[]>();

function getSql() {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function ensureNewsSchema() {
  const sql = getSql();
  if (!sql || schemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS fashion_news_items (
      url TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      source_name TEXT NOT NULL,
      title TEXT NOT NULL,
      published_at TIMESTAMPTZ,
      summary TEXT,
      image_url TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      raw JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_curations (
      curation_date DATE PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      items JSONB NOT NULL,
      trend_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      source_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      model TEXT,
      simulated BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  schemaReady = true;
}

export async function ensureMoodboardSchema() {
  const sql = getSql();
  if (!sql || moodboardSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS anonymous_moodboards (
      anonymous_user_id TEXT PRIMARY KEY,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  moodboardSchemaReady = true;
}

export async function getMoodboardItems(anonymousUserId: string, fallbackItems: MoodboardItem[] = []) {
  const sql = getSql();
  if (!sql) {
    if (!fallbackMoodboards.has(anonymousUserId)) {
      fallbackMoodboards.set(anonymousUserId, fallbackItems);
    }
    return fallbackMoodboards.get(anonymousUserId) || [];
  }

  await ensureMoodboardSchema();
  const rows = await sql`
    SELECT items
    FROM anonymous_moodboards
    WHERE anonymous_user_id = ${anonymousUserId}
    LIMIT 1
  `;
  const resultRows = rows as any[];
  if (resultRows.length === 0) {
    await saveMoodboardItems(anonymousUserId, fallbackItems);
    return fallbackItems;
  }

  return normalizeMoodboardItems(resultRows[0].items);
}

export async function saveMoodboardItems(anonymousUserId: string, items: MoodboardItem[]) {
  const normalizedItems = normalizeMoodboardItems(items).slice(0, 200);
  const sql = getSql();
  if (!sql) {
    fallbackMoodboards.set(anonymousUserId, normalizedItems);
    return { persisted: false };
  }

  await ensureMoodboardSchema();
  await sql`
    INSERT INTO anonymous_moodboards (anonymous_user_id, items, updated_at)
    VALUES (${anonymousUserId}, ${JSON.stringify(normalizedItems)}::jsonb, NOW())
    ON CONFLICT (anonymous_user_id) DO UPDATE SET
      items = EXCLUDED.items,
      updated_at = NOW()
  `;

  return { persisted: true };
}

export async function upsertNewsItems(items: FashionNewsItem[]) {
  if (items.length === 0) return { insertedOrUpdated: 0, persisted: hasDatabase() };

  const sql = getSql();
  if (!sql) {
    const byUrl = new Map(fallbackNewsItems.map((item) => [item.url, item]));
    items.forEach((item) => byUrl.set(item.url, item));
    fallbackNewsItems = Array.from(byUrl.values());
    return { insertedOrUpdated: items.length, persisted: false };
  }

  await ensureNewsSchema();
  for (const item of items) {
    await sql`
      INSERT INTO fashion_news_items (
        url,
        source_id,
        source_name,
        title,
        published_at,
        summary,
        image_url,
        tags,
        fetched_at,
        raw
      )
      VALUES (
        ${item.url},
        ${item.sourceId},
        ${item.sourceName},
        ${item.title},
        ${item.publishedAt ? new Date(item.publishedAt).toISOString() : null},
        ${item.summary || ""},
        ${item.imageUrl || null},
        ${JSON.stringify(item.tags || [])}::jsonb,
        NOW(),
        ${JSON.stringify(item.raw || {})}::jsonb
      )
      ON CONFLICT (url) DO UPDATE SET
        source_id = EXCLUDED.source_id,
        source_name = EXCLUDED.source_name,
        title = EXCLUDED.title,
        published_at = EXCLUDED.published_at,
        summary = EXCLUDED.summary,
        image_url = EXCLUDED.image_url,
        tags = EXCLUDED.tags,
        fetched_at = NOW(),
        raw = EXCLUDED.raw
    `;
  }

  return { insertedOrUpdated: items.length, persisted: true };
}

export async function getRecentNewsItems(days = 2) {
  const sql = getSql();
  if (!sql) {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return fallbackNewsItems.filter((item) => {
      const time = item.publishedAt ? new Date(item.publishedAt).getTime() : Date.now();
      return time >= cutoff;
    });
  }

  await ensureNewsSchema();
  const rows = await sql`
    SELECT
      url,
      source_id,
      source_name,
      title,
      published_at,
      summary,
      image_url,
      tags,
      fetched_at,
      raw
    FROM fashion_news_items
    WHERE COALESCE(published_at, fetched_at) >= NOW() - (${days}::text || ' days')::interval
    ORDER BY COALESCE(published_at, fetched_at) DESC
    LIMIT 80
  `;

  return (rows as any[]).map(rowToNewsItem);
}

export async function saveDailyCuration(curation: DailyCuration) {
  const sql = getSql();
  if (!sql) {
    fallbackCurations = [
      curation,
      ...fallbackCurations.filter((item) => item.date !== curation.date),
    ].slice(0, 14);
    return { persisted: false };
  }

  await ensureNewsSchema();
  await sql`
    INSERT INTO daily_curations (
      curation_date,
      title,
      summary,
      items,
      trend_tags,
      source_urls,
      model,
      simulated,
      created_at
    )
    VALUES (
      ${curation.date},
      ${curation.title},
      ${curation.summary},
      ${JSON.stringify(curation.items)}::jsonb,
      ${JSON.stringify(curation.trendTags)}::jsonb,
      ${JSON.stringify(curation.sourceUrls)}::jsonb,
      ${curation.model || null},
      ${Boolean(curation.simulated)},
      NOW()
    )
    ON CONFLICT (curation_date) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      items = EXCLUDED.items,
      trend_tags = EXCLUDED.trend_tags,
      source_urls = EXCLUDED.source_urls,
      model = EXCLUDED.model,
      simulated = EXCLUDED.simulated,
      created_at = NOW()
  `;

  return { persisted: true };
}

export async function getLatestDailyCuration() {
  const sql = getSql();
  if (!sql) return fallbackCurations[0] || null;

  await ensureNewsSchema();
  const rows = await sql`
    SELECT
      curation_date,
      title,
      summary,
      items,
      trend_tags,
      source_urls,
      model,
      simulated,
      created_at
    FROM daily_curations
    ORDER BY curation_date DESC, created_at DESC
    LIMIT 1
  `;

  const resultRows = rows as any[];
  if (resultRows.length === 0) return null;
  return rowToDailyCuration(resultRows[0]);
}

function rowToNewsItem(row: any): FashionNewsItem {
  return {
    sourceId: row.source_id,
    sourceName: row.source_name,
    title: row.title,
    url: row.url,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    summary: row.summary || "",
    imageUrl: row.image_url || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    fetchedAt: row.fetched_at ? new Date(row.fetched_at).toISOString() : new Date().toISOString(),
    raw: row.raw || {},
  };
}

function rowToDailyCuration(row: any): DailyCuration {
  return {
    date: row.curation_date instanceof Date
      ? row.curation_date.toISOString().slice(0, 10)
      : String(row.curation_date),
    title: row.title,
    summary: row.summary,
    items: Array.isArray(row.items) ? row.items : [],
    trendTags: Array.isArray(row.trend_tags) ? row.trend_tags : [],
    sourceUrls: Array.isArray(row.source_urls) ? row.source_urls : [],
    model: row.model || undefined,
    simulated: Boolean(row.simulated),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function normalizeMoodboardItems(value: unknown): MoodboardItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === "object")
    .map((item: any) => ({
      id: String(item.id || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`),
      title: String(item.title || "未命名灵感"),
      image: typeof item.image === "string" ? item.image : undefined,
      type: ["garment", "trend", "formula", "note"].includes(item.type) ? item.type : "note",
      savedAt: String(item.savedAt || new Date().toLocaleDateString()),
      tags: Array.isArray(item.tags) ? item.tags.map((tag: any) => String(tag)).slice(0, 12) : [],
      notes: typeof item.notes === "string" ? item.notes.slice(0, 8000) : "",
      metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : undefined,
    }));
}
