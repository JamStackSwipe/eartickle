import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const JamStackPlayer = () => {
  const { user } = useUser();
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamStack = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('jamstacksongs')
        .select(`
          song_id,
          songs (
            id,
            title,
            artist,
            audio,
            cover
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error loading JamStack:', error);
        return;
      }

      const songs = data
        .map((row) => row.songs)
        .filter((song) => song && song.audio);

      setPlaylist(shuffleArray(songs));
      setLoading(false);
    };

    fetchJamStack();
  }, [user]);

  const currentSong = playlist[currentIndex];

  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const playPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? playlist.length - 1 : prev - 1
    );
  };

  if (loading) return <p className="p-6">Loading your JamStack...</p>;
  if (!playlist.length) return <p className="p-6">You haven’t added any songs yet.</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 text-center">
      <h1 className="text-3xl font-bold mb-6">🎧 Random Stacker</h1>

      <div className="bg-gray-800 p-4 rounded-lg shadow max-w-md mx-auto">
        <img
          src={currentSong.cover || '/default-cover.png'}
          alt="cover"
          className="w-full h-64 object-cover rounded mb-4"
        />
        <h2 className="text-xl font-semibold">{currentSong.title}</h2>
        <p className="text-sm text-gray-400 mb-4">{currentSong.artist}</p>

        <audio
          key={currentSong.id}
          src={currentSong.audio}
          controls
          autoPlay
          onEnded={playNext}
          className="w-full mb-4"
        />

        <div className="flex justify-between">
          <button
            onClick={playPrev}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            ⏮️ Prev
          </button>
          <button
            onClick={playNext}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            ⏭️ Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JamStackPlayer;
