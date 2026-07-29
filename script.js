window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('auth_code');
    
    if (authCode) {
        document.getElementById("status").innerHTML = "Status : Generating Access Token...";
        
        try {
            const response = await fetch('/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth_code: authCode, app_id: CONFIG.appId })
            });
            
            const data = await response.json();
            
            if (data.s === 'ok' && data.access_token) {
                sessionStorage.setItem('fyers_access_token', data.access_token);
                document.getElementById("status").innerHTML = "Status : Success! Access Token Generated. Ready to Scan.";
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                document.getElementById("status").innerHTML = "Status : Token Failed: " + (data.message || JSON.stringify(data));
            }
        } catch (err) {
            document.getElementById("status").innerHTML = "Status : Server Error.";
            console.error(err);
        }
    } else {
        const existingToken = sessionStorage.getItem('fyers_access_token');
        if (existingToken) {
            document.getElementById("status").innerHTML = "Status : Connected & Ready to Scan.";
        }
    }
};

document.getElementById("scan").onclick = async function () {
    const existingToken = sessionStorage.getItem('fyers_access_token');
    
    if (!existingToken) {
        document.getElementById("status").innerHTML = "Status : Redirecting to Fyers Login...";
        const authUrl = `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${CONFIG.appId}&redirect_uri=${encodeURIComponent(CONFIG.redirectUrl)}&response_type=code&state=sample_state`;
        
        setTimeout(function() {
            window.location.href = authUrl;
        }, 1000);
    } else {
        document.getElementById("status").innerHTML = "Status : Scanning momentum stocks...";
        
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: existingToken })
            });
            
            const result = await response.json();
            
            if (result.s === 'ok' && result.data && result.data.d) {
                document.getElementById("status").innerHTML = "Status : Scan Complete!";
                
                const table = document.getElementById("stocks-table");
                const tbody = document.getElementById("table-body");
                tbody.innerHTML = "";
                
                result.data.d.forEach(item => {
                    const row = `tr style="text-align:center;">
                        <td>${item.symbol}</td>
                        <td>${item.v ? item.v.lp : 'N/A'}</td>
                        <td style="color: ${(item.v && item.v.ch >= 0) ? '#4ade80' : '#ef4444'};">${item.v ? item.v.chp + '%' : 'N/A'}</td>
                    </tr>`;
                    tbody.innerHTML += row;
                });
                
                table.style.display = "table";
            } else {
                document.getElementById("status").innerHTML = "Status : Scan Failed or No Data.";
            }
        } catch (error) {
            document.getElementById("status").innerHTML = "Status : Scanning Error.";
            console.error(error);
        }
    }
};
