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

  // Fetch and shuffle JamStack songs
  useEffect(() => {
    const fetchJamStack = async () => {
      const { data, error } = await supabase
        .from('jamstacksongs')
        .select('id, song_id, songs:song_id(id, title, audio, cover, artist, artist_id)')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error fetching JamStack:', error.message);
      } else if (data?.length) {
        const loadedSongs = data.map((entry) => entry.songs).filter((s) => s.audio);
        setSongs(shuffleArray(loadedSongs));
        setCurrentIndex(0);
      }
    };

    if (user?.id) fetchJamStack();
  }, [user?.id]);

  // Handle autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !songs[currentIndex]?.audio) return;

    audio.pause();
    audio.load();
    audio.play().catch(() => {}); // ignore autoplay block

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
  const nextSong = songs[(currentIndex + 1) % songs.length];

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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          ⏭️ Next Song
        </button>
      </div>

      {/* Up Next Preview */}
      {songs.length > 1 && nextSong && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-300 mb-2">Up Next:</div>
          <div
            className="flex items-center gap-3 justify-center p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition"
            onClick={() => setCurrentIndex((currentIndex + 1) % songs.length)}
          >
            <img
              src={nextSong.cover || '/default-cover.png'}
              alt="Up next cover"
              className="w-12 h-12 object-cover rounded shadow"
            />
            <div className="text-left text-white text-sm font-medium">
              <div>{nextSong.title}</div>
              {nextSong.artist && (
                <div className="text-xs text-gray-400">by {nextSong.artist}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackerScreen;
