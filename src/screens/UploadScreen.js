import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    // 🔎 Debug output
    console.log("DEBUG — user.id:", user?.id);
    const { data: sessionCheck, error: sessionError } = await supabase.auth.getSession();
    console.log("DEBUG — Supabase session:", sessionCheck);
    console.log("DEBUG — Supabase error:", sessionError);

    if (!title || !artist || !genre || !imageFile || !audioFile) {
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

    setIsUploading(true);
    const timestamp = Date.now();
    const imageFilename = `${timestamp}-${imageFile.name}`;
    const audioFilename = `${timestamp}-${audioFile.name}`;

    const { error: imageError } = await supabase.storage
      .from('covers')
      .upload(imageFilename, imageFile);

    const { error: audioError } = await supabase.storage
      .from('audio')
      .upload(audioFilename, audioFile);

    if (imageError || audioError) {
      console.error('Image error:', imageError);
      console.error('Audio error:', audioError);
      alert('Upload failed: ' + (audioError?.message || imageError?.message));
      setIsUploading(false);
      return;
    }

    const coverUrl = supabase.storage.from('covers').getPublicUrl(imageFilename).data.publicUrl;
    const audioUrl = supabase.storage.from('audio').getPublicUrl(audioFilename).data.publicUrl;

    const { error: dbError } = await supabase.from('songs').insert([
      {
        title,
        artist,
        genre,
        cover: coverUrl,
        audio: audioUrl,
        user_id: user?.id, // ✅ must match RLS policy
      },
    ]);

    if (dbError) {
      console.error('Database insert failed:', dbError.message);
      alert('Song metadata upload failed.');
      setIsUploading(false);
    } else {
      setMessage('✅ Song uploaded!');
      setTitle('');
      setArtist('');
      setGenre('');
      setImageFile(null);
      setAudioFile(null);

      setTimeout(() => {
        navigate('/swipe');
      }, 1500);
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

      <label className="block mb-2 font-medium">Genre</label>
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a genre</option>
        <option value="pop">Pop</option>
        <option value="rock">Rock</option>
        <option value="hiphop">Hip-Hop</option>
        <option value="country">Country</option>
        <option value="worship">Worship</option>
        <option value="lofi">Lo-Fi</option>
        <option value="electronic">Electronic</option>
        <option value="comedy">Comedy</option>
        <option value="ambient">Ambient</option>
        <option value="indie">Indie</option>
        <option value="instrumental">Instrumental</option>
        <option value="spokenword">Spoken Word</option>
        <option value="other">Other</option>
      </select>

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
        disabled={isUploading}
        className={`w-full text-white py-2 rounded ${isUploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isUploading ? 'Uploading…' : 'Upload'}
      </button>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default UploadScreen;
