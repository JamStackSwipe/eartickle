// src/screens/UploadScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const FLAVOR_OPTIONS = [
  { value: 'country_roots', label: 'Country & Roots 🤠' },
  { value: 'hiphop_flow', label: 'Hip-Hop & Flow 🎤' },
  { value: 'rock_raw', label: 'Rock & Raw 🤘' },
  { value: 'pop_shine', label: 'Pop & Shine ✨' },
  { value: 'spiritual_soul', label: 'Spiritual & Soul ✝️' },
  { value: 'comedy_other', label: 'Comedy & Other 😂' },
];

const MASTERING_PRESETS = [
  { value: 'country_roots', label: 'Country Roots 🤠' },
  { value: 'hiphop_flow', label: 'HipHop Flow 🎤' },
  { value: 'rock_raw', label: 'Rock Raw 🤘' },
  { value: 'pop_shine', label: 'Pop Shine ✨' },
  { value: 'spiritual_soul', label: 'Spiritual Soul ✝️' },
  { value: 'comedy_other', label: 'Comedy Other 😂' },
];

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genreFlavor, setGenreFlavor] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [enableGifting, setEnableGifting] = useState(true);
  const [masteringPreset, setMasteringPreset] = useState('');
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMastering, setIsMastering] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!title.trim() || !artist.trim() || !genreFlavor || !imageFile || !audioFile) {
      alert('All fields and files are required.');
      return;
    }

    const forbiddenWords = ['test', 'demo', 'sample'];
    if (
      forbiddenWords.some(word => 
        title.toLowerCase().includes(word) || 
        artist.toLowerCase().includes(word)
      ) ||
      title.length < 3 || 
      artist.length < 3
    ) {
      alert('Title and artist must be at least 3 characters and cannot contain "test", "demo", or "sample".');
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

    try {
      const audio = new Audio(URL.createObjectURL(audioFile));
      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          if (audio.duration < 10 || audio.duration > 600) {
            reject('Audio must be between 10 seconds and 10 minutes.');
          }
          resolve();
        };
        audio.onerror = () => reject('Invalid audio file.');
      });
    } catch (err) {
      alert(err);
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
    let audioUrl = supabase.storage.from('audio').getPublicUrl(audioFilename).data.publicUrl;

    let stripeAccountId = null;
    if (enableGifting) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', user.id)
        .maybeSingle();

      stripeAccountId = profile?.stripe_account_id || null;
    }

    const { data: songData, error: dbError } = await supabase.from('songs').insert([
      {
        title,
        artist,
        genre: genreFlavor,
        genre_flavor: genreFlavor,
        cover: coverUrl,
        audio: audioUrl,
        user_id: user.id,
        stripe_account_id: stripeAccountId,
        is_draft: true,
      },
    ]).select().single();

    if (dbError) {
      alert('Song metadata upload failed: ' + dbError.message);
      setIsUploading(false);
      return;
    }

    if (masteringPreset) {
      setIsMastering(true);
      try {
        const response = await fetch('/api/master-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songId: songData.id, preset: masteringPreset, userId: user.id }),
        });

        const result = await response.json();
        if (response.ok) {
          audioUrl = result.masteredUrl;
          await supabase
            .from('songs')
            .update({ audio: audioUrl })
            .eq('id', songData.id);
          setMessage('✅ Song uploaded and mastered! Awaiting review.');
        } else {
          setMessage('✅ Song uploaded, but mastering failed. Awaiting review.');
        }
      } catch (err) {
        setMessage('✅ Song uploaded, but mastering failed. Awaiting review.');
      }
      setIsMastering(false);
    } else {
      setMessage('✅ Song uploaded! Awaiting review.');
    }

    await supabase.from('profiles').update({ is_artist: true }).eq('id', user.id);
    setTitle('');
    setArtist('');
    setGenreFlavor('');
    setMasteringPreset('');
    setEnableGifting(true);
    setImageFile(null);
    setAudioFile(null);
    setIsUploading(false);
    setTimeout(() => navigate('/swipe'), 1500);
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
        required
      />

      <label className="block mb-2 font-medium">Artist Name</label>
      <input
        type="text"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      />

      <label className="block mb-2 font-medium">Genre Flavor</label>
      <select
        value={genreFlavor}
        onChange={(e) => setGenreFlavor(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        required
      >
        <option value="">Select a flavor</option>
        {FLAVOR_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Mastering Preset (Optional)</label>
      <select
        value={masteringPreset}
        onChange={(e) => setMasteringPreset(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">None</option>
        {MASTERING_PRESETS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Cover Image (PNG/JPG, Max 10MB)</label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={(e) => setImageFile(e.target.files[0])}
        className="w-full p-2 border rounded mb-4"
        required
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
            'video/mp4',
          ];

          if (!validAudioTypes.includes(file.type)) {
            alert('❌ Unsupported file format. Use MP3, M4A, or audio-only MP4.');
            return;
          }

          setAudioFile(file);
        }}
        className="w-full p-2 border rounded mb-1"
        required
      />
      <p className="text-xs text-gray-400 mb-4">
        Supported formats: MP3, M4A, or audio-only MP4. Must be 10s–60s.
      </p>

      <label className="block mb-2">
        <input
          type="checkbox"
          checked={enableGifting}
          onChange={() => setEnableGifting(!enableGifting)}
          className="mr-2"
        />
        Enable Gifting (Stripe optional, connect in settings)
      </label>

      <button
        onClick={handleUpload}
        disabled={isUploading || isMastering}
        className={`w-full text-white py-2 rounded ${
          isUploading || isMastering ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? 'Uploading...' : isMastering ? 'Mastering...' : 'Upload'}
      </button>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  );
};

export default UploadScreen;
