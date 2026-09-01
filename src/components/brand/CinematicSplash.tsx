import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Volume2, VolumeX, ArrowRight, Play, Sparkles } from 'lucide-react';

interface CinematicSplashProps {
  onComplete: () => void;
  autoPlayDuration?: number;
}

export const CinematicSplash: React.FC<CinematicSplashProps> = ({
  onComplete,
  autoPlayDuration = 3600,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(true);

  useEffect(() => {
    // 0.00-0.25: Black hold
    // 0.25-0.55: Atmosphere & gold particles
    const stage1 = setTimeout(() => setStage(1), 300);
    // 0.55-0.95: Crest shield outline laser trace
    const stage2 = setTimeout(() => setStage(2), 850);
    // 0.95-1.65: Lion eyes glow & depth activation
    const stage3 = setTimeout(() => setStage(3), 1400);
    // 1.65-2.55: Lion emergence from heart of logo & energy pulse
    const stage4 = setTimeout(() => setStage(4), 2100);
    // 2.55-3.35: Official logo resolves with bilingual brand lockup & tagline
    const stage5 = setTimeout(() => setStage(5), 2800);
    // Transition out
    const finish = setTimeout(() => {
      onComplete();
    }, autoPlayDuration);

    return () => {
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(stage3);
      clearTimeout(stage4);
      clearTimeout(stage5);
      clearTimeout(finish);
    };
  }, [autoPlayDuration, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.6, ease: 'easeInOut' } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-amber-100 overflow-hidden select-none"
    >
      {/* Layer 0: Pure Near-Black Background with Subtle Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#110e05]/30 via-[#080808] to-[#050505]" />

      {/* Layer 1: Atmosphere & Gold Particles */}
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Atmospheric Gold Energy Aura */}
      <motion.div
        animate={{
          scale: stage >= 4 ? [1, 1.15, 1.05] : [0.8, 1, 0.8],
          opacity: stage >= 2 ? (stage >= 4 ? 0.25 : 0.15) : 0,
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-amber-500/20 blur-[100px] pointer-events-none"
      />

      {/* Top Utility Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-mono tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>CANONICAL CINEMATIC REVEAL • العرض السينمائي الرسمي</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="splash-sound-toggle"
            onClick={() => setMuted(!muted)}
            className="px-3 py-1.5 rounded-full bg-zinc-900/80 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 hover:bg-amber-500/20 transition backdrop-blur-md cursor-pointer"
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{muted ? 'Sound Muted • كتم' : 'Sound Active • تفعيل'}</span>
          </button>

          <button
            id="splash-skip-btn"
            onClick={onComplete}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/30 to-amber-500/40 border border-amber-400/50 text-amber-200 text-xs font-semibold flex items-center gap-1.5 hover:from-amber-600/50 hover:to-amber-500/60 transition shadow-[0_0_15px_rgba(212,175,55,0.2)] backdrop-blur-md cursor-pointer"
          >
            <span>Skip Intro • تخطي</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Visual Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl px-6 text-center">
        {/* Layer 2 to 5: Heraldic Shield & Sovereign Lion Emergence */}
        <div className="relative w-52 h-52 md:w-64 md:h-64 mb-6 flex items-center justify-center">
          {/* Energy Ring Pulsing */}
          {stage >= 4 && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [1, 1.25, 1.1], opacity: [0.8, 0, 0.4] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-amber-400 blur-[1px]"
            />
          )}

          {/* SVG Animated Official Emblem Container */}
          <motion.svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="splashGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff9e6" />
                <stop offset="30%" stopColor="#f3e5ab" />
                <stop offset="60%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#7a5e0b" />
              </linearGradient>
              <linearGradient id="splashShield" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#181820" />
                <stop offset="60%" stopColor="#0d0d12" />
                <stop offset="100%" stopColor="#050507" />
              </linearGradient>
              <filter id="splashGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Layer 2: Shield Silhouette Laser Path */}
            <motion.path
              d="M100 12 L168 44 C168 116 142 166 100 190 C58 166 32 116 32 44 L100 12 Z"
              fill="url(#splashShield)"
              stroke="url(#splashGold)"
              strokeWidth="3.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: stage >= 2 ? 1 : 0,
                opacity: stage >= 2 ? 1 : 0,
              }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            />

            {/* Inner Golden Inset Contour */}
            <motion.path
              d="M100 22 L158 50 C158 110 135 153 100 174 C65 153 42 110 42 50 L100 22 Z"
              fill="none"
              stroke="url(#splashGold)"
              strokeWidth="1.2"
              strokeDasharray="4 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 0.75 : 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            {/* Layer 3 & 4: Sovereign Lion Awakening and Emergence */}
            <motion.g
              transform="translate(100, 85)"
              initial={{ scale: 0.5, opacity: 0, z: 0 }}
              animate={{
                scale: stage >= 4 ? 0.74 : stage >= 3 ? 0.65 : 0.5,
                opacity: stage >= 3 ? 1 : 0,
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              filter="url(#splashGlow)"
            >
              {/* Lion Mane Strands */}
              <path
                d="M-55,-40 C-70,-10 -65,30 -35,55 C-45,35 -40,10 -30,-5 Z"
                fill="url(#splashGold)"
              />
              <path
                d="M55,-40 C70,-10 65,30 35,55 C45,35 40,10 30,-5 Z"
                fill="url(#splashGold)"
              />
              <path
                d="M-40,-55 C-55,-40 -50,-10 -25,-25 C-35,-45 -20,-50 -10,-55 Z"
                fill="url(#splashGold)"
              />
              <path
                d="M40,-55 C55,-40 50,-10 25,-25 C35,-45 20,-50 10,-55 Z"
                fill="url(#splashGold)"
              />
              {/* Lion Crown */}
              <polygon
                points="0,-68 -16,-50 -26,-62 -8,-40 0,-48 8,-40 26,-62 16,-50"
                fill="url(#splashGold)"
              />
              {/* Lion Face Box */}
              <path
                d="M-28,-20 L28,-20 L22,18 L0,38 L-22,18 Z"
                fill="#121218"
                stroke="url(#splashGold)"
                strokeWidth="2.5"
              />
              {/* Glowing Eyes on Stage 3 */}
              <motion.circle
                cx="-10"
                cy="-6"
                r="3.2"
                fill="#ffffff"
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 3 ? [0, 1, 0.8] : 0 }}
                transition={{ duration: 0.6 }}
              />
              <motion.circle
                cx="10"
                cy="-6"
                r="3.2"
                fill="#ffffff"
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 3 ? [0, 1, 0.8] : 0 }}
                transition={{ duration: 0.6 }}
              />
              <polygon points="0,6 -6,0 6,0" fill="url(#splashGold)" />
              <path d="M0,6 L0,16 M0,16 L-8,22 M0,16 L8,22" stroke="url(#splashGold)" strokeWidth="2" strokeLinecap="round" />
            </motion.g>

            {/* Olympic Base Rings */}
            <motion.g
              transform="translate(100, 150) scale(0.72)"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{
                scale: stage >= 2 ? 0.72 : 0.3,
                opacity: stage >= 2 ? 1 : 0,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <circle cx="-24" cy="-5" r="9" fill="none" stroke="#0081C8" strokeWidth="2.8" />
              <circle cx="0" cy="-5" r="9" fill="none" stroke="#F4C300" strokeWidth="2.8" />
              <circle cx="24" cy="-5" r="9" fill="none" stroke="#00A651" strokeWidth="2.8" />
              <circle cx="-12" cy="5" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2.8" />
              <circle cx="12" cy="5" r="9" fill="none" stroke="#EE334E" strokeWidth="2.8" />
            </motion.g>
          </motion.svg>
        </div>

        {/* Layer 6: Final Brand Lockup & Tagline */}
        <AnimatePresence>
          {stage >= 5 && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="space-y-3"
            >
              <h1 className="text-3xl md:text-5xl font-black font-brand tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)] uppercase">
                United Olympics Sports
              </h1>

              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400" />
                <h2 className="text-2xl md:text-3xl font-extrabold font-arabic text-amber-300 tracking-wide drop-shadow">
                  يونايتد أوليمبيكس سبورت
                </h2>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400" />
              </div>

              {/* Exact Tagline Mandated by Spec */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs md:text-sm font-semibold text-amber-200/90">
                <span className="tracking-wide">From Childhood, We Build Champions</span>
                <span className="hidden sm:inline text-amber-500">•</span>
                <span className="font-arabic" dir="rtl">من الطفولة نصنع الأبطال</span>
              </div>

              {/* Instant Enter Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="pt-4"
              >
                <button
                  id="splash-enter-btn"
                  onClick={onComplete}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
                >
                  <Shield className="w-4 h-4 fill-black" />
                  <span>ENTER THE ECOSYSTEM • دخول المنظومة</span>
                  <Play className="w-3.5 h-3.5 fill-black" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sleek Minimal Indeterminate Loading Indicator (No Fake Percentage) */}
      <div className="absolute bottom-6 left-8 right-8 z-20 flex flex-col items-center gap-2 max-w-sm mx-auto">
        <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
        </div>
        <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
          Initializing Canonical Experience
        </div>
      </div>
    </motion.div>
  );
};
