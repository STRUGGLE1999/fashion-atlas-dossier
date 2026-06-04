import fs from "fs";
import path from "path";
import type { DailyCuration } from "../types.js";

export const DATA_TYPES = [
  "archives",
  "books",
  "runways",
  "aesthetic_guides",
  "styles",
  "trends",
  "formulas",
  "movies",
  "moodboard",
] as const;

export type DataType = (typeof DATA_TYPES)[number];

const SEARCHABLE_DATA_TYPES: DataType[] = [
  "archives",
  "books",
  "runways",
  "aesthetic_guides",
  "styles",
  "trends",
  "formulas",
];

export interface RetrievedDoc {
  source: string;
  content: any;
  score?: number;
}

export function isDataType(type: string): type is DataType {
  return DATA_TYPES.includes(type as DataType);
}

export function readJsonData<T = any>(type: string): T[] {
  if (!isDataType(type)) return [];

  const filePath = path.join(process.cwd(), "data", `${type}.json`);
  if (!fs.existsSync(filePath)) return [];

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function makeSearchText(item: any) {
  return JSON.stringify(item)
    .toLowerCase()
    .replace(/\\u[\dA-Fa-f]{4}/g, " ");
}

export function retrieveContext(
  query: string,
  options: { topK?: number; dailyCuration?: DailyCuration | null } = {},
): RetrievedDoc[] {
  const topK = options.topK ?? 5;
  const docs: RetrievedDoc[] = [];

  SEARCHABLE_DATA_TYPES.forEach((type) => {
    readJsonData(type).forEach((item) => {
      docs.push({ source: type, content: item });
    });
  });

  if (options.dailyCuration) {
    options.dailyCuration.items.forEach((item) => {
      docs.push({
        source: "daily_curations",
        content: {
          ...item,
          curationTitle: options.dailyCuration?.title,
          curationSummary: options.dailyCuration?.summary,
          curationDate: options.dailyCuration?.date,
        },
      });
    });
  }

  const lowerQuery = query.toLowerCase();
  const queryTokens = tokenize(query);
  const scoredDocs = docs.map((doc) => {
    const searchableText = makeSearchText(doc.content);
    let score = 0;

    queryTokens.forEach((token) => {
      if (searchableText.includes(token)) score += 1;
    });

    const title = `${doc.content.name || doc.content.title || ""}`.toLowerCase();
    if (title && lowerQuery && title.includes(lowerQuery)) score += 5;
    if (doc.source === "daily_curations") score += 0.5;

    return { ...doc, score };
  });

  return scoredDocs
    .filter((doc) => (doc.score || 0) > 0)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, topK)
    .map(({ score, ...doc }) => doc);
}
