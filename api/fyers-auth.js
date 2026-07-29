export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { appId, secret, authCode } = req.body;
  if (!appId || !secret || !authCode) return res.status(400).json({ error: "Missing creds" });

  try {
    const appIdHash = `${appId}:${secret}`;
    const tokenRes = await fetch("https://api-t1.fyers.in/api/v3/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        grant_type: "authorization_code",
        appIdHash: appIdHash,
        code: authCode
      })
    });
    const data = await tokenRes.json();
    if(data.s !== "ok") return res.status(500).json({ error: data.message });
    
    return res.status(200).json({ access_token: data.access_token });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
