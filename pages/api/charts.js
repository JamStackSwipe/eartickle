import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  const { filter = 'views', limit = 20 } = req.query;

  // Validate filter
  const validFilters = ['views', 'loves', 'fires', 'bullseyes', 'sads', 'jams', 'score'];
  const orderBy = validFilters.includes(filter) ? filter : 'views';

  try {
    const { rows } = await sql.query(
      `SELECT * FROM songs 
       WHERE is_draft = false 
       ORDER BY ${orderBy} DESC 
       LIMIT $1`,
      [parseInt(limit)]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching chart songs:', error);
    res.status(500).json({ error: 'Failed to fetch chart songs' });
  }
}
