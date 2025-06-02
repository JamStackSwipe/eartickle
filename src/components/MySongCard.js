import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';

const MySongCard = ({
  song,
  stats = {},
  editableTitle = false,
  onDelete,
  onPublish,
  showStripeButton = false
}) => {
  const [title, setTitle] = useState(song.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [saving, setSaving] = useState(false);

  const audioRef = useRef(null);
  const cardRef = useRef(null);

  const saveTitle = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('songs')
      .update({ title })
      .eq('id', song.id);
    setSaving(false);
    if (error) {
      toast.error('Failed to save title');
    } else {
      toast.success('Title updated!');
      setEditingTitle(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md"
    >
      {/* Cover art */}
      <a
        href={`/artist/${song.artist_id}`}
        onClick={(e) => {
          e.preventDefault();
          window.location.href = `/artist/${song.artist_id}`;
        }}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
        />
      </a>

      {/* Title + Edit */}
      {editableTitle && editingTitle ? (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg bg-zinc-800 border border-gray-500 rounded px-2 py-1 w-full"
          />
          <button
            onClick={saveTitle}
            disabled={saving}
            className="px-2 py-1 text-sm bg-blue-600 rounded hover:bg-blue-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setEditingTitle(false)} className="text-gray-400">✖️</button>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold">{title}</h2>
          {editableTitle && (
            <button onClick={() => setEditingTitle(true)} className="text-sm text-blue-400">✏️</button>
          )}
        </div>
      )}

      {/* Artist label */}
      <p className="text-sm text-gray-400 mb-2">by You</p>

      {/* Audio */}
      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3" />

      {/* Reaction stats */}
      <ReactionStatsBar song={song} stats={stats} />

      {/* Boost */}
      <div className="mt-3">
        <BoostTickles songId={song.id} userId={song.artist_id} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mt-4">
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑 Delete
          </button>
        )}
        {onPublish && (
          <button
            onClick={onPublish}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            🚀 Publish Draft
          </button>
        )}
        {showStripeButton && (
          <a
            href="/settings"
            className="px-3 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-600"
          >
            💵 Connect Stripe
          </a>
        )}
      </div>
    </div>
  );
};

export default MySongCard;
