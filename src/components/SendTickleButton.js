// src/components/SendTickleButton.js
import React from 'react';

const SendTickleButton = ({ songId, songTitle, artistId, artistStripeId, senderId }) => {
  const handleGift = async () => {
    const res = await fetch('/api/create-tickle-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songId,
        songTitle,
        artistStripeId,
        amountCents: 500, // $5 Tickle
        artistId,
        senderId,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert('Error: ' + data.error);
    }
  };

  if (!artistStripeId) return null; // Hide button if no payout account

  return (
    <button
      onClick={handleGift}
      className="mt-2 px-4 py-1 text-sm bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-600"
    >
      🎁 Send a Tickle ($5)
    </button>
  );
};

export default SendTickleButton;
