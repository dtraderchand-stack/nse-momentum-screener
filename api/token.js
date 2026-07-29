export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { auth_code, app_id } = req.body;
    const secret_id = process.env.FYERS_SECRET_ID;

    if (!auth_code || !secret_id) {
        return res.status(400).json({ message: 'Missing auth_code or secret_id configuration' });
    }

    try {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(`${app_id}:${secret_id}`).digest('hex');

        const response = await fetch('https://api-t1.fyers.in/api/v3/validate-authcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                appIdHash: hash,
                code: auth_code,
            }),
        });

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
