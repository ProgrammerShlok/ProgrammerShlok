
import React from 'react';

interface ArcLogoProps {
  active?: boolean;
  size?: number;
}

const ArcLogo: React.FC<ArcLogoProps> = ({ active, size = 48 }) => {
  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer Glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${active ? 'bg-cyan-400/20 blur-md scale-110' : 'bg-cyan-900/10 blur-sm'}`} />
      
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] ${active ? 'animate-[spin_10s_linear_infinite]' : ''}`}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        
        {/* Outer Ring */}
        <circle 
          cx="50" cy="50" r="45" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          className="opacity-20 text-cyan-500" 
        />
        
        {/* Segmented Ring */}
        <circle 
          cx="50" cy="50" r="38" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeDasharray="15 5" 
          className={`text-cyan-400 transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-40'}`}
        />
        
        {/* Inner Details */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <rect
            key={angle}
            x="48" y="15" width="4" height="12"
            fill="currentColor"
            transform={`rotate(${angle}, 50, 50)`}
            className={`text-cyan-300 transition-all duration-500 ${active ? 'opacity-100 scale-y-110' : 'opacity-30'}`}
          />
        ))}
        
        {/* The Core */}
        <circle 
          cx="50" cy="50" r="12" 
          fill="url(#arcGrad)" 
          className={`${active ? 'animate-pulse' : 'opacity-50'}`} 
        />
        <circle 
          cx="50" cy="50" r="6" 
          fill="white" 
          className={`transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} 
        />
      </svg>

      {/* Internal Rotating Element (Opposite direction if active) */}
      <div className={`absolute w-[60%] h-[60%] border-2 border-dashed border-cyan-400/30 rounded-full ${active ? 'animate-[spin_4s_linear_infinite_reverse]' : ''}`} />
    </div>
  );
};

export default ArcLogo;
