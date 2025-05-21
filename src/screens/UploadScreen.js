// src/screens/UploadScreen.js

import React, { useState } from 'react';
import { supabase } from '../supabase';
import { v4 as uuidv4 } from 'uuid';

const MAX_COVER_SIZE_MB = 2;
const MAX_AUDIO_SIZE_MB = 20;

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const validateFile = (file, type, maxSizeMB) => {
    if (!file) return false;
    if (!file.type.startsWith(type)) return `❌ Invalid file type for ${type === 'image/' ? 'cover' : 'audio'}`;
    if (file.size > maxSizeMB * 1024 * 1024) return `❌ File exceeds ${maxSizeMB}MB limit`;
    return '';
  };

  const handleUpload = async () => {
    const coverError = validateFile(coverFile, 'image/', MAX_COVER_SIZE_MB);
    const audioError = validateFile(audioFile, 'audio/', MAX_AUDIO_SIZE_MB);

    if (!title || !artist) return setError('⚠️ Title and Artist are required');
    if (coverError) return setError(coverError);
    if (audioError) return setError(audioError);

    setUploading(true);
    setError('');
    const songId = uuidv4();

    try {
      const { data: coverUpload, error: coverErr } = await supabase.storage
        .from('covers')
        .upload(`${songId}_cover.jpg`, coverFile);

      if (coverErr) throw coverErr;

      const { data: audioUpload, error: audioErr } = await supabase.storage
        .from('songs')
        .upload(`${songId}_audio.mp3`, audioFile);

      if (audioErr) throw audioErr;

      const { error: dbErr } = await supabase.from('songs').insert([
        {
          id: songId,
          title,
          artist,
          cover_url: coverUpload.path,
          audio_url: audioUpload.path,
        },
      ]);

      if (dbErr) throw dbErr;

      alert('✅ Song uploaded successfully!');
      setTitle('');
      setArtist('');
      setCoverFile(null);
      setAudioFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎧 Upload a Song</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <input
        type="text"
        placeholder="Song Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <input
        type="text"
        placeholder="Artist Name"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block font-medium mb-1">Album Cover (JPG/PNG, max 2MB)</label>
      <input
        type="file"
        accept="image/jpeg, image/png"
        onChange={(e) => setCoverFile(e.target.files[0])}
        className="mb-4"
      />

      <label className="block font-medium mb-1">MP3 File (max 20MB)</label>
      <input
        type="file"
        accept="audio/mpeg"
        onChange={(e) => setAudioFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
};

export default UploadScreen;
