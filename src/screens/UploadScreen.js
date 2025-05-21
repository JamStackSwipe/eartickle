import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    setMessage('');

    if (!title || !coverFile || !mp3File) {
      setMessage('Please provide all fields.');
      return;
    }

    // Get the logged-in user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setMessage('User not authenticated.');
      return;
    }

    const userId = userData.user.id;
    const timestamp = Date.now();

    // Upload cover image
    const coverExt = coverFile.name.split('.').pop();
    const coverPath = `${userId}/covers/${timestamp}.${coverExt}`;
    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverFile, { upsert: true });

    if (coverError) {
      setMessage('Failed to upload cover image.');
      return;
    }

    const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverPath);
    const coverUrl = coverUrlData?.publicUrl;

    // Upload MP3 file
    const mp3Ext = mp3File.name.split('.').pop();
    const mp3Path = `${userId}/songs/${timestamp}.${mp3Ext}`;
    const { error: mp3Error } = await supabase.storage
      .from('mp3s')
      .upload(mp3Path, mp3File, { upsert: true });

    if (mp3Error) {
      setMessage('Failed to upload MP3 file.');
      return;
    }

    const { data: mp3UrlData } = supabase.storage.from('mp3s').getPublicUrl(mp3Path);
    const mp3Url = mp3UrlData?.publicUrl;

    // Insert into songs table
    const { error: insertError } = await supabase.from('songs').insert([
      {
        user_id: userId,
        title,
        cover_url: coverUrl,
        mp3_url: mp3Url,
      },
    ]);

    if (insertError) {
      setMessage('Failed to save song record.');
      return;
    }

    setMessage('Upload successful!');
    setTitle('');
    setCoverFile(null);
    setMp3File(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '2rem' }}>
      <h2>Upload New Song</h2>
      <input
        type="text"
        placeholder="Song Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
      />
      <label>Cover Image (JPG/PNG)</label>
      <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} style={{ marginBottom: '1rem' }} />
      <label>MP3 File</label>
      <input type="file" accept="audio/mp3" onChange={(e) => setMp3File(e.target.files[0])} style={{ marginBottom: '1rem' }} />
      <button onClick={handleUpload} style={{ padding: '0.75rem 1.5rem' }}>
        Upload
      </button>
      {message && <p style={{ marginTop: '1rem', color: 'green' }}>{message}</p>}
    </div>
  );
};

export default UploadScreen;
