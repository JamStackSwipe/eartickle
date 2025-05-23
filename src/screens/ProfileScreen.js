import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const ProfileScreen = () => {
  const { user } = useUser();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, display_name, bio')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
      } else if (data) {
        console.log("✅ Profile loaded:", data);
        if (data.avatar_url) {
          console.log("🖼 Avatar from DB:", data.avatar_url);
          setAvatarUrl(data.avatar_url);
        }
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('❌ Failed to upload avatar');
      console.error("Upload error:", uploadError.message);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = data?.publicUrl;

    console.log("🖼 New avatar public URL:", publicUrl);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      alert('❌ Failed to update avatar');
      console.error("Update error:", updateError.m
