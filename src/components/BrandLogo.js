import { useNavigate } from 'react-router-dom';

const BrandLogo = ({ to = '/swipe', className = '' }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col cursor-pointer select-none active:opacity-80 ${className}`}
      onClick={() => navigate(to)}
    >
      <div className="text-xl sm:text-2xl font-bold text-white hover:text-gray-300">🎵 EarTickle</div>
      <div className="text-[10px] sm:text-xs text-gray-400 -mt-0.5 sm:ml-1">Swipe. Stack. Play.</div>
    </div>
  );
};

export default BrandLogo;
