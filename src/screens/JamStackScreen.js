import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const MyJamsScreen = () => {
  const { user } = useAuth();
  const [mySongs, setMySongs] = useState([]);

  useEffect(() => {
    if (user?.id) fetchMyJamStack();
  }, [user]);

  const fetchMyJamStack = async () => {
    const { data, error } = await supabase
      .from('jamstacksongs')
      .select('id, songs ( id, title, artist, genre, cover, audio )')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading jamstack:', error.message);
    } else {
      setMySongs(data);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">Please log in to view your JamStack.</div>;
  }

  if (mySongs.length === 0) {
    return <div className="text-center mt-10 text-gray-500">You haven't added any songs yet.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">🎵 My JamStack</h2>
      {mySongs.map((entry) => {
        const song = entry.songs;
        return (
          <div key={entry.id} className="bg-white shadow-md rounded p-4 mb-6">
            <h3 className="text-xl font-bold mb-2">{song.title}</h3>
            <img src={song.cover} alt="cover" className="w-full h-48 object-cover rounded mb-2" />
            <p className="text-lg font-medium">{song.artist}</p>
            <p className="text-sm text-gray-500 italic mb-2">{song.genre}</p>
            <audio controls src={song.audio} className="w-full" />
          </div>
        );
      })}
    </div>
  );
};

export default MyJamsScreen;
