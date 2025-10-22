'use client'; // Client-only to fix Audio SSR

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

const JamStackScreen = () => {
  const { data: session } = useSession();
  const [jamStackSongs, setJamStackSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchJamStack();
    }
  }, [session?.user?.id]);

  const fetchJamStack = async () => {
    try {
      const res = await fetch(`/api/jamstack?user_id=${session.user.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJamStackSongs(data);
    } catch (error) {
      toast.error('Failed to load Jam Stack');
    }
    setLoading(false);
  };

  const handleDeleteJam = async (songId) => {
    try {
      const res = await fetch(`/api/jamstack/${songId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: session.user.id }),
      });
      if (!res.ok) throw new Error(await res.text());
      setJamStackSongs((prev) => prev.filter((s) => s.id !== songId));
      toast.success('Removed from Jam Stack!');
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  // Audio client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/jam.mp3'); // Your sound
      audio.play().catch(console.warn);
    }
  }, []);

  if (loading) return <p>Loading Jam Stack...</p>;
  if (!session) return <p>Login required</p>;

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: '#3FD6CD' }}>My Jam Stack</h1>
      {jamStackSongs.length === 0 ? (
        <p className="text-center text-gray-500">No songs in your Jam Stack yet.</p>
      ) : (
        jamStackSongs.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            user={session.user}
            onDelete={() => handleDeleteJam(song.id)}
          />
        ))
      )}
    </div>
  );
};

export default JamStackScreen;
