import { QUOTE_URL } from "./config.js";
import { formatSymbol } from "./utils.js";

export async function getQuotes(batch, token) {

  const symbols = batch.map(formatSymbol);

  const response = await fetch(QUOTE_URL, {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      symbols
    })
  });

  const json = await response.json();

  if (json.s !== "ok") {
    throw new Error(json.message || "Quote API Error");
  }

  return json.d.map(stock => ({
    symbol: stock.v.symbol.replace("NSE:", "").replace("-EQ", ""),
    ltp: stock.v.lp,
    change: Number(stock.v.chp),
    volume: stock.v.volume || 0
  }));

}
