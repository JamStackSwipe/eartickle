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

    // ✅ Step 1: Pull metadata
    const metadata = session.metadata || {};
    const { user_id, amount } = metadata;
    const parsedAmount = parseInt(amount, 10);
    const stripeSessionId = session.id;

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Invalid metadata in session:', metadata);
      return res.status(400).send('Invalid metadata');
    }

    // ✅ Step 2: Mark the tickle_purchases row as completed
    const { error: updateError } = await supabase
      .from('tickle_purchases')
      .update({ completed: true })
      .eq('stripe_session_id', stripeSessionId);

    if (updateError) {
      console.error('❌ Failed to update tickle_purchases:', updateError.message);
      return res.status(500).send('Purchase DB update failed');
    }

    // ✅ Step 3: Increment available_tickles via Supabase RPC
    const { error: rpcError } = await supabase.rpc('increment_tickles_balance', {
      uid: user_id,
      tickle_count: parsedAmount,
    });

    if (rpcError) {
      console.error('❌ Failed to increment available_tickles:', rpcError.message);
      return res.status(500).send('Tickle balance update failed');
    }

    console.log(`✅ Successfully added ${parsedAmount} tickles for ${user_id} from session ${stripeSessionId}`);
  }

  return res.status(200).json({ received: true });
}
