// src/components/SongCard.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const emojis = ['🔥', '❤️', '😢', '🎯'];

const SongCard = ({ song, user, tickleBalance, setTickleBalance }) => {
  const [sending, setSending] = useState(false);
  const [localReactions, setLocalReactions] = useState({
    fires: song.fires || 0,
    loves: song.loves || 0,
    sads: song.sads || 0,
    bullseyes: song.bullseyes || 0,
  });
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');

    const statKey = emojiToStatKey(emoji);

    const { error } = await supabase.from('song_reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    if (!error) {
      toast.success(`You reacted with ${emoji}`);
      setLocalReactions((prev) => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + 1,
      }));
    } else {
      toast.error('Failed to react');
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

  const handleAddToJamStack = async () => {
    const { data: existing } = await supabase
      .from('jamstacksongs')
      .select('id')
      .eq('user_id', user.id)
      .eq('song_id', song.id)
      .maybeSingle();

    if (existing) return toast('Already in JamStack');

    const { error } = await supabase.from('jamstacksongs').insert([
      { user_id: user.id, song_id: song.id },
    ]);

    if (!error) toast.success('Added to JamStack!');
    else toast.error('Error adding to JamStack');
  };

  return (
    <div ref={cardRef} className="bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md">
      <a href={`/artist/${song.artist_id}`}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
          onClick={() => incrementViews(song.id)}
        />
      </a>
      <h2 className="text-xl font-semibold mb-1">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
      <audio
        ref={audioRef}
        src={song.audio}
        controls
        className="w-full"
      />
      <div className="flex items-center flex-wrap gap-4 text-xl mt-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="hover:scale-110 transition-transform"
          >
            {emoji} {localReactions[emojiToStatKey(emoji)] || 0}
          </button>
        ))}

        <button
          onClick={handleSendTickle}
          disabled={sending}
          className="ml-auto px-3 py-1 bg-yellow-500 text-black text-sm rounded hover:bg-yellow-600"
        >
          🎁 Send Tickle
        </button>
      </div>

      <button
        onClick={handleAddToJamStack}
        className="mt-3 text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ❤️ Add to JamStack
      </button>
      <div className="text-xs text-gray-400 mt-2 text-center">
        👁️ {song.views || 0} | 📥 {song.jams || 0} | 🔥 {localReactions.fires} | ❤️ {localReactions.loves} | 😢 {localReactions.sads} | 🎯 {localReactions.bullseyes}
      </div>
    </div>
  );
};

const emojiToStatKey = (emoji) => {
  switch (emoji) {
    case '🔥': return 'fires';
    case '❤️': return 'loves';
    case '😢': return 'sads';
    case '🎯': return 'bullseyes';
    default: return '';
  }
};

export default SongCard;
