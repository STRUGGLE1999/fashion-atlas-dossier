import { GoogleGenAI } from "@google/genai";
import type { DailyCuration, DailyCurationItem, FashionNewsItem } from "../types.js";
import {
  getLatestDailyCuration,
  getRecentNewsItems,
  saveDailyCuration,
  upsertNewsItems,
} from "./db";

interface NewsSource {
  id: string;
  name: string;
  url: string;
  tags: string[];
}

const NEWS_SOURCES: NewsSource[] = [
  {
    id: "fashionista",
    name: "Fashionista",
    url: "https://fashionista.com/.rss/excerpt/",
    tags: ["trend", "brand", "industry"],
  },
  {
    id: "vogue",
    name: "Vogue",
    url: "https://www.vogue.com/feed/rss",
    tags: ["runway", "trend", "brand"],
  },
  {
    id: "hypebeast-fashion",
    name: "Hypebeast Fashion",
    url: "https://hypebeast.com/?feed=rss2",
    tags: ["streetwear", "brand", "trend"],
  },
  {
    id: "highsnobiety",
    name: "Highsnobiety",
    url: "https://www.highsnobiety.com/feeds/rss",
    tags: ["streetwear", "brand", "trend"],
  },
  {
    id: "bof",
    name: "The Business of Fashion",
    url: "https://www.businessoffashion.com/feed/",
    tags: ["business", "brand", "industry"],
  },
];

const RELEVANCE_KEYWORDS = [
  "fashion",
  "style",
  "runway",
  "collection",
  "couture",
  "designer",
  "brand",
  "luxury",
  "trend",
  "streetwear",
  "menswear",
  "womenswear",
  "ready-to-wear",
  "spring",
  "summer",
  "fall",
  "winter",
  "paris",
  "milan",
  "london",
  "new york",
  "时尚",
  "秀场",
  "品牌",
  "趋势",
  "高定",
  "设计师",
  "成衣",
];

export async function fetchAndCurateFashionNews() {
  const fetched = await fetchFashionNews();
  const uniqueFetched = dedupeNewsItems(fetched);
  const persistence = await upsertNewsItems(uniqueFetched);
  const candidates = dedupeNewsItems([
    ...uniqueFetched,
    ...(await getRecentNewsItems(2)),
  ]).slice(0, 60);
  const curation = await curateDailyFashionNews(candidates);
  await saveDailyCuration(curation);

  return {
    fetched: fetched.length,
    matched: uniqueFetched.length,
    candidates: candidates.length,
    persisted: persistence.persisted,
    curation,
  };
}

export async function getPublishedDailyCuration() {
  return getLatestDailyCuration();
}

export async function fetchFashionNews() {
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(async (source) => fetchRssSource(source)),
  );

  return results.flatMap((result) => (
    result.status === "fulfilled" ? result.value : []
  ));
}

async function fetchRssSource(source: NewsSource) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "FashionAtlasBot/1.0 (+https://fashionatlas.local)",
      },
      signal: controller.signal,
    });
    if (!response.ok) return [];

    const xml = await response.text();
    return parseFeed(xml, source)
      .map((item) => ({ ...item, tags: mergeTags(item.tags, inferTags(item, source)) }))
      .filter((item) => scoreRelevance(item) > 0);
  } finally {
    clearTimeout(timeout);
  }
}

function parseFeed(xml: string, source: NewsSource): FashionNewsItem[] {
  const blocks = [
    ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ].map((match) => match[0]);

  return blocks
    .map((block) => {
      const title = textFromTag(block, "title");
      const url = linkFromBlock(block);
      if (!title || !url) return null;

      return {
        sourceId: source.id,
        sourceName: source.name,
        title,
        url,
        publishedAt: textFromTag(block, "pubDate") ||
          textFromTag(block, "published") ||
          textFromTag(block, "updated") ||
          null,
        summary: stripHtml(
          textFromTag(block, "description") ||
          textFromTag(block, "summary") ||
          textFromTag(block, "content:encoded"),
        ).slice(0, 600),
        imageUrl: imageFromBlock(block),
        tags: source.tags,
        fetchedAt: new Date().toISOString(),
        raw: { sourceUrl: source.url },
      } satisfies FashionNewsItem;
    })
    .filter(Boolean) as FashionNewsItem[];
}

function textFromTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${escapeRegExp(tag)}\\b[^>]*>([\\s\\S]*?)<\\/${escapeRegExp(tag)}>`, "i"));
  return decodeXml(match?.[1] || "").trim();
}

function linkFromBlock(block: string) {
  const directLink = textFromTag(block, "link");
  if (directLink) return normalizeUrl(directLink);

  const hrefMatch = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i);
  return normalizeUrl(decodeXml(hrefMatch?.[1] || ""));
}

function imageFromBlock(block: string) {
  const enclosure = block.match(/<enclosure\b[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (enclosure?.[1]) return decodeXml(enclosure[1]);

  const media = block.match(/<media:content\b[^>]*url=["']([^"']+)["'][^>]*>/i) ||
    block.match(/<media:thumbnail\b[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (media?.[1]) return decodeXml(media[1]);

  const img = block.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i);
  return img?.[1] ? decodeXml(img[1]) : "";
}

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => {
      parsed.searchParams.delete(key);
    });
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function stripHtml(value: string) {
  return decodeXml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")).trim();
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mergeTags(...tagLists: string[][]) {
  return Array.from(new Set(tagLists.flat().filter(Boolean))).slice(0, 8);
}

function inferTags(item: FashionNewsItem, source: NewsSource) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const tags = [...source.tags];
  if (/(runway|collection|show|couture|ready-to-wear|秀场|高定)/i.test(text)) tags.push("runway");
  if (/(trend|style|look|趋势|风格)/i.test(text)) tags.push("trend");
  if (/(brand|designer|creative director|品牌|设计师)/i.test(text)) tags.push("brand");
  return tags;
}

function scoreRelevance(item: FashionNewsItem) {
  const text = `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
  return RELEVANCE_KEYWORDS.reduce((score, keyword) => (
    text.includes(keyword.toLowerCase()) ? score + 1 : score
  ), 0);
}

function dedupeNewsItems(items: FashionNewsItem[]) {
  const byUrl = new Map<string, FashionNewsItem>();
  const accepted: FashionNewsItem[] = [];

  items.forEach((item) => {
    const normalizedTitle = normalizeTitle(item.title);
    const duplicateTitle = accepted.some((existing) => {
      const existingTitle = normalizeTitle(existing.title);
      return titleSimilarity(normalizedTitle, existingTitle) >= 0.82;
    });

    if (!item.url || duplicateTitle) return;
    byUrl.set(item.url, item);
    if (!duplicateTitle) accepted.push(item);
  });

  return Array.from(byUrl.values())
    .sort((a, b) => dateScore(b) - dateScore(a))
    .slice(0, 80);
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function titleSimilarity(a: string, b: string) {
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

function dateScore(item: FashionNewsItem) {
  return item.publishedAt ? new Date(item.publishedAt).getTime() : 0;
}

async function curateDailyFashionNews(candidates: FashionNewsItem[]): Promise<DailyCuration> {
  const date = new Date().toISOString().slice(0, 10);
  if (candidates.length === 0) return emptyCuration(date);

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) return heuristicCuration(candidates, date, "Gemini API key missing");

  const prompt = buildCurationPrompt(candidates);
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.45,
          systemInstruction: "你是 FashionAtlas 的每日时尚资讯主编。只基于输入来源做策展，不编造链接、人物、品牌或发布时间。",
        },
      }),
      Number(process.env.AI_REQUEST_TIMEOUT_MS || 10000),
    );

    const parsed = parseCurationJson(response.text || "");
    if (!parsed) return heuristicCuration(candidates, date, "Gemini JSON parse failed");

    return normalizeCuration(parsed, candidates, date, model, false);
  } catch (error: any) {
    return heuristicCuration(candidates, date, error?.message || "Gemini request failed");
  }
}

