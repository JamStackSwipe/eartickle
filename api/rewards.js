// /api/rewards.js
// Centralized helper for Stripe-related backend logic

import Stripe from 'stripe';

// Always use Vercel or environment-secured .env key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Helper to create a connected account onboarding link
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

// Helper to create a one-time checkout session for a "Tickle"
export const createTickleCheckoutSession = async ({
  artistStripeId,
  songId,
  songTitle,
  senderId,
  artistId,
  amountCents = 500,
}) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: `🎁 Tickle for "${songTitle}"`,
            metadata: { songId, artistId, senderId },
          },
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?canceled=1`,
      metadata: { songId, artistId, senderId },
      payment_intent_data: {
        application_fee_amount: Math.floor(amountCents * 0.1), // EarTickle keeps 10%
        transfer_data: {
          destination: artistStripeId,
        },
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: error.message };
  }
};
