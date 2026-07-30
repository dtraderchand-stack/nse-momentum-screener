const APP_ID = "1PMA5T4004-200";
const REDIRECT_URI = "https://nse-momentum-screener.vercel.app/";

// Start Scan Button
document.getElementById("scanBtn").onclick = () => {
    window.location.href = "/api/login";
};

// Page Load
window.onload = async () => {

    const result = document.getElementById("result");

    const params = new URLSearchParams(window.location.search);

    const authCode = params.get("auth_code");

    if (!authCode) {
        result.innerHTML = "Waiting for scanner...";
        return;
    }

    result.innerHTML = "Generating Access Token...";

    try {

        const response = await fetch(`/api/token?code=${authCode}`);

        const data = await response.json();

        if (data.access_token) {

            localStorage.setItem("fyers_token", data.access_token);

            result.innerHTML = `
                <h3 style="color:green">
                ✅ Login Successful
                </h3>
            `;

            history.replaceState({}, "", "/");

        } else {

            result.innerHTML =
                "<pre>" +
                JSON.stringify(data, null, 2) +
                "</pre>";

        }

    } catch (e) {

        result.innerHTML = e.message;

    }

};
