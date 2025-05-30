// /api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL,
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
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const { user_id, amount } = metadata;
    const parsedAmount = parseInt(amount, 10);
    const sessionId = session.id;

    console.log('🧾 Session ID:', sessionId);
    console.log('👤 User ID:', user_id);
    console.log('💰 Amount:', parsedAmount);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Invalid metadata:', metadata);
      return res.status(400).send('Invalid metadata');
    }

    // ✅ Update balance via RPC
    const { error: balanceError } = await supabase.rpc('increment_tickles_balance', {
      uid: user_id,
      tickle_count: parsedAmount,
    });

    if (balanceError) {
      console.error('❌ Balance RPC failed:', balanceError);
      return res.status(500).send('Balance update failed');
    }

    // ✅ Mark purchase as completed — safer version with .maybeSingle()
    const { data, error: updateError } = await supabase
      .from('tickle_purchases')
      .update({ completed: true })
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (updateError) {
      console.error('❌ Failed to mark purchase completed:', updateError);
      return res.status(500).send('Purchase update failed');
    }

    if (!data) {
      console.warn('⚠️ No purchase row found for session ID:', sessionId);
    } else {
      console.log('✅ Marked purchase completed:', data);
    }
  }

  return res.status(200).json({ received: true });
}
