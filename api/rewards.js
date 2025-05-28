// /api/rewards.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create a Connected Account for the Artist (Stripe Express)
export async function createConnectedAccount({ user_id, email }) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: { user_id },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings`,
      type: 'account_onboarding',
    });

    return { url: accountLink.url, accountId: account.id };
  } catch (error) {
    console.error('❌ Stripe connect error:', error);
    return { error: error.message };
  }
}

// ✅ Create a Checkout Session for Sending a Tickle Gift
export async function createTickleCheckout({
  artistStripeId,
  amountCents,
  songId,
  songTitle,
  artistId,
  senderId,
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `🎁 Tickle for: ${songTitle}`,
              metadata: {
                songId,
                artistId,
                senderId,
              },
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.floor(amountCents * 0.10), // 10% platform fee
        transfer_data: {
          destination: artistStripeId,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/rewards?canceled=1`,
      metadata: {
        songId,
        songTitle,
        artistId,
        senderId,
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error('❌ Tickle checkout error:', error);
    return { error: error.message };
  }
}
