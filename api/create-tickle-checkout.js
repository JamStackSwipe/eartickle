// /api/create-tickle-checkout.js
import { createTickleCheckoutSession } from '../../rewards';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { songId, songTitle, artistStripeId, artistId, senderId, amountCents } = req.body;

  if (!songId || !artistStripeId || !artistId || !senderId || !amountCents) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sessionUrl = await createTickleCheckoutSession({
      songId,
      songTitle,
      artistStripeId,
      artistId,
      senderId,
      amountCents,
    });

    return res.status(200).json({ url: sessionUrl });
  } catch (err) {
    console.error('❌ Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Stripe checkout session failed.' });
  }
}
