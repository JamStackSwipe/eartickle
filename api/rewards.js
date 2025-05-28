
// api/rewards.js

// Centralized Stripe logic for all Tickles-related activity
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// 🎯 Create a Stripe Connected Account for an artist
export async function createConnectedAccount({ user_id, email }) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: { user_id },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, url: accountLink.url };
}

// 🎁 Create a Checkout Session for sending a Tickle (gift)
export async function createTickleCheckout({
  songId,
  songTitle,
  artistId,
  senderId,
  amountCents,
  artistStripeId,
}) {
  if (!artistStripeId) throw new Error('Artist does not have a Stripe account');

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Tickle for: ${songTitle}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: Math.floor(amountCents * 0.1), // 10% platform fee
      transfer_data: {
        destination: artistStripeId,
      },
      metadata: {
        artistId,
        senderId,
        songId,
      },
    },
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?canceled=true`,
  });

  return { sessionUrl: session.url };
}
