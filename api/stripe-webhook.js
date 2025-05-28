// /api/stripe-webhook.js
const Stripe = require('stripe');
const { buffer } = require('micro');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const user_id = session.metadata.user_id;
    const amount = parseInt(session.metadata.amount);

    // Mark purchase as complete
    await supabase
      .from('tickle_purchases')
      .update({ completed: true })
      .eq('stripe_session_id', session.id);

    // Add tickles to user profile
    await supabase.rpc('increment_tickles', { user_id, amount_to_add: amount });
  }

  res.status(200).send('ok');
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};
