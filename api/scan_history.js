import { HISTORY_URL } from "./config.js";
import { formatSymbol, candleBody, tradedValue } from "./utils.js";

export async function checkHistory(symbol, token) {

  const response = await fetch(HISTORY_URL, {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      symbol: formatSymbol(symbol),
      resolution: "1",
      date_format: "0",
      range_from: Math.floor(Date.now() / 1000) - 120,
      range_to: Math.floor(Date.now() / 1000),
      cont_flag: "1"
    })
  });

  const json = await response.json();

  if (json.s !== "ok") {
    return null;
  }

  const candles = json.candles;

  if (!candles || candles.length === 0) {
    return null;
  }

  const last = candles[candles.length - 1];

  const open = last[1];
  const close = last[4];
  const volume = last[5];

  return {
    body: candleBody(open, close),
    value: tradedValue(volume, close)
  };

}
