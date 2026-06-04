import path from "path";
import { createRequire } from "module";
import PDFDocument from "pdfkit";
import { GoogleGenAI } from "@google/genai";
import type { MoodboardItem } from "../types.js";

const require = createRequire(path.join(process.cwd(), "package.json"));

interface DossierPlan {
  coverTitle: string;
  coverSubtitle: string;
  editorLetter: string;
  sections: {
    title: string;
    subtitle: string;
    itemIds: string[];
    summary: string;
  }[];
  closingNote: string;
  simulated: boolean;
  model: string;
}

export async function generateMoodboardDossierPdf(items: MoodboardItem[]) {
  const normalizedItems = items.slice(0, 80);
  const plan = await createDossierPlan(normalizedItems);
  const pdf = await renderDossierPdf(normalizedItems, plan);
  return {
    buffer: pdf,
    filename: `FashionAtlas-Dossier-${new Date().toISOString().slice(0, 10)}.pdf`,
    plan,
  };
}

async function createDossierPlan(items: MoodboardItem[]): Promise<DossierPlan> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || items.length === 0) return fallbackDossierPlan(items, model, !apiKey);

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `请将以下 FashionAtlas 灵感板内容策展成一份中英双语私人时尚特刊 PDF 的语义排版方案。

输出严格 JSON，不要 Markdown，不要代码块。格式：
{
  "coverTitle": "中文私人特刊标题 / ENGLISH TITLE",
  "coverSubtitle": "一行中英双语副标题",
  "editorLetter": "160字以内中文主编序言，可夹带少量英文关键词",
  "sections": [
    {
      "title": "中文章节名 / ENGLISH SECTION",
      "subtitle": "一句章节说明",
      "itemIds": ["必须使用输入里的 id"],
      "summary": "80字以内章节策展总结"
    }
  ],
  "closingNote": "100字以内结尾策展札记"
}

要求：
1. 只基于输入灵感，不编造品牌、图片或事实。
2. 分成 2-4 个章节。
3. 保留用户写下的文字价值，把它们当作私人审美档案。
4. 语气像高端时尚档案馆主编，克制、精准、漂亮。

灵感板输入：
${JSON.stringify(items.map((item) => ({
  id: item.id,
  title: item.title,
  type: item.type,
  tags: item.tags,
  notes: item.notes,
  hasImage: Boolean(item.image),
})), null, 2)}`;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.55,
          systemInstruction: "你是 FashionAtlas 的私人特刊主编。你只输出 JSON，并且只基于用户灵感板内容组织策展叙事。",
        },
      }),
      Number(process.env.AI_REQUEST_TIMEOUT_MS || 10000),
    );
    const parsed = parseJson(response.text || "");
    if (!parsed) return fallbackDossierPlan(items, model, true);
    return normalizeDossierPlan(parsed, items, model, false);
  } catch {
    return fallbackDossierPlan(items, model, true);
  }
}

function normalizeDossierPlan(parsed: any, items: MoodboardItem[], model: string, simulated: boolean): DossierPlan {
  const itemIds = new Set(items.map((item) => item.id));
  const sections = (Array.isArray(parsed.sections) ? parsed.sections : [])
    .map((section: any) => ({
      title: String(section.title || "私人审美章节 / PRIVATE CHAPTER").slice(0, 90),
      subtitle: String(section.subtitle || "基于灵感板条目的语义整理").slice(0, 140),
      itemIds: Array.isArray(section.itemIds)
        ? section.itemIds.map((id: any) => String(id)).filter((id: string) => itemIds.has(id)).slice(0, 24)
        : [],
      summary: String(section.summary || "本章节聚合了相近的材料、廓形与情绪线索。").slice(0, 220),
    }))
    .filter((section: any) => section.itemIds.length > 0)
    .slice(0, 4);

  if (sections.length === 0) return fallbackDossierPlan(items, model, true);

  return {
    coverTitle: String(parsed.coverTitle || "私人时尚策展特刊 / PRIVATE FASHION DOSSIER").slice(0, 100),
    coverSubtitle: String(parsed.coverSubtitle || "FashionAtlas Personal Moodboard Edition").slice(0, 140),
    editorLetter: String(parsed.editorLetter || "这份特刊由你的灵感板自动生成，将收藏、文字与 AI 策展判断合并为一份可阅读的私人审美档案。").slice(0, 420),
    sections,
    closingNote: String(parsed.closingNote || "愿这份档案成为你下一次审美判断的坐标。").slice(0, 260),
    simulated,
    model,
  };
}

