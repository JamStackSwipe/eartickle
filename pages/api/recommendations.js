import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { user_id } = req.query;
  const sql = neon(process.env.DATABASE_URL);
  try {
    // Simple recs: Top songs by genre match or random; expand with ML later
    const { rows } = await sql`SELECT s.*, (s.score + RANDOM() * 10) as rec_score FROM songs s WHERE s.user_id != ${user_id} ORDER BY rec_score DESC LIMIT 50;`;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error });
  }
}
