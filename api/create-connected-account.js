const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { user_id, email } = req.body;

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://eartickle.com/reauth',
      return_url: 'https://eartickle.com/dashboard',
      type: 'account_onboarding',
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('🔴 Stripe Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
