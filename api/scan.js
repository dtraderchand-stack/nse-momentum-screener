export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { access_token } = req.body;
    const appId = process.env.FYERS_APP_ID || "your_app_id"; // ya direct CONFIG se

    if (!access_token) {
        return res.status(400).json({ message: 'Access token missing' });
    }

    try {
        // Fyers ke zariye Nifty 50 ya sample stocks ka data fetch karne ka logic
        // Example ke liye yahan hum Fyers quotes API call kar sakte hain
        const symbols = "NSE:SBIN-EQ,NSE:RELIANCE-EQ,NSE:TCS-EQ,NSE:INFY-EQ,NSE:HDFCBANK-EQ";
        
        const response = await fetch(`https://api-t1.fyers.in/data/quotes?symbols=${symbols}`, {
            method: 'GET',
            headers: {
                'Authorization': `${appId}:${access_token}`,
                'content-type': 'application/json'
            }
        });

        const data = await response.json();
        return res.status(200).json({ s: 'ok', data: data });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
