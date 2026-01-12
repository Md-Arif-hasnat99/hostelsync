interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function Logo({ size = 48, className = '', showText = true }: LogoProps) {
  const iconSize = size;
  const fontSize = size * 0.25;
  
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="45" fill="url(#gradient1)" />
        
        {/* Building/Hostel icon */}
        <rect x="30" y="35" width="40" height="35" fill="white" opacity="0.9" rx="2" />
        
        {/* Windows */}
        <rect x="35" y="40" width="6" height="6" fill="url(#gradient2)" rx="1" />
        <rect x="47" y="40" width="6" height="6" fill="url(#gradient2)" rx="1" />
        <rect x="59" y="40" width="6" height="6" fill="url(#gradient2)" rx="1" />
        
        <rect x="35" y="50" width="6" height="6" fill="url(#gradient2)" rx="1" />
        <rect x="47" y="50" width="6" height="6" fill="url(#gradient2)" rx="1" />
        <rect x="59" y="50" width="6" height="6" fill="url(#gradient2)" rx="1" />
        
        {/* Door */}
        <rect x="44" y="60" width="12" height="10" fill="url(#gradient2)" rx="1" />
        
        {/* Sync arrows */}
        <path
          d="M 15 50 L 25 50 L 22 46 M 25 50 L 22 54"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 85 50 L 75 50 L 78 46 M 75 50 L 78 54"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col items-start">
          <span 
            className="font-bold text-slate-800 dark:text-white leading-none"
            style={{ fontSize: `${fontSize}px` }}
          >
            Hostel<span className="text-blue-600 dark:text-blue-400">Sync</span>
          </span>
        </div>
      )}
    </div>
  );
}
