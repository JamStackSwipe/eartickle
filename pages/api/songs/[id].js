// pages/api/songs/[id].js (GET)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { rows: songRows } = await sql`SELECT * FROM songs WHERE id = ${id};`;
    const song = songRows[0];
    if (!song) return res.status(404).json({ error: 'Song not found' });
    const { rows: reactionRows } = await sql`SELECT emoji, user_id FROM song_reactions WHERE song_id = ${id};`;
    song.song_reactions = reactionRows;
    res.json({ data: song });
  } catch (error) {
    res.status(500).json({ error });
  }
}
