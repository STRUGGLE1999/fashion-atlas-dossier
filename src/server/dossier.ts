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
    margin: 46,
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

  drawCover(doc, plan, items);
  drawContents(doc, plan, items);

  for (const section of plan.sections) {
    const sectionItems = section.itemIds
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean) as MoodboardItem[];

    if (sectionItems.length === 0) continue;
    ensureSpace(doc, 132);
    drawSectionHeader(doc, section.title, section.subtitle, section.summary);
    for (const item of sectionItems) drawMoodboardItem(doc, item);
  }

  ensureSpace(doc, 190);
  drawClosing(doc, plan);
  addPageNumbers(doc);

  doc.end();
  await new Promise<void>((resolve) => doc.on("end", resolve));
  return Buffer.concat(chunks);
}

function drawPageBase(doc: PDFKit.PDFDocument) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#FBFAF6");
  doc.fillColor("#2A2B2A");
}

function drawCover(doc: PDFKit.PDFDocument, plan: DossierPlan, items: MoodboardItem[]) {
  drawPageBase(doc);
  doc.fillColor("#5C1D24").fontSize(9).text(spacedCaps("FASHIONATLAS // PRIVATE CURATION DOSSIER"), 46, 58);
  doc.moveTo(46, 86).lineTo(doc.page.width - 46, 86).strokeColor("#5C1D24").lineWidth(1).stroke();

  doc.fillColor("#121212").fontSize(28).lineGap(6).text(plan.coverTitle, 46, 130, {
    width: doc.page.width - 92,
    align: "left",
  });

  doc.fillColor("#8C7255").fontSize(11).text(plan.coverSubtitle, 46, 248, {
    width: doc.page.width - 92,
  });

  doc.roundedRect(46, 315, doc.page.width - 92, 170, 6).fillAndStroke("#F1EDE4", "#DED6CA");
  doc.fillColor("#5C1D24").fontSize(8).text(spacedCaps("EDITOR LETTER"), 64, 338);
  doc.fillColor("#2A2B2A").fontSize(11).lineGap(6).text(plan.editorLetter, 64, 365, {
    width: doc.page.width - 128,
    height: 88,
    ellipsis: true,
  });

  doc.fillColor("#5C1D24").fontSize(9).text(spacedCaps(`TOTAL ASSETS ${items.length}`), 46, 588);
  doc.fillColor("#121212").fontSize(9).text(new Date().toLocaleDateString(), 46, 610);
  doc.fillColor("#8C7255").fontSize(8).text(`Generated by ${plan.model}${plan.simulated ? " (fallback curation)" : ""}`, 46, 632);

  const sampleImages = items.filter((item) => item.image).slice(0, 4);
  let x = 346;
  const y = 578;
  sampleImages.forEach((item, idx) => {
    drawImagePlaceholder(doc, x + idx * 42, y, 34, 48, item.title);
  });

  doc.addPage();
  drawPageBase(doc);
}

function drawContents(doc: PDFKit.PDFDocument, plan: DossierPlan, items: MoodboardItem[]) {
  doc.fillColor("#5C1D24").fontSize(8).text(spacedCaps("DOSSIER CONTENTS"), 46, 54);
  doc.fillColor("#121212").fontSize(20).text("目录与资产概览", 46, 82);
  doc.fillColor("#8C7255").fontSize(9).text("每条 AI 灵感会保留标题、标签、摘要、用途与延展问题，便于继续写成作品集叙事。", 46, 114, {
    width: doc.page.width - 92,
  });

  doc.y = 162;
  plan.sections.forEach((section, index) => {
    const count = section.itemIds.filter((id) => items.some((item) => item.id === id)).length;
    if (count === 0) return;
    ensureSpace(doc, 54);
    doc.fillColor("#5C1D24").fontSize(9).text(String(index + 1).padStart(2, "0"), 46, doc.y);
    doc.fillColor("#121212").fontSize(12).text(section.title, 82, doc.y - 2, {
      width: doc.page.width - 180,
      continued: false,
    });
    doc.fillColor("#8C7255").fontSize(8).text(`${count} assets`, doc.page.width - 112, doc.y - 1, {
      width: 66,
      align: "right",
    });
    doc.moveTo(82, doc.y + 20).lineTo(doc.page.width - 46, doc.y + 20).strokeColor("#E1DAD0").lineWidth(0.5).stroke();
    doc.y += 40;
  });

  doc.y += 18;
}

function drawSectionHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string, summary: string) {
  ensureSpace(doc, 118);
  doc.moveTo(46, doc.y).lineTo(doc.page.width - 46, doc.y).strokeColor("#5C1D24").lineWidth(0.8).stroke();
  doc.y += 16;
  doc.fillColor("#5C1D24").fontSize(8).text(spacedCaps("CHAPTER"), 46, doc.y);
  doc.y += 20;
  doc.fillColor("#121212").fontSize(18).lineGap(3).text(title, 46, doc.y, { width: doc.page.width - 92 });
  doc.fillColor("#8C7255").fontSize(9).text(subtitle, 46, doc.y + 8, { width: doc.page.width - 92 });
  doc.moveDown(0.8);
  doc.fillColor("#2A2B2A").fontSize(10).lineGap(4).text(summary, 46, doc.y, { width: doc.page.width - 92 });
  doc.y += 18;
}

