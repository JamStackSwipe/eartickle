import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider'; // ✅ fixed
import {
  playTickle,
  playTickleSpecial
} from '../utils/tickleSound';

const RewardsScreen = () => {
  const { user } = useUser(); // ✅ fixed
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchTickles();
    }
  }, [user]);

  const fetchTickles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Failed to load Tickles.');
    } else {
      setRewards(data);

      // ✅ Play tickle sound based on latest amount
      if (data.length > 0) {
        const latest = data[0];
        if (latest.amount >= 20) {
          playTickleSpecial();
        } else {
          playTickle();
        }
      }
    }

    setLoading(false);
  };

  if (loading) {
    return <p className="text-center mt-10">Loading Tickles...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Please log in to view your Tickles.</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">My Tickles</h2>

      {rewards.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t been tickled yet 😢</p>
      ) : (
        <ul className="space-y-4">
          {rewards.map((reward) => {
            const pts = reward.amount || 0;
            let icon = '🪙';
            let message = 'A tiny tickle!';

            if (pts >= 5 && pts < 10) {
              icon = '🎧';
              message = 'You got someone grooving 🎶';
            } else if (pts >= 10 && pts < 20) {
              icon = '💎';
              message = 'You made someone laugh out loud!';
            } else if (pts >= 20) {
              icon = '👑';
              message = 'Your jam tickled ears all the way to the moon 🚀';
            }

            return (
              <li
                key={reward.id}
                className="p-4 bg-white rounded shadow border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xl">{icon} {pts} Tickles</p>
                    <p className="text-sm text-gray-600">
                      From: {reward.sender_id?.slice(0, 8) || 'Unknown'}<br />
                      Song: {reward.song_id?.slice(0, 8) || '—'}<br />
                      Timestamp: {new Date(reward.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {pts >= 1 && (
                  <p className="mt-2 text-green-600 italic">{message}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RewardsScreen;
