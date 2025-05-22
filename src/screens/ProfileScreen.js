
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();

  const [mySongs, setMySongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '' });

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
      setMySongs((prev) =>
        prev.map((song) =>
          song.id === id ? { ...song, ...editForm } : song
        )
      );
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

      {user && (
        <div className="mb-8">
          <p className="text-gray-300">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-500 text-sm">
            <strong>User ID:</strong> {user.id}
          </p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4">🎵 My Uploaded Songs</h2>

      {loading ? (
        <p>Loading your songs...</p>
      ) : mySongs.length === 0 ? (
        <p className="text-gray-400">You haven't uploaded any songs yet.</p>
      ) : (
        <ul className="space-y-4">
          {mySongs.map((song) => (
            <li
              key={song.id}
              className="bg-gray-900 p-4 rounded-lg shadow-sm"
            >
              {editingId === song.id ? (
                <>
                  <input
                    className="block mb-2 w-full px-2 py-1 bg-gray-800 text-white border border-gray-700 rounded"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    placeholder="Title"
                  />
                  <input
                    className="block mb-2 w-full px-2 py-1 bg-gray-800 text-white border border-gray-700 rounded"
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
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.artist}</p>
                  <div className="mt-3 space-x-2">
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                      onClick={() => startEditing(song)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                      // TODO: Hook up delete logic here
                    >
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
