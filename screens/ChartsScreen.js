'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SongCard from '../components/SongCard';
import toast from 'react-hot-toast';

const ChartsScreen = () => {
  const { data: session } = useSession();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCharts();
    }
  }, [session?.user?.id]);

  const fetchCharts = async () => {
    try {
      const res = await fetch('/api/charts/top?limit=20');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSongs(data);
    } catch (error) {
      toast.error('Failed to load charts');
    }
    setLoading(false);
  };

  // Audio client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sounds/chart.mp3'); // Or your chart sound
      audio.play().catch(console.warn);
    }
  }, []);

  if (loading) return <p>Loading charts...</p>;
  if (!session) return <p>Login required</p>;

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center" style={{ color: '#3FD6CD' }}>Top Charts</h1>
      {songs.length === 0 ? (
        <p className="text-center text-gray-500">No charts yet.</p>
      ) : (
        songs.map((song, index) => (
          <SongCard
            key={song.id}
            song={{ ...song, rank: index + 1 }}
            user={session.user}
          />
        ))
      )}
    </div>
  );
};

export default ChartsScreen;
