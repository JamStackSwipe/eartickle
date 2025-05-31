import { useNavigate } from 'react-router-dom';

const BrandLogo = ({ to = '/swipe', className = '' }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className={`flex items-center gap-3 cursor-pointer select-none ${className}`}
    >
      <img
        src="/logo-icon.png" // ✅ This should be your ear+headphones icon
        alt="EarTickle Icon"
        className="w-10 h-10 sm:w-12 sm:h-12"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-xl sm:text-2xl font-bold text-white">EAR TICKLE</span>
        <span className="text-xs sm:text-sm text-gray-400 -mt-1">Scroll. Stack. Play.</span>
      </div>
    </div>
  );
};

export default BrandLogo;

