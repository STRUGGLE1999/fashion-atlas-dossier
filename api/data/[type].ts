import { isDataType, readJsonData } from "../../src/server/data.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const type = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
  if (!type || !isDataType(type)) {
    res.status(404).json({ error: "Unknown data type" });
    return;
  }

  res.status(200).json(readJsonData(type));
}
