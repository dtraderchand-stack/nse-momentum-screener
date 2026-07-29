export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // NSE ka free API - sirf top gainers
    const nseRes = await fetch("https://api.nsejs.com/top-gainers");
    const nseData = await nseRes.json();
    const top40 = nseData.data.slice(0, 40);

    // Simple format me bhej do
    const result = top40.map(stock => ({
      symbol: stock.symbol,
      ltp: stock.ltp,
      change: stock.percentageChange + "%",
      volume: stock.totalTradedVolume
    }));

    return res.status(200).json({ data: result, total: result.length });

  } catch (error) {
    return res.status(500).json({ error: "NSE API Failed: " + error.message });
  }
}
