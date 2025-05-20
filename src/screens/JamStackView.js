import React, { useEffect, useState } from "react";

const JamStackView = () => {
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with real API or localStorage call
    const fetchJamstack = async () => {
      try {
        const mockData = [
          {
            id: "1",
            title: "My Best Friend Is Jesus",
            artist: "Jolie Grace",
            cover: "https://via.placeholder.com/240", // Replace with actual URL
          },
          {
            id: "2",
            title: "Child of God",
            artist: "Jolie Grace",
            cover: "https://via.placeholder.com/240",
          },
        ];
        setJamstack(mockData);
      } catch (err) {
        console.error("Error loading JamStack:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJamstack();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Loading your JamStack...
      </div>
    );
  }

  if (!jamstack.length) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Your JamStack is empty. Start swiping!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Your JamStack</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {jamstack.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 rounded-xl p-4 flex flex-col items-center shadow-lg"
          >
            <img
              src={item.cover}
