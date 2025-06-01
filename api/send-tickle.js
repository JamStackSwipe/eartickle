export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { artist_id, song_id, emoji } = req.body;
    console.log('⏺️ Incoming Tickle Request:', { artist_id, song_id, emoji });

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No auth token provided' });

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return res.status(401).json({ error: 'Unauthorized or user not found' });
    }

    console.log('✅ Authenticated user:', user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tickle_balance')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Could not fetch profile' });
    }

    if (!profile || profile.tickle_balance < 1) {
      return res.status(400).json({ error: 'No Tickles left — buy more to gift.' });
    }

    // Insert tickle row
    const { error: insertError } = await supabase.from('tickles').insert({
      user_id: user.id,
      artist_id,
      song_id,
      emoji,
      amount: 1
    });

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return res.status(500).json({ error: 'Tickle insert failed' });
    }

    // Update sender's balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tickle_balance: profile.tickle_balance - 1
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      return res.status(500).json({ error: 'Balance update failed' });
    }

    console.log('✅ Tickle sent and balance updated.');
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('❌ Uncaught send-tickle error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
