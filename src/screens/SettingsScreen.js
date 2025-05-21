import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const SettingsScreen = () => {
  const [form, setForm] = useState({ username: '', email: '', bio: '' });
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setStatus({ type: 'error', message: 'You must be logged in to access settings.' });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(error);
        setStatus({ type: 'error', message: 'Failed to load profile.' });
      } else {
        setForm({
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
        });
      }

      setIsLoading(false);
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setStatus(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        email: form.email,
        bio: form.bio,
      })
      .eq('id', user.id);

    if (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to save changes.' });
    } else {
      setStatus({ type: 'success', message: 'Settings updated successfully.' });
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading settings...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {status && (
        <div
          className={`p-3 rounded ${
            status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-gray-700">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Email</span>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded"
          />
        </label>

        <label className="block">
          <span className="text-gray-700">Bio</span>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded"
            rows="3"
          />
        </label>

        <button
          onClick={handleSave}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
