// utils/stripe.js – Next.js server-only (use in API routes)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export const createConnectedAccount = async (userId, email) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: { userId },
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      type: 'account_onboarding',
    });
    return { url: accountLink.url, accountId: account.id };
  } catch (error) {
    console.error('Stripe Connect Error:', error);
    return { error: error.message };
  }
};
