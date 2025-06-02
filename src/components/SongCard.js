import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';

const tickleSound = new Audio('/sounds/tickle.mp3');

const flavorGlowMap = {
  country_roots: 'ring-yellow-400',
  hiphop_flow: 'ring-gray-500',
  rock_raw: 'ring-red-500',
  pop_shine: 'ring-pink-400',
  spiritual_soul: 'ring-purple-500',
};

const flavorLabelMap = {
  country_roots: 'Country & Roots 🤠',
  hiphop_flow: 'Hip-Hop & Flow 🎤',
  rock_raw: 'Rock & Raw 🎸',
  pop_shine: 'Pop & Shine ✨',
  spiritual_soul: 'Spiritual & Soul ✝️',
};

const SongCard = ({ song, user }) => {
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
      incrementViews();
    } else {
      audioRef.current.pause();
    }
  }, [isVisible]);

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-lg bg-zinc-900 text-white ring-2 ring-offset-2 ${
        flavorGlowMap[song.genre_flavor] || ''
      }`}
    >
      <a
        href={`/artist/${song.artist_id}`}
        onClick={(e) => {
          e.preventDefault();
          incrementViews().finally(() => {
            window.location.href = `/artist/${song.artist_id}`;
          });
        }}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
        />
      </a>

      <h2 className="text-xl font-semibold mb-1">{song.title}</h2>
      <p className="text-sm text-gray-300 mb-1">by {song.artist}</p>

      {song.genre_flavor && (
        <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-1 bg-yellow-300 text-black">
          {flavorLabelMap[song.genre_flavor] || 'Unlabeled'}
        </span>
      )}

      {song.genre && (
        <p className="text-xs text-gray-400 mb-2 italic">
          Genre: {song.genre}
        </p>
      )}

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3" />
      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />
    </div>
  );
};

export default SongCard;
