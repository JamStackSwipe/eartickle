// In pages/artist/[id].js – Mark as client component for browser APIs
'use client'; // Add this at top if not there (forces client render)

import { useEffect, useState } from 'react';
// ... other imports

const ArtistPage = ({ params }) => {
  const [tickleSound, setTickleSound] = useState(null); // State for Audio

  useEffect(() => {
    // Create Audio client-side only
    if (typeof window !== 'undefined') {
      setTickleSound(new Audio('/sounds/tickle.mp3'));
    }
  }, []);

  const playTickle = () => {
    if (tickleSound) {
      tickleSound.play().catch(console.error);
    }
  };

  // ... rest of component (e.g., fetch songs, map to SongCard)
  return (
    <div>
      {/* Your artist JSX */}
      <button onClick={playTickle}>Play Tickle</button>
    </div>
  );
};

export default ArtistPage;
