// pages/api/create-tickle-checkout.js
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { songId, songTitle, artistStripeId, artistId, senderId, amountCents } = req.body;

  if (!songId || !artistStripeId || !artistId || !senderId || !amountCents) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Create Stripe checkout session with application fee
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { 
            name: `Tickle for "${songTitle}"`,
            description: `Send Tickles to support this artist`
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://eartickle.com/song/${songId}?tickle=success`,
      cancel_url: `https://eartickle.com/song/${songId}?tickle=cancelled`,
      payment_intent_data: {
        application_fee_amount: Math.floor(amountCents * 0.1), // 10% platform fee
        transfer_data: {
          destination: artistStripeId, // Pay artist directly
        },
      },
      metadata: { 
        songId, 
        artistId, 
        senderId,
        type: 'tickle_gift'
      }
    });

    // Record the transaction
    await sql`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount, stripe_payment_id)
      VALUES (${senderId}, ${artistId}, ${songId}, ${Math.floor(amountCents / 100)}, ${session.id})
    `;

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Stripe checkout session failed.' });
  }
}
