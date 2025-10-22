// pages/api/auth/logout.js (POST)
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try {
    await getServerSession(req, res, authOptions);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error });
  }
}
