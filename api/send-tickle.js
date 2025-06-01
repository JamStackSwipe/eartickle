import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY // ✅ DO NOT use service role key here
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { artist_id, song_id, emoji } = req.body;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.warn('🚫 No token found');
      return res.status(401).json({ error: 'Missing Auth Token' });
    }

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Auth Error:', userError);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check Tickle balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to get profile' });
    }

    if (profile.tickle_balance < 1) {
      return res.status(400).json({ error: 'No Tickles left' });
    }

    // Insert into tickles table
    const { error: insertError } = await supabase.from('tickles').insert({
      user_id: user.id,
      artist_id,
      song_id,
      emoji,
      amount: 1
    });

    if (insertError) {
      console.error('❌ Tickle insert error:', insertError);
      return res.status(500).json({ error: 'Insert failed' });
    }

    // Update sender balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tickle_balance: profile.tickle_balance - 1
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Tickle balance update failed:', updateError);
      return res.status(500).json({ error: 'Balance update failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Unexpected server error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
