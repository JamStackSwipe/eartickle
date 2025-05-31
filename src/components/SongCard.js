import React, { useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useUser } from './AuthProvider';
import { supabase } from '../supabase';
import AddToJamStackButton from './AddToJamStackButton';

const SongCard = ({ song }) => {
  const { user } = useUser();
  const audioRef = useRef(null);

  const incrementViews = async (songId) => {
    await supabase.rpc('increment_song_view', { song_id_input: songId });
  };

  const playSound = (file) => {
    const sound = new Audio(`/sounds/${file}`);
    sound.play();
  };

  const handleSwipe = async (direction) => {
    if (!user) return;

    if (direction === 'Right') {
      // Try to add to JamStack
      const { data: existing, error } = await supabase
        .from('jamstacksongs')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', song.id);

      if (!error && existing.length === 0) {
        await supabase.from('jamstacksongs').insert([
          { user_id: user.id, song_id: song.id },
        ]);
        playSound('add.mp3');
        alert('✅ Added To My Jams');
      } else {
        alert('✅ Already In My Jams. Keep Scrolling!');
      }
    } else if (direction === 'Left') {
      playSound('meh.mp3');
      alert('🙃 Meh');
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe('Left'),
    onSwipedRight: () => handleSwipe('Right'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className="bg-zinc-900 rounded-xl shadow-md p-4 mb-8"
    >
      <a href={`/artist/${song.artist_id}`}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
          onClick={() => incrementViews(song.id)}
        />
      </a>
      <h2 className="text-xl font-semibold text-white mb-1">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
      <audio
        ref={audioRef}
        src={song.audio}
        controls
        className="w-full mb-2"
        onPlay={() => incrementViews(song.id)}
      />
      <div className="flex justify-center">
        <AddToJamStackButton songId={song.id} />
      </div>
      <div className="text-xs text-gray-400 mt-2 text-center">
        👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
      </div>
    </div>
  );
};

export default SongCard;
