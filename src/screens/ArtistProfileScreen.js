import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArtistPage from '../components/ArtistPage';

const ArtistProfileScreen = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ArtistProfileScreen: ID from URL:', id);
    setLoading(false);
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="artist-profile-screen">
      <ArtistPage id={id} />
    </div>
  );
};

export default ArtistProfileScreen;
