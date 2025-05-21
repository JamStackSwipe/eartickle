import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const RewardsScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchRewards();
    }
  }, [authLoading, user]);

  const fetchRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Failed to load rewards.');
    } else {
      setRewards(data);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return <p className="text-center mt-10">Loading rewards...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Please log in to view rewards.</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">My Rewards</h2>

      {rewards.length === 0 ? (
        <p className="text-center text-gray-500">No rewards earned yet.</p>
      ) : (
        <ul className="space-y-4">
          {rewards.map((reward) => (
            <li
              key={reward.id}
              className="p-4 bg-white rounded shadow border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{reward.name || 'Reward'}</p>
                  <p className="text-sm text-gray-500">
                    Earned on {new Date(reward.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-blue-600 font-bold text-lg">{reward.points} pts</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RewardsScreen;
