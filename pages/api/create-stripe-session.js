// pages/api/create-stripe-session.js
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user_id, amount } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ error: 'Missing user_id or amount' });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${amount} Tickles` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://eartickle.com/rewards?success=true',
      cancel_url: 'https://eartickle.com/rewards?cancelled=true',
      metadata: { user_id, amount }
    });

    // Record the purchase attempt
    await sql`
      INSERT INTO tickle_transactions (sender_id, receiver_id, amount, stripe_payment_id)
      VALUES (${user_id}, ${user_id}, ${amount}, ${session.id})
    `;

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe session error:', error.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
}
