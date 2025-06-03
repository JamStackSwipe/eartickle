// /api/send-tickle.js
//
// ✅ Purpose: Handles gifting 1 Tickle to an artist
// ✅ Used by: "Send Tickle" button in ReactionStatsBar.js
// 🚫 Do NOT use this file for Boost Tickles or multi-cost actions
//    Boosting requires a different path (see: BoostTickles.js or /api/spend-tickles.js)


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

    if (!artist_id || !song_id) {
      return res.status(400).json({ error: 'Missing artist or song ID' });
    }

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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!profile || profile.tickle_balance < 1) {
      return res.status(400).json({ error: 'No Tickles left — buy more to gift.' });
    }

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

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Uncaught error in /api/send-tickle:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
