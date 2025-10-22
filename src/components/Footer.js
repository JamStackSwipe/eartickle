import Link from 'next/link';

const Footer = () => (
  <footer className="w-full bg-black text-gray-400 text-xs py-4 px-4 text-center mt-auto">
    <div className="space-x-3">
      <Link href="/privacy" className="hover:underline">🔒 Privacy</Link>
      <Link href="/terms" className="hover:underline">📄 Terms</Link>
      <Link href="/about" className="hover:underline">📖 About</Link>
      <Link href="/flavors" className="hover:underline">🎨 Flavors</Link>
      <a href="https://github.com/JamStackSwipe/eartickle/wiki" target="_blank" rel="noreferrer" className="hover:underline">📘 Wiki</a>
      <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noreferrer" className="hover:underline">🔗 GitHub</a>
    </div>
  </footer>
);

export default Footer;
