import type { DailyCuration, FashionNewsItem } from "../types.js";
import { beijingDate, readDailyCurationFile, writeDailyCurationFile } from "./curation-file.js";
import { getGeminiApiKey, getGeminiModel } from "./gemini.js";
import {
  curateDailyFashionNews,
  dedupeNewsItems,
  fetchFashionNews,
  verifyCurationGrounding,
} from "./news.js";

export interface CurationAgentResult {
  published: boolean;
  reason: string;
  fetched: number;
  candidates: number;
  date: string;
  model: string;
  curation: DailyCuration | null;
}

export async function runHomepageCurationAgent(): Promise<CurationAgentResult> {
  const date = beijingDate();
  const model = getGeminiModel();

  if (!getGeminiApiKey()) {
    return skip("GEMINI_API_KEY is missing", date, model);
  }

  const fetchedItems = await fetchFashionNews();
  const uniqueFetched = dedupeNewsItems(fetchedItems);
  const yesterdayUrls = new Set(readDailyCurationFile()?.sourceUrls || []);
  const candidates = uniqueFetched
    .filter((item) => !yesterdayUrls.has(item.url))
    .slice(0, 60);

  if (candidates.length < 3) {
    return skip("Not enough unique RSS candidates after yesterday's URLs", date, model, {
      fetched: fetchedItems.length,
      candidates: candidates.length,
    });
  }

  const curation = await curateDailyFashionNews(candidates, date);
  const verified = verifyCurationGrounding(curation, candidates);

  if (!verified.ok) {
    return skip(verified.reason, date, model, {
      fetched: fetchedItems.length,
      candidates: candidates.length,
      curation,
    });
  }

  if (curation.items.length < 3) {
    return skip("Curation has fewer than 3 grounded items", date, model, {
      fetched: fetchedItems.length,
      candidates: candidates.length,
      curation,
    });
  }

  const datedCuration: DailyCuration = { ...curation, date };
  writeDailyCurationFile(datedCuration);

  return {
    published: true,
    reason: "Wrote today's homepage briefing",
    fetched: fetchedItems.length,
    candidates: candidates.length,
    date,
    model,
    curation: datedCuration,
  };
}

function skip(
  reason: string,
  date: string,
  model: string,
  extra: Partial<CurationAgentResult> = {},
): CurationAgentResult {
  return {
    published: false,
    reason,
    fetched: extra.fetched || 0,
    candidates: extra.candidates || 0,
    date,
    model,
    curation: extra.curation || null,
  };
}
