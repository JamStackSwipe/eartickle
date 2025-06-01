import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SongCard from '../components/SongCard';

const ChartsScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, cover, audio, artist, genre, artist_id, fires, loves, sads, bullseyes, views, jams, score')
        .order('score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading top songs:', error.message);
      } else {
        setSongs(data);
      }

      setLoading(false);
    };

    fetchTopSongs();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading top songs...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-10">
      <h1 className="text-white text-2xl font-bold mb-4 text-center">🔥 Top 20 Chart</h1>
      {songs.map((song) => (
        <SongCard key={song.id} song={song} user={user} />
      ))}
    </div>
  );
};

export default ChartsScreen;
