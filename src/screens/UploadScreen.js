import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider'; // ✅ FIXED

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { user } = useUser(); // ✅ FIXED
  const navigate = useNavigate();

  const handleUpload = async () => {
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
        user_id: user.id,
      },
    ]);

    if (dbError) {
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

    <label className="block mb-2 font-medium">
  Audio File (MP3, M4A, or audio-only MP4, Max 20MB)
</label>
<input
  type="file"
  accept="audio/mpeg, audio/mp4, audio/x-m4a, audio/aac, video/mp4"
  onChange={(e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validAudioTypes = [
      'audio/mpeg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/aac',
      'video/mp4' // for audio-only mp4
    ];

    if (!validAudioTypes.includes(file.type)) {
      alert('❌ Unsupported file format. Please upload an MP3, M4A, or audio-only MP4.');
      return;
    }

    setAudioFile(file);
  }}
  className="w-full p-2 border rounded mb-1"
/>
<p className="text-xs text-gray-400 mb-4">
  Supported formats: MP3, M4A, or audio-only MP4. Make sure your MP4 does not contain video.
</p>


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
