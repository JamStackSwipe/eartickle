// src/components/MySongCard.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const tickleSound = new Audio('/sounds/tickle.mp3');

const MySongCard = ({ song, user, stats, onDelete, onPublish, editableTitle, showStripeButton, isEditing, onEdit, onSaveEdit, onCancelEdit }) => {
  const [localSong, setLocalSong] = useState(song);
  const [newCover, setNewCover] = useState(null);
  const [newGenre, setNewGenre] = useState(song.genre_flavor || '');
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLocalSong(song);
    setNewGenre(song.genre_flavor || '');
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

  const handleReaction = async (emoji) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('reactions').insert({
        song_id: localSong.id,
        user_id: user.id,
        emoji: emoji === 'fire' ? '🔥' : emoji === 'heart' ? '❤️' : emoji === 'cry' ? '😢' : '🎯',
      });
      if (error) throw error;
      tickleSound.play().catch(() => {});
      // Update stats locally (optimistic update)
      setLocalSong((prev) => ({
        ...prev,
        [emoji === 'fire' ? 'fires' : emoji === 'heart' ? 'loves' : emoji === 'cry' ? 'sads' : 'bullseyes']:
          (prev[emoji === 'fire' ? 'fires' : emoji === 'heart' ? 'loves' : emoji === 'cry' ? 'sads' : 'bullseyes'] || 0) + 1,
      }));
    } catch (error) {
      console.error('Reaction Error:', error);
    }
  };

  if (isEditing) {
    return (
      <div
        ref={cardRef}
        className={`bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md`}
      >
        <div className="relative">
          <img
            src={localSong.cover}
            alt={localSong.title}
            className="w-full h-auto rounded-xl mb-4"
          />
          <input
            type="file"
            onChange={(e) => setNewCover(e.target.files[0])}
            className="mb-2"
          />
          <select
            value={newGenre}
            onChange={(e) => setNewGenre(e.target.value)}
            className="p-2 border rounded w-full"
          >
            {Object.keys(genreFlavorMap).map((genre) => (
              <option key={genre} value={genre}>
                {genreFlavorMap[genre].label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSaveEdit(newCover, newGenre)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={onCancelEdit}
            className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

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
      {editableTitle && user && user.id === localSong.user_id && (
        <button
          onClick={onDelete}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      )}
      {onPublish && (
        <button
          onClick={onPublish}
          className="mt-2 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Publish
        </button>
      )}
      {showStripeButton && (
        <a
          href="https://connect.stripe.com/express/oauth/authorize?client_id=ca_N4z8G7vXvGq9o9z5dQvQ7z3zQvQvQvQv&state=xyz123&stripe_user[email]=user@example.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 ml-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 inline-block"
        >
          Connect Stripe
        </a>
      )}
      <audio ref={audioRef} src={localSong.audio} controls className="w-full mb-3 mt-2" />
      <ReactionStatsBar song={localSong} stats={stats} onReaction={handleReaction} />
    </div>
  );
};

export default MySongCard;
