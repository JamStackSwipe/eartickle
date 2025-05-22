import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';

const socialLinks = [
  { field: 'website', label: 'Website', icon: '🌐' },
  { field: 'spotify', label: 'Spotify', icon: '🎵' },
  { field: 'youtube', label: 'YouTube', icon: '🎬' },
  { field: 'instagram', label: 'Instagram', icon: '📷' },
  { field: 'soundcloud', label: 'SoundCloud', icon: '🎶' },
  { field: 'tiktok', label: 'TikTok', icon: '💬' },
  { field: 'bandlab', label: 'BandLab', icon: '🧪' },
];

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const fetchArtistData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('❌ Error loading profile:', profileError);
        return;
      }
      setProfile(profileData);

      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (songsError) {
        console.error('❌ Error loading songs:', songsError);
        return;
      }
      setSongs(songsData);
    };

    fetchArtistData();
  }, [id]);

  if (!profile) {
    return <div className="p-6 text-white">Loading artist...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-xl mx-auto text-center">
        {profile.avatar_url && (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
          />
        )}
        <h1 className="text-3xl font-bold">{profile.display_name || 'Unknown Artist'}</h1>
        <p className="text-gray-400 mt-2">{profile.bio}</p>

        {/* Social links */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {socialLinks.map(({ field, label, icon }) =>
            profile[field] ? (
              <a
                key={field}
                href={profile[field]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm bg-white text-black px-3 py-1 rounded shadow hover:bg-gray-200 transition"
              >
                {icon} {label}
              </a>
            ) : null
          )}
        </div>
      </div>

      <div className="mt-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">🎵 Songs by {profile.display_name}</h2>
        {songs.length === 0 ? (
          <p className="text-gray-500 text-center">This artist hasn’t uploaded any songs yet.</p>
        ) : (
          <ul className="space-y-4">
            {songs.map((song) => (
              <li
                key={song.id}
                className="bg-gray-900 p-4 rounded-lg shadow flex items-center space-x-4"
              >
                {song.cover && (
                  <img
                    src={song.cover}
                    alt="cover"
                    className="w-20 h-20 object-contain rounded"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{song.title}</h3>
                  <p className="text-sm text-gray-400">{song.genre || 'Unknown Genre'}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ArtistProfileScreen;
