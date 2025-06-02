/**
 * 🎵 StackerScreen.js
 * 
 * JamStack autoplay screen. Plays user's favorited songs one-by-one.
 * Pulls from `jamstacksongs` table and displays each using <SongCard>.
 * Auto-plays next track when the current song ends.
 * 
 * ✅ Uses full SongCard layout for visual consistency
 * ✅ AutoPlay + Manual Skip (Next button)
 * 🔁 Could later support shuffle/repeat, mini-player, etc.
 * 
 * This is the "sit back and listen" mode for users' JamStack.
 */

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
    const audio = audioRef.current;
    if (!audio) return;

    // Reset and play the new audio track
    audio.pause();
    audio.load();
    audio.play().catch(() => {});

    // Auto-skip listener
    const handleEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, songs.length]);

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
          onClick={() => setCurrentIndex((prev) => (prev + 1) % songs.length)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next Song
        </button>
      </div>
    </div>
  );
};

export default StackerScreen;
