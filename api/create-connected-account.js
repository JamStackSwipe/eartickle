// /api/create-connected-account.js

import { createConnectedAccount } from '../../utils/stripe'; // ✅ updated path

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id, email } = req.body;

  if (!user_id || !email) {
    return res.status(400).json({ error: 'Missing user_id or email' });
  }

  try {
    const result = await createConnectedAccount(user_id, email);

    if (result.error) {
      console.error('❌ Stripe account creation error:', result.error);
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ url: result.url });
  } catch (err) {
    console.error('❌ Stripe connect error:', err.message);
    return res.status(500).json({ error: 'Stripe connection failed. Try again later.' });
  }
}
