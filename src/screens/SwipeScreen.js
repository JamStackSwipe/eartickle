import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, artist, artist_id, cover, audio');

    if (error) {
      console.error('🚫 Failed to fetch songs:', error.message);
    } else {
      setSongs(data || []);
    }
  };

  const addToJamStack = async (songId) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('jamstacksongs')
      .insert({ user_id: user.id, song_id: songId })
      .select();

    if (error) {
      if (!error.message.includes('duplicate key')) {
        console.error('🧨 Add to JamStack failed:', error.message);
      }
    }
  };

  const handleSwipe = (dir, songId) => {
    if (dir === 'Right') {
      addToJamStack(songId);
    }
    // Optionally handle left swipe
  };

  return (
    <div className="overflow-y-scroll h-screen px-4 pt-20 space-y-8 pb-24">
      {songs.map((song) => {
        const swipeHandlers = useSwipeable({
          onSwipedLeft: () => handleSwipe('Left', song.id),
          onSwipedRight: () => handleSwipe('Right', song.id),
          preventScrollOnSwipe: true,
          trackMouse: true,
        });

        return (
          <div
            key={song.id}
            {...swipeHandlers}
            className="bg-white rounded-xl shadow-md p-4 transition-all duration-300"
          >
            <img
              src={song.cover}
              alt="cover"
              onClick={() => navigate(`/artist/${song.artist_id}`)}
              className="w-full aspect-square object-contain rounded mb-4 cursor-pointer"
            />
            <h3 className="text-xl font-bold">{song.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{song.artist}</p>
            <audio controls src={song.audio} className="w-full" />
          </div>
        );
      })}
    </div>
  );
};

export default SwipeScreen;
