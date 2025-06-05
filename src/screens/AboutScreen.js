import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutScreen = () => {
  const navigate = useNavigate();

  const handleJoinNow = () => {
    navigate('/signup'); // Adjust to your signup route
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center" style={{ color: '#3FD6CD' }}>
          Welcome to EarTickle™
        </h1>
        <p className="text-center text-gray-700 text-lg sm:text-xl">
          A community where music feels alive again. Scroll, discover, and connect with artists who pour their soul into every note.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
          <p className="text-gray-600 text-base sm:text-lg">
            EarTickle is a love letter to music’s golden days—when you’d stack cassettes, flip CDs, and let songs tell your story. We’re bringing that magic back with a modern twist, like TikTok for music lovers. Scroll through raw, real tracks. Build your <span className="font-semibold text-[#3FD6CD]">JamStack™</span>. Feel the vibe.
          </p>

          <p className="text-gray-600 text-base sm:text-lg">
            Today’s platforms push soulless hits and pay artists pennies. Not us. EarTickle is where <span className="font-semibold text-[#3FD6CD]">talent rises</span>, fans reward creators directly, and music heals, inspires, and unites.
          </p>

          <blockquote className="border-l-4 pl-4 italic text-gray-500 text-base" style={{ borderColor: '#3FD6CD' }}>
            “Music should lift you up, not drag you down. EarTickle is where hope sounds alive.”
          </blockquote>

          <h2 className="text-2xl font-bold text-center" style={{ color: '#3FD6CD' }}>
            Why Join Our Community?
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🎵', text: 'Scroll through fresh songs, TikTok-style, and discover hidden gems.' },
              { icon: '📚', text: 'Build your JamStack™—your personal mixtape, revived.' },
              { icon: '🎤', text: 'Artists upload in seconds and connect with fans who care.' },
              { icon: '🎁', text: 'Send Tickles to reward artists directly for music that moves you.' },
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-600">{item.text}</span>
              </li>
            ))}
          </ul>

          <p className="text-gray-600 text-base sm:text-lg">
            EarTickle isn’t just an app—it’s a movement. For artists who dream big. For fans who crave real music. For a world where creativity thrives.
          </p>

          <div className="text-center">
            <button
              onClick={handleJoinNow}
              className="px-6 py-3 text-white rounded-lg text-lg font-semibold hover:shadow-lg transition"
              style={{ backgroundColor: '#3FD6CD' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2CB9B0')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3FD6CD')}
            >
              Join EarTickle Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;
