import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import AddToJamStackButton from './AddToJamStackButton'; // ✅ Keep shared button

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
        console.error('Failed to fetch live reaction stats', error);
      }
    };

    fetchLatestStats();
  }, [song.id]);

  const incrementViews = async () => {
    await supabase.rpc('increment_song_view', { song_id_input: song.id });
  };

  // ✅ Safely prevents duplicate emoji reactions
  const handleReaction = async (emoji) => {
    if (!user) return toast.error('Please sign in to react.');

    const statKey = emojiToStatKey(emoji);

    try {
      const { data: existing, error: checkError } = await supabase
        .from('reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('song_id', song.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        toast('You already reacted with this emoji.');
        return;
      }

      const { error: insertError } = await supabase.from('reactions').insert([
        { user_id: user.id, song_id: song.id, emoji },
      ]);

      if (insertError) throw insertError;

      toast.success(`You reacted with ${emoji}`);
      setLocalReactions((prev) => ({
        ...prev,
        [statKey]: (prev[statKey] || 0) + 1,
      }));
    } catch (err) {
      console.error('Reaction failed:', err.message);
      toast.error('Could not add your reaction.');
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
        <AddToJamStackButton songId={song.id} />
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
