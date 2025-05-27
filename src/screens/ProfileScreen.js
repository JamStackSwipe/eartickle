import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);

  useEffect(() => {
    if (user) {
      fetchSongs();
      fetchGenresFromSongs();
    }
  }, [user]);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setSongs(data || []);
  };

  const fetchGenresFromSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('genre')
      .not('genre', 'is', null);

    if (!error) {
      const uniqueGenres = [...new Set(data.map((s) => s.genre).filter(Boolean))].sort();
      setAvailableGenres(uniqueGenres);
    }
  };

  const updateSong = async (id, updates) => {
    const { error } = await supabase
      .from('songs')
      .update(updates)
      .eq('id', id);

    if (error) {
      alert('Error updating song');
    } else {
      fetchSongs(); // reload to reflect edits
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this song?');
    if (!confirmed) return;

    await supabase.from('songs').delete().eq('id', id);
    fetchSongs();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">Your Uploaded Songs</h1>

      {songs.length === 0 ? (
        <p className="text-gray-400">No songs uploaded yet.</p>
      ) : (
        <ul className="space-y-6">
          {songs.map((song) => (
            <li key={song.id} className="bg-gray-900 p-4 rounded shadow space-y-2">
              <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-4">
                <img
                  src={song.cover}
                  alt="cover"
                  className="w-20 h-20 object-cover rounded mb-2 md:mb-0"
                />

                <div className="flex-1 space-y-1">
                  <label className="text-sm text-gray-400">🎵 Title</label>
                  <input
                    value={song.title}
                    onChange={(e) => updateSong(song.id, { title: e.target.value })}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-full"
                  />

                  <label className="text-sm text-gray-400 mt-2 block">🏷️ Genre</label>
                  <select
                    value={song.genre}
                    onChange={(e) => updateSong(song.id, { genre: e.target.value })}
                    className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 w-full"
                  >
                    <option value="">Select genre</option>
                    {availableGenres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  {song.stripe_account_id && (
                    <>
                      <label className="text-sm text-gray-400 mt-2 block">🎁 Gifting Enabled</label>
                      <input
                        type="checkbox"
                        checked={!!song.stripe_account_id}
                        onChange={(e) =>
                          updateSong(song.id, {
                            stripe_account_id: e.target.checked ? song.stripe_account_id : null,
                          })
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">
                        {song.stripe_account_id ? 'Yes' : 'No'}
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(song.id)}
                  className="mt-4 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;
