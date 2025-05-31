// src/utils/recommendationEngine.js

import { supabase } from '../supabase';

export async function getRecommendedSongs(userId) {
  const { data: songs, error: songError } = await supabase
    .from('songs')
    .select('*')
    .neq('audio', null);

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

      if (jams?.some((j) => j.song_id === song.id)) score += 10;
      if (tickles?.some((t) => t.song_id === song.id)) score += 25;
      if (profile?.preferred_genres?.includes(song.genre)) score += 5;

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

      // Combine everything into a final score
      score +=
        emojiCounts['❤️'] * 2 +
        emojiCounts['🔥'] * 3 +
        emojiCounts['😢'] +
        emojiCounts['🎯'] * 4 +
        (jamCount || 0);

      // 🧠 Update the song’s score in the DB
      await supabase
        .from('songs')
        .update({ score })
        .eq('id', song.id);

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

  return enriched.sort((a, b) => b.score - a.score);
}
