// pages/api/master-audio.js
import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Audio files can be large
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { songId, preset, userId } = req.body;

  // TODO: Add proper auth check when we implement NextAuth
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch song audio URL
    const { rows: songRows } = await sql`
      SELECT audio_url 
      FROM songs 
      WHERE id = ${songId}
    `;

    if (!songRows.length) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const song = songRows[0];

    // Create mastering job record
    const { rows: jobRows } = await sql`
      INSERT INTO mastering_jobs (song_id, user_id, preset, status)
      VALUES (${songId}, ${userId}, ${preset}, 'processing')
      RETURNING id
    `;

    const jobId = jobRows[0].id;

    try {
      // Download the original audio
      const response = await fetch(song.audio_url);
      if (!response.ok) {
        throw new Error('Failed to download original audio');
      }

      const audioBuffer = await response.arrayBuffer();
      
      // Mock processing (replace with actual mastering logic)
      console.log('Processing audio with preset:', preset);
      
      // For now, just re-upload (you'd add actual mastering processing here)
      const masteredFileName = `mastered-${songId}-${preset}-${Date.now()}.mp3`;
      
      // Upload to Vercel Blob
      const blob = await put(masteredFileName, audioBuffer, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Update mastering job
      await sql`
        UPDATE mastering_jobs
        SET status = 'completed', 
            mastered_audio_url = ${blob.url},
            completed_at = NOW()
        WHERE id = ${jobId}
      `;

      return res.status(200).json({ 
        masteredUrl: blob.url, 
        jobId 
      });

    } catch (err) {
      console.error('Mastering error:', err.message);
      
      // Update job as failed
      await sql`
        UPDATE mastering_jobs
        SET status = 'failed', 
            error_message = ${err.message}
        WHERE id = ${jobId}
      `;

      return res.status(500).json({ error: 'Mastering failed: ' + err.message });
    }

  } catch (err) {
    console.error('Database error:', err.message);
    return res.status(500).json({ error: 'Database error' });
  }
}
