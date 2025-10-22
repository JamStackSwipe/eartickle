// pages/api/jamstack/check.js (GET)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { user_id, song_id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { rows } = await sql`SELECT id FROM jamstacksongs WHERE user_id = ${user_id} AND song_id = ${song_id};`;
    res.json({ data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ error });
  }
}
