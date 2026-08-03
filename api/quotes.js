import fs from "fs";
import path from "path";
import { chunkArray, formatSymbol } from "./utils.js";
import { BATCH_SIZE } from "./config.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        error: "Missing Token"
      });
    }

    const filePath = path.join(process.cwd(), "symbols.json");

    const symbols = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    const batches = chunkArray(symbols, BATCH_SIZE);

    let results = [];

    for (const batch of batches) {

      const fyersSymbols = batch
        .map(formatSymbol)
        .join(",");

      const response = await fetch(
        "https://api-t1.fyers.in/data/quotes",
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            symbols: fyersSymbols
          })
        }
      );

      const data = await response.json();

      if (!data.d) continue;

      for (const stock of data.d) {

        if (!stock.v) continue;

        const prev = stock.v.prev_close_price;
        const ltp = stock.v.lp;

        if (!prev || !ltp) continue;

        const change =
          ((ltp - prev) / prev) * 100;

        results.push({
          symbol: stock.n,
          ltp,
          change: Number(change.toFixed(2))
        });

      }

    }

    results.sort(
      (a, b) => b.change - a.change
    );

    return res.status(200).json({
      total: results.length,
      top100: results.slice(0, 100)
    });

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }

}
