// /api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { supabase } from '../../supabase'; // Adjust if your supabase client is elsewhere
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../../rewards';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

export const config = {
  api: {
    bodyParser: false, // Required for Stripe webhook signatures
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  let event;
  const sig = req.headers['stripe-signature'];

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    const { songId, artistId, senderId, emoji, amountCents } = metadata;

    if (!songId || !artistId || !senderId) {
      console.warn('⚠️ Incomplete metadata on session.');
      return res.status(400).send('Missing metadata.');
    }

    const { error } = await supabase.from('tickles').insert([
      {
        song_id: songId,
        artist_id: artistId,
        user_id: senderId,
        emoji: emoji || '🎁',
        amount: parseFloat((amountCents / 100).toFixed(2)),
      },
    ]);

    if (error) {
      console.error('❌ Failed to save Tickle in DB:', error.message);
    } else {
      console.log('✅ Tickle recorded for song:', songId);
    }
  }

  res.status(200).json({ received: true });
}
