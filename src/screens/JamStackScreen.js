// Stacker Screen
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const JamStackScreen = () => {
  const { user } = useAuth();
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
      .select('id, songs ( id, title, artist, artist_id, genre, cover, audio )')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading JamStack:', error.message);
    } else {
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
        console.warn('Autoplay blocked:', e.message);
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
  const nextSong = songs[(currentIndex + 1) % songs.length];

  return (
    <div className="max-w-xl mx-auto mt-10 text-center px-4">
      <h2 className="text-2xl font-bold mb-4">🔀 JamStack Stacker</h2>

      {/* Clickable album cover */}
      <img
        src={currentSong.cover}
        alt="cover"
        className="w-full h-60 object-cover rounded mb-4 cursor-pointer transition-transform hover:scale-105"
        onClick={() => navigate(`/artist/${currentSong.artist_id}`)}
      />

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

      {/* 🔮 Upcoming Song Preview */}
      {nextSong && (
        <div className="mt-6 text-left bg-gray-100 p-4 rounded">
          <p className="text-gray-700 font-semibold mb-1">Up Next:</p>
          <div className="flex items-center gap-4">
            <img
              src={nextSong.cover}
              alt="next cover"
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-bold">{nextSong.title}</p>
              <p className="text-sm text-gray-600">{nextSong.artist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JamStackScreen;
