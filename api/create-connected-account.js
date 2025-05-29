// /api/create-connected-account.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  console.log('🔥 API HIT: create-connected-account');

  if (req.method !== 'POST') {
    console.log('❌ Wrong method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;
  console.log('🔍 Received user_id:', user_id);

  if (!user_id) {
    console.log('❌ Missing user_id');
    return res.status(400).json({ error: 'Missing user_id' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', user_id)
      .single();

    if (error) {
      console.log('❌ Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    console.log('✅ Found profile:', profile);

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      console.log('🆕 Creating new Stripe Express account...');
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user_id);

      if (updateError) {
        console.log('❌ Failed to update stripe_account_id:', updateError);
        return res.status(500).json({ error: 'Failed to save Stripe account ID' });
      }
      console.log('✅ Stripe account ID saved:', accountId);
    } else {
      console.log('✅ Reusing existing Stripe account:', accountId);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'https://www.eartickle.com/settings',
      return_url: 'https://www.eartickle.com/settings',
      type: 'account_onboarding',
    });

    console.log('✅ Account link created:', accountLink.url);
    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error('🔥 Uncaught server error:', err);
    return res.status(500).json({ error: 'Stripe onboarding failed.' });
  }
}
