// /api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

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

    console.log('🧾 Session ID:', session.id);
    console.log('👤 User ID:', user_id);
    console.log('💰 Amount:', parsedAmount);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Invalid metadata:', metadata);
      return res.status(400).send('Invalid metadata');
    }

    // ✅ Step 1: Update balance
    const { error: balanceError } = await supabase.rpc('increment_tickles_balance', {
      uid: user_id,
      tickle_count: parsedAmount,
    });

    if (balanceError) {
      console.error('❌ Balance update failed:', balanceError.message);
      return res.status(500).send('Balance update failed');
    }

    // ✅ Step 2: Mark purchase as completed
    const { data, error: updateError } = await supabase
      .from('tickle_purchases')
      .update({ completed: true })
      .eq('stripe_session_id', session.id)
      .select();

    if (updateError) {
      console.error('❌ Purchase update failed:', updateError.message);
      return res.status(500).send('Purchase update failed');
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No matching tickle_purchases row found for session:', session.id);
    } else {
      console.log('✅ Purchase marked completed:', data[0]);
    }
  }

  return res.status(200).json({ received: true });
}
