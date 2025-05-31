import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [jamStackIds, setJamStackIds] = useState([]);
  const [tickleCounts, setTickleCounts] = useState({});
  const [trendingIds, setTrendingIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchSongs();
      fetchJamStack();
      fetchTickleStats();
    }
  }, [user]);

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

  const fetchJamStack = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('song_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setJamStackIds(data.map((entry) => entry.song_id));
    }
  };

  const fetchTickleStats = async () => {
    const { data, error } = await supabase
      .from('tickles')
      .select('song_id, emoji, count:count')
      .group('song_id, emoji');

    if (!error && data) {
      const counts = {};
      const trending = new Set();

      for (const row of data) {
        if (!counts[row.song_id]) counts[row.song_id] = {};
        counts[row.song_id][row.emoji] = row.count;

        // 🔥 Trending logic
        if (row.emoji === '🔥' && row.count > 10) {
          trending.add(row.song_id);
        }
      }

      setTickleCounts(counts);
      setTrendingIds([...trending]);
    }
  };

  const addToJamStack = async (songId) => {
    if (!user?.id || jamStackIds.includes(songId)) return;

    const { error } = await supabase
      .from('jamstacksongs')
      .insert({ user_id: user.id, song_id: songId });

    if (!error) {
      setJamStackIds((prev) => [...prev, songId]);
    } else if (!error.message.includes('duplicate key')) {
      console.error('🧨 Add to JamStack failed:', error.message);
    }
  };

  const sendReaction = async (emoji, songId) => {
    if (!user?.id) return;

    const { error } = await supabase.from('tickles').insert({
      emoji,
      song_id: songId,
      sender_id: user.id,
    });

    if (error) {
      console.error('❌ Emoji reaction failed:', error.message);
    } else {
      fetchTickleStats(); // 🔄 refresh
    }
  };

  const handleSwipe = (dir, songId) => {
    if (dir === 'Right') {
      addToJamStack(songId);
    }
  };

  return (
    <div className="overflow-y-scroll h-screen px-4 pt-20 space-y-10 pb-24">
      {songs.map((song) => {
        const swipeHandlers = useSwipeable({
          onSwipedLeft: () => handleSwipe('Left', song.id),
          onSwipedRight: () => handleSwipe('Right', song.id),
          preventScrollOnSwipe: true,
          trackMouse: true,
        });

        const inJam = jamStackIds.includes(song.id);
        const reactions = tickleCounts[song.id] || {};
        const isTrending = trendingIds.includes(song.id);

        return (
          <div
            key={song.id}
            {...swipeHandlers}
            className="bg-white rounded-xl shadow-md p-4 transition-all duration-300 relative"
          >
            <div className="relative">
              <img
                src={song.cover}
                alt="cover"
                className="w-full aspect-square object-contain rounded mb-4 cursor-pointer"
                onClick={() => navigate(`/artist/${song.artist_id}`)}
              />

              {/* 🔥 Trending Badge */}
              {isTrending && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
                  🔥 Trending
                </div>
              )}

              {/* ✅ JamStack Badge */}
              {inJam && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow">
                  In JamStack
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold">{song.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{song.artist}</p>

            <audio controls src={song.audio} className="w-full mb-3" />

            {/* Emoji Reactions + Counts */}
            <div className="flex justify-center gap-5 text-2xl">
              {['🔥', '❤️', '🎯', '😢'].map((emoji) => (
                <div key={emoji} className="flex flex-col items-center">
                  <button
                    onClick={() => sendReaction(emoji, song.id)}
                    className="hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                  <span className="text-sm text-gray-500">{reactions[emoji] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SwipeScreen;
