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
  process.env.SUPABASE_URL,                     // ✅ your live var
  process.env.SUPABASE_SERVICE_ROLE_KEY         // ✅ make sure this exists and is correct
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

    console.log('✅ Webhook triggered with metadata:', metadata);

    if (!user_id || isNaN(parsedAmount)) {
      console.warn('⚠️ Invalid metadata:', metadata);
      return res.status(400).send('Invalid metadata');
    }

    // ✅ Step 1: Add to available_tickles
    const { error: balanceError } = await supabase.rpc('increment_tickles_balance', {
      uid: user_id,
      tickle_count: parsedAmount,
    });

    if (balanceError) {
      console.error('❌ Balance RPC failed:', balanceError.message);
      return res.status(500).send('Balance update failed');
    }

    // ✅ Step 2: Mark tickle_purchases row as completed
    const { error: updateError } = await supabase
      .from('tickle_purchases')
      .update({ completed: true })
      .eq('stripe_session_id', session.id);

    if (updateError) {
      console.error('❌ Update tickle_purchases failed:', updateError.message);
      return res.status(500).send('Purchase update failed');
    }

    console.log(`✅ ${parsedAmount} Tickles added + purchase marked complete for ${user_id}`);
  }

  return res.status(200).json({ received: true });
}
