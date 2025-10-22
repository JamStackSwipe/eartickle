// pages/api/profiles/[id]/preferences.js (GET/PATCH)
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT preferred_genres FROM profiles WHERE id = ${id};`;
      res.json(rows[0] || { preferred_genres: [] });
    } catch (error) {
      res.status(500).json({ error });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { preferred_genres } = req.body;
      await sql`UPDATE profiles SET preferred_genres = ${preferred_genres} WHERE id = ${id};`;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
