// /api/send-tickle.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    console.error('❌ Invalid method');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist_id, song_id, emoji } = req.body;
    console.log('📦 Incoming Tickle Payload:', { artist_id, song_id, emoji });

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ Missing auth token');
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Auth failed:', userError || 'No user found');
      return res.status(401).json({ error: 'Unauthorized or user not found' });
    }

    console.log('👤 Authenticated user ID:', user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Failed to fetch profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    if (!profile || profile.tickle_balance < 1) {
      console.warn('⚠️ Not enough Tickles');
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
      console.error('❌ Failed to insert tickle:', insertError);
      return res.status(500).json({ error: 'Failed to insert tickle' });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tickle_balance: profile.tickle_balance - 1
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to update sender balance:', updateError);
      return res.status(500).json({ error: 'Failed to update sender balance' });
    }

    console.log(`✅ Tickle sent from ${user.id} to ${artist_id} for song ${song_id}`);
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Uncaught error in /api/send-tickle:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
