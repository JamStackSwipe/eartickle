// screens/SongPage.js – Neon migration (Next.js navigation + API fetch)
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MySongCard from '../components/MySongCard';
import toast from 'react-hot-toast';
import { useUser } from '../components/AuthProvider';

const SongPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser() || {};
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const songId = params.id;

  useEffect(() => {
    if (!songId) return;
    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${songId}`);
        const { data, error } = await res.json();
        if (!res.ok || error) throw new Error(error || 'Song not found');
        const stats = {};
        data.song_reactions?.forEach(({ emoji }) => {
          stats[emoji] = (stats[emoji] || 0) + 1;
        });
        setSong({
          ...data,
          stats,
          views: data.views || 0,
          jams: data.jams || 0,
          is_own_song: user ? data.user_id === user.id : false,
        });
        setLoading(false);
        // Increment view
        await fetch(`/api/songs/${songId}/view`, { method: 'POST' });
      } catch (error) {
        console.error('Fetch song error:', error);
        toast.error('Failed to load song');
        router.push('/');
        setLoading(false);
      }
    };
    fetchSong();
  }, [songId, router, user]);

  const handleBack = () => {
    router.push(user ? '/profile' : '/');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-[#3FD6CD] text-lg">Loading...</p>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="p-6 max-w-2xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Song not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-gradient-to-b from-gray-100 to-gray-200 min-h-screen">
      <div className="flex items-center mb-4">
        <button
          onClick={handleBack}
          className="px-3 py-1 text-sm rounded-full font-semibold transition bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          ← Back
        </button>
      </div>
      <h1 className="text-3xl font-bold text-[#3FD6CD] mb-4 text-center">{song.title}</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">by {song.artist}</p>
      <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition duration-300">
        <MySongCard
          song={{
            id: song.id,
            title: song.title,
            artist: song.artist,
            user_id: song.user_id,
            artist_id: song.artist_id,
            cover: song.cover,
            audio: song.audio,
            genre_flavor: song.genre_flavor,
            is_draft: song.is_draft,
            is_own_song: song.is_own_song,
            stats: song.stats,
            views: song.views,
            jams: song.jams,
          }}
          user={user || null}
          stats={song.stats}
        />
      </div>
    </div>
  );
};

export default SongPage;
