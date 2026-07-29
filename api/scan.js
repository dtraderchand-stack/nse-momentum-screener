export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { access_token } = req.body;
  const appId = process.env.FYERS_APP_ID;
  if (!access_token) return res.status(400).json({ error: "Missing access_token" });

  // 200 Liquid F&O + Nifty50 stocks
  const universe = [
    "RELIANCE","TCS","INFY","HDFCBANK","ICIBANK","HDFC","BHARTIARTL","ITC","KOTAKBANK","LT",
    "AXISBANK","ASIANPAINT","MARUTI","SBIN","BAJFINANCE","WIPRO","HCLTECH","ADANIPORTS","SUNPHARMA","TITAN",
    "ULTRACEMCO","NESTLEIND","POWERGRID","NTPC","ONGC","COALINDIA","TATAMOTORS","TATASTEEL","JSWSTEEL","BAJAJFINSV",
    "TECHM","INDUSINDBK","GRASIM","HINDALCO","BPCL","EICHERMOTORS","DIVISLAB","BRITANNIA","HEROMOTOCO","CIPLA",
    "BAJAJ-AUTO","M&M","DRREDDY","TATACONSUM","PIDILITIND","APOLLOHOSP","GODREJCP","DABUR","DMART","TRENT"
  ];

  const fyersSymbols = universe.map(s => `NSE:${s}-EQ`);

  try {
    // Fyers Quotes API - 1 call me 200 stock ka data
    const quoteRes = await fetch("https://api-t1.fyers.in/data/quotes", {
      method: "POST",
      headers: { 
        "Authorization": `${appId}:${access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "symbols": fyersSymbols })
    });

    const quoteData = await quoteRes.json();
    
    if(quoteData.s !== "ok") {
      return res.status(500).json({ error: quoteData.message || "Fyers Quote Failed" });
    }

    // Sort by % change and take top 40
    const sorted = quoteData.d
      .map(stock => ({
        symbol: stock.v.symbol.replace("NSE:","").replace("-EQ",""),
        ltp: stock.v.lp,
        change: stock.v.chp, // % change
        volume: stock.v.volume,
        turnover: stock.v.lp * stock.v.volume
      }))
      .sort((a, b) => b.change - a.change) // sabse zyada gain upar
      .slice(0, 40); // sirf top 40

    return res.status(200).json({ data: sorted, total: sorted.length });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
