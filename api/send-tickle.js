import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist_id, song_id, emoji } = req.body;

    // Auth header from client (handled by Supabase Auth)
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized or user not found' });
    }

    // 1. Check current available_tickles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('available_tickles')
      .eq('id', user.id)
      .single();

    if (profileError || profile.available_tickles < 1) {
      return res.status(400).json({ error: 'No Tickles left — buy more to gift.' });
    }

    // 2. Insert tickle
    const { error: insertError } = await supabase
      .from('tickles')
      .insert({
        user_id: user.id,
        artist_id,
        song_id,
        emoji,
        amount: 1
      });

    if (insertError) {
      return res.status(500).json({ error: 'Failed to insert tickle' });
    }

    // 3. Deduct from sender
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        available_tickles: profile.available_tickles - 1
      })
      .eq('id', user.id);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update profile balance' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ send-tickle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
