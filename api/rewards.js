// pages/api/rewards.js
// Centralized helper for Stripe-related backend logic
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

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
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eartickle.com'}/settings`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eartickle.com'}/settings`,
      type: 'account_onboarding',
    });

    // Save Stripe account ID to database
    await sql`
      UPDATE profiles 
      SET stripe_account_id = ${account.id}
      WHERE id = ${userId}
    `;

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
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eartickle.com'}/rewards?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://eartickle.com'}/rewards?canceled=1`,
      
      metadata: {
        songId,
        artistId,
        senderId,
        amountCents,
        type: 'tickle_purchase',
      },
      payment_intent_data: {
        application_fee_amount: Math.floor(amountCents * 0.1), // EarTickle keeps 10%
        transfer_data: {
          destination: artistStripeId,
        },
      },
    });

    // Record the pending transaction
    await sql`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount, stripe_payment_id)
      VALUES (${senderId}, ${artistId}, ${songId}, ${Math.floor(amountCents / 100)}, ${session.id})
    `;

    return { url: session.url };
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: error.message };
  }
};

// API endpoint handler (if called directly)
export default async function handler(req, res) {
  res.status(200).json({ 
    message: 'This is a helper module. Use /api/create-connected-account or /api/create-tickle-checkout instead.' 
  });
}
