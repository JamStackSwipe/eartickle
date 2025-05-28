import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { user_id, amount } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ error: 'Missing user_id or amount' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${amount} Tickles` },
          unit_amount: amount * 100, // 10 Tickles = $10
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://eartickle.com/rewards?success=true',
      cancel_url: 'https://eartickle.com/rewards?cancelled=true',
      metadata: { user_id, amount }
    });

    // Track the purchase in Supabase
    await supabase.from('tickle_purchases').insert([
      {
        buyer_id: user_id,
        amount,
        stripe_session_id: session.id,
        completed: false
      }
    ]);

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('🔥 Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
}
