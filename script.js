window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth_code');
    
    if (authCode) {
        document.getElementById("status").innerHTML = "Status : Fyers Login Successful! Auth Code received.";
        console.log("Auth Code:", authCode);
    }
};

document.getElementById("scan").onclick = function () {
    document.getElementById("status").innerHTML = "Status : Redirecting to Fyers Login...";
    
    // Corrected Fyers OAuth Login URL
    const authUrl = `https://api.fyers.in/vocab/v2/oauth?client_id=${CONFIG.appId}&redirect_uri=${encodeURIComponent(CONFIG.redirectUrl)}&response_type=code&state=sample_state`;
    
    setTimeout(function() {
        window.location.href = authUrl;
    }, 1000);
};
