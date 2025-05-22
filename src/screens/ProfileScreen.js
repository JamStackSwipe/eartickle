// src/screens/ProfileScreen.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();

  const [mySongs, setMySongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '' });

  // Fetch current user's songs
  useEffect(() => {
    const fetchMySongs = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching songs:', error.message);
      } else {
        setMySongs(data);
      }

      setLoading(false);
    };

    fetchMySongs();
  }, [user]);

  // Start editing a song
  const startEditing = (song) => {
    setEditingId(song.id);
    setEditForm({ title: song.title, artist: song.artist });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', artist: '' });
  };

  const saveChanges = async (id) => {
    const { error } = await supabase
      .from('songs')
      .update(editForm)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error updating song:', error.message);
    } else {
      // Update local list
      setMySongs((prev) =>
        prev.map((song) =>
          song.id === id ? { ...song, ...editForm } : song
        )
      );
      cancelEditing();
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">👤 My Profile</h1>
      {user && (
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-600 text-sm">
            <strong>User ID:</strong> {user.id}
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">🎵 My Uploaded Songs</h2>
      {loading ? (
        <p>Loading your songs...</p>
      ) : mySongs.length === 0 ? (
        <p>You haven't uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-3">
          {mySongs.map((song) => (
            <li
              key={song.id}
              className="border p-4 rounded bg-white dark:bg-gray-800 shadow-sm"
            >
              {editingId === song.id ? (
                <>
                  <input
                    className="block mb-2 w-full px-2 py-1 border rounded"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Title"
                  />
                  <input
                    className="block mb-2 w-full px-2 py-1 border rounded"
                    value={editForm.artist}
                    onChange={(e) =>
                      setEditForm({ ...editForm, artist: e.target.value })
                    }
                    placeholder="Artist"
                  />
                  <div className="space-x-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      onClick={() => saveChanges(song.id)}
                    >
                      Save
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-400 text-white rounded text-sm"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                  <div className="mt-2 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      onClick={() => startEditing(song)}
                    >
                      Edit
                    </button>
                    {/* Delete button coming next */}
                    <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProfileScreen;
