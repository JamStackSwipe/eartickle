// src/screens/ProfileScreen.js
import { useEffect, useState } from 'react';
import { useUser } from '../components/AuthProvider';
import { supabase } from '../supabase';
import { genreFlavorMap } from '../utils/genreList';

const ProfileScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [editSongId, setEditSongId] = useState(null);
  const [newCover, setNewCover] = useState(null);
  const [newGenre, setNewGenre] = useState('');

  useEffect(() => {
    if (user) {
      fetchSongs();
    }
  }, [user]);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .neq('is_draft', true);
    if (error) console.error('Error fetching songs:', error);
    else setSongs(data || []);
  };

  const handleEdit = (songId) => {
    setEditSongId(songId);
    const song = songs.find(s => s.id === songId);
    setNewGenre(song.genre_flavor || '');
  };

  const handleSave = async (songId) => {
    const song = songs.find(s => s.id === songId);
    let coverUrl = song.cover;

    if (newCover) {
      const fileName = `${Date.now()}-${newCover.name}`;
      const { error: uploadError } = await supabase.storage
        .from('covers')
        .upload(`public/covers/${fileName}`, newCover);
      if (!uploadError) {
        coverUrl = `https://auth.eartickle.com/storage/v1/object/public/covers/${fileName}`;
      } else {
        console.error('Cover upload error:', uploadError);
        return;
      }
    }

    const { error } = await supabase
      .from('songs')
      .update({ cover: coverUrl, genre_flavor: newGenre })
      .eq('id', songId);
    if (error) console.error('Update error:', error);
    else {
      setEditSongId(null);
      setNewCover(null);
      fetchSongs(); // Refresh the list
    }
  };

  const handleCancel = () => {
    setEditSongId(null);
    setNewCover(null);
    setNewGenre('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ color: '#3FD6CD' }}>My Songs</h1>
      {songs.map((song) => (
        <div key={song.id} className="mb-4 p-4 bg-white rounded-lg shadow-md">
          <img src={song.cover} alt={song.title} className="w-32 h-32 object-cover mb-2 rounded" />
          <h2 className="text-xl font-semibold">{song.title}</h2>
          <p className="text-gray-600">Genre: {song.genre_flavor}</p>
          {editSongId === song.id ? (
            <div className="mt-2">
              <input
                type="file"
                onChange={(e) => setNewCover(e.target.files[0])}
                className="mb-2"
              />
              <select
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="p-2 border rounded"
              >
                {Object.keys(genreFlavorMap).map((genre) => (
                  <option key={genre} value={genre}>
                    {genreFlavorMap[genre].label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleSave(song.id)}
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEdit(song.id)}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProfileScreen;
