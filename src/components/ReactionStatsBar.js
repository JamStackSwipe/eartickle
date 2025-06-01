import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';
import { playTickle } from '../utils/tickleSound';
import toast from 'react-hot-toast';

const emojis = ["🔥", "❤️", "😢", "🎯"];

const ReactionStatsBar = ({ song }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({});
  const [showConfirm, setShowConfirm] = useState(null);

  useEffect(() => {
    const loadReactions = async () => {
      const { data, error } = await supabase
        .from('song_reactions')
        .select('emoji, count')
        .eq('song_id', song.id)
        .group('emoji');

      if (!error && data) {
        const mapped = {};
        data.forEach(({ emoji, count }) => {
          mapped[emoji] = count;
        });
        setStats(mapped);
      }
    };

    loadReactions();
  }, [song.id]);

  const handleEmojiClick = async (emoji) => {
    if (!user) {
      toast.error('Login required to react');
      return;
    }

    await supabase.from('song_reactions').insert([
      {
        user_id: user.id,
        song_id: song.id,
        emoji,
      },
    ]);

    setStats((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    setShowConfirm(emoji);
  };

  const handleSendTickle = async () => {
    if (!user) return;

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .maybeSingle();

    if ((userProfile?.tickle_balance || 0) < 1) {
      toast.error('You need Tickles to gift. Buy more in Rewards.');
      return;
    }

    const { error } = await supabase.from('rewards').insert([
      {
        sender_id: user.id,
        receiver_id: song.user_id,
        song_id: song.id,
        amount: 1,
        emoji: showConfirm,
      },
    ]);

    if (!error) {
      playTickle();
      toast.success('1 Tickle sent to the artist!');
    } else {
      toast.error('Failed to send tickle.');
    }

    setShowConfirm(null);
  };

  return (
    <div className="flex items-center flex-wrap gap-4 text-lg mt-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleEmojiClick(emoji)}
          className="flex items-center space-x-1 hover:scale-110 transition-transform"
        >
          <span>{emoji}</span>
          <span className="text-sm">{stats[emoji] || 0}</span>
        </button>
      ))}

      <button
        onClick={() => setShowConfirm('🎁')}
        className="ml-auto px-3 py-1 bg-yellow-400 rounded text-black text-sm font-medium"
      >
        🎁 Send Tickle
      </button>

      {showConfirm && showConfirm !== '🎁' && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 shadow-lg rounded z-50">
          <p className="text-center text-lg mb-3">
            Send 1 Tickle with your {showConfirm}?
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={handleSendTickle} className="bg-purple-600 text-white px-4 py-1 rounded">
              Yes, Send
            </button>
            <button onClick={() => setShowConfirm(null)} className="px-4 py-1">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionStatsBar;
