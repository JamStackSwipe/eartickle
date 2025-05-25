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
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        profiles:profiles!songs_user_id_fkey(id, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) {
      const enriched = data.map((song) => ({
        ...song,
        artist_avatar_url: song.profiles?.avatar_url,
      }));
      setSongs(enriched);
    }
  };

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_views', { song_id: songId });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, songs.length - 1));
    incrementViews(songs[Math.min(currentIndex + 1, songs.length - 1)]?.id);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
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
    if (emoji === '🔥') soundFile = '/sounds/fire.mp3';
    if (emoji === '❤️') soundFile = '/sounds/love.mp3';
    if (emoji === '😢') soundFile = '/sounds/sad.mp3';
    if (emoji === '🎯') soundFile = '/sounds/bullseye.mp3';

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
    setShowOverlay(false);
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

  const song = songs[currentIndex];
  const artistAvatar = song.artist_avatar_url
    ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${song.artist_avatar_url}`
    : '/default-avatar.png';

  return (
    <div
      {...swipeHandlers}
      onClick={handleFirstTap}
      className="min-h-screen bg-black text-white flex justify-center items-center p-4 relative"
    >
      {showOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white text-center z-20 space-y-2 text-lg">
          <div>👈 Swipe left to skip</div>
          <div>👉 Swipe right to add</div>
          <div>↑ Swipe up for next</div>
          <div>↓ Swipe down to go back</div>
          <p className="text-sm text-gray-400 mt-4">(tap to start)</p>
        </div>
      )}

      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6 text-center z-10">
        <Link to={`/artist/${song.user_id}`}>
          <img
            src={artistAvatar}
            alt="Artist Avatar"
            className="w-12 h-12 rounded-full mx-auto mb-2 border hover:opacity-80 transition"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </Link>

        <img
          src={song.cover || '/default-cover.png'}
          alt="cover"
          className="w-full h-64 object-contain rounded mb-4"
        />
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
