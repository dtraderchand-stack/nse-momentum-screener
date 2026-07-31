const APP_ID = "1PMA5T4004-200";

function startScan() {

    const token = localStorage.getItem("fyers_token");

    if (!token) {

        window.location.href = "/api/login";
        return;

    }

    document.getElementById("result").innerHTML =
        "<h3>Scanning...</h3>";

    fetch("/api/scan", {

        method: "POST",

        headers: {

            Authorization: token

        }

    })

    .then(r => r.json())

    .then(data => {

        document.getElementById("result").innerHTML =
        "<pre>" + JSON.stringify(data, null, 2) + "</pre>";

    })

    .catch(err => {

        document.getElementById("result").innerHTML =
        err.message;

    });

}

document.getElementById("scanBtn").onclick = startScan;

window.onload = async () => {

    const params = new URLSearchParams(window.location.search);

    const authCode = params.get("auth_code");

    if (authCode) {

        document.getElementById("result").innerHTML =
        "Generating Access Token...";

        const res = await fetch("/api/token?code=" + authCode);

        const data = await res.json();

        if (data.access_token) {

            localStorage.setItem(
                "fyers_token",
                data.access_token
            );

            history.replaceState({}, "", "/");

        }

    }

    if (localStorage.getItem("fyers_token")) {

        startScan();

    } else {

        document.getElementById("result").innerHTML =
        "Waiting for scanner...";

    }

};
