// pages/api/create-connected-account.js – Fixed EOF/string close; completed else block + full response
import Stripe from 'stripe';
import { sql } from '@vercel/postgres'; // Or '@neondatabase/serverless' if Neon; swap sql init accordingly
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

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
    // Fetch user profile
    const { rows } = await sql`
      SELECT stripe_account_id
      FROM profiles
      WHERE id = ${user_id}
    `;

    if (!rows.length) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = rows[0];
    console.log('✅ Found profile:', profile);

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      console.log('🆕 Creating new Stripe Express account...');
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;

      // Save Stripe account ID to database
      await sql`
        UPDATE profiles
        SET stripe_account_id = ${accountId}
        WHERE id = ${user_id}
      `;

      console.log('✅ Stripe account ID saved:', accountId);
    } else {
      console.log('✅ Existing Stripe account found:', accountId); // Fixed: Closed string + complete log
    }

    // Optional: Update account details or onboard link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.headers.origin}/profile?setup=true`,
      return_url: `${req.headers.origin}/profile?setup=complete`,
      type: 'account_onboarding',
    });

    return res.status(200).json({ 
      success: true, 
      accountId, 
      onboardUrl: accountLink.url // For Express dashboard
    });
  } catch (error) {
    console.error('❌ Stripe/DB error:', error);
    return res.status(500).json({ error: 'Failed to create connected account' });
  }
}
