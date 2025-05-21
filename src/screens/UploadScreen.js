import React, { useState } from 'react';
import { supabase } from '../supabase';

const UploadScreen = () => {
  const [title, setTitle] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [mp3File, setMp3File] = useState(null);
  const [message, setMessage] = useState('');

  const validateFile = (file, allowedTypes, maxSizeMB) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (!allowedTypes.includes(file.type)) return `Invalid file type: ${file.type}`;
    if (file.size > maxSizeBytes) return `File too large. Max size is ${maxSizeMB}MB.`;
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

    // Upload files
    const coverPath = `${userId}/covers/${timestamp}.${coverFile.name.split('.').pop()}`;
    const mp3Path = `${userId}/songs/${timestamp}.${mp3File.name.split('.').pop()}`;

    const { error: coverError } = await supabase.storage
      .from('covers')
      .upload(coverPath, coverFile, { upsert: true });
    if (coverError) return setMessage('Error uploading cover.');

    const { error: mp3Error } = await supabase.storage
      .from('mp3s')
      .upload(mp3Path, mp3File, { upsert: true });
    if (mp3Error) return set
