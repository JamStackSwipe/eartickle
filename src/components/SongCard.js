// src/components/SongCard.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const tickleSound = new Audio('/sounds/tickle.mp3');

const SongCard = ({ song, user }) => {
  if (song.is_draft || !song.cover || !song.audio) {
    return null;
  }

  const [localReactions, setLocalReactions] = useState({
    fires: song.fires || 0,
    loves: song.loves || 0,
    sads: song.sads || 0,
    bullseyes: song.bullseyes || 0,
  });
  const [hasReacted, setHasReacted] = useState({
    fires: false,
    loves: false,
    sads: false,
    bullseyes: false,
  });

  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const flavor = genreFlavorMap[song.genre_flavor] || null;
  const ringClass = flavor ? `ring-4 ring-${flavor.color}-500` : '';
  const glowColor = flavor ? flavor.color : 'white';

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
    const fetchStatsAndReactions = async () => {
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

    fetchStatsAndReactions();
  }, [user, song.id]);

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');

    const statKey = emojiToStatKey(emoji);
    if (hasReacted[statKey]) {
      toast('You already reacted with this emoji.');
      return;
    }

    const { error } = await supabase.from('reactions').insert([
      {
        user_id: user.id,
        song_id: song.id,
        emoji: emojiToDbValue(emoji),
      },
    ]);

    if (!error) {
      toast.success(`You reacted with ${emoji}`);
      setLocalReactions((prev) => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + 1,
      }));
      setHasReacted((prev) => ({
        ...prev,
        [statKey]: true,
      }));
    } else {
      toast.error('Failed to react.');
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
          href={`/artist-${song.artist_id}`}
          onClick={(e) => {
            e.preventDefault();
            incrementViews().finally(() => {
              window.location.href = `/artist-${song.artist_id}`;
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

      <h2 className="text-xl font-semibold mb-1">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>

      {user && (
        <div className="mt-3 flex justify-center">
          <BoostTickles songId={song.id} userId={user.id} />
        </div>
      )}

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3 mt-2" />

      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />
    </div>
  );
};

// Helper Functions
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

const emojiToDbValue = (emoji) => {
  switch (emoji) {
    case '🔥': return 'fire';
    case '💖': return 'heart';
    case '😭': return 'cry';
    case '🎯': return 'bullseye';
    default: return '';
  }
};

export default SongCard;
