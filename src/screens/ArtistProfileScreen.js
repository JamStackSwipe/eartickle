// src/screens/ArtistProfileScreen.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArtistPage from '../components/ArtistPage'; // Ensure you have the correct import path

const ArtistProfileScreen = () => {
  const { id } = useParams(); // Grab the artist ID from the URL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Optionally, you can fetch some data to populate, if needed
    setLoading(false);
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="artist-profile-screen">
      {/* Pass the id to the ArtistPage component */}
      <ArtistPage id={id} />
    </div>
  );
};

export default ArtistProfileScreen;
