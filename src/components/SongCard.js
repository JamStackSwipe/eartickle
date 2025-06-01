// src/components/SongCard.js

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import AddToJamStackButton from './AddToJamStackButton';

const SongCard = ({ song, user, tickleBalance, setTickleBalance }) => {
  const [sending, setSending] = useState(false);
  const [localReactions, setLocalReactions] = useState({
    fires: song.fires || 0,
    loves: song.loves || 0,
    sads: song.sads || 0,
    bullseyes: song.bullseyes || 0,
  });
  const [jamsCount, setJamsCount] = useState(song.jams || 0);
  const [hasReacted, setHasReacted] = useState({
    fires: false,
    loves: false,
    sads: false,
    bullseyes: false,
  });

  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // Detect when the card is visible (auto-play + view count)
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
        supabase
          .from('songs')
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

  const handleSendTickle = async () => {
    if (tickleBalance < 1) {
      toast.error('Not enough Tickles. Buy more in Rewards.');
      return;
    }

    setSending(true);

    const { error } = await supabase.from('rewards').insert([
      {
        sender_id: user.id,
        receiver_id: song.profile_id,
        song_id: song.id,
        amount: 1,
        emoji: null,
      },
    ]);

    if (!error) {
      setTickleBalance((prev) => prev - 1);
      toast.success('1 Tickle sent!');
    } else {
      toast.error('Failed to send Tickle.');
    }

    setSending(false);
  };

  return (
    <div
      ref={cardRef}
      className="bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md"
    >
      <a href={`/artist/${song.artist_id}`}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
          + onClick={incrementViews}
        />
      </a>

      <h2 className="text-xl font-semibold mb-1">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3" />

      <div className="flex flex-wrap items-center justify-between text-lg text-white">
        <div className="flex gap-4 flex-wrap">
          <span
            onClick={() => handleReaction('🔥')}
            className={`cursor-pointer ${hasReacted.fires ? 'opacity-50' : ''}`}
          >
            🔥 {localReactions.fires}
          </span>
          <span
            onClick={() => handleReaction('❤️')}
            className={`cursor-pointer ${hasReacted.loves ? 'opacity-50' : ''}`}
          >
            ❤️ {localReactions.loves}
          </span>
          <span
            onClick={() => handleReaction('😢')}
            className={`cursor-pointer ${hasReacted.sads ? 'opacity-50' : ''}`}
          >
            😢 {localReactions.sads}
          </span>
          <span
            onClick={() => handleReaction('🎯')}
            className={`cursor-pointer ${hasReacted.bullseyes ? 'opacity-50' : ''}`}
          >
            🎯 {localReactions.bullseyes}
          </span>
          <span className="text-sm text-gray-300">👁️ {song.views || 0}</span>
          <span className="text-sm text-gray-300">📥 {jamsCount}</span>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-600" />

      <div className="flex items-center justify-between">
        <AddToJamStackButton
          songId={song.id}
          user={user}
          onAdded={() => setJamsCount((prev) => prev + 1)}
        />

        <button
          onClick={handleSendTickle}
          disabled={sending}
          className="px-3 py-1 text-sm bg-yellow-500 text-black rounded hover:bg-yellow-600"
        >
          🎁 Send Tickle
        </button>
      </div>
    </div>
  );
};

// === Helper Functions ===

const emojiToStatKey = (emoji) => {
  switch (emoji) {
    case '🔥': return 'fires';
    case '❤️': return 'loves';
    case '😢': return 'sads';
    case '🎯': return 'bullseyes';
    default: return '';
  }
};

const emojiToSymbol = (word) => {
  switch (word) {
    case 'fire': return '🔥';
    case 'heart': return '❤️';
    case 'cry': return '😢';
    case 'bullseye': return '🎯';
    default: return '';
  }
};

const emojiToDbValue = (emoji) => {
  switch (emoji) {
    case '🔥': return 'fire';
    case '❤️': return 'heart';
    case '😢': return 'cry';
    case '🎯': return 'bullseye';
    default: return '';
  }
};

export default SongCard;
