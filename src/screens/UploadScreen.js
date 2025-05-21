import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!title || !artist || !imageFile) {
      alert('Please fill out all fields and select an image.');
      return;
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      alert('Image too large. Max size is 10MB.');
      return;
    }

    const filename = `${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('songs')
      .upload(filename, imageFile);

    if (uploadError) {
      console.error('Upload failed:', uploadError.message);
      alert('Image upload failed.');
      return;
    }

    const imageUrl = supabase.storage.from('songs').getPublicUrl(filename).data.publicUrl;

    const { error: insertError } = await supabase.from('songs').insert([
      {
        title,
        artist,
        cover: imageUrl,
      },
    ]);

    if (insertError) {
      console.error('Insert failed:', insertError.message);
      alert('Song metadata upload failed.');
    } else {
      setMessage('✅ Song uploaded!');
      setTitle('');
      setArtist('');
      setImageFile(null);
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
