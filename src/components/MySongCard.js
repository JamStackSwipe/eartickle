// src/components/MySongCard.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const tickleSound = new Audio('/sounds/tickle.mp3');

const MySongCard = ({ song, user }) => {
  const [localSong, setLocalSong] = useState(song); // Local state to track updates
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLocalSong(song); // Update local state when prop changes
  }, [song]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isVisible) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isVisible]);

  const flavor = genreFlavorMap[localSong.genre_flavor] || null;
  const ringClass = flavor ? `ring-4 ring-${flavor.color}-500` : '';
  const glowColor = flavor ? getGlowColor(flavor.color) : 'white';

  const getGlowColor = (color) => {
    switch (color) {
      case 'amber': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'pink': return '#ec4899';
      case 'purple': return '#a855f7';
      case 'cyan': return '#06b6d4';
      case 'red': return '#ef4444';
      case 'lime': return '#a3e635';
      default: return '#ffffff';
    }
  };

  // ... (rest of the handleReaction and helper functions remain unchanged)

  return (
    <div
      ref={cardRef}
      data-song-id={localSong.id}
      className={`bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md transition-all ${flavor ? 'hover:animate-genre-pulse' : ''}`}
      style={flavor ? { boxShadow: `0 0 15px ${glowColor}` } : {}}
    >
      <div className="relative">
        <a href={`/artist/${localSong.artist_id}`}>
          <img
            src={localSong.cover}
            alt={localSong.title}
            className="w-full h-auto rounded-xl mb-4"
          />
        </a>
        {flavor && (
          <div className={`absolute top-2 left-2 bg-${flavor.color}-600 text-white text-xs font-bold px-2 py-1 rounded shadow`}>
            {flavor.label}
          </div>
        )}
      </div>
      <h2 className="text-xl font-semibold mb-1">{localSong.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {localSong.artist}</p>
      {user && (
        <div className="mt-3 flex justify-center">
          <BoostTickles songId={localSong.id} userId={user.id} />
        </div>
      )}
      <audio ref={audioRef} src={localSong.audio} controls className="w-full mb-3 mt-2" />
      <ReactionStatsBar song={localSong} />
    </div>
  );
};

export default MySongCard;
