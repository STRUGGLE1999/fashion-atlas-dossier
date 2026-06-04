import { handleGetMoodboard, handleSaveMoodboard } from "../src/server/moodboard.js";

export default async function handler(req: any, res: any) {
  const context = {
    getHeader: (name: string) => {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },
    setHeader: (name: string, value: string) => res.setHeader(name, value),
  };

  if (req.method === "GET") {
    const result = await handleGetMoodboard(context);
    res.status(result.status).json(result.body);
    return;
  }

  if (req.method === "POST") {
    const result = await handleSaveMoodboard(context, req.body);
    res.status(result.status).json(result.body);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
