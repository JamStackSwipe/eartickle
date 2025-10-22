// pages/api/auth/reset-password.js (POST)
import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from './[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { email } = req.body;
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.email !== email) return res.status(401).json({ error: 'Unauthorized' });
  const sql = neon(process.env.DATABASE_URL);
  try {
    // Implement email send (use Nodemailer or Vercel Email if needed)
    // For now, placeholder
    res.json({ success: true, message: 'Reset link sent' });
  } catch (error) {
    res.status(500).json({ error });
  }
}
