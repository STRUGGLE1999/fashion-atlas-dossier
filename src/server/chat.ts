import { GoogleGenAI } from "@google/genai";
import { getLatestDailyCuration } from "./db.js";
import { retrieveContext } from "./data.js";

interface ChatBody {
  messages?: { role: "user" | "assistant"; content: string }[];
  contextGarment?: any;
  contextTrend?: any;
}

export async function handleChatRequest(body: ChatBody) {
  const messages = body.messages;
  if (!messages || !Array.isArray(messages)) {
    return {
      status: 400,
      body: { error: "Invalid parameters. 'messages' must be an array." },
    };
  }

  const latestMessage = messages[messages.length - 1]?.content || "";
  const dailyCuration = await getLatestDailyCuration();
  const retrievedDocs = retrieveContext(latestMessage, { dailyCuration, topK: 6 });
  const systemInstruction = buildSystemInstruction({
    retrievedDocs,
    contextGarment: body.contextGarment,
    contextTrend: body.contextTrend,
    hasDailyCuration: Boolean(dailyCuration),
  });

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) {
    return {
      status: 200,
      body: {
        text: fallbackAnswer(retrievedDocs, body),
        simulated: true,
        retrievedDocs,
      },
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await withTimeout(
      ai.models.generateContent({
        model,
        contents: messages.map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        config: {
          temperature: 0.65,
          systemInstruction,
        },
      }),
      Number(process.env.AI_REQUEST_TIMEOUT_MS || 10000),
    );

    return {
      status: 200,
      body: {
        text: response.text || fallbackAnswer(retrievedDocs, body),
        simulated: false,
        model,
        retrievedDocs,
      },
    };
  } catch (error: any) {
    return {
      status: 200,
      body: {
        text: fallbackAnswer(retrievedDocs, body, error?.message),
        simulated: true,
        errorDetail: error?.message || "Gemini request failed",
        retrievedDocs,
      },
    };
  }
}

function buildSystemInstruction(input: {
  retrievedDocs: any[];
  contextGarment?: any;
  contextTrend?: any;
  hasDailyCuration: boolean;
}) {
  let instruction = `You are "FashionAtlas AI Curation Engine", an elite digital fashion curator, stylist, and fashion historian.
Your goal is to provide insightful, academically grounded, and aesthetically sophisticated advice in Chinese.

Guidelines:
1. Break fashion analysis into Concept, Materiality, Silhouette, Context, and Practical Styling Path.
2. If using retrieved documents, cite them explicitly by title and source table.
3. If using daily fashion news, clearly label it as "今日资讯来源" and keep the original source visible.
4. Do not invent URLs, brands, runway seasons, books, or source facts.
5. Use concise bullet points or numbered lists.`;

  if (input.retrievedDocs.length > 0) {
    instruction += "\n\n[Retrieved Knowledge Base Documents]\n";
    input.retrievedDocs.forEach((doc, index) => {
      instruction += `--- Document ${index + 1} (Source: ${doc.source}) ---\n`;
      instruction += `${JSON.stringify(doc.content, null, 2)}\n`;
    });
  }

  if (input.contextGarment) {
    instruction += "\n\n[Active UI Context: Archive Item]\n";
    instruction += JSON.stringify(input.contextGarment, null, 2);
  }

  if (input.contextTrend) {
    instruction += "\n\n[Active UI Context: Trend Topic]\n";
    instruction += JSON.stringify(input.contextTrend, null, 2);
  }

  if (!input.hasDailyCuration) {
    instruction += "\n\n[Daily News Status]\n今日资讯策展尚未发布。若用户询问实时资讯，请说明当前没有已发布的今日资讯，并基于站内馆藏回答。";
  }

  return instruction;
}

function fallbackAnswer(retrievedDocs: any[], body: ChatBody, errorDetail?: string) {
  const lines = ["【FashionAtlas 策展引擎兜底回答】"];
  if (errorDetail) lines.push(`AI 生成暂不可用：${errorDetail}`);

  if (body.contextGarment) {
    lines.push(`当前绑定馆藏：《${body.contextGarment.name}》。建议从概念、材料、廓形和历史语境四层拆解，再转化为可执行穿搭路径。`);
  }

  if (body.contextTrend) {
    lines.push(`当前绑定趋势：《${body.contextTrend.name}》。建议先识别关键单品，再判断它与现有衣橱的版型、颜色和场景关系。`);
  }

  if (retrievedDocs.length > 0) {
    lines.push("站内命中资料：");
    retrievedDocs.forEach((doc) => {
      lines.push(`- [${doc.source}] ${doc.content.name || doc.content.title || doc.content.sourceName || "Untitled"}`);
    });
  } else {
    lines.push("暂未命中强相关站内资料。建议换用具体品牌、秀场、风格词或单品名称提问。");
  }

  return lines.join("\n\n");
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
