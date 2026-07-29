export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { access_token } = req.body;
    const appId = process.env.FYERS_APP_ID || "your_app_id";

    if (!access_token) {
        return res.status(400).json({ message: 'Access token missing' });
    }

    try {
        const symbols = "NSE:SBIN-EQ,NSE:RELIANCE-EQ,NSE:TCS-EQ,NSE:INFY-EQ,NSE:HDFCBANK-EQ";
        
        const quotesRes = await fetch(`https://api-t1.fyers.in/data/quotes?symbols=${symbols}`, {
            method: 'GET',
            headers: {
                'Authorization': `${appId}:${access_token}`,
                'content-type': 'application/json'
            }
        });
        const quotesData = await quotesRes.json();

        const enhancedData = [];
        
        if (quotesData.s === 'ok' && quotesData.d) {
            for (let item of quotesData.d) {
                const sym = item.symbol;
                let candle1Percent = "No (0.00%)";
                let turnoverCr = "0.00 Cr";

                try {
                    const today = new Date().toISOString().slice(0, 10);
                    const historyRes = await fetch(`https://api-t1.fyers.in/data/history?symbol=${sym}&resolution=1&date_format=1&range_from=${today}&range_to=${today}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `${appId}:${access_token}`
                        }
                    });
                    const historyData = await historyRes.json();

                    if (historyData.s === 'success' && historyData.candles && historyData.candles.length > 0) {
                        const latest = historyData.candles[historyData.candles.length - 1];
                        const open = latest[1];
                        const close = latest[4];
                        const volume = latest[5];

                        const pctChange = ((close - open) / open) * 100;
                        const isMore1 = Math.abs(pctChange) >= 1.0 ? "Yes" : "No";
                        candle1Percent = `${isMore1} (${pctChange.toFixed(2)}%)`;

                        const ltp = item.v ? item.v.lp : close;
                        const turnover = ltp * volume;
                        const turnoverInCr = turnover / 10000000;
                        turnoverCr = `${turnoverInCr.toFixed(2)} Cr`;
                    }
                } catch (e) {
                    console.log("History error", e);
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
