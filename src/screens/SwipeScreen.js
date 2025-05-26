import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from '../components/AuthProvider';

const SwipeScreen = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [jams, setJams] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchJams = async () => {
      const { data, error } = await supabase
        .from('jams')
        .select('id, title, album_art_url, artist_id, artist_name');

      if (error) {
        console.error('Error fetching jams:', error);
      } else {
        setJams(data);
      }
    };

    fetchJams();
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % jams.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? jams.length - 1 : prevIndex - 1
    );
  };

  if (jams.length === 0) {
    return <div className="text-white text-center mt-10">Loading jams...</div>;
  }

  const currentJam = jams[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative">
          <img
            src={currentJam.album_art_url}
            alt={currentJam.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 px-3 py-1 rounded">
            <h2 className="text-xl font-semibold">{currentJam.title}</h2>
            <button
              onClick={() => navigate(`/artist/${currentJam.artist_id}`)}
              className="text-teal-300 hover:underline mt-1"
            >
              {currentJam.artist_name}
            </button>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwipeScreen;
