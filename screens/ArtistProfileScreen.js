import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ArtistPage from '../components/ArtistPage';

const ArtistProfileScreen = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      console.log('ArtistProfileScreen: ID from URL:', id);
      setLoading(false);
    }
  }, [id]);

  if (!id || loading) return <div>Loading...</div>;

  return (
    <div className="artist-profile-screen">
      <ArtistPage id={id} />
    </div>
  );
};

export default ArtistProfileScreen;
