import { BATCH_SIZE, TOP_GAINERS } from "./config.js";
import { chunkArray, formatSymbol } from "./utils.js";
import symbols from "../symbols.json" assert { type: "json" };

let cache = {
  time: 0,
  data: null
};

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Missing Token" });
  }

  const batches = chunkArray(symbols, BATCH_SIZE);

  return res.status(200).json({
    message: "Scanner Engine Ready",
    totalStocks: symbols.length,
    totalBatches: batches.length,
    topGainers: TOP_GAINERS
  });

}
