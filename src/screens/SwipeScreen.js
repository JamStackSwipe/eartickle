import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import AddToJamStackButton from '../components/AddToJamStackButton';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
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

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_view', { song_id_input: songId });
  };

  if (loading) {
    return <div className="text-center mt-10 text-white">Loading songs...</div>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-10">
      {songs.map((song) => (
        <div key={song.id} className="bg-zinc-900 rounded-xl shadow-md p-4">
          <a href={`/artist/${song.artist_id}`}>
            <img
              src={song.cover}
              alt={song.title}
              className="w-full h-auto rounded-xl mb-4"
              onClick={() => incrementViews(song.id)}
            />
          </a>
          <h2 className="text-xl font-semibold text-white mb-1">{song.title}</h2>
          <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
          <audio
            src={song.audio}
            controls
            autoPlay
            className="w-full mb-2"
            onPlay={() => incrementViews(song.id)}
          />
          <AddToJamStackButton songId={song.id} />
          <div className="text-xs text-gray-400 mt-2">
            👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwipeScreen;
