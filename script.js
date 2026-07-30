const APP_ID = "1PMA5T4004-200";


// Start Scan Button
document.getElementById("scanBtn").onclick = async () => {

    const token = localStorage.getItem("fyers_token");

    if (!token) {

        // First time login
        window.location.href = "/api/login";
        return;

    }


    startScanner(token);

};



// Page Load
window.onload = async () => {

    const result = document.getElementById("result");

    const params = new URLSearchParams(window.location.search);

    const authCode = params.get("auth_code");


    // After FYERS login
    if (authCode) {

        result.innerHTML = "Generating Access Token...";


        try {

            const response = await fetch(
                `/api/token?code=${authCode}`
            );


            const data = await response.json();


            if (data.access_token) {


                localStorage.setItem(
                    "fyers_token",
                    data.access_token
                );


                result.innerHTML = `
                <h3 style="color:green">
                ✅ Login Successful
                </h3>
                <p>Click Start Scan</p>
                `;


                history.replaceState({}, "", "/");


            } else {

                result.innerHTML =
                JSON.stringify(data,null,2);

            }


        } catch(error){

            result.innerHTML = error.message;

        }


    }

};





async function startScanner(token){


    const result = document.getElementById("result");


    result.innerHTML =
    "Loading NSE Stocks...";



    try {


        // Load 2070 symbols

        const response = await fetch(
            "symbol.json"
        );


        const symbols =
        await response.json();



        result.innerHTML =
        `
        Total Stocks Loaded:
        ${symbols.length}
        <br>
        Scanning...
        `;



        // Convert symbols

        const fyersSymbols =
        symbols.map(
            s => `NSE:${s}-EQ`
        );



        // Call backend

        const scanResponse =
        await fetch(
            "/api/quotes",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    token:token,

                    symbols:fyersSymbols

                })

            }
        );



        const data =
        await scanResponse.json();



        if(data.top100){


            let html =
            `
            <h3>
            Top 100 Gainers
            </h3>
            <table border="1">
            <tr>
            <th>Symbol</th>
            <th>LTP</th>
            <th>Change %</th>
            </tr>
            `;



            data.top100.forEach(stock=>{


                html +=
                `
                <tr>
                <td>${stock.symbol}</td>
                <td>${stock.ltp}</td>
                <td>${stock.change}%</td>
                </tr>
                `;


            });



            html += "</table>";


            result.innerHTML = html;


        }
        else{

            result.innerHTML =
            JSON.stringify(data,null,2);

        }



    }
    catch(error){

        result.innerHTML =
        error.message;

    }

}
