// EmojiReactionGiftBox.js
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';
import { playTickle, playTickleSpecial } from '../utils/tickleSound';

const EmojiReactionGiftBox = ({ song, user, tickleBalance, setTickleBalance }) => {
  const [confirmation, setConfirmation] = useState({ emoji: null, show: false });

  const handleEmojiReaction = async (emoji) => {
    if (!user || !song?.id) return;

    await supabase.from('song_reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    setConfirmation({ emoji, show: true });
  };

  const handleSendTickle = async () => {
    if (tickleBalance < 1) {
      toast.error("You don't have any Tickles. Buy more on the Rewards page.");
      setConfirmation({ ...confirmation, show: false });
      return;
    }

    const { error } = await supabase.from('rewards').insert([
      {
        sender_id: user.id,
        receiver_id: song.profile_id, // assuming song.profile_id is artist id
        song_id: song.id,
        amount: 1,
        emoji: confirmation.emoji,
      },
    ]);

    if (!error) {
      playTickle();
      setTickleBalance((prev) => prev - 1);
      toast.success("You sent 1 Tickle!");
    } else {
      toast.error("Failed to send tickle.");
    }

    setConfirmation({ ...confirmation, show: false });
  };

  return (
    <div className="flex gap-4 items-center">
      {["🔥", "❤️", "😢", "🎯"].map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleEmojiReaction(emoji)}
          className="text-2xl hover:scale-125 transition-transform"
        >
          {emoji}
        </button>
      ))}

      {confirmation.show && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg z-50">
          <p className="text-lg">
            Send 1 Tickle with your {confirmation.emoji} to support this artist?
          </p>
          <div className="mt-3 flex justify-center space-x-4">
            <button
              onClick={handleSendTickle}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Send
            </button>
            <button
              onClick={() => setConfirmation({ emoji: null, show: false })}
              className="px-4 py-2 border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiReactionGiftBox;
