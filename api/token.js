import crypto from "crypto";

export default async function handler(req, res) {
  const { code } = req.query;

  const APP_ID = "1PMA5T4004-200";
  const APP_SECRET = process.env.FYERS_SECRET_ID;
  const REDIRECT_URI = "https://nse-momentum-screener.vercel.app/";

  if (!code) {
    return res.status(400).json({ error: "Code missing" });
  }

  const appIdHash = crypto
    .createHash("sha256")
    .update(`${APP_ID}:${APP_SECRET}`)
    .digest("hex");

  try {
    const response = await fetch(
      "https://api-t1.fyers.in/api/v3/validate-authcode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          appIdHash,
          code,
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}
