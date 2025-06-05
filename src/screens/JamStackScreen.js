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

  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  useEffect(() => {
    const fetchJamStack = async () => {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select(`
          id,
          song_id,
          songs (
            id, title, cover, audio, artist, genre, genre_flavor, artist_id,
            fires, loves, sads, bullseyes, views, jams
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching JamStack:', error.message);
      } else if (data?.length) {
        const loadedSongs = data.map((entry) => entry.songs).filter((s) => s?.audio);
        setSongs(shuffleArray(loadedSongs));
        setCurrentIndex(0);
      }
    };

    if (user?.id) fetchJamStack();
  }, [user?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !songs[currentIndex]?.audio) return;

    audio.pause();
    audio.load();
    audio.play().catch(() => {});

    const handleEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % songs.length);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentIndex, songs]);

  if (!songs.length) {
    return (
      <div className="text-white text-center mt-10">
        No songs in your JamStack yet.
        <br />
        Go add some from Swipe or Charts!
      </div>
    );
  }

  const currentSong = songs[currentIndex];
  const upcoming = [
    songs[(currentIndex + 1) % songs.length],
    songs[(currentIndex + 2) % songs.length],
    songs[(currentIndex + 3) % songs.length],
  ];

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
  className="px-4 py-2 text-white rounded hover:shadow-md transition"
  style={{ backgroundColor: '#3FD6CD', '--tw-bg-opacity': 1 }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
>
  ⏭️ Next Song
</button>
      </div>
      {songs.length > 1 && (
  <div className="mt-8 bg-black/80 p-4 rounded-xl shadow-inner">
    <div className="text-sm text-gray-300 text-center mb-2">Up Next</div>
    <div className="space-y-2">
      {upcoming.map((song, offset) => (
        <div
          key={song?.id || offset}
          onClick={() => setCurrentIndex((currentIndex + offset + 1) % songs.length)}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition"
        >
          <img
            src={song?.cover || '/default-cover.png'}
            alt="cover"
            className="w-12 h-12 object-cover rounded shadow ring-2 ring-[#00CEC8]"
          />
          <div className="text-white text-sm">
            <div className="font-medium">{song?.title || 'Untitled'}</div>
            {song?.artist && (
              <div className="text-xs text-gray-400">by {song.artist}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
};

export default StackerScreen;
