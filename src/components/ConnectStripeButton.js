import React from 'react';

const ConnectStripeButton = ({ userId, email }) => {
  const handleClick = async () => {
    try {
      const res = await fetch('/api/create-connected-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, email }),
      });

      const data = await res.json().catch(() => null); // Protect against invalid JSON

      if (!res.ok) {
        throw new Error(data?.error || 'Stripe connection failed. Try again later.');
      }

      if (data?.url) {
        window.location.href = data.url; // Redirect to Stripe onboarding
      } else {
        alert('Stripe Error: Unexpected response from server.');
      }
    } catch (err) {
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
