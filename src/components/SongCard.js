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

  // 👁️ Trigger view tracking
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

  // 🔁 Fetch fresh emoji counts on mount
  useEffect(() => {
    const fetchLatestStats = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('fires, loves, sads, bullseyes')
        .eq('id', song.id)
        .single();

      if (data && !error) {
        setLocalReactions({
          fires: data.fires || 0,
          loves: data.loves || 0,
          sads: data.sads || 0,
          bullseyes: data.bullseyes || 0,
        });
      } else {
        console.error('Failed to fetch emoji stats:', error);
      }
    };

    fetchLatestStats();
  }, [song.id]);

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');

    const statKey = emojiToStatKey(emoji);

    const { error } = await supabase.from('reactions').insert([
      { user_id: user.id, song_id: song.id, emoji },
    ]);

    if (!error) {
      toast.success(`You reacted with ${emoji}`);
      setLocalReactions((prev) => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + 1,
      }));
    } else {
      toast.error('Failed to react.');
      console.error('Insert error:', error);
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
    <div
      ref={cardRef}
      className="bg-zinc-900 text-white w-full max-w-md mx-auto mb-10 p-4 rounded-xl shadow-md"
    >
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

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3" />

      <div className="flex flex-wrap items-center justify-between text-lg text-white">
        <div className="flex gap-4 flex-wrap">
          <span onClick={() => handleReaction('🔥')} className="cursor-pointer">🔥 {localReactions.fires}</span>
          <span onClick={() => handleReaction('❤️')} className="cursor-pointer">❤️ {localReactions.loves}</span>
          <span onClick={() => handleReaction('😢')} className="cursor-pointer">😢 {localReactions.sads}</span>
          <span onClick={() => handleReaction('🎯')} className="cursor-pointer">🎯 {localReactions.bullseyes}</span>
          <span className="text-sm text-gray-300">👁️ {song.views || 0}</span>
          <span className="text-sm text-gray-300">📥 {song.jams || 0}</span>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-600" />

      <div className="flex items-center justify-between">
        <button
          onClick={handleAddToJamStack}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ❤️ Add to JamStack
        </button>

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

const emojiToStatKey = (emoji) => {
  switch (emoji) {
    case '🔥':
      return 'fires';
    case '❤️':
      return 'loves';
    case '😢':
      return 'sads';
    case '🎯':
      return 'bullseyes';
    default:
      return '';
  }
};

export default SongCard;
