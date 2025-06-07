// src/utils/recommendationEngine.js
import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null)
    .order('created_at', { ascending: false }); // Prioritize newer songs

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
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24); // Days since upload
      const recencyBonus = daysSinceCreation < 7 ? 50 / (daysSinceCreation + 1) : 0; // Boost new songs (first week)

      if (jams?.some((j) => j.song_id === song.id)) score += 10;
      if (tickles?.some((t) => t.song_id === song.id)) score += 25;
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;
      score += recencyBonus; // Add recency bonus

      const { data: allTickles } = await supabase
        .from('tickles')
        .select('emoji')
        .eq('song_id', song.id);

      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles?.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) {
          emojiCounts[t.emoji]++;
        }
      });

      const { count: jamCount } = await supabase
        .from('jamstacksongs')
        .select('*', { count: 'exact', head: true })
        .eq('song_id', song.id);

      // Combine into final score
      score +=
        emojiCounts['❤️'] * 2 +
        emojiCounts['🔥'] * 3 +
        emojiCounts['😢'] +
        emojiCounts['🎯'] * 4 +
        (jamCount || 0);

      // Update the song’s score in the DB
      await supabase
        .from('songs')
        .update({ score })
        .eq('id', song.id);
      await supabase.from('song_score_snapshots').insert([
        {
          song_id: song.id,
          score,
          snapshot_type: 'daily',
        },
      ]);

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCount || 0,
        views: song.views || 0,
      };
    })
  );

  // Shuffle to avoid always showing the same top song, then sort by score
  for (let i = enriched.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [enriched[i], enriched[j]] = [enriched[j], enriched[i]];
  }
  return enriched.sort((a, b) => b.score - a.score).slice(0, 10); // Top 10 after shuffle
}
