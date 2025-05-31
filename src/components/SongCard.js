import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import AddToJamStackButton from './AddToJamStackButton';
import SendTickleButton from './SendTickleButton';
import { useUser } from './AuthProvider';

const SongCard = ({ song }) => {
  const { user } = useUser();
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isVisible && !manuallyPaused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isVisible, manuallyPaused]);

  const handleManualPause = () => {
    setManuallyPaused(true);
  };

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  return (
    <div ref={cardRef} className="bg-zinc-900 rounded-xl shadow-md p-4 mb-10">
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
        className="w-full"
        onPlay={() => incrementViews(song.id)}
        onPause={handleManualPause}
      />
      <div className="flex flex-col items-center gap-2 mt-4">
        <AddToJamStackButton songId={song.id} />
        <SendTickleButton song={song} />
      </div>
      <div className="text-xs text-gray-400 mt-2 text-center">
        👁️ {song.views || 0} | 🎧 {song.jams || 0} | 🔥 {song.fires || 0} | ❤️ {song.loves || 0} | 😢 {song.sads || 0} | 🎯 {song.bullseyes || 0}
      </div>
    </div>
  );
};

export default SongCard;
