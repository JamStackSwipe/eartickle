import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

const reactionEmojis = ['🔥', '❤️', '😢', '🎯'];

const SwipeScreen = () => {
  const { user } = useUser();
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adding, setAdding] = useState(false);
  const [artistProfile, setArtistProfile] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data.length > 0) {
      setSongs(data);
      incrementViews(data[0].id);
      fetchArtistProfile(data[0].user_id);
    }
  };

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_views', { song_id: songId });
  };

  const fetchArtistProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (!error) {
      setArtistProfile(data);
    } else {
      setArtistProfile(null);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setCurrentIndex(nextIndex);
      incrementViews(songs[nextIndex].id);
      fetchArtistProfile(songs[nextIndex].user_id);
    }
  };

  const handleAddToJamStack = async () => {
    if (!user || adding) return;

    setAdding(true);
    const currentSong = songs[currentIndex];

    if (!currentSong?.id) {
      alert("⚠️ Invalid song selected.");
      setAdding(false);
      return;
    }

    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', currentSong.id)
      .maybeSingle();

    if (existing) {
      alert('🛑 This song is already in your JamStack.');
      setAdding(false);
      return;
    }

    const { error } = await supabase.from('jamstacksongs').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
      },
    ]);

    if (error) {
      alert('❌ Failed to add song to your JamStack');
      console.error('JamStack insert error:', error);
    } else {
      alert('🎵 Added to your JamStack!');
    }

    setAdding(false);
  };

  const handleReact = async (emoji) => {
    const currentSong = songs[currentIndex];
    if (!user || !currentSong?.id) return;

    const { error } = await supabase.from('reactions').insert([
      {
        id: uuidv4(),
        user_id: user.id,
        song_id: currentSong.id,
        emoji: emoji,
      },
    ]);

    if (error) {
      console.error('❌ Reaction insert error:', error);
    } else {
      console.log(`✅ Reaction ${emoji} recorded for song ${currentSong.id}`);

      // TODO: Play sound effect here:
      // playReactionSound(emoji);
    }
  };

  if (songs.length === 0) {
    return <div className="text-center mt-10 text-gray-500">No songs to swipe yet.</div>;
  }

  const song = songs[currentIndex];

  return (
    <div className="w-full max-w-md mx-auto mt-6 p-4 sm:p-6 bg-white shadow-lg rounded text-center">
      {/* Artist info */}
      {artistProfile && (
        <div className="flex items-center justify-center space-x-2 mb-3">
          <a
            href={`/artist/${song.user_id}`}
            className="flex items-center space-x-2 hover:underline"
          >
            <img
              src={artistProfile.avatar_url || '/default-avatar.png'}
              alt="artist"
              className="w-8 h-8 rounded-full object-cover border border-black"
            />
            <span className="text-sm font-semibold text-black">
              {artistProfile.display_name || 'Unknown Artist'}
            </span>
          </a>
        </div>
      )}

      {/* Song details */}
      <h2 className="text-2xl font-bold mb-2">{song.title}</h2>
      <img
        src={song.cover}
        alt="cover"
        className="w-full h-48 sm:h-64 object-cover rounded mb-4"
      />
      <p className="text-lg font-semibold">{song.artist}</p>
      <p className="text-sm italic text-gray-500">{song.genre}</p>
      <audio controls src={song.audio} className="w-full mt-4 mb-2" />

      {/* Reactions */}
      <div className="flex justify-center gap-4 mt-4 text-2xl">
        {reactionEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className="hover:scale-125 transition-transform duration-150"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <button
          onClick={handleAddToJamStack}
          disabled={adding}
          className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          ❤️ Add to JamStack
        </button>
        <button
          onClick={handleNext}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ⏭️ Next
        </button>
      </div>
    </div>
  );
};

export default SwipeScreen;
