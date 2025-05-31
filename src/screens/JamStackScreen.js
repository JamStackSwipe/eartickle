import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const JamStackScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) fetchJamStackSongs();
  }, [user]);

  const fetchJamStackSongs = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select(`
        id,
        song_id,
        songs:song_id (
          id, title, artist, artist_id, cover, audio, views
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error loading JamStack:', error.message);
    } else {
      const extracted = data.map((entry) => entry.songs).filter(Boolean);
      const shuffled = extracted.sort(() => Math.random() - 0.5);
      setSongs(shuffled);
    }
  };

  // ⬆️ Count views when song loads
  useEffect(() => {
    if (songs.length === 0) return;

    const currentSong = songs[currentIndex];
    if (!currentSong?.id) return;

    supabase
      .from('songs')
      .update({ views: (currentSong.views || 0) + 1 })
      .eq('id', currentSong.id)
      .then(({ error }) => {
        if (error) console.error('📉 View update failed:', error.message);
      });

  }, [currentIndex]);

  // ⏭️ Autoplay next on song end
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Autoplay blocked:', err.message);
      });
    }
  }, [currentIndex]);

  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  const sendReaction = async (emoji) => {
    const currentSong = songs[currentIndex];
    if (!currentSong || !user?.id) return;

    const { error } = await supabase.from('tickles').insert({
      emoji,
      song_id: currentSong.id,
      sender_id: user.id,
    });

    if (error) {
      console.error('🧨 Failed to send reaction:', error.message);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Please log in to use the JamStack Stacker.</div>;
  }

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-500">You haven’t added any songs to your JamStack yet.</div>;
  }

  const currentSong = songs[currentIndex];
  const nextSong = songs[(currentIndex + 1) % songs.length];

  return (
    <div className="max-w-xl mx-auto mt-6 text-center px-4">

      {/* ✅ EarTickle Logo */}
      <img
        src="/logo.png"
        alt="EarTickle"
        className="h-10 mx-auto mb-4 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* ✅ Album Cover */}
      <img
        src={currentSong.cover}
        alt="cover"
        className="w-full max-w-md aspect-square object-contain rounded-xl mb-4 cursor-pointer transition-transform hover:scale-105 mx-auto"
        onClick={() => navigate(`/artist/${currentSong.artist_id}`)}
      />

      <h3 className="text-xl font-semibold">{currentSong.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{currentSong.artist}</p>

      <audio
        ref={audioRef}
        src={currentSong.audio}
        autoPlay
        controls
        onEnded={playNext}
        className="w-full mb-4"
      />

      {/* ✅ Reaction Buttons */}
      <div className="flex justify-center gap-5 mt-2 text-2xl">
        {['🔥', '❤️', '🎯', '😢'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            className="hover:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* ✅ Skip Button */}
      <button
        onClick={playNext}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm"
      >
        ⏭️ Skip to Next
      </button>

      {/* ✅ Up Next Preview */}
      {nextSong && (
        <div className="mt-6 bg-gray-100 p-3 rounded-md text-left">
          <p className="text-xs text-gray-500 uppercase font-medium mb-2">Up Next</p>
          <div className="flex items-center gap-3">
            <img src={nextSong.cover} alt="next" className="w-14 h-14 object-cover rounded" />
            <div>
              <p className="font-semibold text-sm">{nextSong.title}</p>
              <p className="text-xs text-gray-500">{nextSong.artist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamStackScreen;
