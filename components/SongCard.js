
// src/components/SongCard.js – Fixed JSX (<a> full tag + self-close <img />); Next.js migrated (router.push, fetch for Neon)
'use client'; // Client for state/effects

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // SPA nav

import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const tickleSound = new Audio('/sounds/tickle.mp3');

const SongCard = ({ song, user }) => {
  if (song.is_draft || !song.cover || !song.audio) {
    return null;
  }

  const router = useRouter();
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
      try {
        const [emojiStatsRes, reactionFlagsRes] = await Promise.all([
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

        if (emojiStatsRes.data) {
          setLocalReactions({
            fires: emojiStatsRes.data.fires || 0,
            loves: emojiStatsRes.data.loves || 0,
            sads: emojiStatsRes.data.sads || 0,
            bullseyes: emojiStatsRes.data.bullseyes || 0,
          });
        }

        if (reactionFlagsRes.data?.length > 0) {
          const flags = {};
          for (const r of reactionFlagsRes.data) {
            const key = emojiToStatKey(emojiToSymbol(r.emoji));
            flags[key] = true;
          }
          setHasReacted(flags);
        }
      } catch (error) {
        console.error('❌ Stats/reactions fetch error:', error);
      }
    };
    fetchStatsAndReactions();
  }, [user, song.id]);

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_song_view', { song_id_input: song.id });
    } catch (error) {
      console.error('❌ View increment error:', error);
    }
  };

  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');
    const statKey = emojiToStatKey(emoji);
    if (hasReacted[statKey]) {
      toast('You already reacted with this emoji.');
      return;
    }

    try {
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
    } catch (error) {
      toast.error('Failed to react.');
      console.error('Reaction error:', error);
    }
  };

  const handleArtistClick = (e) => {
    e.preventDefault();
    incrementViews().finally(() => {
      router.push(`/artist/${song.artist_id}`); // SPA nav; drop window.location reload
    });
  };

  return (
    <div
      ref={cardRef}
      data-song-id={song.id}
      className={`bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md transition-all ${flavor ? 'hover:animate-genre-pulse' : ''} ${ringClass}`}
      style={flavor ? { boxShadow: `0 0 15px ${getGlowColor(flavor.color)}` } : {}}
    >
      <div className="relative">
        {/* Fixed: Full <a> tag with props; block class; router for nav */}
        <a
          href={`/artist/${song.artist_id}`}
          onClick={handleArtistClick}
          className="block"
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
