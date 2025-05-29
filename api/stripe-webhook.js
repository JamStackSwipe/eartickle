// api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false, // required to handle raw body for Stripe
  },
};

// ✅ Supabase init (do not import shared client – use private key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be the service key with full access
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle gift confirmation
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};

    const { songId, artistId, senderId, emoji, amountCents } = metadata;

    if (!songId || !artistId || !senderId) {
      console.warn('⚠️ Missing metadata in Stripe session.');
      return res.status(400).send('Missing metadata');
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
      console.error('❌ Failed to insert Tickle into DB:', error.message);
    } else {
      console.log(`✅ Tickle recorded: ${emoji} on song ${songId}`);
    }
  }

  res.status(200).json({ received: true });
}
