import React, { useEffect, useState } from "react";

const JamStackView = () => {
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamstack = async () => {
      const mockData = [
        { id: "1", title: "Bow My Head", artist: "Jolie Grace", cover: "https://via.placeholder.com/240" },
        { id: "2", title: "Child of God", artist: "Jolie Grace", cover: "https://via.placeholder.com/240" },
      ];
      setJamstack(mockData);
      setLoading(false);
    };

    fetchJamstack();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading your JamStack...</div>;
  }

  if (!jamstack.length) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Your JamStack is empty. Start swiping!</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Your JamStack</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {jamstack.map((item) => (
          <div key={item.id} className="bg-gray-900 rounded-xl p-4 flex flex-col items-center shadow-lg">
            <img src={item.cover} alt={item.title} className="w-60 h-60 rounded-lg object-cover mb-4" />
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-400">by {item.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JamStackView;