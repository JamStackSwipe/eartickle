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

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError || profile.tickle_balance < 1) {
      return res.status(400).json({ error: 'No Tickles left — buy more to gift.' });
    }

    // Insert into tickles table
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
      console.error('❌ Tickle insert failed:', insertError);
      return res.status(500).json({ error: 'Failed to insert tickle' });
    }

    // Insert into rewards table
    const { error: rewardError } = await supabase
      .from('rewards')
      .insert({
        sender_id: user.id,
        receiver_id: artist_id,
        song_id,
        amount: 1
      });

    if (rewardError) {
      console.error('❌ Failed to log reward:', rewardError);
      return res.status(500).json({ error: 'Failed to log reward' });
    }

    // Deduct tickle
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tickle_balance: profile.tickle_balance - 1
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Failed to update balance:', updateError);
      return res.status(500).json({ error: 'Failed to update profile balance' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ send-tickle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
