//Works With Profile Page
// src/components/MySongCard.js

import { useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const MySongCard = ({
  song,
  stats = {},
  editableTitle,
  onDelete,
  onPublish,
  showStripeButton,
}) => {
  const [title, setTitle] = useState(song.title);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleSave = async () => {
    const { error } = await supabase
      .from('songs')
      .update({ title })
      .eq('id', song.id);
    if (!error) toast.success('✅ Title updated!');
    else toast.error('❌ Failed to update title.');
    setIsEditing(false);
  };

  const handleBoost = async (amount) => {
    const { error } = await supabase.from('tickles').insert([
      {
        user_id: song.user_id,
        song_id: song.id,
        artist_id: song.artist_id,
        amount,
      },
    ]);
    if (!error) {
      toast.success(`🎁 Boosted with ${amount} Tickles!`);
    } else {
      toast.error('❌ Boost failed');
    }
  };

  return (
    <div className="bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md">
      <img
        src={song.cover}
        alt={song.title}
        className="w-full h-auto rounded-xl mb-4"
      />

      {editableTitle && isEditing ? (
        <div className="mb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded border border-gray-600 text-black"
          />
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={handleTitleSave}
              className="px-2 py-1 text-sm bg-green-600 text-white rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setTitle(song.title);
              }}
              className="px-2 py-1 text-sm bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
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

      <audio src={song.audio} controls className="w-full mb-3" />

      {/* Emoji Stats Row */}
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <div className="flex gap-3">
          <span>🔥 {stats['🔥'] || stats.fires || 0}</span>
          <span>💖 {stats['💖'] || stats.loves || 0}</span>
          <span>😭 {stats['😭'] || stats.sads || 0}</span>
          <span>🎯 {stats['🎯'] || stats.bullseyes || 0}</span>
        </div>
        <div className="flex gap-3">
          <span>👁️ {stats.views || 0}</span>
          <span>📥 {stats.jam_saves || 0}</span>
        </div>
      </div>

      {/* Boost + Delete Inline Row */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <button
            onClick={() => handleBoost(5)}
            className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-full"
          >
            🎁 Boost (5)
          </button>
          <button
            onClick={() => handleBoost(10)}
            className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-full"
          >
            🔥 Mega (10)
          </button>
          <button
            onClick={() => handleBoost(25)}
            className="px-2 py-1 text-xs bg-pink-600 hover:bg-pink-700 text-white rounded-full"
          >
            🚀 Super (25)
          </button>
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

      {/* Optional Actions */}
      {onPublish && (
        <button
          onClick={onPublish}
          className="w-full mt-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded"
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
