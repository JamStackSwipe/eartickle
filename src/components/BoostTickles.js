import React from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const boostSound = new Audio('/sounds/tickle-welcome.mp3');

const BoostTickles = ({ songId, userId }) => {
  const playBoostSound = () => {
    boostSound.pause();
    boostSound.currentTime = 0;
    boostSound.play().catch(() => {});
  };

  const boost = async (amount) => {
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: userId,
      song_id_input: songId,
      reason: '🎯',
      cost: amount,
    });

    if (error) {
      toast.error(error.message || 'Boost failed.');
    } else {
      playBoostSound();
      toast.success(`🎯 Boosted with ${amount} Tickles!`);
    }
  };

  const buttonStyles = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div className="flex gap-2 justify-end flex-wrap mt-2">
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
