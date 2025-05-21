
  import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const SwipeScreen = () => {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [userReady, setUserReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Auth error:', error);
        return;
      }

      if (!user) {
        navigate('/auth');
      } else {
        setUserReady(true);
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setSongs(data || []);
    };

    if (userReady) fetchSongs();
  }, [userReady]);

  const current = songs[currentIndex];

  const handleAddToJamStack = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId || !current?.id) {
      setCurrentIndex((i) => i + 1);
      return;
    }

    const { data: existingSong } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', userId)
      .eq('song_id', current.id)
      .single();

    if (existingSong) {
      setMessage('⚠️ Already in your JamStack');
      setTimeout(() => setMessage(''), 2000);
      setCurrentIndex((i) => i + 1);
      return;
    }

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('order')
      .eq('user_id', userId)
      .order('order', { ascending: false })
      .limit(1);

    const newOrder = (existing?.[0]?.order || 0) + 1;

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        user_id: userId,
        song_id: current.id,
        order: newOrder
      }
    ]);

    if (error) {
      console.error('Add to JamStack failed:', error.message);
      setMessage('❌ Could not add song.');
    } else {
      setMessage('✅ Added to JamStack!');
    }

    setTimeout(() => setMessage(''), 2000);
    setCurrentIndex((i) => i + 1);
  };

  if (!userReady) return <div className="p-4 text-center">Checking session...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      {current ? (
        <>
          <img src={current.cover_url} alt={current.title} className="w-60 h-60 object-cover rounded mb-4" />
          <h2 className="text-xl font-bold">{current.title}</h2>
          <audio controls src={current.mp3_url} className="my-4" />

          <div className="space-x-6 mt-4">
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="bg-red-500 px-4 py-2 rounded"
            >
              ❌ Skip
            </button>

            <button
              onClick={handleAddToJamStack}
              className="bg-green-400 text-black px-4 py-2 rounded"
            >
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
