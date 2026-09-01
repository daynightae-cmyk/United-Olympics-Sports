import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  orientation = 'horizontal',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    hero: 'w-36 h-36 md:w-44 md:h-44',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    hero: 'text-2xl md:text-3xl',
  };

  return (
    <div
      className={`inline-flex items-center gap-3 ${
        orientation === 'vertical' ? 'flex-col text-center' : 'flex-row'
      } ${className}`}
    >
      {/* Official Crest SVG with Lion, Shield, Laurel, & Olympic Rings */}
      <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 hover:scale-105`}>
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff8e7" />
              <stop offset="35%" stopColor="#e5c158" />
              <stop offset="70%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8a6c14" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a24" />
              <stop offset="50%" stopColor="#0d0d12" />
              <stop offset="100%" stopColor="#050507" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Crest / Shield Outline */}
          <path
            d="M100 12 L168 44 C168 116 142 166 100 190 C58 166 32 116 32 44 L100 12 Z"
            fill="url(#shieldGrad)"
            stroke="url(#goldGrad)"
            strokeWidth="4"
          />

          {/* Inner Accent Inset Border */}
          <path
            d="M100 22 L158 50 C158 110 135 153 100 174 C65 153 42 110 42 50 L100 22 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* Stylized Majestic Sovereign Lion Head */}
          <g transform="translate(100, 85) scale(0.65)" filter="url(#goldGlow)">
            {/* Lion Mane Strands */}
            <path
              d="M-55,-40 C-70,-10 -65,30 -35,55 C-45,35 -40,10 -30,-5 Z"
              fill="url(#goldGrad)"
            />
            <path
              d="M55,-40 C70,-10 65,30 35,55 C45,35 40,10 30,-5 Z"
              fill="url(#goldGrad)"
            />
            <path
              d="M-40,-55 C-55,-40 -50,-10 -25,-25 C-35,-45 -20,-50 -10,-55 Z"
              fill="url(#goldGrad)"
            />
            <path
              d="M40,-55 C55,-40 50,-10 25,-25 C35,-45 20,-50 10,-55 Z"
              fill="url(#goldGrad)"
            />
            {/* Lion Crown Crest */}
            <polygon
              points="0,-68 -16,-50 -26,-62 -8,-40 0,-48 8,-40 26,-62 16,-50"
              fill="url(#goldGrad)"
            />
            {/* Lion Face / Jaw Structure */}
            <path
              d="M-28,-20 L28,-20 L22,18 L0,38 L-22,18 Z"
              fill="#121218"
              stroke="url(#goldGrad)"
              strokeWidth="2.5"
            />
            {/* Lion Eyes & Nose & Whiskers */}
            <circle cx="-10" cy="-6" r="3" fill="url(#goldGrad)" />
            <circle cx="10" cy="-6" r="3" fill="url(#goldGrad)" />
            <polygon points="0,6 -6,0 6,0" fill="url(#goldGrad)" />
            <path d="M0,6 L0,16 M0,16 L-8,22 M0,16 L8,22" stroke="url(#goldGrad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M-15,4 L-28,2 M-15,8 L-29,10 M-15,12 L-26,18" stroke="url(#goldGrad)" strokeWidth="1.2" />
            <path d="M15,4 L28,2 M15,8 L29,10 M15,12 L26,18" stroke="url(#goldGrad)" strokeWidth="1.2" />
          </g>

          {/* 5 Olympic Rings at the Shield Base */}
          <g transform="translate(100, 148) scale(0.68)">
            {/* Top row */}
            <circle cx="-24" cy="-5" r="9" fill="none" stroke="#0081C8" strokeWidth="2.5" />
            <circle cx="0" cy="-5" r="9" fill="none" stroke="#F4C300" strokeWidth="2.5" />
            <circle cx="24" cy="-5" r="9" fill="none" stroke="#00A651" strokeWidth="2.5" />
            {/* Bottom row interlocking */}
            <circle cx="-12" cy="5" r="9" fill="none" stroke="#000000" strokeWidth="2.5" />
            <circle cx="12" cy="5" r="9" fill="none" stroke="#EE334E" strokeWidth="2.5" />
          </g>

          {/* Top Star Accent */}
          <polygon
            points="100,20 102,26 108,27 104,31 105,37 100,34 95,37 96,31 92,27 98,26"
            fill="url(#goldGrad)"
          />
        </svg>
      </div>

      {/* Official Bilingual Typography */}
      {showText && (
        <div className={`flex flex-col ${orientation === 'vertical' ? 'items-center' : 'items-start'}`}>
          <div className="flex items-center gap-1.5 font-bold tracking-wider font-brand text-amber-100">
            <span className={`${textSizes[size]} uppercase tracking-widest text-amber-200 font-extrabold drop-shadow`}>
              United Olympics Sports
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-semibold font-arabic text-sm">
            <span className="tracking-wide">يونايتد أوليمبيكس سبورت</span>
          </div>
        </div>
      )}
    </div>
  );
};
