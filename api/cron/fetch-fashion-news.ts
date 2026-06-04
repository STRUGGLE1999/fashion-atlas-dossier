import { fetchAndCurateFashionNews } from "../../src/server/news.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  try {
    const result = await fetchAndCurateFashionNews();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to fetch and curate fashion news",
      detail: error?.message || String(error),
    });
  }
}
