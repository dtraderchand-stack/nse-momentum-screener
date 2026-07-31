import fs from "fs";
import path from "path";

import { BATCH_SIZE, TOP_GAINERS } from "./config.js";
import { chunkArray } from "./utils.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: "Missing Token"
    });
  }

  try {

    const filePath = path.join(process.cwd(), "symbols.json");

    const symbols = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const batches = chunkArray(symbols, BATCH_SIZE);

    return res.status(200).json({

      message: "Scanner Engine Ready",

      totalStocks: symbols.length,

      totalBatches: batches.length,

      topGainers: TOP_GAINERS

    });

  } catch (e) {

    return res.status(500).json({

      error: e.message

    });

  }

}
