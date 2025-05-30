if (event.type === 'checkout.session.completed') {
  const session = event.data.object;
  const metadata = session.metadata || {};
  const { senderId, amountCents } = metadata;

  if (!senderId || !amountCents) {
    console.warn('⚠️ Missing metadata:', metadata);
    return res.status(400).send('Missing senderId or amountCents');
  }

  const sessionId = session.id;
  const parsedAmount = parseInt(amountCents, 10);

  // Try to update existing incomplete purchase
  const { error: updateError, data: updateData } = await supabase
    .from('tickle_purchases')
    .update({
      completed: true,
      stripe_session_id: sessionId,
    })
    .eq('buyer_id', senderId)
    .eq('completed', false)
    .order('date_purchased', { ascending: false })
    .limit(1)
    .select();

  if (updateError || !updateData?.length) {
    // Fallback: insert new if nothing was updated
    const { error: insertError } = await supabase.from('tickle_purchases').insert([
      {
        buyer_id: senderId,
        amount: parsedAmount,
        stripe_session_id: sessionId,
        completed: true,
      },
    ]);

    if (insertError) {
      console.error('❌ Insert fallback failed:', insertError.message);
    } else {
      console.log('✅ Inserted fallback tickle purchase.');
    }
  } else {
    console.log(`✅ Updated existing tickle purchase for user ${senderId}`);
  }
}
