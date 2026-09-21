import React from 'react';

export type SportMindState = 'idle' | 'thinking' | 'streaming' | 'complete' | 'error';

interface SportMindCoreProps {
  state?: SportMindState;
  size?: number;
  className?: string;
  sport?: string;
}

/**
 * UOS SPORTMIND CORE — Signature Visual Object
 * Layered circular performance rings, tactical field arcs, timing ticks, and intelligent pulse.
 * Calm when idle, subtly active when thinking or streaming.
 * Respects prefers-reduced-motion, works seamlessly in Day and Dark modes.
 */
export const SportMindCore: React.FC<SportMindCoreProps> = ({
  state = 'idle',
  size = 120,
  className = '',
  sport,
}) => {
  const sportName = sport?.toLowerCase() || 'general';
  const isSwimming = sportName.includes('swim');
  const isBasketball = sportName.includes('basket');

  return (
    <div
      className={`sportmind-core-container sportmind-core--${state} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`SportMind Core: ${state}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="sportmind-core-svg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="uos-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--uos-gold-secondary, #e9d8a6)" />
            <stop offset="100%" stopColor="var(--uos-gold-primary, #c9a227)" />
          </linearGradient>
          <linearGradient id="uos-navy-pulse" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.25)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0.05)" />
          </linearGradient>
        </defs>

        {/* Ambient Pulse Aura */}
        <circle
          cx="50"
          cy="50"
          r="46"
          className="sportmind-aura"
          fill="url(#uos-navy-pulse)"
        />

        {/* Outer Timing Ticks Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          className="sportmind-ring-ticks"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="1.5 5.5"
          opacity="0.45"
        />

        {/* Outer Orbit / Tactical Arc */}
        <circle
          cx="50"
          cy="50"
          r="38"
          className="sportmind-ring-orbit"
          stroke="url(#uos-gold-grad)"
          strokeWidth="1.5"
          strokeDasharray="60 30"
          strokeLinecap="round"
        />

        {/* Mid Performance Ring / Lane or Court Geometry */}
        {isSwimming ? (
          // Swimming Lane Lines abstraction
          <>
            <line x1="20" y1="42" x2="80" y2="42" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
            <line x1="16" y1="50" x2="84" y2="50" stroke="url(#uos-gold-grad)" strokeWidth="1.2" opacity="0.8" />
            <line x1="20" y1="58" x2="80" y2="58" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
          </>
        ) : isBasketball ? (
          // Court 3-point Arc abstraction
          <>
            <path d="M 24 64 A 28 28 0 0 1 76 64" stroke="url(#uos-gold-grad)" strokeWidth="1.2" fill="none" opacity="0.7" />
            <circle cx="50" cy="40" r="5" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
          </>
        ) : (
          // Standard Athletic / Tactical Field Ring
          <circle
            cx="50"
            cy="50"
            r="28"
            className="sportmind-ring-inner"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="25 15 10 15"
            opacity="0.6"
          />
        )}

        {/* Core Nucleus & Tactical Focus Dots */}
        <circle
          cx="50"
          cy="50"
          r="14"
          className="sportmind-nucleus"
          fill="url(#uos-gold-grad)"
        />

        <circle
          cx="50"
          cy="50"
          r="6"
          className="sportmind-nucleus-center"
          fill="var(--uos-canvas, #0a0c12)"
        />

        {/* Tactical Crosshair Nodes */}
        <circle cx="50" cy="6" r="1.5" fill="var(--uos-gold-primary, #c9a227)" />
        <circle cx="94" cy="50" r="1.5" fill="var(--uos-gold-primary, #c9a227)" />
        <circle cx="50" cy="94" r="1.5" fill="var(--uos-gold-primary, #c9a227)" />
        <circle cx="6" cy="50" r="1.5" fill="var(--uos-gold-primary, #c9a227)" />
      </svg>
    </div>
  );
};
