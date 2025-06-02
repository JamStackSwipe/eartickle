// BoostTickles.js – with flash + balance update
import React from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const BoostTickles = ({ songId, userId, onBoost, refreshBalance }) => {
  const boost = async (amount) => {
    // Check balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      toast.error('Failed to get tickle balance.');
      return;
    }

    if (profile.tickle_balance < amount) {
      toast.error('Not enough Tickles.');
      return;
    }

    // Spend tickles via RPC
    const { error: spendError } = await supabase.rpc('spend_tickles', {
      user_id_input: userId,
      song_id_input: songId,
      reason: '🎯',
      cost: amount,
    });

    if (spendError) {
      console.error('❌ Spend tickles failed:', spendError);
      toast.error('Boost failed.');
    } else {
      toast.success(`🎯 Boosted with ${amount} Tickles!`);

      // Flash animation on the card
      const card = document.querySelector(`[data-song-id="${songId}"]`);
      if (card) {
        card.classList.add('animate-pulse', 'ring-4', 'ring-green-400');
        setTimeout(() => {
          card.classList.remove('animate-pulse', 'ring-4', 'ring-green-400');
        }, 800);
      }

      if (refreshBalance) refreshBalance();
      if (onBoost) onBoost(songId, amount);
    }
  };

  const buttonStyles = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div className="flex gap-2 justify-end flex-wrap">
      {buttonStyles.map(({ amount, label, color }) => (
        <button
          key={amount}
          onClick={() => boost(amount)}
          className={`px-3 py-1 text-sm rounded-full font-semibold transition ${color}`}
        >
          {label} ({amount})
        </button>
      ))}
    </div>
  );
};

export default BoostTickles;
