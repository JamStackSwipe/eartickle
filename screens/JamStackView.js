import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "../components/AuthProvider";

const JamStackView = () => {
  const { user } = useUser();
  const router = useRouter();
  const [jamstack, setJamstack] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJamstack = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/jamstack/get');
        
        if (!response.ok) {
          throw new Error('Failed to fetch JamStack');
        }

        const data = await response.json();
        setJamstack(data);
      } catch (error) {
        console.error('Error fetching JamStack:', error);
        setJamstack([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJamstack();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading your JamStack...
      </div>
    );
  }

  if (!jamstack.length) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
            onClick={() => router.push(`/song/${item.id}`)}
            className="bg-gray-900 rounded-xl p-4 flex flex-col items-center shadow-lg cursor-pointer hover:bg-gray-800 transition"
          >
            <img
              src={item.cover_url || '/default-cover.png'}
              alt={item.title}
              className="w-60 h-60 rounded-lg object-cover mb-4"
            />
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-400">by {item.artist}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JamStackView;