function drawMoodboardItem(doc: PDFKit.PDFDocument, item: MoodboardItem) {
  const summary = item.metadata?.summary || firstParagraph(item.notes || "");
  const theme = item.metadata?.theme;
  const dossierUse = item.metadata?.dossierUse;
  const questions = item.metadata?.followUpQuestions || [];
  const notes = item.notes || "此灵感尚未写入详细札记。";
  ensureSpace(doc, 220);

  doc.moveTo(46, doc.y).lineTo(doc.page.width - 46, doc.y).strokeColor("#E4DDD3").lineWidth(0.6).stroke();
  doc.y += 14;

  doc.fillColor("#5C1D24").fontSize(7).text(spacedCaps(`${item.type.toUpperCase()} // ${item.savedAt}`), 46, doc.y, {
    width: doc.page.width - 92,
    lineBreak: false,
  });
  doc.y += 16;

  doc.fillColor("#121212").fontSize(14).lineGap(2).text(item.title, 46, doc.y, {
    width: doc.page.width - 92,
  });
  doc.y += 6;

  if (summary) {
    ensureSpace(doc, 46);
    doc.fillColor("#8C7255").fontSize(8).text("摘要", 46, doc.y, { lineBreak: false });
    doc.y += 13;
    doc.fillColor("#2A2B2A").fontSize(9).lineGap(3).text(summary, 46, doc.y, {
      width: doc.page.width - 92,
    });
    doc.y += 6;
  }

  const metaLine = [theme ? `主题：${theme}` : "", dossierUse ? `用途：${dossierUse}` : ""].filter(Boolean).join("    ");
  if (metaLine) {
    ensureSpace(doc, 28);
    doc.fillColor("#5C1D24").fontSize(8).text(metaLine, 46, doc.y, {
      width: doc.page.width - 92,
    });
    doc.y += 6;
  }

  ensureSpace(doc, 80);
  doc.fillColor("#2A2B2A").fontSize(9).lineGap(3).text(notes, 46, doc.y, {
    width: doc.page.width - 92,
    height: 78,
    ellipsis: true,
  });
  doc.y += 8;

  if (questions.length > 0) {
    ensureSpace(doc, 18 + questions.length * 14);
    doc.fillColor("#8C7255").fontSize(8).text("可延展问题", 46, doc.y, { lineBreak: false });
    doc.y += 13;
    questions.slice(0, 3).forEach((question, index) => {
      doc.fillColor("#2A2B2A").fontSize(8).text(`${index + 1}. ${question}`, 46, doc.y, {
        width: doc.page.width - 92,
      });
    });
    doc.y += 6;
  }

  if (item.tags && item.tags.length > 0) {
    ensureSpace(doc, 22);
    doc.fillColor("#8C7255").fontSize(8).text(item.tags.map((tag) => `#${tag}`).join("   "), 46, doc.y, {
      width: doc.page.width - 92,
    });
  }

  doc.y += 18;
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
  doc.moveTo(46, doc.y).lineTo(doc.page.width - 46, doc.y).strokeColor("#5C1D24").lineWidth(0.8).stroke();
  doc.y += 18;
  doc.fillColor("#5C1D24").fontSize(8).text(spacedCaps("EDITORIAL CLOSING NOTE"), 46, doc.y);
  doc.y += 28;
  doc.fillColor("#121212").fontSize(20).text("策展尾声 / Final Note", 46, doc.y, {
    width: doc.page.width - 92,
  });
  doc.moveDown(0.8);
  doc.fillColor("#2A2B2A").fontSize(11).lineGap(6).text(plan.closingNote, 46, doc.y, {
    width: doc.page.width - 92,
  });
  doc.moveDown(1.2);
  doc.fillColor("#8C7255").fontSize(8).text(`Generated by ${plan.model}${plan.simulated ? " (fallback curation)" : ""}`, 46, doc.y);
}

function addPageNumbers(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.fillColor("#8C7255").fontSize(8).text(spacedCaps(`FASHIONATLAS ${String(i + 1).padStart(2, "0")}`), 52, doc.page.height - 36, {
      width: doc.page.width - 104,
      align: "right",
      height: 10,
      lineBreak: false,
    });
  }
}

function ensureSpace(doc: PDFKit.PDFDocument, neededHeight: number) {
  if (doc.y + neededHeight <= doc.page.height - 62) return;
  doc.addPage();
  drawPageBase(doc);
  doc.y = 54;
}

function firstParagraph(value: string) {
  return value.split(/\n\s*\n/)[0]?.replace(/\s+/g, " ").slice(0, 120).trim() || "";
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
