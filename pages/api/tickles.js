// pages/api/tickles.js (GET)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { user_id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    const { rows } = await sql`SELECT song_id FROM tickles WHERE user_id = ${user_id};`;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
}
