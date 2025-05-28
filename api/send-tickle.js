import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { user } = await supabase.auth.getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { artist_id, song_id, emoji } = req.body;

  // 1. Check if user has any tickles left
  const { data: profile } = await supabase
    .from('profiles')
    .select('available_tickles')
    .eq('id', user.id)
    .single();

  if ((profile?.available_tickles || 0) < 1) {
    return res.status(400).json({ error: 'No Tickles left! Buy more to gift.' });
  }

  // 2. Deduct and insert
  const { error: updateError } = await supabase
    .rpc('send_tickle_and_deduct', {
      sender_id: user.id,
      artist_id,
      song_id,
      emoji,
    });

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  res.status(200).json({ success: true });
}
