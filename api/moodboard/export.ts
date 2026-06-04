import { getMoodboardItems } from "../../src/server/db.js";
import { generateMoodboardDossierPdf } from "../../src/server/dossier.js";
import { getAnonymousUserId } from "../../src/server/identity.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const context = {
    getHeader: (name: string) => {
      const value = req.headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    },
    setHeader: (name: string, value: string) => res.setHeader(name, value),
  };

  const userId = getAnonymousUserId(context);
  const items = await getMoodboardItems(userId);
  const { buffer, filename } = await generateMoodboardDossierPdf(items);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buffer);
}
