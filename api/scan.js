export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({
      error: "Missing Token"
    });
  }

  try {

    const response = await fetch(
      `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/quotes`,
      {
        method: "POST",
        headers: {
          Authorization: token
        }
      }
    );

    const data = await response.json();

    return res.status(200).json(data);

  } catch (e) {

    return res.status(500).json({
      error: e.message
    });

  }

}
