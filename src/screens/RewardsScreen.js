import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../components/AuthProvider';

const RewardsScreen = () => {
  const { user, loading: authLoading } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchRewards();
    }
  }, [authLoading, user]);

  const fetchRewards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError('Failed to load rewards.');
    } else {
      setRewards(data);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return <p className="text-center mt-10">Loading rewards...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Please log in to view rewards.</p>;
  }

  if (error) {
    return <p className="te
