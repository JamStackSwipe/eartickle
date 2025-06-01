// src/components/SongCard.js
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';

const emojis = ['🔥', '❤️', '😢', '🎯'];

const SongCard = ({ song, user, tickleBalance, setTickleBalance }) => {
  const [confirmation, setConfirmation] = useState({ show: false, emoji: null });
  const [sending, setSending] = useState(false);
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
    const isMobile = window.innerWidth < 768;

    if (isMobile && isVisible) {
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

    const { error } = await supabase.from('song_reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    if (!error) {
      toast.success(`You reacted with ${emoji}`);
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
    <div ref={cardRef} className="bg-gray-100 p-4 rounded shadow">
      <div className="flex items-center space-x-4 mb-2">
        <img
          src={song.cover}
          alt="cover"
          className="w-16 h-16 object-cover rounded"
          onClick={incrementViews}
        />
        <div>
          <h3 className="text-lg font-bold">{song.title}</h3>
          <p className="text-sm text-gray-600">{song.artist}</p>
          <div className="text-sm text-gray-500">
            👁️ {song.views || 0} 📥 {song.jams || 0}
          </div>
        </div>
      </div>

      <audio ref={audioRef} controls src={song.audio} className="w-full rounded my-2" />

      <div className="flex items-center flex-wrap gap-4 text-xl mt-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="hover:scale-110 transition-transform"
          >
            {emoji} {song[emojiToStatKey(emoji)] || 0}
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
