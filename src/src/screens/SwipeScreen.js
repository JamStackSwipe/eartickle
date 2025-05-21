import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const SwipeScreen = () => {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setSongs(data || []);
    };

    fetchSongs();
  }, []);

  const current = songs[currentIndex];

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
              onClick={() => {
                // In future: Add to JamStack
                setCurrentIndex((i) => i + 1);
              }}
              className="bg-green-400 text-black px-4 py-2 rounded"
            >
              ✅ Add to JamStack
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-400">No more songs to swipe.</p>
      )}
    </div>
  );
};

export default SwipeScreen;
