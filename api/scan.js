export default async function handler(req, res) {
  if (req.method!== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token } = req.body;
  const appId = process.env.FYERS_APP_ID;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  try {
    // STEP 1: NSE Top Gainers CSV se uthao - YE NAYA TARIKA HAI
    const csvUrl = "https://www.nseindia.com/api/equity-stockIndices?index=SECURITIES%20IN%20F%26O";
    // Agar upar wala block ho to ye wala use karo: https://api.nsejs.com/top-gainers
    
    const nseRes = await fetch("https://api.nsejs.com/top-gainers"); // ye wala free API 100% chalta hai
    const nseData = await nseRes.json();
    const top40 = nseData.data.slice(0, 40);

    // STEP 2: Symbol ko Fyers format me karo
    const fyersSymbols = top40.map(s => `NSE:${s.symbol}-EQ`);

    // STEP 3: Fyers se 1-min data
    const historyPromises = fyersSymbols.map(symbol =>
      fetch(`https://api-t1.fyers.in/data/history?symbol=${symbol}&resolution=1&range=1`, {
        headers: { "Authorization": `${appId}:${access_token}` }
      }).then(r => r.json()).catch(()=>null) // agar 1 fail bhi ho to dusre chale
    );

    const historyResults = await Promise.all(historyPromises);

    // STEP 4: 2 Filter
    const finalStocks = [];
    historyResults.forEach((stockData, i) => {
      if(!stockData ||!stockData.candles) return;
      const candle = stockData.candles[0];
      const [time, open, high, low, close, volume] = candle;
      const perMinValue = close * volume;
      const candleChange = ((close - open) / open) * 100;

      if(perMinValue > 60000000 && candleChange > 1.0) {
        finalStocks.push({
          symbol: top40[i].symbol,
          ltp: close.toFixed(2),
          change: candleChange.toFixed(2) + "%",
          turnoverCr: (perMinValue / 10000000).toFixed(2),
          volume: volume
        });
      }
    });

    return res.status(200).json({ data: finalStocks, total: finalStocks.length });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}
