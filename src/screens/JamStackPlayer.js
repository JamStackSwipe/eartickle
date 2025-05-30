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
  const [sending, setSending] = useState(false);

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
            cover,
            user_id,
            stripe_account_id
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

  const handleSendTickle = async () => {
    if (!user || !currentSong?.user_id || user.id === currentSong.user_id) {
      alert('You cannot send a tickle to yourself.');
      return;
    }

    setSending(true);
    const session = await supabase.auth.getSession();
    const token = session.data.session.access_token;

    const res = await fetch('/api/send-tickle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        artist_id: currentSong.user_id,
        song_id: currentSong.id,
        emoji: '💎'
      }),
    });

    const result = await res.json();
    setSending(false);

    if (res.ok) {
      alert(`🎁 You sent a Tickle to ${currentSong.artist || 'this artist'}!`);
    } else {
      alert(`❌ ${result.error || 'Failed to send Tickle.'}`);
    }
  };

  if (loading) return <p className="p-6 text-white">Loading your JamStack...</p>;
  if (!playlist.length) return <p className="p-6 text-white">You haven’t added any songs yet.</p>;

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">
      <div className="bg-white text-black rounded-xl shadow-lg w-full max-w-md p-6 text-center">
        <img
          src={currentSong.cover || '/default-cover.png'}
          alt="cover"
          className="w-full h-64 object-contain rounded mb-4"
        />
        <h2 className="text-2xl font-bold mb-1">{currentSong.title}</h2>
        <p className="text-sm text-gray-600 mb-4">{currentSong.artist || 'Unknown Artist'}</p>

        <audio
          key={currentSong.id}
          src={currentSong.audio}
          controls
          autoPlay
          onEnded={playNext}
          className="w-full mb-4"
        />

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
          <button
            onClick={handleSendTickle}
            disabled={sending}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
          >
            🎁 Send a Tickle
          </button>
        </div>

        <div className="flex justify-between">
          <button
            onClick={playPrev}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ⏮️ Prev
          </button>
          <button
            onClick={playNext}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            ⏭️ Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JamStackPlayer;
