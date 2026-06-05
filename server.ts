import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handleChatRequest } from "./src/server/chat.js";
import { isDataType, readJsonData } from "./src/server/data.js";
import { getMoodboardItems } from "./src/server/db.js";
import { generateMoodboardDossierPdf } from "./src/server/dossier.js";
import { getAnonymousUserId } from "./src/server/identity.js";
import { handleCurateInsightRequest } from "./src/server/insight.js";
import { handleGetMoodboard, handleSaveMoodboard } from "./src/server/moodboard.js";
import { fetchAndCurateFashionNews, getPublishedDailyCuration } from "./src/server/news.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Data API Endpoints
app.get("/api/data/:type", (req, res) => {
  const { type } = req.params;
  if (!isDataType(type)) {
    res.status(404).json({ error: "Unknown data type" });
    return;
  }

  res.json(readJsonData(type));
});

// Search API for Archives
app.get("/api/search/archives", (req, res) => {
  const query = (req.query.q as string || "").toLowerCase();
  const archives = readJsonData("archives");
  const filtered = archives.filter((item: any) =>
    item.name.toLowerCase().includes(query) ||
    item.designer.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
  res.json(filtered);
});

// Moodboard API Endpoints
app.get("/api/moodboard", (req, res) => {
  handleGetMoodboard(
    {
      getHeader: (name) => {
        const value = req.headers[name.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
      },
      setHeader: (name, value) => res.setHeader(name, value),
    },
    readJsonData("moodboard"),
  ).then((result) => {
    res.status(result.status).json(result.body);
  });
});

app.post("/api/moodboard", (req, res) => {
  handleSaveMoodboard(
    {
      getHeader: (name) => {
        const value = req.headers[name.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
      },
      setHeader: (name, value) => res.setHeader(name, value),
    },
    req.body,
  ).then((result) => {
    res.status(result.status).json(result.body);
  });
});

app.post("/api/moodboard/curate-insight", async (req, res) => {
  const result = await handleCurateInsightRequest(req.body || {});
  res.status(result.status).json(result.body);
});

app.get("/api/moodboard/export", async (req, res) => {
  const context = {
    getHeader: (name: string) => {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },
    setHeader: (name: string, value: string) => res.setHeader(name, value),
  };
  const userId = getAnonymousUserId(context);
  const items = await getMoodboardItems(userId, readJsonData("moodboard"));
  const { buffer, filename } = await generateMoodboardDossierPdf(items);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buffer);
});

// REST API for chatbot interaction (Gemini + station knowledge RAG)
app.post("/api/chat", async (req: express.Request, res: express.Response): Promise<void> => {
  const result = await handleChatRequest(req.body || {});
  res.status(result.status).json(result.body);
});

app.get("/api/daily-curation", async (_req, res) => {
  const curation = await getPublishedDailyCuration();
  if (!curation || curation.items.length === 0) {
    res.json({ curation: null, fallback: true });
    return;
  }

  res.json({ curation, fallback: false });
});

app.get("/api/cron/fetch-fashion-news", async (req, res) => {
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  const result = await fetchAndCurateFashionNews();
  res.json(result);
});

// Configure Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production builds serve statically
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FashionAtlas Full-Stack App Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
