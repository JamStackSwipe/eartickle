import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../supabase';

const SwipeScreen = () => {
  const { user, loading } = useAuth();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth'; // ✅ Safe redirect without crashing
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setSongs(data || []);
    };
    if (user) fetchSongs();
  }, [user]);

  const current = songs[currentIndex];

  const handleAddToJamStack = async () => {
    if (!user || !current?.id) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const { data: existingSong } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', current.id)
      .single();

    if (existingSong) {
      setMessage('⚠️ Already in your JamStack');
      setTimeout(() => setMessage(''), 2000);
      setCurrentIndex((i) => i + 1);
      return;
    }

    const { data: orderData } = await supabase
      .from('jamstacksongs')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1);

    const newOrder = (orderData?.[0]?.order || 0) + 1;

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        user_id: user.id,
        song_id: current.id,
        order: newOrder
      }
    ]);

    if (error) {
      setMessage('❌ Could not add song.');
    } else {
      setMessage('✅ Added to JamStack!');
    }

    setTimeout(() => setMessage(''), 2000);
    setCurrentIndex((i) => i + 1);
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      {current ? (
        <>
          <img src={current.cover_url} alt={current.title} className="w-60 h-60 object-cover rounded mb-4" />
          <h2 className="text-xl font-bold">{current.title}</h2>
          <audio controls src={current.mp3_url} className="my-4" />
          <div className="space-x-6 mt-4">
            <button onClick={() => setCurrentIndex((i) => i + 1)} className="bg-red-500 px-4 py-2 rounded">
              ❌ Skip
            </button>
            <button onClick={handleAddToJamStack} className="bg-green-400 text-black px-4 py-2 rounded">
              ✅ Add to JamStack
            </button>
          </div>
          {message && <p className="mt-4 text-teal-300">{message}</p>}
        </>
      ) : (
        <p className="text-gray-400 text-lg">No more songs to swipe.</p>
      )}
    </div>
  );
};

export default SwipeScreen;
