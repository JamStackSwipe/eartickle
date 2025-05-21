import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [message, setMessage] = useState('');

  const validateFile = (file, allowedTypes, maxSizeMB) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type: ${file.type}`;
    }
    if (file.size > maxSizeBytes) {
      return `File too large. Max size is ${maxSizeMB}MB.`;
    }
    return null;
  };

  const handleUpload = async () => {
    setMessage('');

    if (!title || !coverFile || !mp3File) {
      setMessage('Please fill out all fields and select files.');
      return;
    }

    const coverValidation = validateFile(coverFile, ['image/png', 'image/jpeg'], 2);
    const mp3Validation = validateFile(mp3File, ['audio/mpeg'], 20);

    if (coverValidation || mp3Validation) {
      setMessage(coverValidation || mp3Validation);
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setMessage('User not authenticated.');
      return;
    }

    const userId = userData.user.id;
    const timestamp = Date.now();

    // Upload cover
    const coverExt = coverFile.name.split('.').pop();
    const coverPath = `${userId}/covers/${timestamp}.${coverExt}`;
    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverFile, { upsert: true });

    if (coverError) {
      setMessage('Error uploading cover image.');
      return;
    }

    const { data: coverData } = supabase.storage.from('covers').getPublicUrl(coverPath);
    const coverUrl = coverData?.publicUrl;

    // Upload MP3
    const mp3Ext = mp3File.name.split('.').pop();
    const mp3Path = `${userId}/songs/${timestamp}.${mp3Ext}`;
    const { error: mp3Error } = await supabase.storage
      .from('mp3s')
      .upload(mp3Path, mp3File, { upsert: true });

    if (mp3Error) {
      setMessage('Error uploading MP3.');
      return;
    }

    const { data: mp3Data } = supabase.storage.from('mp3s').getPublicUrl(mp3Path);
    const mp3Url = mp3Data?.publicUrl;

    // Insert song record
    const { error: insertError } = await supabase.from('songs').insert([
      {
        user_id: userId,
        title,
        cover_url: coverUrl,
        mp3_url: mp3Url,
      },
    ]);

    if (insertError) {
      setMessage('Error saving song to database.');
      return;
    }

    setMessage('✅ Upload successful!');
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
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <label>Cover Image (PNG or JPEG, max 2MB)</label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => setCoverFile(e.target.files[0])}
        style={{ marginBottom: '1rem' }}
      />

      <label>MP3 File (max 20MB)</label>
      <input
        type="file"
        accept="audio/mpeg"
        onChange={(e) => setMp3File(e.target.files[0])}
        style={{ marginBottom: '1rem' }}
      />

      <button onClick={handleUpload} style={{ padding: '0.75rem 1.5rem' }}>
        Upload
      </button>

      {message && (
        <p style={{ marginTop: '1rem', color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default UploadScreen;

