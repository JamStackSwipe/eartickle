// src/components/ConnectStripeButton.js
import React from 'react';

const ConnectStripeButton = ({ userId, email }) => {
  const handleClick = async () => {
    const res = await fetch('/api/create-connected-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, email }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe onboarding
    } else {
      alert('Stripe Error: ' + (data.error || 'Unknown error'));
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
