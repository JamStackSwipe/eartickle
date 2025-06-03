// src/screens/SwipeScreen.js

import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SongCard from '../components/SongCard';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, cover, audio, artist, genre, genre_flavor, artist_id, fires, loves, sads, bullseyes, views, jams')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading songs:', error.message);
      } else {
        setSongs(data);
      }
      setLoading(false);
    };

    fetchSongs();
  }, []);

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading songs...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-10">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} user={user} />
      ))}
    </div>
  );
};

export default SwipeScreen;
