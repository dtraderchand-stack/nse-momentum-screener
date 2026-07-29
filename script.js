const APP_ID = "1PMA5T4004-200";
const REDIRECT_URI = "https://nse-momentum-screener.vercel.app/";

async function startScan() {

    const token = localStorage.getItem("fyers_token");

    if (!token) {

        document.getElementById("result").innerHTML =
            "<h3>Redirecting to Fyers Login...</h3>";

        const authUrl =
            `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=123`;

        setTimeout(() => {
            window.location.href = authUrl;
        }, 800);

        return;
    }


    document.getElementById("result").innerHTML =
        "<h3>Scanning...</h3>";


    try {

        const res = await fetch("/api/scan", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            }

        });


        const json = await res.json();


        if (json.error) {

            localStorage.removeItem("fyers_token");


            document.getElementById("result").innerHTML =
                "<h3>Session Expired. Logging in again...</h3>";


            setTimeout(startScan, 1000);

            return;

        }


        showTable(json.data);


    } catch(e) {


        document.getElementById("result").innerHTML =
            "<h3>Scanner Error</h3>";


        console.log(e);

    }

}



window.onload = async () => {


    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");


    if (code) {


        document.getElementById("result").innerHTML =
            "<h3>Generating Access Token...</h3>";


        const res = await fetch(`/api/token?code=${code}`);


        const data = await res.json();


        if (data.access_token) {


            localStorage.setItem(
                "fyers_token",
                data.access_token
            );


            history.replaceState(
                {},
                document.title,
                REDIRECT_URI
            );

        }

    }


    startScan();


};



document.getElementById("scanBtn").onclick = () => {

    startScan();

};
