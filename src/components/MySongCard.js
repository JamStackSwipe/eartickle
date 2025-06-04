// works with profile page
// src/components/MySongCard.js

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import AddToJamStackButton from './AddToJamStackButton';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const MySongCard = ({
  song,
  user,
  editableTitle = false,
  onDelete,
  onPublish,
  showStripeButton,
}) => {
  const [title, setTitle] = useState(song.title);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({});
  const audioRef = useRef(null);
  const cardRef = useRef(null);

  const flavor = genreFlavorMap[song.genre_flavor] || null;
  const getGlowColor = (color) => {
    switch (color) {
      case 'amber': return '#f59e0b';
      case 'blue': return '#3b82f6';
      case 'pink': return '#ec4899';
      case 'purple': return '#a855f7';
      case 'cyan': return '#06b6d4';
      case 'red': return '#ef4444';
      default: return '#ffffff';
    }
  };

  const handleTitleSave = async () => {
    const { error } = await supabase
      .from('songs')
      .update({ title })
      .eq('id', song.id);
    if (!error) {
      toast.success('✅ Title updated!');
      setIsEditing(false);
    } else {
      toast.error('❌ Failed to update title.');
    }
  };

  const handleBoost = async (amount) => {
    const { error } = await supabase.from('tickles').insert([
      {
        user_id: song.user_id,
        song_id: song.id,
        artist_id: song.artist_id,
        amount,
        emoji: 'boost',
      },
    ]);
    if (!error) {
      toast.success(`🎁 Boosted with ${amount} Tickles!`);
      const event = new Event('ticklesUpdated');
      window.dispatchEvent(event);
    } else {
      toast.error('❌ Boost failed');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('fires, loves, sads, bullseyes, views, jams')
        .eq('id', song.id)
        .single();
      if (data) setStats(data);
    };
    fetchStats();
  }, [song.id]);

  return (
    <div
      ref={cardRef}
      className={`bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md transition-all ${flavor ? 'hover:animate-genre-pulse' : ''}`}
      style={flavor ? { boxShadow: `0 0 15px ${getGlowColor(flavor.color)}` } : {}}
    >
      <div className="relative">
        <a href={`/artist/${song.artist_id}`}>
          <img
            src={song.cover}
            alt={song.title}
            className="w-full h-auto rounded-xl mb-4"
          />
        </a>
        {flavor && (
          <div className={`absolute top-2 left-2 bg-${flavor.color}-600 text-white text-xs font-bold px-2 py-1 rounded shadow`}>
            {flavor.label}
          </div>
        )}
      </div>

      {editableTitle && isEditing ? (
        <div className="mb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 text-black"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={handleTitleSave} className="px-2 py-1 text-sm bg-green-600 text-white rounded">Save</button>
            <button onClick={() => { setIsEditing(false); setTitle(song.title); }} className="px-2 py-1 text-sm bg-gray-500 text-white rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <h2
          className="text-xl font-semibold mb-1 cursor-pointer"
          onClick={() => editableTitle && setIsEditing(true)}
        >
          {title}
        </h2>
      )}

      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3 mt-2" />

      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />

      {/* Boost + Delete Row */}
      <div className="flex justify-between items-center mt-4 mb-2">
        <div className="flex gap-2">
          <button onClick={() => handleBoost(5)} className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full">🎁 Boost (5)</button>
          <button onClick={() => handleBoost(10)} className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-full">🔥 Mega (10)</button>
          <button onClick={() => handleBoost(25)} className="px-2 py-1 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded-full">🚀 Super (25)</button>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 text-xl"
            title="Delete song"
          >
            🗑️
          </button>
        )}
      </div>

      {onPublish && (
        <button
          onClick={onPublish}
          className="w-full mt-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded"
        >
          🚀 Publish Draft
        </button>
      )}

      {showStripeButton && (
        <a
          href="/settings"
          className="block text-center w-full mt-2 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
        >
          💸 Accept Rewards
        </a>
      )}
    </div>
  );
};

export default MySongCard;
