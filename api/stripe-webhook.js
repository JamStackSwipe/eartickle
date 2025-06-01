import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ✅ Needs service role to insert/update
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
    const { user_id, amount } = session.metadata || {};
    const parsedAmount = parseInt(amount, 10);

    console.log('✅ Stripe Webhook: Payment complete');
    console.log('👤 User ID:', user_id);
    console.log('💰 Amount:', parsedAmount);
    console.log('🧾 Session ID:', session.id);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Missing or invalid metadata:', session.metadata);
      return res.status(400).send('Invalid metadata');
    }

    // ✅ Check for duplicate session ID
    const { data: existing } = await supabase
      .from('tickle_purchases')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();

    if (existing) {
      console.warn('⚠️ Duplicate Stripe session detected. Skipping insert.');
      return res.status(200).json({ received: true, duplicate: true });
    }

    // ✅ Insert new tickle purchase
    const { error } = await supabase.from('tickle_purchases').insert([{
      buyer_id: user_id,
      amount: parsedAmount,
      completed: true,
      stripe_session_id: session.id,
    }]);

    if (error) {
      console.error('❌ Failed to insert tickle purchase:', error.message);
      return res.status(500).send('Database insert failed');
    }

    console.log('✅ Tickle purchase recorded.');
  }

  return res.status(200).json({ received: true });
}
