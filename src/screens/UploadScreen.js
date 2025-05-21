
import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!title || !artist || !imageFile || !audioFile) {
      alert('Please fill out all fields and select both files.');
      return;
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      alert('Image too large. Max size is 10MB.');
      return;
    }

    if (audioFile.size > 20 * 1024 * 1024) {
      alert('Audio file too large. Max size is 20MB.');
      return;
    }

    const timestamp = Date.now();
    const imageFilename = `${timestamp}-${imageFile.name}`;
    const audioFilename = `${timestamp}-${audioFile.name}`;

    const { error: imageError } = await supabase.storage
      .from('covers') // ✅ correct bucket
      .upload(imageFilename, imageFile);

    const { error: audioError } = await supabase.storage
      .from('audio') // ✅ correct bucket
      .upload(audioFilename, audioFile);

    if (imageError || audioError) {
      console.error('Image error:', imageError);
      console.error('Audio error:', audioError);
      alert('Upload failed: ' + (audioError?.message || imageError?.message));
      return;
    }

    const coverUrl = supabase.storage.from('covers').getPublicUrl(imageFilename).data.publicUrl;
    const audioUrl = supabase.storage.from('audio').getPublicUrl(audioFilename).data.publicUrl;

    const { error: dbError } = await supabase.from('songs').insert([
      {
        title,
        artist,
        cover: coverUrl,
        audio: audioUrl,
      },
    ]);

    if (dbError) {
      console.error('Database insert failed:', dbError.message);
      alert('Song metadata upload failed.');
    } else {
      setMessage('✅ Song uploaded!');
      setTitle('');
      setArtist('');
      setImageFile(null);
      setAudioFile(null);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload a Song</h2>

      <label className="block mb-2 font-medium">Song Title</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Artist Name</label>
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Cover Image (PNG/JPG, Max 10MB)</label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Audio File (MP3, Max 20MB)</label>
      <input
        type="file"
        accept="audio/mpeg"
        onChange={(e) => setAudioFile(e.target.files[0])}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleUpload}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default UploadScreen;
