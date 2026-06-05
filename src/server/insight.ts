import { GoogleGenAI } from "@google/genai";
import type { ArchiveItem, MoodboardItem, TrendTopic } from "../types.js";

interface CurateInsightBody {
  title?: string;
  content?: string;
  contextGarment?: ArchiveItem | null;
  contextTrend?: TrendTopic | null;
}

interface CuratedInsight {
  title: string;
  tags: string[];
  theme: string;
  summary: string;
  dossierUse: string;
  followUpQuestions: string[];
}

export async function handleCurateInsightRequest(body: CurateInsightBody) {
  if (!body.content || typeof body.content !== "string") {
    return {
      status: 400,
      body: { error: "Invalid parameters. 'content' must be a string." },
    };
  }

  const insight = await curateInsight(body);
  const item: MoodboardItem = {
    id: `ai-insight-${Date.now()}`,
    title: insight.title,
    type: "note",
    savedAt: new Date().toLocaleDateString(),
    tags: insight.tags,
    notes: formatInsightNotes(body.content),
    metadata: {
      theme: insight.theme,
      summary: insight.summary,
      sourceTitle: body.title,
      dossierUse: insight.dossierUse,
      followUpQuestions: insight.followUpQuestions,
      generatedBy: "ai-insight-curator",
    },
  };

  return {
    status: 200,
    body: { item },
  };
}

async function curateInsight(body: CurateInsightBody): Promise<CuratedInsight> {
  const fallback = fallbackInsight(body);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `请把以下 AI 策展回答整理成一张可进入 FashionAtlas 灵感板和 Dossier 的结构化灵感资产。

输出严格 JSON，不要 Markdown，不要代码块。格式：
{
  "title": "18字以内中文灵感标题",
  "tags": ["2-5个短标签，可含英文关键词"],
  "theme": "所属主题，16字以内",
  "summary": "60字以内摘要",
  "dossierUse": "可用于 Dossier 的哪个章节或用途，30字以内",
  "followUpQuestions": ["2-3个可延展问题"]
}

要求：
1. 不编造原文没有出现的品牌、人物、秀场或事实。
2. 标题要像策展卡片标题，不要写“AI回答总结”。
3. 标签优先提炼风格、廓形、材料、审美方法。
4. 如果有当前页面上下文，要把它作为所属主题或用途参考。

当前页面上下文：
${JSON.stringify({
  garment: body.contextGarment ? {
    name: body.contextGarment.name,
    category: body.contextGarment.category,
    designer: body.contextGarment.designer,
  } : null,
  trend: body.contextTrend ? {
    name: body.contextTrend.name,
    keyItems: body.contextTrend.keyItems,
  } : null,
}, null, 2)}

原始标题：
${body.title || "AI时尚策展灵感札记"}

AI 策展回答：
${body.content.slice(0, 5000)}`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.35,
          systemInstruction: "你是 FashionAtlas 的灵感资产整理器。你只输出 JSON，并把 AI 回答整理为可复用的策展资料卡。",
        },
      }),
      Number(process.env.AI_REQUEST_TIMEOUT_MS || 30000),
    );
    return normalizeInsight(parseJson(response.text || ""), fallback);
  } catch {
    return fallback;
  }
}

function fallbackInsight(body: CurateInsightBody): CuratedInsight {
  const contextTitle = body.contextGarment?.name || body.contextTrend?.name || body.title || "AI策展灵感";
  const content = body.content || "";
  const tags = Array.from(new Set([
    body.contextGarment?.category?.split(" / ")[0],
    body.contextTrend ? "趋势解构" : undefined,
    content.includes("廓形") ? "廓形实验" : undefined,
    content.includes("材质") || content.includes("Materiality") ? "材料语言" : undefined,
    content.includes("解构") ? "解构时装" : undefined,
    "AI策展",
  ].filter(Boolean) as string[])).slice(0, 5);

  return {
    title: compactTitle(contextTitle),
    tags,
    theme: compactTitle(contextTitle, 16),
    summary: firstSentence(content, 60) || "这条灵感记录了一次可继续延展的时尚策展判断。",
    dossierUse: body.contextTrend ? "可用于趋势章节" : body.contextGarment ? "可用于馆藏解析章节" : "可用于策展札记章节",
    followUpQuestions: [
      "它可以延展成哪一种穿搭公式？",
      "它与哪些秀场或品牌语境相关？",
    ],
  };
}

function normalizeInsight(parsed: any, fallback: CuratedInsight): CuratedInsight {
  if (!parsed || typeof parsed !== "object") return fallback;
  return {
    title: String(parsed.title || fallback.title).slice(0, 36),
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((tag: any) => String(tag).trim()).filter(Boolean).slice(0, 5)
      : fallback.tags,
    theme: String(parsed.theme || fallback.theme).slice(0, 32),
    summary: String(parsed.summary || fallback.summary).slice(0, 120),
    dossierUse: String(parsed.dossierUse || fallback.dossierUse).slice(0, 80),
    followUpQuestions: Array.isArray(parsed.followUpQuestions)
      ? parsed.followUpQuestions.map((question: any) => String(question).trim()).filter(Boolean).slice(0, 3)
      : fallback.followUpQuestions,
  };
}

function formatInsightNotes(content: string) {
  return content.trim();
}

function compactTitle(value: string, maxLength = 18) {
  return value.replace(/[【】《》]/g, "").trim().slice(0, maxLength) || "AI策展灵感";
}

function firstSentence(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").split(/[。！？\n]/)[0]?.slice(0, maxLength).trim();
}

function parseJson(text: string) {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timer = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error("AI insight curation timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
