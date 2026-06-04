import { getPublishedDailyCuration } from "../src/server/news.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const curation = await getPublishedDailyCuration();
  if (!curation || curation.items.length === 0) {
    res.status(200).json({ curation: null, fallback: true });
    return;
  }

  res.status(200).json({ curation, fallback: false });
}
