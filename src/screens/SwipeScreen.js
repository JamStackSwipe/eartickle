import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useSwipeable } from 'react-swipeable';
import { v4 as uuidv4 } from 'uuid';
import { Link } from 'react-router-dom';

const reactionEmojis = ['🔥', '❤️', '😢', '🎯'];

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [userHasTapped, setUserHasTapped] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const audioRef = useRef();

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching songs:', error);
      } else {
        setSongs(data);
      }
    };

    fetchSongs();
  }, []);

  const song = songs[currentIndex];

  const handleFirstTap = () => {
    setUserHasTapped(true);
    setShowOverlay(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, songs.length - 1));
    if (songs[currentIndex + 1]) {
      supabase.rpc('increment_song_views', { song_id: songs[currentIndex + 1].id });
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleAddToJamStack = async () => {
    if (!user || adding || !song?.id) return;
    setAdding(true);

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', song.id)
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
        song_id: song.id,
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
    if (!user || !song?.id) return;

    await supabase.from('reactions').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: song.id,
        emoji,
      },
    ]);

    const sound = {
      '🔥': '/sounds/fire.mp3',
      '❤️': '/sounds/love.mp3',
      '😢': '/sounds/sad.mp3',
      '🎯': '/sounds/bullseye.mp3',
    }[emoji];

    if (sound) new Audio(sound).play();
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleNext();
      handleFirstTap();
    },
    onSwipedRight: () => {
      handleAddToJamStack();
      handleFirstTap();
    },
    onSwipedUp: () => {
      handleNext();
      handleFirstTap();
    },
    onSwipedDown: () => {
      handlePrevious();
      handleFirstTap();
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-400">No songs to swipe yet.</div>;
  }

  return (
    <div
      {...swipeHandlers}
      onClick={handleFirstTap}
      className="min-h-screen bg-black text-white flex justify-center items-center p-4 relative"
    >
      {showOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-70 pointer-events-none z-10">
          <div className="flex flex-col items-center justify-center h-full text-white text-center space-y-2 text-lg pointer-events-auto">
            <div>👈 Swipe left to skip</div>
            <div>👉 Swipe right to add</div>
            <div>↑ Swipe up for next</div>
            <div>↓ Swipe down to go back</div>
            <p className="text-sm text-gray-400 mt-4">(tap to start)</p>
          </div>
        </div>
      )}

      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6 text-center z-10">
        <Link
          to={`/artist/${song.user_id}`}
          onClick={(e) => e.stopPropagation()}
          className="block mb-4"
        >
          <img
            src={song.cover || '/default-cover.png'}
            alt="cover"
            className="w-full h-64 object-contain rounded hover:opacity-90 transition"
          />
        </Link>

        <h2 className="text-2xl font-bold mb-1">{song.title}</h2>
        <p className="text-sm text-gray-600">{song.artist || 'Unknown Artist'}</p>
        <p className="text-xs italic text-gray-400 mb-3">{song.genre}</p>

        <div className="flex justify-center gap-3 flex-wrap text-gray-600 text-xs mb-2">
          <span>👁️ {song.views || 0}</span>
          <span>❤️ {song.likes || 0}</span>
          <span>🔥 {song.fires || 0}</span>
          <span>😢 {song.sads || 0}</span>
          <span>🎯 {song.bullseyes || 0}</span>
          <span>📦 {song.jams || 0} Jams</span>
        </div>

        <audio ref={audioRef} src={song.audio} controls className="w-full mb-4" />

        <div className="flex justify-center gap-4 text-2xl mb-4">
          {reactionEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                handleReact(emoji);
                handleFirstTap();
              }}
              className="hover:scale-125 transition-transform duration-150"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              handleAddToJamStack();
              handleFirstTap();
            }}
            disabled={adding}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ❤️ Add to JamStack
          </button>
          <button
            onClick={() => {
              handleNext();
              handleFirstTap();
            }}
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
