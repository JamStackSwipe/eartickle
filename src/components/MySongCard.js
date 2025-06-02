import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const emojiStats = ['🔥', '💖', '😢', '🎯'];

const MySongCard = ({
  song,
  stats = {},
  onDelete,
  onEditCover,
  onPublish
}) => {
  const {
    id,
    title,
    cover,
    is_draft,
    artist_id,
  } = song;

  const views = stats[id]?.views || 0;
  const jamSaves = stats[id]?.jam_saves || 0;

  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 mb-3 shadow">
      <div className="flex items-center gap-3">
        <Link to={`/artist/${artist_id || ''}`} className="relative w-16 h-16 block group">
          <img
            src={cover || '/default-cover.png'}
            alt={title}
            className="w-16 h-16 object-cover rounded group-hover:opacity-80 transition"
          />
          {onEditCover && (
            <div
              onClick={(e) => {
                e.preventDefault();
                onEditCover(id);
              }}
              className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded cursor-pointer"
            >
              📷
            </div>
          )}
        </Link>

        <div>
          <div className="font-semibold text-white">{title}</div>
          {is_draft && (
            <button
              onClick={() => onPublish?.(id)}
              className="mt-1 text-xs bg-yellow-400 text-black px-2 py-0.5 rounded hover:bg-yellow-500"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {emojiStats.map((emoji) => (
          <span key={emoji} className="text-sm text-white flex items-center gap-1">
            {emoji}
            <span className="text-gray-300">{stats[id]?.[emoji] || 0}</span>
          </span>
        ))}
        <span className="text-sm text-white">👁️ {views}</span>
        <span className="text-sm text-white">📥 {jamSaves}</span>
        {onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="ml-2 text-red-400 text-sm hover:text-red-600"
          >
            ❌
          </button>
        )}
      </div>
    </div>
  );
};

export default MySongCard;