function fallbackDossierPlan(items: MoodboardItem[], model: string, simulated: boolean): DossierPlan {
  const grouped = new Map<string, MoodboardItem[]>();
  items.forEach((item) => {
    const key = item.type === "garment"
      ? "馆藏与廓形 / ARCHIVE SILHOUETTES"
      : item.type === "trend"
      ? "趋势与信号 / TREND SIGNALS"
      : item.type === "formula"
      ? "穿搭公式 / STYLING FORMULAS"
      : "策展札记 / CURATORIAL NOTES";
    grouped.set(key, [...(grouped.get(key) || []), item]);
  });

  const sections = Array.from(grouped.entries()).map(([title, group]) => ({
    title,
    subtitle: "由灵感板条目自动聚类生成",
    itemIds: group.map((item) => item.id),
    summary: "本章节将同类灵感归档为可复盘的审美线索，便于继续扩写成作品集叙事。",
  }));

  return {
    coverTitle: "私人时尚策展特刊 / PRIVATE FASHION DOSSIER",
    coverSubtitle: "FashionAtlas Moodboard Edition",
    editorLetter: "这份私人特刊由你的灵感板自动生成。系统将馆藏、趋势、穿搭公式与个人札记整理为一份可阅读、可展示、可继续深化的审美档案。",
    sections: sections.length > 0 ? sections : [{
      title: "空白档案 / EMPTY DOSSIER",
      subtitle: "尚未保存灵感",
      itemIds: [],
      summary: "请先在馆藏、趋势或 AI 对话中保存灵感，再导出私人特刊。",
    }],
    closingNote: "FashionAtlas 将每一次收藏都视为一次审美判断：不是堆积素材，而是建立自己的观看秩序。",
    simulated,
    model,
  };
}

async function renderDossierPdf(items: MoodboardItem[], plan: DossierPlan) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 52,
    bufferPages: true,
    info: {
      Title: plan.coverTitle,
      Author: "FashionAtlas Curator AI",
      Subject: "Personal Fashion Moodboard Dossier",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const fontPath = require.resolve("@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff");
  doc.registerFont("NotoSC", fontPath);
  doc.font("NotoSC");

  drawPageBackground(doc);
  drawCover(doc, plan, items);

  for (const section of plan.sections) {
    const sectionItems = section.itemIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean) as MoodboardItem[];

    doc.addPage();
    drawPageBackground(doc);
    drawSectionHeader(doc, section.title, section.subtitle, section.summary);
    for (const item of sectionItems) drawMoodboardItem(doc, item);
  }

  doc.addPage();
  drawPageBackground(doc);
  drawClosing(doc, plan);
  addPageNumbers(doc);

  doc.end();
  await new Promise<void>((resolve) => doc.on("end", resolve));
  return Buffer.concat(chunks);
}

function drawPageBackground(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F6F4E8");
  doc.strokeColor("#D8D0C4").lineWidth(0.6);
  for (let y = 64; y < doc.page.height - 48; y += 44) {
    doc.moveTo(42, y).lineTo(doc.page.width - 42, y).stroke();
  }
  doc.fillColor("#2A2B2A");
}

