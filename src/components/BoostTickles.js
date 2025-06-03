// src/components/BoostTickles.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const boostSound = new Audio('/sounds/tickle-welcome.mp3');

const BoostTickles = ({ userId, songId }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setBalance(data.tickle_balance);
    }
  };

  useEffect(() => {
    if (userId) fetchBalance();
  }, [userId]);

  const handleBoost = async (amount, label) => {
    if (!userId || !songId) return;

    if ((balance ?? 0) < amount) {
      toast.error('Not enough Tickles!');
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: userId,
      song_id_input: songId,
      reason: 'boost',
      cost: Number.parseInt(amount, 10),
    });

    if (error) {
      console.error('❌ Boost RPC failed:', error.message);
      toast.error('Boost failed.');
      setLoading(false);
      return;
    }

    toast.success(`${label} sent!`);
    boostSound.play();

    // Visual flash effect on card
    const card = document.querySelector(`[data-song-id="${songId}"]`);
    if (card) {
      card.classList.add('animate-pulse', 'ring-4', 'ring-lime-400');
      setTimeout(() => {
        card.classList.remove('animate-pulse', 'ring-4', 'ring-lime-400');
      }, 1000);
    }

    // Instantly update balance
    setBalance((prev) => (prev ?? 0) - amount);
    await fetchBalance(); // Silent confirm
    setLoading(false);
  };

  const boostOptions = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div className="mt-3">
      {balance !== null && (
        <div className="text-sm text-right text-gray-400 mb-2">
          Available Tickles: <span className="text-white font-semibold">{balance}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end flex-wrap">
        {boostOptions.map(({ amount, label, color }) => (
          <button
            key={amount}
            onClick={() => handleBoost(amount, label)}
            disabled={loading}
            className={`px-3 py-1 text-sm rounded-full font-semibold transition ${color} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {label} ({amount})
          </button>
        ))}
      </div>
    </div>
  );
};

export default BoostTickles;
