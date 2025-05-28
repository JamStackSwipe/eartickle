import { createClient } from '@supabase/supabase-js';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // must be service role for updates
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, email } = req.body;

  if (!user_id || !email) {
    return res.status(400).json({ error: 'Missing user_id or email' });
  }

  try {
    // 1. Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    // 2. Save stripe_account_id to Supabase
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ stripe_account_id: account.id })
      .eq('id', user_id);

    if (dbError) {
      console.error('🔴 Supabase DB Error:', dbError.message);
      return res.status(500).json({ error: 'Failed to update Supabase profile' });
    }

    // 3. Create Stripe onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://eartickle.com/settings',
      return_url: 'https://eartickle.com/settings',
      type: 'account_onboarding',
    });

    return res.status(200).json({ url: accountLink.url });

  } catch (error) {
    console.error('🔴 Stripe Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
