// pages/api/create-connected-account.js – Full Stripe Express account creation + Neon save
import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]'; // Your NextAuth config

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { user_id } = req.body;
    if (!user_id || user_id !== session.user.id) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Fetch current profile
    const { rows: profileRows } = await sql`SELECT stripe_account_id FROM profiles WHERE id = ${user_id};`;
    const profile = profileRows[0];

    if (profile?.stripe_account_id) {
      return res.status(200).json({ success: true, accountId: profile.stripe_account_id, message: 'Account already connected' });
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: session.user.email,
      metadata: { userId: user_id },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?status=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings?status=complete`,
      type: 'account_onboarding',
    });

    // Save to Neon
    await sql`UPDATE profiles SET stripe_account_id = ${account.id} WHERE id = ${user_id};`;

    res.status(200).json({
      success: true,
      accountId: account.id,
      url: accountLink.url,
      message: 'Account created—complete onboarding',
    });
  } catch (error) {
    console.error('Create connected account error:', error);
    res.status(500).json({ error: error.message });
  }
}
