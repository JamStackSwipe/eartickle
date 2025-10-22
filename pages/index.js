// pages/index.js – Basic home screen (landing with login + teaser)
import React from 'react';
import Link from 'next/link';
import Header from '../components/Header'; // Adjust if path changed

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl font-bold text-[#3FD6CD] mb-4">EarTickle</h1>
          <p className="text-xl text-gray-700 mb-8">Swipe. Stack. Play. Rediscover your jams with a twist.</p>
          <div className="space-y-4">
            <Link href="/login">
              <button className="w-full max-w-md bg-[#3FD6CD] text-white py-4 px-6 rounded-full text-lg font-semibold hover:bg-[#2CB9B0] transition">
                Get Started – Login with GitHub/Google
              </button>
            </Link>
            <p className="text-sm text-gray-500">Or <Link href="/swipe" className="text-[#3FD6CD] hover:underline">demo swipe</Link> without login.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-[#3FD6CD]">🎵 Swipe</h3>
              <p className="text-sm text-gray-600">Discover new tracks like Tinder for music.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-[#3FD6CD]">📚 Stack</h3>
              <p className="text-sm text-gray-600">Build your personal jam collection.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold text-[#3FD6CD]">🎁 Tickles</h3>
              <p className="text-sm text-gray-600">Gift fans and artists with virtual love.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
