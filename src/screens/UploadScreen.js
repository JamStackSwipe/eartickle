import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !artist || !coverUrl) {
      setMessage('All fields are required.');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { error } = await supabase.from('songs').insert([
        {
          title,
          artist,
          cover_url: coverUrl,
          user_id: userId
        }
      ]);

      if (error) {
        console.error('Upload error:', error.message);
        setMessage('Error uploading song.');
      } else {
        setMessage('Song uploaded successfully!');
        setTitle('');
        setArtist('');
        setCoverUrl('');
      }
    } catch (err) {
      console.error(err);
      setMessage('Unexpected error.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-6">Upload a Song</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          placeholder="Song Title"
          className="w-full p-2 rounded text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Artist Name"
          className="w-full p-2 rounded text-black"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <input
          type="text"
          placeholder="Album Cover URL"
          className="w-full p-2 rounded text-black"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
        />
        <button
          type="submit"
          className="bg-teal-400 text-black font-bold py-2 px-4 rounded hover:bg-teal-300"
        >
          Upload
        </button>
      </form>
      {message && <p className="mt-4 text-teal-300">{message}</p>}
    </div>
  );
};

export default UploadScreen;
