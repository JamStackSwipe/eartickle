import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const boostSound = new Audio('/sounds/tickle-welcome.mp3');

const BoostTickles = ({ songId, userId }) => {
  const [tickleBalance, setTickleBalance] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', userId)
      .single();
    if (!error && data) setTickleBalance(data.tickle_balance);
  };

  const boost = async (amount, label) => {
    if ((tickleBalance ?? 0) < amount) {
      toast.error('Not enough Tickles.');
      return;
    }

    const { error } = await supabase.rpc('spend_tickles', {
      user_id_input: userId,
      song_id_input: songId,
      reason: 'boost',
      cost: amount,
    });

    if (error) {
      toast.error('Boost failed.');
    } else {
      toast.success(`${label} successful!`);
      boostSound.play();
      fetchBalance();
    }
  };

  return (
    <div className="flex gap-2 justify-end flex-wrap mt-2">
      <button
        onClick={() => boost(5, '🎁 Boost')}
        className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
      >
        🎁 Boost (5)
      </button>
      <button
        onClick={() => boost(10, '🔥 Mega Boost')}
        className="px-3 py-1 text-sm rounded-full bg-purple-200 text-purple-800 hover:bg-purple-300 transition"
      >
        🔥 Mega (10)
      </button>
      <button
        onClick={() => boost(25, '🚀 Super Boost')}
        className="px-3 py-1 text-sm rounded-full bg-pink-200 text-pink-800 hover:bg-pink-300 transition"
      >
        🚀 Super (25)
      </button>
    </div>
  );
};

export default BoostTickles;
