// screens/UploadScreen.js – Neon + Vercel Blob migration
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const FLAVOR_OPTIONS = [
  { value: 'country_roots', label: 'Country & Roots 🤠' },
  { value: 'hiphop_flow', label: 'Hip-Hop & Flow 🎤' },
  { value: 'rock_raw', label: 'Rock & Raw 🤘' },
  { value: 'pop_shine', label: 'Pop & Shine ✨' },
  { value: 'spiritual_soul', label: 'Spiritual & Soul ✝️' },
  { value: 'comedy_other', label: 'Comedy & Other 😂' },
];

const UploadScreen = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genreFlavor, setGenreFlavor] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [enableGifting, setEnableGifting] = useState(true);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim() || !artist.trim() || !genreFlavor || !imageFile || !audioFile) {
      toast.error('All fields and files required.');
      return;
    }
    const forbiddenWords = ['test', 'demo', 'sample'];
    if (forbiddenWords.some(word => title.toLowerCase().includes(word) || artist.toLowerCase().includes(word)) || title.length < 3 || artist.length < 3) {
      toast.error('Title/artist min 3 chars, no "test"/"demo"/"sample".');
      return;
    }
    if (imageFile.size > 10 * 1024 * 1024) {
      toast.error('Image max 10MB.');
      return;
    }
    if (audioFile.size > 20 * 1024 * 1024) {
      toast.error('Audio max 20MB.');
      return;
    }
    try {
      const audio = new Audio(URL.createObjectURL(audioFile));
      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          if (audio.duration < 10 || audio.duration > 600) reject('Audio 10s–10min.');
          resolve();
        };
        audio.onerror = reject;
      });
    } catch (err) {
      toast.error(err);
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('genreFlavor', genreFlavor);
      formData.append('enableGifting', enableGifting);
      formData.append('imageFile', imageFile);
      formData.append('audioFile', audioFile);
      const res = await fetch('/api/upload-song', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage('✅ Song uploaded! Check profile to publish.');
      toast.success('Upload success!');
      setTitle(''); setArtist(''); setGenreFlavor(''); setImageFile(null); setAudioFile(null); setEnableGifting(true);
      router.push('/profile');
    } catch (error) {
      toast.error('Upload failed: ' + error.message);
    }
    setIsUploading(false);
  };

  if (!session) return <p className="text-center mt-10">Login required.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Upload a Song</h2>
      <label className="block mb-2 font-medium">Song Title</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-4" required />
      <label className="block mb-2 font-medium">Artist Name</label>
      <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full p-2 border rounded mb-4" required />
      <label className="block mb-2 font-medium">Genre Flavor</label>
      <select value={genreFlavor} onChange={(e) => setGenreFlavor(e.target.value)} className="w-full p-2 border rounded mb-4" required>
        <option value="">Select</option>
        {FLAVOR_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <label className="block mb-2 font-medium">Cover Image (PNG/JPG, Max 10MB)</label>
      <input type="file" accept="image/png, image/jpeg" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded mb-4" required />
      <label className="block mb-2 font-medium">Audio File (MP3/M4A/MP4 audio, Max 20MB)</label>
      <input type="file" accept="audio/mpeg, audio/mp4, audio/x-m4a, audio/aac, video/mp4" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full p-2 border rounded mb-4" required />
      <label className="block mb-2">
        <input type="checkbox" checked={enableGifting} onChange={(e) => setEnableGifting(e.target.checked)} className="mr-2" />
        Enable Gifting (Stripe optional)
      </label>
      <button onClick={handleUpload} disabled={isUploading} className={`w-full text-white py-2 rounded ${isUploading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default UploadScreen;
