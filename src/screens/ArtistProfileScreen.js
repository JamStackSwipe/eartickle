import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import SendTickleButton from '../components/SendTickleButton';

const ArtistProfileScreen = () => {
  const { id } = useParams(); // artist id
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [reactionsMap, setReactionsMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistAndSongs();
  }, [id]);

  const fetchArtistAndSongs = async () => {
    const [{ data: artistData }, { data: songData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).maybeSingle(),
      supabase.from('songs').select('*').eq('owner_id', id),
    ]);

    if (artistData) setArtist(artistData);
    if (songData) {
      setSongs(songData);
      fetchReactions(songData.map((s) => s.id));
    }

    setLoading(false);
  };

  const fetchReactions = async (songIds) => {
    const { data, error } = await supabase
      .from('reactions')
      .select('song_id, emoji')
      .in('song_id', songIds);

    if (error) {
      console.error('❌ Error fetching reactions:', error);
      return;
    }

    const map = {};
    data.forEach(({ song_id, emoji }) => {
      if (!map[song_id]) map[song_id] = { '❤️': 0, '😢': 0, '🎯': 0, '👁': 0 };
      map[song_id][emoji] = (map[song_id][emoji] || 0) + 1;
    });

    setReactionsMap(map);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {loading ? (
        <p>Loading artist profile...</p>
      ) : !artist ? (
        <p>Artist not found.</p>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1">{artist.display_name || 'Unknown Artist'}</h1>
            <p className="text-sm text-gray-400">{artist.bio || ''}</p>
          </div>

          {songs.length === 0 ? (
            <p>This artist hasn’t uploaded any songs yet.</p>
          ) : (
            <ul className="space-y-4">
              {songs.map((song) => {
                const stats = reactionsMap[song.id] || { '❤️': 0, '😢': 0, '🎯': 0, '👁': 0 };

                return (
                  <li
                    key={song.id}
                    className="bg-gray-900 p-4 rounded-lg shadow space-y-2"
                  >
                    <div className="flex items-center space-x-4">
                      {song.cover && (
                        <img
                          src={song.cover}
                          alt="cover"
                          className="w-20 h-20 object-contain rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold">{song?.title || 'Untitled'}</h2>
                        <p className="text-sm text-gray-400">{song?.artist || 'Unknown Artist'}</p>
                        {song.audio && (
                          <audio controls className="w-full mt-2">
                            <source src={song.audio} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-1 flex gap-3">
                      ❤️ {stats['❤️']} · 😢 {stats['😢']} · 🎯 {stats['🎯']} · 👁 {stats['👁']}
                    </div>

                    <SendTickleButton
                      songId={song.id}
                      songTitle={song.title}
                      artistId={id}
                      artistStripeId={song.stripe_account_id}
                      senderId={song.owner_id}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default ArtistProfileScreen;
