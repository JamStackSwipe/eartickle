import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="w-full bg-black text-gray-400 text-xs py-4 px-4 text-center mt-auto">
    <div className="space-x-3">
      <Link to="/privacy" className="hover:underline">🔒 Privacy</Link>
      <Link to="/terms" className="hover:underline">📄 Terms</Link>
      <Link to="/about" className="hover:underline">📖 About</Link>
      <a href="https://github.com/JamStackSwipe/eartickle/wiki" target="_blank" rel="noreferrer" className="hover:underline">📘 Wiki</a>
      <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noreferrer" className="hover:underline">🔗 GitHub</a>
    </div>
  </footer>
);

export default Footer;
