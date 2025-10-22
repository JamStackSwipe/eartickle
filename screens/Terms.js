import React from 'react';

const Terms = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 text-sm text-gray-800">
    <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>
    
    <p className="mb-4">
      Welcome to <strong>EarTickle™</strong>. By accessing or using our platform, you agree to be bound by these Terms of Use. If you do not agree, you may not use the service.
    </p>

    <h2 className="font-semibold mt-6 mb-2">1. User Accounts</h2>
    <p className="mb-4">
      You must be at least 13 years old to use EarTickle. You are responsible for maintaining the security of your account and all activity under it.
    </p>

    <h2 className="font-semibold mt-6 mb-2">2. Uploaded Content</h2>
    <p className="mb-4">
      By uploading songs or other content, you affirm that you own or have the rights to distribute that content. You retain ownership of your work, but grant EarTickle a worldwide, non-exclusive license to host, stream, and publicly display your content within the platform.
    </p>

    <h2 className="font-semibold mt-6 mb-2">3. Community Guidelines</h2>
    <p className="mb-4">
      Users must refrain from uploading or linking to content that is unlawful, abusive, pornographic, or infringes on intellectual property rights. EarTickle reserves the right to remove content or suspend accounts that violate these terms.
    </p>

    <h2 className="font-semibold mt-6 mb-2">4. Rewards & Tickles</h2>
    <p className="mb-4">
      EarTickle offers a virtual reward system ("Tickles") which may be purchased or sent between users. Only approved artists may connect a Stripe account to cash out earned Tickles. EarTickle makes no guarantees of earnings or ongoing payouts, and reserves the right to adjust rates or eligibility at any time.
    </p>

    <h2 className="font-semibold mt-6 mb-2">5. Platform Changes</h2>
    <p className="mb-4">
      We may modify, suspend, or discontinue features at any time without notice. We are not liable for any loss of data, revenue, or exposure due to platform changes or outages.
    </p>

    <h2 className="font-semibold mt-6 mb-2">6. Termination</h2>
    <p className="mb-4">
      You may delete your account at any time. We reserve the right to suspend or terminate accounts that violate these terms, our community guidelines, or applicable laws.
    </p>

    <h2 className="font-semibold mt-6 mb-2">7. Contact</h2>
    <p className="mb-4">
      For questions about these terms, contact us at <a href="mailto:legal@eartickle.com" className="underline">legal@eartickle.com</a>.
    </p>

    <p className="mt-8 text-xs text-gray-500">
      Last updated: June 1, 2025
    </p>
  </div>
);

export default Terms;
