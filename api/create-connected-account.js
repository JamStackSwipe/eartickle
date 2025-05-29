// /api/create-connected-account.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REAL_SUPABASE_SERVICE_KEY // ✅ must be service role key
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: 'Missing user_id' });
  }

  // Step 1: Fetch profile from Supabase
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', user_id)
    .single();

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }

  let stripeAccountId = profile?.stripe_account_id;

  // Step 2: Create Stripe account if none exists
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({ type: 'express' });
    stripeAccountId = account.id;

    // Step 3: Store the Stripe account ID in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', user_id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to save Stripe account ID' });
    }
  }

  // Step 4: Create Stripe onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    type: 'account_onboarding',
  });

  // Step 5: Send the URL back to frontend
  res.status(200).json({ url: accountLink.url });
}
