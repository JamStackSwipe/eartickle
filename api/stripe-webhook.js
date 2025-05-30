// /api/stripe-webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // Required for raw Stripe webhook payload
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
    console.error('❌ Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;

    try {
      // Step 1: Find the tickle_purchases row by session ID
      const { data: purchaseRows, error: purchaseError } = await supabase
        .from('tickle_purchases')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .limit(1);

      if (purchaseError || !purchaseRows || purchaseRows.length === 0) {
        console.warn('⚠️ No matching tickle purchase found for session:', sessionId);
        return res.status(200).json({ received: true });
      }

      const purchase = purchaseRows[0];
      if (purchase.completed) {
        console.log('✅ Tickle already processed for session:', sessionId);
        return res.status(200).json({ received: true });
      }

      // Step 2: Mark the purchase as completed
      const { error: updatePurchaseError } = await supabase
        .from('tickle_purchases')
        .update({ completed: true })
        .eq('id', purchase.id);

      if (updatePurchaseError) {
        console.error('❌ Failed to mark tickle purchase as complete:', updatePurchaseError.message);
      }

      // Step 3: Increment user’s available_tickles balance
      const { error: incrementError } = await supabase.rpc('increment_tickles_balance', {
        uid: purchase.buyer_id,
        tickle_count: purchase.amount,
      });

      if (incrementError) {
        console.error('❌ Failed to increment tickle balance:', incrementError.message);
      } else {
        console.log(`✅ Credited ${purchase.amount} Tickles to user: ${purchase.buyer_id}`);
      }

    } catch (err) {
      console.error('❌ Error during webhook processing:', err.message);
    }
  }

  return res.status(200).json({ received: true });
}
