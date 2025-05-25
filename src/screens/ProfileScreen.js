// 🖼 Avatar Upload Code (to use in ProfileScreen.js)
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const AvatarUploader = () => {
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const filePath = `${user.id}/avatar.png`;
    setUploading(true);
    setMessage('');

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: 'public, max-age=3600'
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError.message);
      setMessage('Upload failed.');
      setUploading(false);
      return;
    }

    const publicUrl = `https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/avatars/${filePath}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Profile update error:', updateError.message);
      setMessage('Avatar saved but profile update failed.');
    } else {
      setMessage('✅ Avatar updated!');
    }

    setUploading(false);
  };

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium mb-1">Upload Avatar</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="text-sm"
        disabled={uploading}
      />
      {message && <p className="text-xs mt-1">{message}</p>}
    </div>
  );
};

export default AvatarUploader;
