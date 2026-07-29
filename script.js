// Check for auth code in URL after Fyers redirect
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth_code');
    
    if (authCode) {
        document.getElementById("status").innerHTML = "Status : Fyers Login Successful! Auth Code received.";
        console.log("Auth Code:", authCode);
        // Yahan aage token generation aur scanning logic aayega
    }
};

document.getElementById("scan").onclick = function () {
    document.getElementById("status").innerHTML = "Status : Redirecting to Fyers Login...";
    
    const authUrl = `https://api-t1.fyers.in/vocab/v2/oauth?client_id=${CONFIG.appId}&redirect_uri=${encodeURIComponent(CONFIG.redirectUrl)}&response_type=code&state=sample_state`;
    
    setTimeout(function() {
        window.location.href = authUrl;
    }, 1000);
};
