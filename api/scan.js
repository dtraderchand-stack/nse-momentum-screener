export default async function handler(req, res) {
  if (req.method!== "POST") return res.status(405).json({ error: "Method not allowed" });

  const access_token = req.body.access_token;
  const appId = process.env.FYERS_APP_ID;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  try {
    // STEP 1: NSE se Top 100 Gainers uthao
    const nseRes = await fetch("https://www.nseindia.com/api/top-gainers", {
      headers: {
        "User-Agent": "Mozilla/5.0" // NSE ko browser jaisa lagna chahiye
      }
    });
    const nseData = await nseRes.json();
    const top40 = nseData.data.slice(0, 40); // sirf 40 stock

    // STEP 2: Un 40 ke symbol ko Fyers format me convert karo NSE:SBIN-EQ
    const fyersSymbols = top40.map(s => `NSE:${s.symbol}-EQ`);

    // STEP 3: Fyers se 1-min candle data lo sabhi 40 ka
    const historyPromises = fyersSymbols.map(symbol =>
      fetch(`https://api-t1.fyers.in/data/history?symbol=${symbol}&resolution=1&range=1`, {
        headers: { "Authorization": `${appId}:${access_token}` }
      }).then(r => r.json())
    );

    const historyResults = await Promise.all(historyPromises);

    // STEP 4: 2 Filter lagao
    const finalStocks = [];
    historyResults.forEach((stockData, i) => {
      const candle = stockData.candles[0]; // last 1 min candle [timestamp, open, high, low, close, volume]
      if(!candle) return;

      const [time, open, high, low, close, volume] = candle;
      const perMinValue = close * volume; // Filter 1
      const candleChange = ((close - open) / open) * 100; // Filter 2

      if(perMinValue > 60000000 && candleChange > 1.0) { // 6 Cr aur 1%
        finalStocks.push({
          symbol: top40[i].symbol,
          ltp: close,
          change: candleChange.toFixed(2),
          turnoverCr: (perMinValue / 10000000).toFixed(2), // Cr me
          volume: volume
        });
      }
    });

    return res.status(200).json({ data: finalStocks });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
