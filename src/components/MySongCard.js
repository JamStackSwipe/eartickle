// MySongCard.js - now with editable title saving, artist link, and delete undo
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';

const emojiIcons = {
  '🔥': '🔥',
  '💖': '💖',
  '😭': '😭',
  '🎯': '🎯',
  views: '👁️',
  jamstack: '➕'
};

const MySongCard = ({
  song,
  stats = {},
  compact = false,
  editable = false,
  onDelete,
  onDeleteWithConfirm = false,
  onPublish,
  showStripeButton = false,
}) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(song.title || '');
  const fileInputRef = useRef();
  const isDraft = song.is_draft;

  useEffect(() => {
    if (confirmDelete) {
      const timeout = setTimeout(() => {
        if (fadeOut && onDelete) onDelete(song.id);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [confirmDelete, fadeOut]);

  const handleDelete = () => {
    if (onDeleteWithConfirm) {
      setFadeOut(true);
      setConfirmDelete(true);
    } else if (onDelete) {
      onDelete(song.id);
    }
  };

  const handleUndo = () => {
    setFadeOut(false);
    setConfirmDelete(false);
  };

  const handleCoverClick = () => {
    if (editable) fileInputRef.current?.click();
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const path = `covers/${song.id}.jpg`;
    await supabase.storage.from('covers').upload(path, file, { upsert: true });
    const { data } = supabase.storage.from('covers').getPublicUrl(path);
    const newUrl = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from('songs').update({ cover: newUrl }).eq('id', song.id);
    window.location.reload();
  };

  const handleTitleSave = async () => {
    if (title.trim() !== song.title) {
      await supabase.from('songs').update({ title: title.trim() }).eq('id', song.id);
    }
  };

  const coverImage = (
    <div className="relative" onClick={handleCoverClick}>
      <img
        src={song.cover || '/default-cover.png'}
        alt="cover"
        className={`rounded ${compact ? 'w-16 h-16' : 'w-24 h-24'} object-cover cursor-pointer`}
      />
      {editable && (
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
          📷
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleCoverUpload}
        hidden
      />
    </div>
  );

  return (
    <div
      className={`flex items-center gap-4 border p-3 rounded shadow-sm relative transition-all duration-500 ${
        fadeOut ? 'opacity-30 blur-sm' : 'opacity-100'
      }`}
    >
      {onDeleteWithConfirm && !editable ? (
        <Link to={`/artist/${song.artist_id}`}>{coverImage}</Link>
      ) : (
        coverImage
      )}

      <div className="flex-1">
        {editable ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            className="text-lg font-semibold w-full border-b"
          />
        ) : (
          <div className="text-lg font-semibold">{song.title}</div>
        )}

        {/* Simple Emoji Stats Bar */}
        <div className="flex gap-3 text-sm mt-1 text-gray-600">
          {Object.entries(emojiIcons).map(([key, icon]) => (
            <div key={key} className="flex items-center gap-1">
              <span>{icon}</span>
              <span>{stats[key] || 0}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-2 flex gap-3 flex-wrap">
          {editable && isDraft && (
            <button
              onClick={() => onPublish?.(song.id)}
              className="text-sm bg-yellow-500 text-white px-3 py-1 rounded"
            >
              Publish
            </button>
          )}

          {editable && showStripeButton && (
            <button
              className="text-sm bg-purple-600 text-white px-3 py-1 rounded"
              onClick={() => window.location.href = '/settings'}
            >
              Enable Rewards
            </button>
          )}

          {(onDelete || onDeleteWithConfirm) && !confirmDelete && (
            <button
              onClick={handleDelete}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          )}

          {confirmDelete && (
            <button
              onClick={handleUndo}
              className="text-sm text-red-600 underline font-medium"
            >
              Undo Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySongCard;
