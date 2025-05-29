// /api/create-connected-account.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,                // ✅ matches Vercel
  process.env.SUPABASE_SERVICE_ROLE_KEY    // ✅ matches Vercel
);

export default async function handler(req, res) {
  console.log('🔥 Stripe Connect API hit');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  if (!user_id) {
    console.log('❌ Missing user_id');
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    // Fetch user profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user_id)
      .single();

    if (error) {
      console.log('❌ Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    let accountId = profile?.stripe_account_id;

    // Create a Stripe Express account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user_id);

      if (updateError) {
        console.log('❌ Error updating stripe_account_id:', updateError);
        return res.status(500).json({ error: 'Failed to save Stripe account ID' });
      }
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `https://www.eartickle.com/settings`,
      return_url: `https://www.eartickle.com/settings`,
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error('🔥 Fatal error during onboarding:', err);
    res.status(500).json({ error: 'Stripe onboarding failed.' });
  }
}
