//For A Single Song Page Displays Shared Songs
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import MySongCard from '../components/MySongCard';
import toast from 'react-hot-toast';
import { useUser } from '../components/AuthProvider';

const SongPage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!songId) return;

    const fetchSong = async () => {
      try {
        const { data, error } = await supabase
          .from('songs')
          .select(`
            id,
            title,
            artist,
            user_id,
            artist_id,
            cover,
            audio,
            genre_flavor,
            is_draft,
            views,
            jams,
            song_reactions (emoji, user_id)
          `)
          .eq('id', songId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          toast.error('Song not found');
          navigate('/');
          return;
        }

        // Process reaction stats
        const stats = {};
        data.song_reactions?.forEach(({ emoji }) => {
          stats[emoji] = (stats[emoji] || 0) + 1;
        });

        setSong({
          ...data,
          stats,
          views: data.views || 0,
          jams: data.jams || 0,
        });
        setLoading(false);

        // Increment view count
        await supabase
          .from('songs')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', songId);
      } catch (error) {
        console.error('Fetch song error:', error);
        toast.error('Failed to load song');
        setLoading(false);
      }
    };

    fetchSong();
  }, [songId, navigate]);

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
      <h1 className="text-3xl font-bold text-[#3FD6CD] mb-6 text-center">{song.title}</h1>
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
          stats: song.stats,
          views: song.views,
          jams: song.jams,
        }}
        user={user || null} // Pass null if user is undefined
        stats={song.stats}
      />
    </div>
  );
};

export default SongPage;
