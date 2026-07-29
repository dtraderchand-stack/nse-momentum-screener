let cache = {
  time: 0,
  data: null
};


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  const { authorization } = req.headers;


  if (!authorization) {
    return res.status(400).json({
      error: "Missing Authorization header"
    });
  }


  // Market timing check (NSE)
  const nowDate = new Date();

  const hour = nowDate.getHours();
  const minute = nowDate.getMinutes();

  const currentTime = hour * 60 + minute;


  if (currentTime < 555 || currentTime > 930) {

    return res.status(200).json({
      data: [],
      message: "Market Closed"
    });

  }



  // 10 second cache
  const now = Date.now();

  if (cache.data && now - cache.time < 10000) {

    return res.status(200).json({
      data: cache.data,
      total: cache.data.length
    });

  }



  const universe = [

    "RELIANCE",
    "TCS",
    "INFY",
    "HDFCBANK",
    "ICICIBANK",
    "BHARTIARTL",
    "ITC",
    "KOTAKBANK",
    "LT",
    "AXISBANK",
    "ASIANPAINT",
    "MARUTI",
    "SBIN",
    "BAJFINANCE",
    "WIPRO",
    "HCLTECH",
    "ADANIPORTS",
    "SUNPHARMA",
    "TITAN",
    "ULTRACEMCO",
    "NTPC",
    "ONGC",
    "COALINDIA",
    "TATAMOTORS",
    "TATASTEEL",
    "JSWSTEEL",
    "TECHM",
    "INDUSINDBK",
    "GRASIM",
    "HINDALCO",
    "BPCL",
    "CIPLA",
    "M&M",
    "DRREDDY",
    "TRENT"

  ];



  const fyersSymbols =
    universe.map(s => `NSE:${s}-EQ`);



  try {


    const quoteRes = await fetch(
      "https://api-t1.fyers.in/data/quotes",
      {

        method: "POST",

        headers: {

          "Authorization": authorization,

          "Content-Type": "application/json"

        },


        body: JSON.stringify({

          symbols: fyersSymbols

        })

      });



    const quoteData = await quoteRes.json();



    if (quoteData.s !== "ok") {

      return res.status(500).json({

        error: "Fyers Error: " + quoteData.message

      });

    }



    const sorted = quoteData.d

      .map(stock => ({

        symbol: stock.v.symbol
          .replace("NSE:", "")
          .replace("-EQ", ""),

        ltp: stock.v.lp,

        change: Number(stock.v.chp).toFixed(2)

      }))


      .sort((a,b) => b.change - a.change)

      .slice(0,40);



    // save cache

    cache.time = now;

    cache.data = sorted;



    return res.status(200).json({

      data: sorted,

      total: sorted.length

    });



  } catch(error) {


    return res.status(500).json({

      error: error.message

    });


  }

}
