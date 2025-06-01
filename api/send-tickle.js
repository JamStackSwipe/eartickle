import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { artist_id, song_id, emoji } = req.body;

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing Auth Token' });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return res.status(500).json({ error: 'Profile not found' });
    if (profile.tickle_balance < 1) return res.status(400).json({ error: 'No tickles left' });

    const { error: insertError } = await supabase.from('tickles').insert({
      user_id: user.id,
      artist_id,
      song_id,
      emoji,
      amount: 1
    });
    if (insertError) return res.status(500).json({ error: 'Insert failed' });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tickle_balance: profile.tickle_balance - 1 })
      .eq('id', user.id);
    if (updateError) return res.status(500).json({ error: 'Balance update failed' });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Unexpected error in send-tickle:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
