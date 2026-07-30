export default function handler(req, res) {
  const APP_ID = "1PMA5T4004-200";
  const REDIRECT_URI = "https://nse-momentum-screener.vercel.app/";

  const loginUrl =
    `https://api-t1.fyers.in/api/v3/generate-authcode?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=123`;

  res.writeHead(302, {
    Location: loginUrl,
  });

  res.end();
}
