export default async function handler(req, res) {
  const { code } = req.query;
  const APP_ID = "1PMA5T4004-200";
  const APP_SECRET = process.env.FYERS_SECRET; // Vercel me dalna hai ye
  const REDIRECT_URI = "https://nse-momentum-screener.vercel.app/";

  if (!code) return res.status(400).json({ error: "Code missing" });

  try {
    const response = await fetch("https://api-t1.fyers.in/api/v3/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        appIdHash: APP_ID,
        code: code,
        appSecret: APP_SECRET,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
