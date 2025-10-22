import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { user_id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    // Fetch all songs
    const { rows: songs } = await sql`SELECT * FROM songs WHERE audio IS NOT NULL ORDER BY created_at DESC;`;
    if (!songs.length) return res.json([]);

    // Fetch profile
    const { rows: profileRows } = await sql`SELECT preferred_genres FROM profiles WHERE id = ${user_id};`;
    const profile = profileRows[0] || { preferred_genres: [] };

    // Fetch jams
    const { rows: jams } = await sql`SELECT song_id FROM jamstacksongs WHERE user_id = ${user_id};`;

    // Fetch tickles
    const { rows: tickles } = await sql`SELECT song_id FROM tickles WHERE user_id = ${user_id};`;

    const jamIds = jams.map(j => j.song_id);
    const tickleIds = tickles.map(t => t.song_id);

    // Enrich & score
    const enriched = await Promise.all(songs.map(async (song) => {
      let score = 0;
      const now = new Date();
      const createdAt = new Date(song.created_at || now);
      const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
      const recencyBonus = daysSinceCreation < 7 ? 50 / (daysSinceCreation + 1) : 0;
      if (jamIds.includes(song.id)) score += 10;
      if (tickleIds.includes(song.id)) score += 25;
      if (profile.preferred_genres?.includes(song.genre_flavor)) score += 5;
      score += recencyBonus;

      // Emoji counts
      const { rows: allTickles } = await sql`SELECT emoji FROM tickles WHERE song_id = ${song.id};`;
      const emojiCounts = { '❤️': 0, '🔥': 0, '😢': 0, '🎯': 0 };
      allTickles.forEach((t) => {
        if (emojiCounts[t.emoji] !== undefined) emojiCounts[t.emoji]++;
      });

      // Jam count
      const { count: jamCount } = await sql`SELECT COUNT(*) as count FROM jamstacksongs WHERE song_id = ${song.id};`;

      // Boost count (skip if no table)
      const { count: boostCount } = await sql`SELECT COUNT(*) as count FROM boosts WHERE song_id = ${song.id};`;

      score += emojiCounts['❤️'] * 2 + emojiCounts['🔥'] * 3 + emojiCounts['😢'] + emojiCounts['🎯'] * 4 + jamCount * 2 + boostCount * 10;

      // Update score
      await sql`UPDATE songs SET score = ${score} WHERE id = ${song.id};`;

      return {
        ...song,
        score,
        likes: emojiCounts['❤️'],
        fires: emojiCounts['🔥'],
        sads: emojiCounts['😢'],
        bullseyes: emojiCounts['🎯'],
        jams: jamCount,
        boosts: boostCount,
        views: song.views || 0,
      };
    }));

    // Shuffle & sort
    for (let i = enriched.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [enriched[i], enriched[j]] = [enriched[j], enriched[i]];
    }

    res.json(enriched.sort((a, b) => b.score - a.score));
  } catch (error) {
    console.error('Recs error:', error);
    res.status(500).json({ error });
  }
}
