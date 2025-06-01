// src/components/SongCard.js
import React, { useRef, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import { useUser } from './AuthProvider';

const emojis = ['🔥', '❤️', '😢', '🎯'];

const SongCard = ({ song, user, artist, tickleBalance, setTickleBalance }) => {
  const audioRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [confirmation, setConfirmation] = useState({ show: false, emoji: null });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isVisible && !manuallyPaused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isVisible, manuallyPaused]);

  const handleManualPause = () => {
    setManuallyPaused(true);
  };

  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');

    await supabase.from('song_reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    setConfirmation({ show: true, emoji });
  };

  const handleSendTickle = async () => {
    if (tickleBalance < 1) {
      toast.error('Not enough Tickles. Buy more in Rewards.');
      setConfirmation({ ...confirmation, show: false });
      return;
    }

    setSending(true);

    const { error } = await supabase.from('rewards').insert([
      {
        sender_id: user.id,
        receiver_id: song.profile_id,
        song_id: song.id,
        amount: 1,
        emoji: confirmation.emoji,
      },
    ]);

    if (!error) {
      setTickleBalance((prev) => prev - 1);
      toast.success('1 Tickle sent!');
    } else {
      toast.error('Failed to send Tickle.');
    }

    setConfirmation({ show: false, emoji: null });
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
    <div ref={cardRef} className="bg-zinc-900 rounded-xl shadow-md p-4 mb-10">
      <a href={`/artist/${song.artist_id}`}>
        <img
          src={song.cover}
          alt={song.title}
          className="w-full h-auto rounded-xl mb-4"
          onClick={() =>
            supabase.rpc('increment_song_view', { song_id_input: song.id })
          }
        />
      </a>
      <h2 className="text-xl font-semibold text-white mb-1">{song.title}</h2>
      <p className="text-sm text-gray-400 mb-2">by {song.artist}</p>
      <audio
        ref={audioRef}
        src={song.audio}
        controls
        className="w-full"
        onPlay={() =>
          supabase.rpc('increment_song_view', { song_id_input: song.id })
        }
        onPause={handleManualPause}
      />
      <div className="flex items-center gap-4 text-xl mt-3 text-white">
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
          onClick={handleAddToJamStack}
          className="ml-auto text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ❤️ Add to JamStack
        </button>
      </div>

      {confirmation.show && (
        <div className="mt-4 bg-white border p-4 rounded shadow text-black">
          <p className="mb-2">Send 1 Tickle with your {confirmation.emoji}?</p>
          <div className="flex space-x-3">
            <button
              onClick={handleSendTickle}
              disabled={sending}
              className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
            <button
              onClick={() => setConfirmation({ show: false, emoji: null })}
              className="border px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
