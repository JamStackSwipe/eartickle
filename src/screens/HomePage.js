import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <img src="/logo-icon.png" alt="EarTickle Logo" className="w-20 h-20 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Scroll. Stack. Play.</h1>
        <p className="text-lg text-gray-300 mb-6">
          Discover your next favorite artist — and help them rise.
        </p>
        <Link to="/auth" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full">
          Get Started
        </Link>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900 py-16 px-6">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
          <div>
            <span className="text-4xl">🎧</span>
            <h3 className="font-semibold text-lg mt-2">Scroll the Feels</h3>
            <p className="text-sm text-gray-400">Swipe through songs, find your vibe.</p>
          </div>
          <div>
            <span className="text-4xl">📦</span>
            <h3 className="font-semibold text-lg mt-2">Stack the Fire</h3>
            <p className="text-sm text-gray-400">Add favorites to your JamStack™.</p>
          </div>
          <div>
            <span className="text-4xl">🎁</span>
            <h3 className="font-semibold text-lg mt-2">Send Tickles</h3>
            <p className="text-sm text-gray-400">Support artists with emoji gifts.</p>
          </div>
          <div>
            <span className="text-4xl">🌟</span>
            <h3 className="font-semibold text-lg mt-2">Help Them Rise</h3>
            <p className="text-sm text-gray-400">Your support lifts real talent.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 text-center">
        <h2 className="text-2xl font-bold mb-4">No ads. Just good music and real connections.</h2>
        <p className="text-gray-400 mb-8">EarTickle is where music meets momentum.</p>
        <Link to="/auth" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full">
          Join the Movement
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6 bg-black border-t border-gray-800">
        <div className="mb-2">© {new Date().getFullYear()} EarTickle™</div>
        <div className="space-x-4">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
