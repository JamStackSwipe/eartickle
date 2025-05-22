import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useSwipeable } from 'react-swipeable';
import { v4 as uuidv4 } from 'uuid';

const reactionEmojis = ['🔥', '❤️', '😢', '🎯'];

const SwipeScreen = () => {
  const { user } = useUser();
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

    if (!error && data.length > 0) {
      setSongs(data);
      incrementViews(data[0].id);
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

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', currentSong.id)
      .maybeSingle();

    if (existing) {
      alert('🛑 Already in your JamStack!');
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

    if (!error) {
      alert('🎵 Added to your JamStack!');
    } else {
      console.error('❌ Error adding to JamStack:', error);
    }

    setAdding(false);
  };

  const handleReact = async (emoji) => {
    const currentSong = songs[currentIndex];
    if (!user || !currentSong?.id) return;

    await supabase.from('reactions').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
        emoji: emoji,
      },
    ]);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNext(),
    onSwipedRight: () => handleAddToJamStack(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-400">No songs to swipe yet.</div>;
  }

  const song = songs[currentIndex];

  return (
    <div
      {...swipeHandlers}
      className="min-h-screen bg-black text-white flex justify-center items-center p-4"
    >
      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6 text-center">
        <img
          src={song.cover || '/default-cover.png'}
          alt="cover"
          className="w-full h-64 object-contain rounded mb-4"
        />
        <h2 className="text-2xl font-bold mb-1">{song.title}</h2>
        <p className="text-sm text-gray-600">{song.artist || 'Unknown Artist'}</p>
        <p className="text-xs italic text-gray-400 mb-3">{song.genre}</p>

        <audio controls src={song.audio} className="w-full mb-4" />

        <div className="flex justify-center gap-4 text-2xl mb-4">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="hover:scale-125 transition-transform duration-150"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddToJamStack}
            disabled={adding}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ❤️ Add to JamStack
          </button>
          <button
            onClick={handleNext}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ⏭️ Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeScreen;
