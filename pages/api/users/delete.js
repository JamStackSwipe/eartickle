// pages/api/users/delete.js (DELETE)
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'DELETE only' });
  const { user_id } = req.body;
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.id !== user_id) return res.status(401).json({ error: 'Unauthorized' });
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`DELETE FROM profiles WHERE id = ${user_id};`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}
