// src/utils/recommendationEngine.js
import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null)
    .order('created_at', { ascending: false }); // Newest first

  if (songError || !songs) return [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_genres')
    .eq('id', userId)
    .maybeSingle();

  const { data: jams } = await supabase
    .from('jamstacksongs')
    .select('song_id')
    .eq('user_id', userId);

  const { data: tickles } = await supabase
    .from('tickles')
    .select('song_id')
    .eq('sender_id', userId);

  const enriched = await Promise.all(
    songs.map(async (song) => {
      let score = 0;
      const now = new Date();
      const createdAt = new Date(song.created_at);
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      const recencyBonus = daysSinceCreation < 7 ? 50 / (daysSinceCreation + 1) : 0; // Fade over 7 days

      if (jams?.some((j) => j.song_id === song.id)) score += 10; // Jam bonus
      if (tickles?.some((t) => t.song_id === song.id)) score += 25; // Tickle bonus
      if (profile?.preferred_genres?.includes(song.genre)) score += 5; // Genre preference
      score += recencyBonus;

      const { data: allTickles } = await supabase
        .from('tickles')
        .select('emoji')
        .eq('song_id', song.id);

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles?.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) emojiCounts[t.emoji]++;
      });

      const { count: jamCount } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id);

      const { count: boostCount } = await supabase
        .from('boosts')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id); // Assuming a boosts table

      // Score based on engagement
      score +=
        emojiCounts['❤️'] * 2 + // Likes
        emojiCounts['🔥'] * 3 +  // Fires
        emojiCounts['😢'] +      // Sads
        emojiCounts['🎯'] * 4 +  // Bullseyes
        (jamCount || 0) * 2 +   // Jam count bonus
        (boostCount || 0) * 10; // Boost multiplier

      // Update song score in DB
      await supabase
        .from('songs')
        .update({ score })
        .eq('id', song.id);
      await supabase.from('song_score_snapshots').insert([
        { song_id: song.id, score, snapshot_type: 'daily' },
      ]);

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCount || 0,
        boosts: boostCount || 0,
        views: song.views || 0,
      };
    })
  );

  // Shuffle to mix up the order, then sort by score
  for (let i = enriched.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enriched[i], enriched[j]] = [enriched[j], enriched[i]];
  }
  return enriched.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 after shuffle
}
