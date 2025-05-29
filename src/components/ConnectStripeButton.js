// src/components/ConnectStripeButton.js
import React from 'react';

const ConnectStripeButton = ({ userId, email }) => {
  const handleClick = async () => {
    try {
      const response = await fetch('/api/create-connected-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email }),
      });

      const result = await response.json().catch(() => ({})); // Avoid crash on bad JSON

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Stripe onboarding failed.');
      }

      window.location.href = result.url;
    } catch (err) {
      console.error('❌ Stripe Connect Error:', err);
      alert(`Stripe Error: ${err.message}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      🚀 Connect Stripe (Receive Tickles)
    </button>
  );
};

export default ConnectStripeButton;
