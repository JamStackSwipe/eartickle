import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !artist || !coverFile || !mp3File) {
      setMessage('All fields are required.');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      setMessage('You must be logged in to upload.');
      return;
    }

    const fileId = Date.now(); // unique file reference
    const coverPath = `${userId}/covers/${fileId}-${coverFile.name}`;
    const mp3Path = `${userId}/mp3s/${fileId}-${mp3File.name}`;

    // Upload cover image
    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverFile, { cacheControl: '3600', upsert: true });

    if (coverError) {
      console.error(coverError.message);
      setMessage('Cover upload failed.');
      return;
    }

    // Upload mp3
    const { error: mp3Error } = await supabase.storage
      .from('mp3s')
      .upload(mp3Path, mp3File, { cacheControl: '3600', upsert: true });

    if (mp3Error) {
      console.error(mp3Error.message);
      setMessage('MP3 upload failed.');
      return;
    }

    // Get public URLs
    const coverUrl = supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl;
    const mp3Url = supabase.storage.from('mp3s').getPublicUrl(mp3Path).data.publicUrl;

    // Insert song into database
    const { error: insertError } = await supabase.from('songs').insert([
      {
        user_id: userId,
        title,
        artist,
        cover_url: coverUrl,
        mp3_url: mp3Url,
      },
    ]);

    if (insertError) {
      console.error(insertError.message);
      setMessage('Upload failed.');
    } else {
      setMessage('✅ Song uploaded successfully!');
      setTitle('');
      setArtist('');
      setCoverFile(null);
      setMp3File(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">🎧 Upload a Song</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />

        <input
          type="text"
          placeholder="Artist Name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full p-2 rounded text-black"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files[0])}
          className="w-full text-sm text-gray-400"
          required
        />

        <input
          type="file"
          accept="audio/mpeg"
          onChange={(e) => setMp3File(e.target.files[0])}
          className="w-full text-sm text-gray-400"
          required
        />

        <button
          type="submit"
          className="bg-blue-400 text-black px-4 py-2 rounded hover:bg-blue-300"
        >
          Upload Song
        </button>
      </form>

      {message && <p className="mt-4 text-teal-300">{message}</p>}
    </div>
  );
};

export default UploadScreen;
