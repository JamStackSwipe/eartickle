// pages/api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { sql } from '@vercel/postgres';

export const config = { 
  api: { 
    bodyParser: false 
  } 
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  const sig = req.headers['stripe-signature'];

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, amount, songId, artistId, senderId } = session.metadata || {};
    const parsedAmount = parseInt(amount, 10);

    console.log('✅ Stripe Webhook: Payment complete');
    console.log('👤 User ID:', user_id);
    console.log('💰 Amount:', parsedAmount);
    console.log('🧾 Session ID:', session.id);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Missing or invalid metadata:', session.metadata);
      return res.status(400).send('Invalid metadata');
    }

    try {
      // Check for duplicate session ID
      const { rows: existing } = await sql`
        SELECT id 
        FROM tickle_transactions 
        WHERE stripe_payment_id = ${session.id}
      `;

      if (existing.length > 0) {
        console.warn('⚠️ Duplicate Stripe session detected. Skipping insert.');
        return res.status(200).json({ received: true, duplicate: true });
      }

      // Add tickles to user's balance
      await sql`
        UPDATE profiles 
        SET tickle_balance = tickle_balance + ${parsedAmount}
        WHERE id = ${user_id}
      `;

      // Record the purchase transaction
      await sql`
        INSERT INTO tickle_transactions (sender_id, receiver_id, amount, stripe_payment_id)
        VALUES (${user_id}, ${user_id}, ${parsedAmount}, ${session.id})
      `;

      console.log('✅ Tickle purchase recorded and balance updated.');

    } catch (error) {
      console.error('❌ Failed to process tickle purchase:', error.message);
      return res.status(500).send('Database operation failed');
    }
  }

  return res.status(200).json({ received: true });
}
