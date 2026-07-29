export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { authorization } = req.headers; // frontend se header aayega
  if (!authorization) return res.status(400).json({ error: "Missing Authorization header" });

  // Top 50 F&O stocks only
  const universe = [
    "RELIANCE","TCS","INFY","HDFCBANK","ICIBANK","HDFC","BHARTIARTL","ITC","KOTAKBANK","LT",
    "AXISBANK","ASIANPAINT","MARUTI","SBIN","BAJFINANCE","WIPRO","HCLTECH","ADANIPORTS","SUNPHARMA","TITAN",
    "ULTRACEMCO","NESTLEIND","POWERGRID","NTPC","ONGC","COALINDIA","TATAMOTORS","TATASTEEL","JSWSTEEL","BAJAJFINSV",
    "TECHM","INDUSINDBK","GRASIM","HINDALCO","BPCL","EICHERMOTORS","DIVISLAB","BRITANNIA","HEROMOTOCO","CIPLA",
    "BAJAJ-AUTO","M&M","DRREDDY","TATACONSUM","PIDILITIND","APOLLOHOSP","GODREJCP","DABUR","DMART","TRENT"
  ];
  const fyersSymbols = universe.map(s => `NSE:${s}-EQ`);

  try {
    const quoteRes = await fetch("https://api-t1.fyers.in/data/quotes", {
      method: "POST",
      headers: { 
        "Authorization": authorization, // seedha forward kar diya
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "symbols": fyersSymbols })
    });

    const quoteData = await quoteRes.json();
    
    if(quoteData.s !== "ok") {
      return res.status(500).json({ error: "Fyers Error: " + quoteData.message });
    }

    const sorted = quoteData.d
      .map(stock => ({
        symbol: stock.v.symbol.replace("NSE:","").replace("-EQ",""),
        ltp: stock.v.lp,
        change: stock.v.chp.toFixed(2),
      }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 40);

    return res.status(200).json({ data: sorted, total: sorted.length });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
