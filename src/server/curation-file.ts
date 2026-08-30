import fs from "fs";
import path from "path";
import type { DailyCuration } from "../types.js";

export const DAILY_CURATION_RELATIVE_PATH = "data/daily_curation.json";

export function beijingDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function dailyCurationFilePath() {
  return path.join(process.cwd(), DAILY_CURATION_RELATIVE_PATH);
}

export function readDailyCurationFile(): DailyCuration | null {
  const filePath = dailyCurationFilePath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.items)) return null;
    return parsed as DailyCuration;
  } catch {
    return null;
  }
}

export function writeDailyCurationFile(curation: DailyCuration) {
  const filePath = dailyCurationFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(curation, null, 2)}\n`, "utf-8");
}

export function getFileCurationForToday(): DailyCuration | null {
  const curation = readDailyCurationFile();
  if (!curation || curation.items.length === 0) return null;
  if (curation.date !== beijingDate()) return null;
  return curation;
}
