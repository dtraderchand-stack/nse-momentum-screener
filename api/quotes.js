
export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { token, symbols } = req.body;

        const APP_ID = "1PMA5T4004-200";

        if (!token || !symbols) {
            return res.status(400).json({
                error: "Token or symbols missing"
            });
        }


        let results = [];


        // 50-50 batch
        for (let i = 0; i < symbols.length; i += 50) {

            const batch = symbols.slice(i, i + 50);


            const response = await fetch(
                "https://api-t1.fyers.in/data/quotes",
                {
                    method: "POST",

                    headers: {
                        "Authorization": APP_ID + ":" + token,
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        symbols: batch.join(",")
                    })
                }
            );


            const data = await response.json();


            if (data.d) {

                data.d.forEach(stock => {

                    if (stock.v) {

                        const ltp = stock.v.lp;
                        const prev = stock.v.prev_close_price;


                        if (ltp && prev) {

                            const change =
                                ((ltp - prev) / prev) * 100;


                            results.push({

                                symbol: stock.n,
                                ltp: ltp,
                                change: Number(change.toFixed(2))

                            });

                        }
                    }

                });

            }

        }


        // Top gainers
        results.sort(
            (a, b) => b.change - a.change
        );


        return res.status(200).json({

            total: results.length,

            top100: results.slice(0,100)

        });


    } catch (error) {

        return res.status(500).json({

            error: error.message

        });

    }

}
