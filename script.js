document.getElementById("scan").onclick = function () {
    document.getElementById("status").innerHTML = "Status : Redirecting to Fyers Login...";
    
    // Fyers Auth URL generation
    const authUrl = `https://api-t1.fyers.in/vocab/v2/oauth?client_id=${CONFIG.appId}&redirect_uri=${encodeURIComponent(CONFIG.redirectUrl)}&response_type=code&state=sample_state`;
    
    setTimeout(function() {
        window.location.href = authUrl;
    }, 1000);
};
