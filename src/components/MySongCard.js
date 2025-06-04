// src/components/MySongCard.js

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const MySongCard = ({
  song,
  user,
  editableTitle = false,
  onDelete,
}) => {
  const [title, setTitle] = useState(song.title);
  const [isEditing, setIsEditing] = useState(false);

  const [localReactions, setLocalReactions] = useState({
    fires: song.fires || 0,
    loves: song.loves || 0,
    sads: song.sads || 0,
    bullseyes: song.bullseyes || 0,
  });
  const [jamsCount, setJamsCount] = useState(song.jams || 0);
  const [hasReacted, setHasReacted] = useState({});

  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const flavor = genreFlavorMap[song.genre_flavor] || null;
  const ringClass = flavor ? `ring-4 ring-${flavor.color}-500` : '';

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

  useEffect(() => {
    const fetchStats = async () => {
      const [emojiStats, reactionFlags] = await Promise.all([
        supabase.from('songs')
          .select('fires, loves, sads, bullseyes, jams')
          .eq('id', song.id)
          .single(),
        user
          ? supabase
              .from('reactions')
              .select('emoji')
              .eq('user_id', user.id)
              .eq('song_id', song.id)
          : { data: [] },
      ]);

      if (emojiStats.data) {
        setLocalReactions({
          fires: emojiStats.data.fires || 0,
          loves: emojiStats.data.loves || 0,
          sads: emojiStats.data.sads || 0,
          bullseyes: emojiStats.data.bullseyes || 0,
        });
        setJamsCount(emojiStats.data.jams || 0);
      }

      if (reactionFlags.data) {
        const flags = {};
        for (const r of reactionFlags.data) {
          const key = emojiToStatKey(emojiToSymbol(r.emoji));
          flags[key] = true;
        }
        setHasReacted(flags);
      }
    };

    fetchStats();
  }, [user, song.id]);

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
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

  return (
    <div
      ref={cardRef}
      data-song-id={song.id}
      className={`bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md transition-all ${flavor ? 'hover:animate-genre-pulse' : ''}`}
      style={flavor ? { boxShadow: `0 0 15px ${getGlowColor(flavor.color)}` } : {}}
    >
      <div className="relative">
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
        <div className="flex justify-between items-center mb-1">
          <h2
            className="text-xl font-semibold cursor-pointer"
            onClick={() => editableTitle && setIsEditing(true)}
          >
            {title}
          </h2>
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
      )}

      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3 mt-2" />

      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />

      {user && (
        <div className="mt-3 flex justify-center">
          <BoostTickles
            songId={song.id}
            userId={user.id}
            onBoosted={() => {
              const tickleStatBar = document.querySelector(`[data-song-id="${song.id}"]`);
              if (tickleStatBar) {
                const event = new CustomEvent('boosted', { detail: { songId: song.id } });
                tickleStatBar.dispatchEvent(event);
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

const emojiToStatKey = (emoji) => {
  switch (emoji) {
    case '🔥': return 'fires';
    case '💖': return 'loves';
    case '😭': return 'sads';
    case '🎯': return 'bullseyes';
    default: return '';
  }
};

const emojiToSymbol = (word) => {
  switch (word) {
    case 'fire': return '🔥';
    case 'heart': return '💖';
    case 'cry': return '😭';
    case 'bullseye': return '🎯';
    default: return '';
  }
};

export default MySongCard;
