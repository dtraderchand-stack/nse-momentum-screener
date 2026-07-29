export default async function handler(req, res) {
  if (req.method!== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token } = req.body;
  const appId = process.env.FYERS_APP_ID;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  // STEP 1: NSE Top 40 F&O Stocks Hardcoded
  const top40Symbols = [
    "RELIANCE","TCS","INFY","HDFCBANK","ICIBANK","HDFC","BHARTIARTL","ITC","KOTAKBANK","LT",
    "AXISBANK","ASIANPAINT","MARUTI","SBIN","BAJFINANCE","WIPRO","HCLTECH","ADANIPORTS","SUNPHARMA","TITAN",
    "ULTRACEMCO","NESTLEIND","POWERGRID","NTPC","ONGC","COALINDIA","TATAMOTORS","TATASTEEL","JSWSTEEL","BAJAJFINSV",
    "TECHM","INDUSINDBK","GRASIM","HINDALCO","BPCL","EICHERMOTORS","DIVISLAB","BRITANNIA","HEROMOTOCO","CIPLA"
  ];
  
  const fyersSymbols = top40Symbols.map(s => `NSE:${s}-EQ`);

  try {
    // STEP 2: Fyers se 1-min data
    const historyPromises = fyersSymbols.map(symbol =>
      fetch(`https://api-t1.fyers.in/data/history?symbol=${symbol}&resolution=1&range=1`, {
        headers: { "Authorization": `${appId}:${access_token}` }
      }).then(r => r.json()).catch(()=>null)
    );

    const historyResults = await Promise.all(historyPromises);

    // STEP 3: 2 Filter lagao
    const finalStocks = [];
    historyResults.forEach((stockData, i) => {
      if(!stockData ||!stockData.candles || stockData.candles.length === 0) return;
      const candle = stockData.candles[0];
      const [time, open, high, low, close, volume] = candle;
      const perMinValue = close * volume; // Filter 1: > 6 Cr
      const candleChange = ((close - open) / open) * 100; // Filter 2: > 1%

      if(perMinValue > 60000000 && candleChange > 1.0) {
        finalStocks.push({
          symbol: top40Symbols[i],
          ltp: close.toFixed(2),
          change: candleChange.toFixed(2) + "%",
          turnoverCr: (perMinValue / 10000000).toFixed(2),
          volume: volume.toLocaleString()
        });
      }
    });

    return res.status(200).json({ data: finalStocks, total: finalStocks.length });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}
