// src/screens/StackerScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SongCard from '../components/SongCard';

const StackerScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchJamStack = async () => {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id, song_id, songs:song_id(*)')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching JamStack:', error.message);
      } else {
        setSongs(data.map(entry => entry.songs));
      }
    };

    if (user?.id) fetchJamStack();
  }, [user?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  if (!songs.length) {
    return <div className="text-white text-center mt-10">No songs in your JamStack yet.</div>;
  }

  const currentSong = songs[currentIndex];

  return (
    <div className="p-4 max-w-xl mx-auto">
      <SongCard
        song={currentSong}
        user={user}
        audioRef={audioRef}
        autoPlay
        key={currentSong.id}
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next Song
        </button>
      </div>
    </div>
  );
};

export default StackerScreen;
