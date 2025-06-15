import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import toast from 'react-hot-toast';
import ReactionStatsBar from './ReactionStatsBar';
import BoostTickles from './BoostTickles';
import { genreFlavorMap } from '../utils/genreList';

const MySongCard = ({ song, user, stats = {}, onDelete, onPublish, editableTitle, showStripeButton }) => {
  const [localReactions, setLocalReactions] = useState({
    fires: stats.fires || song.fires || 0,
    loves: stats.loves || song.loves || 0,
    sads: stats.sads || song.sads || 0,
    bullseyes: stats.bullseyes || song.bullseyes || 0,
  });
  const [jamsCount, setJamsCount] = useState(stats.jam_saves || song.jams || 0);
  const [hasReacted, setHasReacted] = useState({
    fires: false,
    loves: false,
    sads: false,
    bullseyes: false,
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(song.title);
  const [editingGenre, setEditingGenre] = useState(false);
  const [newGenre, setNewGenre] = useState(song.genre_flavor || '');
  const [isDeleting, setIsDeleting] = useState(false); // Added for loading state
  const [isTogglingDraft, setIsTogglingDraft] = useState(false); // Added for Draft/Publish

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
          fires: stats.fires || emojiStats.data.fires || 0,
          loves: stats.loves || emojiStats.data.loves || 0,
          sads: stats.sads || emojiStats.data.sads || 0,
          bullseyes: stats.bullseyes || emojiStats.data.bullseyes || 0,
        });
        setJamsCount(stats.jam_saves || emojiStats.data.jams || 0);
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
  }, [user, song.id, stats]);

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

  const handleTitleSave = async () => {
    if (!editableTitle || user?.id !== song.artist_id) return;
    const { error } = await supabase
      .from('songs')
      .update({ title })
      .eq('id', song.id)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update title.');
    } else {
      toast.success('Title updated!');
      setEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !user.id) {
      toast.error('Please sign in to delete.');
      return;
    }
    if (isDeleting) {
      toast.error('Deletion in progress...');
      return;
    }

    const confirm = window.confirm('Are you sure you want to delete this song?');
    if (!confirm) return;

    setIsDeleting(true);
    try {
      console.log(`Deleting song ${song.id} for user ${user.id}`);
      // Delete related reactions
      const { error: reactionsError } = await supabase
        .from('reactions')
        .delete()
        .eq('song_id', song.id);
      if (reactionsError) {
        console.error('Reactions delete error:', {
          message: reactionsError.message,
          code: reactionsError.code,
          details: reactionsError.details,
          hint: reactionsError.hint,
        });
        toast.error(`Failed to delete reactions: ${reactionsError.message} (Code: ${reactionsError.code})`);
        return;
      }
      console.log(`Reactions deleted for song ${song.id}`);

      // Delete related jams
      const { error: jamsError } = await supabase
        .from('jams')
        .delete()
        .eq('song_id', song.id);
      if (jamsError) {
        console.error('Jams delete error:', {
          message: jamsError.message,
          code: jamsError.code,
          details: jamsError.details,
          hint: jamsError.hint,
        });
        toast.error(`Failed to delete jams: ${jamsError.message} (Code: ${jamsError.code})`);
        return;
      }
      console.log(`Jams deleted for song ${song.id}`);

      // Delete related boosts (if table exists)
      const { error: boostsError } = await supabase
        .from('boosts')
        .delete()
        .eq('song_id', song.id);
      if (boostsError) {
        console.error('Boosts delete error:', {
          message: boostsError.message,
          code: boostsError.code,
          details: boostsError.details,
          hint: boostsError.hint,
        });
        toast.error(`Failed to delete boosts: ${boostsError.message} (Code: ${boostsError.code})`);
        return;
      }
      console.log(`Boosts deleted for song ${song.id}`);

      // Delete the song
      const { error: songError } = await supabase
        .from('songs')
        .delete()
        .eq('id', song.id)
        .eq('user_id', user.id);

      if (songError) {
        console.error('Song delete error:', {
          message: songError.message,
          code: songError.code,
          details: songError.details,
          hint: songError.hint,
        });
        toast.error(`Failed to delete song: ${songError.message} (Code: ${songError.code})`);
        return;
      }

      console.log(`Song ${song.id} deleted successfully`);
      toast.success('Song deleted');
      if (onDelete) onDelete(song.id);
    } catch (err) {
      console.error('Unexpected error during deletion:', {
        message: err.message,
        stack: err.stack,
      });
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleDraftPublish = async () => {
    if (!user || user.id !== song.artist_id) {
      toast.error('Unauthorized action');
      return;
    }
    if (isTogglingDraft) {
      toast.error('Toggling in progress...');
      return;
    }

    const newDraftStatus = !song.is_draft;
    setIsTogglingDraft(true);
    try {
      console.log(`Toggling draft status for song ${song.id} to ${newDraftStatus}`);
      const { error, data } = await supabase
        .from('songs')
        .update({ is_draft: newDraftStatus })
        .eq('id', song.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Draft/Publish error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        toast.error(`Failed to ${newDraftStatus ? 'set as draft' : 'publish'}: ${error.message} (Code: ${error.code})`);
        return;
      }

      console.log(`Song ${song.id} draft status updated to ${newDraftStatus}`);
      toast.success(`Song ${newDraftStatus ? 'set as draft' : 'published'}!`);
      if (onPublish && !newDraftStatus) onPublish(song.id);
      // Update local state
      song.is_draft = newDraftStatus;
    } catch (err) {
      console.error('Unexpected error during draft/publish:', {
        message: err.message,
        stack: err.stack,
      });
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setIsTogglingDraft(false);
    }
  };

  const handleSaveGenre = async () => {
    if (newGenre !== song.genre_flavor && user?.id === song.artist_id) {
      const { error } = await supabase.from('songs').update({ genre_flavor: newGenre }).eq('id', song.id);
      if (error) toast.error('Failed to update genre.');
      else { toast.success('Genre updated!'); setEditingGenre(false); }
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
          href={`/artist/${song.artist_id}`}
          onClick={(e) => {
            e.preventDefault();
            incrementViews().finally(() => {
              window.location.href = `/artist/${song.artist_id}`;
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
        {user && (user.id === song.artist_id || song.is_jam) && (
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 text-white bg-red-600 p-1 rounded-full hover:bg-red-700"
            aria-label="Delete song"
            disabled={isDeleting}
          >
            🗑️
          </button>
        )}
        {user && user.id === song.artist_id && (
          <button
            onClick={toggleDraftPublish}
            className={`absolute top-2 right-12 text-white p-1 rounded-full ${
              song.is_draft
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
            aria-label={song.is_draft ? 'Publish song' : 'Set as draft'}
            disabled={isTogglingDraft}
          >
            {song.is_draft ? '📢 Publish' : '⏸️ Draft'}
          </button>
        )}
      </div>

      {editableTitle && user?.id === song.artist_id && editingTitle ? (
        <div className="mb-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-1 bg-zinc-800 rounded text-white"
            aria-label="Edit song title"
          />
          <button
            onClick={handleTitleSave}
            className="text-sm text-green-400 mt-1"
            aria-label="Save title"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditingTitle(false);
              setTitle(song.title);
            }}
            className="text-sm text-gray-400 mt-1 ml-2"
            aria-label="Cancel edit"
          >
            Cancel
          </button>
        </div>
      ) : (
        <h2
          className="text-xl font-semibold mb-1 cursor-pointer"
          onClick={() => editableTitle && user?.id === song.artist_id && setEditingTitle(true)}
        >
          {title}
        </h2>
      )}
      <p className="bg-gray-800 text-white">by {song.artist}</p>

      {user?.id === song.artist_id && (
        <div className="mb-2">
          {editingGenre ? (
            <div>
              <select value={newGenre} onChange={(e) => setNewGenre(e.target.value)} className="p-1 border rounded">
                {Object.keys(genreFlavorMap).map(genre => (
                  <option key={genre} value={genre}>{genreFlavorMap[genre].label}</option>
                ))}
              </select>
              <button onClick={handleSaveGenre} className="ml-2 p-1 bg-blue-500 text-white rounded">Save</button>
              <button onClick={() => setEditingGenre(false)} className="ml-1 p-1 bg-gray-500 text-white rounded">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditingGenre(true)} className="p-1 bg-green-500 text-white rounded">Edit Genre</button>
          )}
        </div>
      )}

      {user && (
        <div className="mt-3 flex justify-center">
          <BoostTickles songId={song.id} userId={user.id} artistId={song.artist_id} />
        </div>
      )}

      <audio ref={audioRef} src={song.audio} controls className="w-full mb-3 mt-2" />

      <ReactionStatsBar song={{ ...song, user_id: song.artist_id }} />
      {/* Note on 2025-06-06: "Add to Jam Stack" functionality was moved to ReactionStatsBar.js for better mobile layout. */}
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

export default MySongCard;
