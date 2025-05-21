import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const RewardsScreen = () => {
  const { user } = useAuth();
  const [ticklesGiven, setTicklesGiven] = useState([]);
  const [ticklesReceived, setTicklesReceived] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTickles = async () => {
      if (!user?.id) return;

      const [{ data: given = [] }, { data: received = [] }] = await Promise.all([
        supabase
          .from('rewards')
          .select('amount, created_at, song_id, receiver_id')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('rewards')
          .select('amount, created_at, song_id, sender_id')
          .eq('receiver_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setTicklesGiven(given);
      setTicklesReceived(received);
      setLoading(false);
    };

    loadTickles();
  }, [user]);

  const sumTickles = (list) => list.reduce((acc, row) => acc + row.amount, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🎁 Tickles</h1>

      {!user ? (
        <p className="text-red-400">You must be logged in to view your Tickles.</p>
      ) : loading ? (
        <p className="text-gray-400">Loading your Tickles...</p>
      ) : (
        <>
          <div className="mb-6 space-y-2">
            <p className="text-green-400">✅ Tickles Received: {sumTickles(ticklesReceived)}</p>
            <p className="text-yellow-300">💌 Tickles Given: {sumTickles(ticklesGiven)}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">📥 Tickles You Received</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                {ticklesReceived.map((t, i) => (
                  <li key={i} className="border border-gray-700 rounded p-3">
                    <p>From user: {t.sender_id}</p>
                    <p>Song ID: {t.song_id}</p>
                    <p>Tickles: {t.amount}</p>
                    <p className="text-gray-500 text-xs">Tickled on: {new Date(t.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">📤 Tickles You Gave</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                {ticklesGiven.map((t, i) => (
                  <li key={i} className="border border-gray-700 rounded p-3">
                    <p>To user: {t.receiver_id}</p>
                    <p>Song ID: {t.song_id}</p>
                    <p>Tickles: {t.amount}</p>
                    <p className="text-gray-500 text-xs">Tickled on: {new Date(t.created_at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RewardsScreen;
