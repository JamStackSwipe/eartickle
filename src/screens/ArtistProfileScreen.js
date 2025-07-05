// src/screens/ArtistProfilePage.js
import React from 'react';
import ArtistPage from '../components/ArtistPage'; // Correct the import path to components

const ArtistProfilePage = () => {
  return (
    <div className="artist-profile-page">
      <ArtistPage /> {/* This will render the artist profile dynamically based on the user ID */}
    </div>
  );
};

export default ArtistProfilePage;
