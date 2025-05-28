// /api/create-tickle-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { songId, songTitle, artistStripeId, amountCents, artistId, senderId } = req.body;

  if (!artistStripeId || !amountCents || !songId) {
    return res.status(400).json({ error: 'Missing required info' });
  }

  try {
    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tickle for: ${songTitle}`,
            },
            unit_amount: amountCents, // e.g., 500 = $5
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(amountCents * 0.15), // 15% platform fee
        transfer_data: {
          destination: artistStripeId,
        },
        metadata: {
          song_id: songId,
          artist_id: artistId,
          sender_id: senderId,
        },
      },
      mode: 'payment',
      success_url: 'https://eartickle.com/success?tickle=true',
      cancel_url: 'https://eartickle.com/cancel',
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('🔴 Stripe Checkout Error:', error);
    res.status(500).json({ error: error.message });
  }
}
