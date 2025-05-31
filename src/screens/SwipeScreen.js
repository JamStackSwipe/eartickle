import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import SendTickleButton from '../components/SendTickleButton';
import AddToJamButton from '../components/AddToJamButton';

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch songs:', error.message);
    } else {
      setSongs(data || []);
    }

    setLoading(false);
  };

  const incrementView = async (songId) => {
    await supabase
      .from('songs')
      .update({ views: supabase.literal('views + 1') })
      .eq('id', songId);
  };

  const handlePlay = (songId) => {
    incrementView(songId);
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading songs...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-6 px-4">
      <h2 className="text-2xl font-bold mb-4 text-center">🎧 Swipe & Discover</h2>
      <div className="space-y-8">
        {songs.map((song) => (
          <div key={song.id} className="bg-white shadow-lg rounded-xl overflow-hidden">
            <img
              src={song.cover}
              alt={song.title}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => window.location.href = `/artist/${song.artist_id}`}
            />
            <div className="p-4">
              <h3 className="text-xl font-bold">{song.title}</h3>
              <p className="text-sm text-gray-600">{song.artist}</p>

              <audio
                controls
                className="w-full mt-3"
                onPlay={() => handlePlay(song.id)}
                src={song.audio}
              />

              <div className="flex items-center justify-between mt-4">
                <AddToJamButton songId={song.id} />
                <SendTickleButton songId={song.id} />
              </div>

              <div className="text-sm text-gray-500 mt-2">
                👁️ {song.views || 0} views • ❤️ {song.loves || 0} • 🔥 {song.fires || 0} • 🎯 {song.bullseyes || 0} • 😢 {song.sads || 0} • 🎶 {song.jams || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwipeScreen;
