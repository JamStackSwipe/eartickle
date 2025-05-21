
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

const SwipeScreen = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setSongs(data);
      if (data.length > 0) incrementViews(data[0].id);
    }
  };

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_views', { song_id: songId });
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setCurrentIndex(nextIndex);
      incrementViews(songs[nextIndex].id);
    }
  };

  const handleAddToJamStack = async () => {
    if (!user || adding) return;

    setAdding(true);
    const currentSong = songs[currentIndex];

    if (!currentSong?.id) {
      alert("⚠️ Invalid song selected.");
      setAdding(false);
      return;
    }

    const { data: songCheck } = await supabase
      .from('songs')
      .select('id')
      .eq('id', currentSong.id)
      .maybeSingle();

    if (!songCheck) {
      alert("⚠️ This song no longer exists in the catalog.");
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
      },
    ]);

    if (error) {
      alert('❌ Failed to add song to your JamStack');
      console.error('JamStack insert error:', error);
    } else {
      alert('🎵 Added to your JamStack!');
    }

    setAdding(false);
  };

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-500">No songs to swipe yet.</div>;
  }

  const song = songs[currentIndex];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded text-center">
      <h2 className="text-2xl font-bold mb-4">{song.title}</h2>
      <img
        src={song.cover}
        alt="cover"
        className="w-full h-64 object-cover rounded mb-4"
      />
      <p className="text-lg font-semibold">{song.artist}</p>
      <p className="text-sm italic text-gray-500">{song.genre}</p>
      <audio controls src={song.audio} className="w-full mt-4 mb-2" />

      <div className="flex justify-between items-center mt-4 space-x-4">
        <button
          onClick={handleAddToJamStack}
          disabled={adding}
          className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ❤️ Add to JamStack
        </button>
        <button
          onClick={handleNext}
          className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ⏭️ Next
        </button>
      </div>
    </div>
  );
};

export default SwipeScreen;