function buildCurationPrompt(candidates: FashionNewsItem[]) {
  const input = candidates.slice(0, 40).map((item, index) => ({
    index,
    title: item.title,
    sourceName: item.sourceName,
    url: item.url,
    publishedAt: item.publishedAt,
    summary: item.summary,
    imageUrl: item.imageUrl,
    tags: item.tags,
  }));

  return `请从以下时尚资讯候选中筛选 3-5 条最适合 FashionAtlas 首页与 AI 知识库的内容，范围限定为趋势、秀场、品牌动态。

输出严格 JSON，不要 Markdown，不要代码块。格式：
{
  "title": "今日私人策展标题",
  "summary": "120字以内中文总览，说明今日趋势线索",
  "trendTags": ["中文标签", "English Keyword"],
  "items": [
    {
      "title": "标题",
      "sourceName": "来源",
      "url": "必须使用输入里的原始URL",
      "publishedAt": "发布时间",
      "summary": "中文摘要，80字以内",
      "recommendationReason": "为什么值得读，80字以内",
      "tags": ["趋势", "品牌"],
      "imageUrl": "输入中的图片URL，可为空"
    }
  ]
}

候选资讯：
${JSON.stringify(input, null, 2)}`;
}

function parseCurationJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function normalizeCuration(
  parsed: any,
  candidates: FashionNewsItem[],
  date: string,
  model: string,
  simulated: boolean,
): DailyCuration {
  const candidateByUrl = new Map(candidates.map((item) => [item.url, item]));
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .map((item: any) => {
      const source = candidateByUrl.get(item.url) || candidates.find((candidate) => candidate.title === item.title);
      if (!source) return null;

      return {
        title: source.title,
        sourceName: source.sourceName,
        url: source.url,
        publishedAt: source.publishedAt,
        summary: String(item.summary || source.summary || "").slice(0, 240),
        recommendationReason: String(item.recommendationReason || "具备趋势、秀场或品牌观察价值。").slice(0, 240),
        tags: mergeTags(Array.isArray(item.tags) ? item.tags : [], source.tags).slice(0, 6),
        imageUrl: item.imageUrl || source.imageUrl || "",
      } satisfies DailyCurationItem;
    })
    .filter(Boolean)
    .slice(0, 5) as DailyCurationItem[];

  const finalItems = items.length > 0 ? items : heuristicItems(candidates);

  return {
    date,
    title: String(parsed.title || "今日时尚策展简报").slice(0, 80),
    summary: String(parsed.summary || "今日重点关注趋势、秀场与品牌动态的交叉变化。").slice(0, 300),
    items: finalItems,
    trendTags: Array.isArray(parsed.trendTags) ? parsed.trendTags.slice(0, 8) : collectTags(finalItems),
    sourceUrls: finalItems.map((item) => item.url),
    model,
    simulated,
    createdAt: new Date().toISOString(),
  };
}

function heuristicCuration(candidates: FashionNewsItem[], date: string, reason: string): DailyCuration {
  const items = heuristicItems(candidates);
  return {
    date,
    title: "今日时尚策展简报",
    summary: `系统已基于公开 RSS 来源完成趋势、秀场与品牌动态筛选。AI 主编生成暂不可用，当前使用规则策展兜底。原因：${reason}`,
    items,
    trendTags: collectTags(items),
    sourceUrls: items.map((item) => item.url),
    model: "heuristic-fallback",
    simulated: true,
    createdAt: new Date().toISOString(),
  };
}

function heuristicItems(candidates: FashionNewsItem[]): DailyCurationItem[] {
  return candidates
    .sort((a, b) => scoreRelevance(b) - scoreRelevance(a) || dateScore(b) - dateScore(a))
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      sourceName: item.sourceName,
      url: item.url,
      publishedAt: item.publishedAt,
      summary: item.summary || "公开来源显示，这条资讯与趋势、秀场或品牌动态相关，适合作为今日策展线索。",
      recommendationReason: "命中趋势、秀场或品牌关键词，并保留原始来源链接，适合进入 FashionAtlas 今日策展池。",
      tags: item.tags.slice(0, 6),
      imageUrl: item.imageUrl || "",
    }));
}

function collectTags(items: DailyCurationItem[]) {
  return Array.from(new Set(items.flatMap((item) => item.tags))).slice(0, 8);
}

function emptyCuration(date: string): DailyCuration {
  return {
    date,
    title: "今日时尚策展暂未更新",
    summary: "公开 RSS 来源暂未返回可用的趋势、秀场或品牌动态。首页将继续使用静态策展内容兜底。",
    items: [],
    trendTags: [],
    sourceUrls: [],
    model: "empty-fallback",
    simulated: true,
    createdAt: new Date().toISOString(),
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("AI request timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
