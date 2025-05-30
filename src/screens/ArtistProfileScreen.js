// ✅ ArtistProfileScreen.js (fixed emoji logic + spacing)

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '../components/AuthProvider';

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const { data: uploads } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      const enriched = await Promise.all(
        (uploads || []).map(async (song) => {
          const { data: tickles } = await supabase
            .from('tickles')
            .select('id', { count: 'exact', head: true })
            .eq('song_id', song.id)
            .eq('receiver_id', id);

          return {
            ...song,
            tickle_count: tickles?.length || 0,
          };
        })
      );

      enriched.sort((a, b) => b.tickle_count - a.tickle_count);

      setArtist(profile);
      setSongs(enriched);
      setLoading(false);
    };

    fetchArtist();
  }, [id]);

  const handleAddToJamStack = async (songId) => {
    if (!user || adding) return;
    setAdding(true);

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', songId)
      .maybeSingle();

    if (existing) {
      alert('🛑 Already in your JamStack!');
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: songId,
      },
    ]);

    if (!error) {
      alert('🎵 Added to your JamStack!');
    }
    setAdding(false);
  };

  const handleSendTickle = async (emoji, songId) => {
    if (!user) return alert('Please log in to send Tickles.');
    const session = await supabase.auth.getSession();
    const token = session.data.session.access_token;

    const res = await fetch('/api/send-tickle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artist_id: id, song_id: songId, emoji }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`🎁 You sent a ${emoji} Tickle!`);
    } else {
      alert(`❌ ${data.error}`);
    }
  };

  if (loading) return <div className="p-6">Loading artist page...</div>;
  if (!artist) return <div className="p-6 text-center text-gray-500">Artist not found.</div>;

  const avatarSrc =
    artist.avatar_url?.trim() !== ''
      ? `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/${artist.avatar_url}`
      : '/default-avatar.png';

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex items-center space-x-6 mb-6">
        <img src={avatarSrc} alt="artist avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow" />
        <div>
          <h1 className="text-3xl font-bold">{artist.display_name || 'Unnamed Artist'}</h1>
          <p className="text-gray-600">{artist.bio || 'No bio available.'}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">🎵 Songs by this artist</h2>
      <ul className="space-y-4">
        {songs.map((song) => (
          <li key={song.id} className="bg-gray-100 p-4 rounded shadow">
            <div className="flex items-center space-x-4 mb-2">
              <img src={song.cover} alt="cover" className="w-16 h-16 object-cover rounded" />
              <div>
                <h3 className="text-lg font-semibold">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.artist}</p>
                <div className="text-xs text-gray-600 mt-1">
                  🎁 {song.tickle_count || 0} | 🔥 {song.fires || 0} | ❤️ {song.likes || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
                </div>
              </div>
            </div>

            <audio controls src={song.audio} className="w-full my-2 rounded" />

            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={() => handleSendTickle('💎', song.id)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                🎁 Send a Tickle
              </button>
              <button
                onClick={() => handleAddToJamStack(song.id)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ❤️ Add to JamStack
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistProfileScreen;


// ✅ MyJamsScreen.js already posted above — use that clean version with reactions + SendTickleButton preserved.
