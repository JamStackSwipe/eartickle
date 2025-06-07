// api/master-audio.js
import fetch from 'node-fetch';
import path from 'path';
import os from 'os';
import fs from 'fs/promises';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables (same as client-side)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
  process.env.SUPABASE_KEY || 'your-supabase-anon-key'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { songId, preset, userId } = req.body;

  // Authenticate user (similar to send-tickle)
  const { data: session, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session || session.user.id !== userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch song audio URL
  const { data: song, error: songError } = await supabase
    .from('songs')
    .select('audio')
    .eq('id', songId)
    .single();

  if (songError || !song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  // Create mastering job
  const { data: job, error: jobError } = await supabase
    .from('mastering_jobs')
    .insert({ song_id: songId, user_id: userId, preset })
    .select()
    .single();

  if (jobError) {
    return res.status(500).json({ error: 'Failed to create mastering job' });
  }

  try {
    // Download the original audio
    const response = await fetch(song.audio);
    if (!response.ok) {
      throw new Error('Failed to download original audio');
    }
    const buffer = await response.buffer();
    const tempInput = path.join(os.tmpdir(), `${songId}-input.mp3`);
    const masteredFileName = `${songId}-${preset}-${Date.now()}.mp3`;
    const tempOutput = path.join(os.tmpdir(), masteredFileName);
    await fs.writeFile(tempInput, buffer);

    // Mock processing (replace with actual mastering logic if ffmpeg is intended)
    console.log('Processing audio with preset:', preset);
    await fs.copyFile(tempInput, tempOutput); // Placeholder for mastering

    // Upload mastered audio to Supabase Storage
    const masteredBuffer = await fs.readFile(tempOutput);
    const { error: uploadError } = await supabase.storage
      .from('mastered-audio')
      .upload(masteredFileName, masteredBuffer, { upsert: true });

    if (uploadError) {
      throw new Error('Failed to upload mastered audio: ' + uploadError.message);
    }

    const masteredUrl = supabase.storage.from('mastered-audio').getPublicUrl(masteredFileName).data.publicUrl;

    // Clean up temp files
    await fs.unlink(tempInput);
    await fs.unlink(tempOutput);

    // Update mastering job
    await supabase
      .from('mastering_jobs')
      .update({ status: 'completed', mastered_audio_url: masteredUrl })
      .eq('id', job.id);

    return res.status(200).json({ masteredUrl, jobId: job.id });
  } catch (err) {
    console.error('Mastering error:', err.message);
    await supabase
      .from('mastering_jobs')
      .update({ status: 'failed', error_message: err.message })
      .eq('id', job.id);
    return res.status(500).json({ error: 'Mastering failed: ' + err.message });
  }
};
