import fs from "fs";
import path from "path";
import { beijingDate, readDailyCurationFile } from "../src/server/curation-file.js";

interface GoldenExpect {
  mustInclude?: string[];
  mustIncludeAny?: string[];
  mustNotInclude?: string[];
  retrieveId?: string;
  retrieveSource?: string;
  news?: "reflect-file";
  forbidInventedUrls?: boolean;
}

interface GoldenCase {
  id: string;
  category: string;
  question: string;
  expect: GoldenExpect;
}

interface GoldenFile {
  cases: GoldenCase[];
}

const ROOT = process.cwd();
const GOLDEN_PATH = path.join(ROOT, "data/eval/golden.json");
const OUTPUT_PATH = path.join(ROOT, "data/eval/last-run.json");
const CHAT_URL = process.env.EVAL_CHAT_URL || "http://127.0.0.1:3000/api/chat";

function extractUrls(text: string) {
  return Array.from(text.matchAll(/https?:\/\/[^\s)\]>'"]+/gi)).map((match) => match[0].replace(/[.,]$/, ""));
}

function includesAll(haystack: string, needles: string[] = []) {
  const lower = haystack.toLowerCase();
  return needles.filter((needle) => !lower.includes(needle.toLowerCase()));
}

function includesAny(haystack: string, needles: string[] = []) {
  const lower = haystack.toLowerCase();
  return needles.filter((needle) => lower.includes(needle.toLowerCase()));
}

function retrievedIds(docs: any[]) {
  return (docs || []).map((doc) => doc?.content?.id).filter(Boolean);
}

function retrievedSources(docs: any[]) {
  return (docs || []).map((doc) => doc?.source).filter(Boolean);
}

async function ask(question: string) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`chat ${response.status}: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
}

function publishedCuration() {
  const file = readDailyCurationFile();
  if (!file || file.date !== beijingDate() || !file.items?.length) return null;
  return file;
}

function scoreCase(testCase: GoldenCase, answer: string, docs: any[], curation: ReturnType<typeof publishedCuration>) {
  const failures: string[] = [];
  const text = answer || "";

  const missingRequired = includesAll(text, testCase.expect.mustInclude);
  if (missingRequired.length) failures.push(`missing: ${missingRequired.join(" | ")}`);

  if (testCase.expect.mustIncludeAny?.length) {
    const anyHit = includesAny(text, testCase.expect.mustIncludeAny);
    if (!anyHit.length) {
      failures.push(`missing any of: ${testCase.expect.mustIncludeAny.join(" | ")}`);
    }
  }

  const leaked = includesAny(text, testCase.expect.mustNotInclude);
  if (leaked.length) failures.push(`mustNotInclude hit: ${leaked.join(" | ")}`);

  if (testCase.expect.retrieveId && !retrievedIds(docs).includes(testCase.expect.retrieveId)) {
    failures.push(`retrieveId missed: ${testCase.expect.retrieveId} (got ${retrievedIds(docs).join(", ") || "none"})`);
  }

  if (testCase.expect.retrieveSource && !retrievedSources(docs).includes(testCase.expect.retrieveSource)) {
    failures.push(`retrieveSource missed: ${testCase.expect.retrieveSource}`);
  }

  const urls = extractUrls(text);
  const allowed = new Set((curation?.sourceUrls || []).concat((curation?.items || []).map((item) => item.url)));

  if (testCase.expect.news === "reflect-file") {
    if (!curation) {
      if (!/尚未发布/.test(text)) failures.push("expected 尚未发布 when no today's file");
    } else {
      const titleHit = curation.items.some((item) => text.includes(item.title.slice(0, 18)));
      const urlHit = curation.items.some((item) => text.includes(item.url));
      if (!titleHit && !urlHit) failures.push("live briefing not reflected in answer");
    }
  }

  if (testCase.expect.forbidInventedUrls) {
    const invented = urls.filter((url) => !allowed.has(url));
    if (invented.length) failures.push(`invented url: ${invented.join(" | ")}`);
  }

  return { pass: failures.length === 0, failures, urls };
}

async function main() {
  const golden = JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf-8")) as GoldenFile;
  const curation = publishedCuration();
  const results = [];

  console.log(`chat ${CHAT_URL}`);
  console.log(`today ${beijingDate()} liveFile=${Boolean(curation)} cases=${golden.cases.length}`);

  for (const testCase of golden.cases) {
    const started = Date.now();
    try {
      const body = await ask(testCase.question);
      const answer = String(body.text || "");
      const docs = body.retrievedDocs || [];
      const scored = scoreCase(testCase, answer, docs, curation);
      results.push({
        id: testCase.id,
        category: testCase.category,
        pass: scored.pass,
        failures: scored.failures,
        ms: Date.now() - started,
        simulated: Boolean(body.simulated),
        model: body.model || null,
        retrieveIds: retrievedIds(docs),
        answerPreview: answer.slice(0, 220),
      });
      console.log(`${scored.pass ? "PASS" : "FAIL"} ${testCase.id} ${Date.now() - started}ms`);
      if (!scored.pass) console.log(" ", scored.failures.join("; "));
    } catch (error) {
      results.push({
        id: testCase.id,
        category: testCase.category,
        pass: false,
        failures: [error instanceof Error ? error.message : String(error)],
        ms: Date.now() - started,
      });
      console.log(`FAIL ${testCase.id} ${error instanceof Error ? error.message : error}`);
    }
  }

  const passed = results.filter((row) => row.pass).length;
  const report = {
    ranAt: new Date().toISOString(),
    chatUrl: CHAT_URL,
    liveFile: Boolean(curation),
    passed,
    total: results.length,
    results,
  };
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`\n${passed}/${results.length} passed → ${path.relative(ROOT, OUTPUT_PATH)}`);
  if (passed < results.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
