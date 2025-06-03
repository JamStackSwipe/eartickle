// SongCard.js – with black base, genre glow, flavor label, and top-left genre badge
// 🚫 DO NOT MODIFY WITHOUT OWNER APPROVAL

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';

const tickleSound = new Audio('/sounds/tickle.mp3');

const genreLabels = {
  country_roots: { name: 'Country & Roots', color: 'bg-yellow-400 text-black' },
  hiphop_flow: { name: 'Hip-Hop & Flow', color: 'bg-gray-500 text-white' },
  rock_raw: { name: 'Rock & Raw', color: 'bg-red-500 text-white' },
  pop_shine: { name: 'Pop & Shine', color: 'bg-pink-500 text-white' },
  spiritual_soul: { name: 'Spiritual & Soul', color: 'bg-purple-500 text-white' },
};

const flavorGlowMap = {
  country_roots: 'shadow-yellow-300 ring-yellow-400',
  hiphop_flow: 'shadow-gray-400 ring-gray-500',
  rock_raw: 'shadow-red-400 ring-red-500',
  pop_shine: 'shadow-pink-300 ring-pink-400',
  spiritual_soul: 'shadow-purple-400 ring-purple-500',
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

  const glowStyle = flavorGlowMap[song.genre_flavor] || '';
  const genreInfo = genreLabels[song.genre_flavor];

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

  const handleBoost = async (amount) => {
    if (!user) return toast.error('Please log in to boost!');
    const { data, error } = await supabase.rpc('spend_tickles', {
      user_id_input: user.id,
      song_id_input: song.id,
      reason: '🎁',
      cost: amount,
    });

    if (error) {
      console.error('Boost failed:', error.message);
      toast.error('Failed to boost this song.');
    } else {
      toast.success(`Boosted with ${amount} Tickles! 🎉`);
    }
  };

  return (
    <div
      ref={cardRef}
      data-song-id={song.id}
      className={`relative w-full max-w-md mx-auto mb-10 p-4 rounded-xl ring-2 ring-offset-2 bg-black ${glowStyle}`}
    >
      {/* Genre Badge */}
      {genreInfo && (
        <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${genreInfo.color}`}>
          {genreInfo.name}
        </div>
      )}

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

      <h2 className="text-xl font-semibold text-white mb-1">{song.title}</h2>
      <p className="text-sm text-gray-300 mb-1">by {song.artist}</p>

      {song.genre_flavor && (
        <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full mb-1 bg-yellow-300 text-black">
          {flavorLabelMap[song.genre_flavor] || 'Unlabeled'}
        </span>
      )}

      {song.genre && (
        <p className="text-xs text-gray-400 mb-2 italic">Genre: {song.genre}</p>
      )}

      {/* Boost Buttons */}
      <div className="flex justify-between gap-2 mb-3">
        {[5, 10, 25].map((amount) => (
          <button
            key={amount}
            onClick={() => handleBoost(amount)}
            className="flex-1 text-sm font-semibold py-1 rounded bg-yellow-500 text-black hover:bg-yellow-600 transition"
          >
            Boost {amount}
          </button>
        ))}
      </div>

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3" />

      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />
    </div>
  );
};

export default SongCard;