function drawCover(doc: PDFKit.PDFDocument, plan: DossierPlan, items: MoodboardItem[]) {
  doc.fillColor("#5C1D24").fontSize(9).text(spacedCaps("FASHIONATLAS // PRIVATE CURATION DOSSIER"), 52, 70);
  doc.moveTo(52, 102).lineTo(doc.page.width - 52, 102).strokeColor("#5C1D24").lineWidth(1).stroke();

  doc.fillColor("#121212").fontSize(30).lineGap(6).text(plan.coverTitle, 52, 150, {
    width: doc.page.width - 104,
    align: "left",
  });

  doc.fillColor("#8C7255").fontSize(12).text(plan.coverSubtitle, 52, 270, {
    width: doc.page.width - 104,
  });

  doc.fillColor("#2A2B2A").fontSize(12).lineGap(7).text(plan.editorLetter, 52, 340, {
    width: doc.page.width - 128,
  });

  doc.fillColor("#5C1D24").fontSize(10).text(spacedCaps(`TOTAL ARCHIVES ${items.length}`), 52, 610);
  doc.fillColor("#121212").fontSize(10).text(new Date().toLocaleDateString(), 52, 632);

  const sampleImages = items.filter((item) => item.image).slice(0, 4);
  let x = 330;
  let y = 585;
  sampleImages.forEach((item, idx) => {
    drawImagePlaceholder(doc, x + idx * 38, y, 30, 42, item.title);
  });
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, summary: string) {
  doc.fillColor("#5C1D24").fontSize(9).text(spacedCaps("CHAPTER INDEX"), 52, 58);
  doc.fillColor("#121212").fontSize(22).lineGap(4).text(title, 52, 88, { width: doc.page.width - 104 });
  doc.fillColor("#8C7255").fontSize(10).text(subtitle, 52, 146, { width: doc.page.width - 104 });
  doc.fillColor("#2A2B2A").fontSize(11).lineGap(5).text(summary, 52, 180, { width: doc.page.width - 104 });
  doc.moveTo(52, 230).lineTo(doc.page.width - 52, 230).strokeColor("#5C1D24").lineWidth(0.8).stroke();
  doc.y = 254;
}

function drawMoodboardItem(doc: PDFKit.PDFDocument, item: MoodboardItem) {
  if (doc.y > doc.page.height - 190) {
    doc.addPage();
    drawPageBackground(doc);
    doc.y = 64;
  }

  const top = doc.y;
  if (item.image) drawImagePlaceholder(doc, 52, top, 92, 72, item.title);

  const textX = item.image ? 168 : 52;
  const width = doc.page.width - textX - 52;
  doc.fillColor("#5C1D24").fontSize(8).text(spacedCaps(`${item.type.toUpperCase()} // ${item.savedAt}`), textX, top, { width });
  doc.fillColor("#121212").fontSize(14).lineGap(2).text(item.title, textX, top + 18, { width });
  doc.fillColor("#2A2B2A").fontSize(10).lineGap(4).text(item.notes || "此灵感尚未写入详细札记。", textX, top + 48, {
    width,
    height: 92,
    ellipsis: true,
  });

  if (item.tags && item.tags.length > 0) {
    doc.fillColor("#8C7255").fontSize(8).text(item.tags.map((tag) => `#${tag}`).join("   "), textX, doc.y + 6, { width });
  }

  doc.y = Math.max(doc.y, top + 134);
  doc.moveTo(52, doc.y).lineTo(doc.page.width - 52, doc.y).strokeColor("#D8D0C4").lineWidth(0.6).stroke();
  doc.y += 22;
}

function drawImagePlaceholder(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number, label: string) {
  doc.save();
  doc.roundedRect(x, y, width, height, 4).fillAndStroke("#E5E0D8", "#CFC5B8");
  doc.fillColor("#5C1D24").fontSize(7).text("IMAGE", x + 8, y + 8, { width: width - 16 });
  doc.fillColor("#2A2B2A").fontSize(7).text(label.slice(0, 28), x + 8, y + height - 22, {
    width: width - 16,
    height: 16,
    ellipsis: true,
  });
  doc.restore();
}

function drawClosing(doc: PDFKit.PDFDocument, plan: DossierPlan) {
  doc.fillColor("#5C1D24").fontSize(9).text(spacedCaps("EDITORIAL CLOSING NOTE"), 52, 88);
  doc.fillColor("#121212").fontSize(24).text("策展尾声 / FINAL CURATORIAL NOTE", 52, 130, {
    width: doc.page.width - 104,
  });
  doc.fillColor("#2A2B2A").fontSize(13).lineGap(8).text(plan.closingNote, 52, 220, {
    width: doc.page.width - 120,
  });
  doc.fillColor("#8C7255").fontSize(9).text(`Generated by ${plan.model}${plan.simulated ? " (fallback curation)" : ""}`, 52, 620);
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.fillColor("#8C7255").fontSize(8).text(spacedCaps(`FASHIONATLAS ${String(i + 1).padStart(2, "0")}`), 52, doc.page.height - 36, {
      width: doc.page.width - 104,
      align: "right",
    });
  }
}

function spacedCaps(value: string) {
  return value.toUpperCase().split("").join(" ");
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
    timeout = setTimeout(() => reject(new Error("AI request timed out")), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
