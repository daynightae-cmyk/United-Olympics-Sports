/**
 * UOS SPORTMIND — Arena Reveal Experience
 * Tactical field lines animation -> Core emerges -> Panel expands.
 * Finite state model: 'idle' | 'field-lines' | 'core-emerging' | 'revealed' | 'collapsed'
 * Auto-collapse timer (10s, within 8-12s requirement) with hover/focus pause.
 * Mobile bottom sheet at <= 480px / 390px with safe area padding.
 * Public copy truth & approved public actions:
 * - Explore Sports (/programs)
 * - Find Your Program (/programs)
 * - Ask SportMind (opens assistant drawer)
 * - Enter Arena (/assistant)
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { SportMindCore } from './SportMindCore';
import { BilingualText, bi } from '../bilingual/BilingualText';

export type RevealState = 'idle' | 'field-lines' | 'core-emerging' | 'revealed' | 'collapsed';

export interface SportMindArenaRevealProps {
  onOpenArena?: () => void;
  onAskSportMind?: () => void;
  onDismiss?: () => void;
  onAutoCollapse?: () => void;
  autoCollapseMs?: number; // default 10000ms (10s)
}

export const SportMindArenaReveal: React.FC<SportMindArenaRevealProps> = ({
  onOpenArena,
  onAskSportMind,
  onDismiss,
  onAutoCollapse,
  autoCollapseMs = 10000,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<RevealState>('idle');
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Finite State Transition Lifecycle
  useEffect(() => {
    // 1. Tactical field lines begin after 300ms
    const t1 = setTimeout(() => setState('field-lines'), 300);
    // 2. Core emerges after field lines draw (800ms)
    const t2 = setTimeout(() => setState('core-emerging'), 1100);
    // 3. Panel expands after core emerges (700ms)
    const t3 = setTimeout(() => setState('revealed'), 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Auto-collapse timer: 10s after becoming revealed (8-12s requirement)
  useEffect(() => {
    if (state !== 'revealed' || isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(() => {
      setState('collapsed');
      onAutoCollapse?.();
    }, autoCollapseMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, isPaused, autoCollapseMs, onAutoCollapse]);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleDismiss = () => {
    if (isMountedRef.current) setState('collapsed');
    onDismiss?.();
  };

  // Escape key accessibility: close reveal on Escape
  useEffect(() => {
    if (state === 'idle' || state === 'collapsed') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [state, onDismiss]);

  const handleEnterArena = () => {
    if (isMountedRef.current) setState('collapsed');
    if (onOpenArena) {
      onOpenArena();
    } else {
      navigate('/assistant');
    }
  };

  const handleAskSportMind = () => {
    if (isMountedRef.current) setState('collapsed');
    if (onAskSportMind) {
      onAskSportMind();
    }
  };

  const handleExploreSports = () => {
    if (isMountedRef.current) setState('collapsed');
    onAutoCollapse?.();
    navigate('/programs');
  };

  const handleFindProgram = () => {
    if (isMountedRef.current) setState('collapsed');
    onAutoCollapse?.();
    navigate('/programs');
  };

  if (state === 'idle' || state === 'collapsed') {
    return null;
  }

  return (
    <div
      className={`sportmind-reveal-container sportmind-reveal--${state}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="dialog"
      aria-label="SportMind Arena Reveal | ساحة الذكاء الرياضي"
      data-reveal-state={state}
    >
      {/* 1. Tactical Field Lines Animation SVG */}
      <div className="sportmind-reveal-field" aria-hidden="true">
        <svg viewBox="0 0 360 140" className="sportmind-reveal-svg" fill="none">
          <defs>
            <linearGradient id="reveal-gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(212,175,55,0.05)" />
              <stop offset="50%" stopColor="rgba(233,216,166,0.9)" />
              <stop offset="100%" stopColor="rgba(212,175,55,0.05)" />
            </linearGradient>
          </defs>
          <path
            d="M 10 70 L 350 70"
            className="sportmind-reveal-line sportmind-reveal-axis"
            stroke="url(#reveal-gold-grad)"
            strokeWidth="1.5"
          />
          <circle
            cx="180"
            cy="70"
            r="40"
            className="sportmind-reveal-line sportmind-reveal-center-circle"
            stroke="url(#reveal-gold-grad)"
            strokeWidth="1.2"
          />
          <rect
            x="15"
            y="15"
            width="330"
            height="110"
            rx="12"
            className="sportmind-reveal-line sportmind-reveal-bounds"
            stroke="url(#reveal-gold-grad)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* 2. Emerging SportMind Core */}
      <div className="sportmind-reveal-core-anchor">
        <SportMindCore
          size={state === 'revealed' ? 42 : 56}
          state={state === 'revealed' ? 'idle' : 'thinking'}
        />
      </div>

      {/* 3. Expanding Panel & Interactive Actions */}
      {state === 'revealed' && (
        <div className="sportmind-reveal-panel uos-glass-4">
          <div className="sportmind-reveal-header">
            <div className="sportmind-reveal-brand">
              <Sparkles size={14} className="sportmind-gold-icon" />
              <span className="sportmind-reveal-tag">
                <BilingualText value={bi('UOS SPORTMIND ARENA', 'ساحة الذكاء الرياضي')} />
              </span>
            </div>
            <button
              type="button"
              className="sportmind-reveal-close-btn"
              onClick={handleDismiss}
              aria-label="Close reveal | إغلاق"
            >
              <X size={15} />
            </button>
          </div>

          <div className="sportmind-reveal-body">
            <h3 className="sportmind-reveal-title">
              <BilingualText
                value={bi('United Sports Intelligence Arena', 'ساحة يونايتد للذكاء الرياضي')}
              />
            </h3>
            <p className="sportmind-reveal-description">
              <BilingualText
                value={bi(
                  'Explore sports, programs, training guidance, and the UOS experience with SportMind.',
                  'استكشف الرياضات والبرامج والتوجيه التدريبي وتجربة يونايتد مع SportMind.',
                )}
              />
            </p>
          </div>

          <div className="sportmind-reveal-quick-links">
            <button
              type="button"
              className="sportmind-reveal-chip uos-touch"
              onClick={handleExploreSports}
            >
              <BilingualText value={bi('Explore Sports', 'استكشف الرياضات')} />
            </button>
            <button
              type="button"
              className="sportmind-reveal-chip uos-touch"
              onClick={handleFindProgram}
            >
              <BilingualText value={bi('Find Your Program', 'اكتشف برنامجك')} />
            </button>
            <button
              type="button"
              className="sportmind-reveal-chip uos-touch"
              onClick={handleAskSportMind}
            >
              <BilingualText value={bi('Ask SportMind', 'اسأل SportMind')} />
            </button>
          </div>

          <div className="sportmind-reveal-actions">
            <button
              type="button"
              className="sportmind-btn-enter-arena uos-touch"
              onClick={handleEnterArena}
            >
              <span>
                <BilingualText value={bi('Enter Arena', 'دخول الساحة')} />
              </span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="sportmind-btn-later uos-touch"
              onClick={handleDismiss}
            >
              <BilingualText value={bi('Later', 'لاحقاً')} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
