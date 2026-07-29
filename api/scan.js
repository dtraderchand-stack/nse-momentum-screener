export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { access_token }Example = req.body;
    const appId = process.env.FYERS_APP_ID || "your_app_id";

    if (!access_token) {
        return res.status(400).json({ message: 'Access token missing' });
    }

    try {
        const symbols = "NSE:SBIN-EQ,NSE:RELIANCE-EQ,NSE:TCS-EQ,NSE:INFY-EQ,NSE:HDFCBANK-EQ";
        
        // 1. Quotes API se LTP aur general data lenge
        const quotesRes = await fetch(`https://api-t1.fyers.in/data/quotes?symbols=${symbols}`, {
            method: 'GET',
            headers: {
                'Authorization': `${appId}:${access_token}`,
                'content-type': 'application/json'
            }
        });
        const quotesData = await quotesRes.json();

        // 2. Har symbol ke liye 1-minute candle history fetch karenge taaki 1% move & Turnover nikal sakein
        const enhancedData = [];
        
        if (quotesData.s === 'ok' && quotesData.d) {
            for (let item of quotesData.d) {
                const sym = item.symbol;
                let candle1Percent = "No";
                let turnoverCr = "0";

                try {
                    // Fyers History API for 1-minute candle (resolution: "1")
                    const todayDate = new Date().toISOString().slice(0, 10);
                    const historyRes = await fetch(`https://api-t1.fyers.in/data/history?symbol=${sym}&resolution=1&date_format=1&range_from=${todayDate}&range_to=${todayDate}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${appId}:${access_token}`
                        }
                    });
                    const historyData = await historyRes.json();

                    if (historyData.s === 'success' && historyData.candles && historyData.candles.length > 0) {
                        // Aakhri (latest) 1-minute candle: [Timestamp, Open, High, Low, Close, Volume]
                        const latestCandle = historyData.candles[historyData.candles.length - 1];
                        const open = latestCandle[1];
                        const close = latestCandle[4];
                        const volume = latestCandle[5];

                        // 1% candle check ((Close - Open) / Open * 100)
                        const pctChange = ((close - open) / open) * 100;
                        if (Math.abs(pctChange) >= 1.0) {
                            candle1Percent = "Yes (" + pctChange.toFixed(2) + "%)";
                        } else {
                            candle1Percent = "No (" + pctChange.toFixed(2) + "%)";
                        }

                        // Turnover check (Price * Volume) -> 6 Crore = 60,000,000
                        const ltp = item.v ? item.v.lp : close;
                        const turnover = ltp * volume;
                        const turnoverInCrore = turnover / 10000000;
                        turnoverCr = turnoverInCrore.toFixed(2) + " Cr";
                    }
                } catch (err) {
                    console.error("History fetch error for " + sym, err);
                }

                enhancedData.push({
                    symbol: sym,
                    lp: item.v ? item.v.lp : 'N/A',
                    chp: item.v ? item.v.chp : '0',
                    candle1Percent: candle1Percent,
                    turnoverCr: turnoverCr
                });
            }
        }

        return res.status(200).json({ s: 'ok', data: enhancedData });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
