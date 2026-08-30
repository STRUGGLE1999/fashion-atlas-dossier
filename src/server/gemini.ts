import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ override: true });

const DEFAULT_BASE_URL = "https://api.aicodemirror.ai/api/gemini";
const DEFAULT_MODEL = "gemini-3.7-flash";
const DEFAULT_TIMEOUT_MS = 30000;

export function getGeminiApiKey() {
  return (process.env.GEMINI_API_KEY || "").trim();
}

export function getGeminiModel() {
  return (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
}

export function getGeminiBaseUrl() {
  const configured = (process.env.GEMINI_BASE_URL || DEFAULT_BASE_URL).trim();
  return configured.replace(/\/+$/, "");
}

export function getGeminiTimeoutMs() {
  const timeout = Number(process.env.AI_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS;
}

export function createGeminiClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      baseUrl: getGeminiBaseUrl(),
    },
  });
}

/** Gemini 3.x rejects temperature / topP / topK. Keep those only on older models. */
export function geminiContentConfig(config: {
  systemInstruction?: string;
  temperature?: number;
}) {
  const skipSampling = /^gemini-3/i.test(getGeminiModel());
  return {
    ...(config.systemInstruction ? { systemInstruction: config.systemInstruction } : {}),
    ...(!skipSampling && typeof config.temperature === "number"
      ? { temperature: config.temperature }
      : {}),
  };
}
