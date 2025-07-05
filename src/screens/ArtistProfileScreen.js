
// src/screens/ArtistProfilePage.js
import React from 'react';
import ArtistPage from './ArtistPage'; // Import the newly created ArtistPage component

const ArtistProfilePage = () => {
  return (
    <div className="artist-profile-page">
      <ArtistPage /> {/* This will render the artist profile dynamically based on the user ID */}
    </div>
  );
};

export default ArtistProfilePage;
