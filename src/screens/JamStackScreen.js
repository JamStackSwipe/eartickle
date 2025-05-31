import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const JamStackScreen = () => {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (user?.id) fetchJamStackSongs();
  }, [user]);

  const fetchJamStackSongs = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('id, songs ( id, title, artist, cover, audio )')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading JamStack:', error.message);
    } else {
      // Extract and shuffle songs
      const shuffled = data.map((entry) => entry.songs).sort(() => Math.random() - 0.5);
      setSongs(shuffled);
    }
  };

  const playNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((e) => {
        console.warn('Autoplay prevented:', e.message);
      });
    }
  }, [currentIndex]);

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Please log in to use the JamStack Stacker.</div>;
  }

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-500">You haven’t added any songs to your JamStack yet.</div>;
  }

  const currentSong = songs[currentIndex];

  return (
    <div className="max-w-xl mx-auto mt-10 text-center px-4">
      <h2 className="text-2xl font-bold mb-4">🔀 JamStack Stacker</h2>
      <img src={currentSong.cover} alt="cover" className="w-full h-60 object-cover rounded mb-4" />
      <h3 className="text-xl font-semibold">{currentSong.title}</h3>
      <p className="text-gray-600 mb-4">{currentSong.artist}</p>

      <audio
        ref={audioRef}
        src={currentSong.audio}
        autoPlay
        controls
        onEnded={playNext}
        className="w-full mb-4"
      />

      <button
        onClick={playNext}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ⏭️ Next Song
      </button>
    </div>
  );
};

export default JamStackScreen;
