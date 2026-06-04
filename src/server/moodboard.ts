import type { MoodboardItem } from "../types.js";
import { getMoodboardItems, saveMoodboardItems } from "./db.js";
import { getAnonymousUserId, type CookieContext } from "./identity.js";

export async function handleGetMoodboard(
  context: CookieContext,
  fallbackItems: MoodboardItem[] = [],
) {
  const userId = getAnonymousUserId(context);
  const items = await getMoodboardItems(userId, fallbackItems);
  return { status: 200, body: items };
}

export async function handleSaveMoodboard(context: CookieContext, body: unknown) {
  if (!Array.isArray(body)) {
    return { status: 400, body: { error: "Moodboard payload must be an array." } };
  }

  const userId = getAnonymousUserId(context);
  const result = await saveMoodboardItems(userId, body as MoodboardItem[]);
  return {
    status: 200,
    body: {
      success: true,
      persisted: result.persisted,
    },
  };
}
