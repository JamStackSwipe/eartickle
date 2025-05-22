import React, { useEffect, useState, useRef } from 'react';
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
  const [autoplay, setAutoplay] = useState(false);
  const [userHasTapped, setUserHasTapped] = useState(false);
  const audioRef = useRef();

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
    }
  };

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_views', { song_id: songId });
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setCurrentIndex(nextIndex);
      if (autoplay) audioRef.current?.play();
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

  const playReactionSound = (emoji) => {
    let soundFile = null;
    if (emoji === '🔥') soundFile = '/sounds/fire.mp3'; // Add more as you upload!

    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.play();
    }
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

    playReactionSound(emoji);
  };

  const handleFirstTap = () => {
    setUserHasTapped(true);
    if (autoplay && audioRef.current) {
      audioRef.current.play();
    }
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
      onClick={handleFirstTap}
      className="min-h-screen bg-black text-white flex justify-center items-center p-4 relative"
    >
      {/* Autoplay toggle button */}
      <button
        onClick={() => setAutoplay(!autoplay)}
        className="absolute top-4 right-4 text-xs bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200"
      >
        Autoplay: {autoplay ? 'ON' : 'OFF'}
      </button>

      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6 text-center">
        <img
          src={song.cover || '/default-cover.png'}
          alt="cover"
          className="w-full h-64 object-contain rounded mb-4"
        />
        <h2 className="text-2xl font-bold mb-1">{song.title}</h2>
        <p className="text-sm text-gray-600">{song.artist || 'Unknown Artist'}</p>
        <p className="text-xs italic text-gray-400 mb-3">{song.genre}</p>

        <audio
          ref={audioRef}
          src={song.audio}
          controls
          className="w-full mb-4"
        />

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

      {/* Tap-to-play overlay */}
      {!userHasTapped && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center text-white text-xl font-semibold z-10">
          👆 Tap to start listening
        </div>
      )}
    </div>
  );
};

export default SwipeScreen;
