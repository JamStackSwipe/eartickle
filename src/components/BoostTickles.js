import React, { useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const BoostTickles = ({ songId, userId }) => {
  const cardRef = useRef(null);
  const boostSound = new Audio('/sounds/tickle-welcome.mp3');

  const boost = async (amount) => {
    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: userId,
      song_id_input: songId,
      reason: '🎯',
      cost: amount,
    });

    if (error) {
      toast.error('❌ Boost failed: ' + error.message);
      console.error(error);
    } else {
      toast.success(`🎯 Boosted with ${amount} Tickles!`);
      boostSound.play().catch(() => {});
      animateCard();
    }
  };

  const animateCard = () => {
    if (!cardRef.current) return;
    cardRef.current.classList.add('animate-boost');
    setTimeout(() => {
      cardRef.current.classList.remove('animate-boost');
    }, 1000);
  };

  const buttonStyles = [
    { amount: 5, label: '🎁 Boost', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { amount: 10, label: '🔥 Mega', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { amount: 25, label: '🚀 Super', color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
  ];

  return (
    <div ref={cardRef} className="flex gap-2 justify-end flex-wrap transition-all">
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
