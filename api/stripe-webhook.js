// /api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const metadata = session.metadata || {};

    const { user_id, amount } = metadata;
    const parsedAmount = parseInt(amount, 10);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Missing or invalid metadata:', metadata);
      return res.status(400).send('Invalid metadata');
    }

    const { error } = await supabase.rpc('increment_tickles_balance', {
      uid: user_id,
      tickle_count: parsedAmount,
    });

    if (error) {
      console.error('❌ Supabase RPC failed:', error.message);
      return res.status(500).send('Failed to update tickle balance');
    }

    console.log(`✅ ${parsedAmount} Tickles added to ${user_id}`);
  }

  return res.status(200).json({ received: true });
}
