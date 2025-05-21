import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const MyJamsScreen = () => {
  const [jamSongs, setJamSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10); // pagination support
  const navigate = useNavigate();

  const fetchJamStack = async () => {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('User not authenticated:', userError);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('jamstacksongs')
      .select(`
        id,
        created_at,
        song_id,
        songs (
          id,
          title,
          artist,
          cover
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching JamStack songs:', error);
    } else {
      setJamSongs(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchJamStack();
  }, [limit]);

  const handleRemove = async (song_id) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('jamstacksongs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', song_id);

    if (error) {
      console.error('Failed to remove song:', error);
    } else {
      setJamSongs((prev) => prev.filter((entry) => entry.song_id !== song_id));
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading your JamStack™...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold">My JamStack™</h1>

      {jamSongs.length > 0 ? (
        <>
          {jamSongs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between space-x-4 p-4 border rounded-md bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={entry.songs?.cover || '/default-cover.jpg'}
                  alt="cover"
                  className="w-16 h-16 rounded"
                />
                <div>
                  <p className="font-semibold">{entry.songs?.title}</p>
                  <p className="text-sm text-gray-600">by {entry.songs?.artist}</p>
                  <p className="text-xs text-gray-500">
                    Saved: {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(entry.song_id)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          {jamSongs.length >= limit && (
            <button
              onClick={() => setLimit((prev) => prev + 10)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load More
            </button>
          )}
        </>
      ) : (
        <div className="text-center text-gray-600 space-y-2">
          <p>You haven't added any songs to your JamStack™ yet.</p>
          <button
            onClick={() => navigate('/swipe')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Swiping
          </button>
        </div>
      )}
    </div>
  );
};

export default MyJamsScreen;
