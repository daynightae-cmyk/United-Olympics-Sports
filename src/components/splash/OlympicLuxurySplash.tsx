import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Flame, Trophy, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OlympicLuxurySplashProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const STAGES = [
  {
    threshold: 0,
    icon: Flame,
    ar: 'إيقاد الشعلة الأولمبية',
    en: 'Kindling the Olympic Flame',
    detailAr: 'تحفيز الطاقة الرياضية وبدء التجربة...',
    detailEn: 'Energizing the athletic spirit and igniting the journey...',
  },
  {
    threshold: 40,
    icon: Compass,
    ar: 'تنسيق المسارات والأنشطة',
    en: 'Harmonizing Pathways & Programs',
    detailAr: 'تهيئة البرامج والأنظمة الرياضية والمسارات المعتمدة...',
    detailEn: 'Aligning accredited pathways, programs, and schedules...',
  },
  {
    threshold: 80,
    icon: Trophy,
    ar: 'المنصة جاهزة لصناعة الأبطال',
    en: 'Platform Ready for Champions',
    detailAr: 'أهلاً بكم في بيئة التميز الأولمبي للناشئين...',
    detailEn: 'Welcome to the youth olympic excellence ecosystem...',
  },
];

export function OlympicLuxurySplash({ onComplete, forceShow = false }: OlympicLuxurySplashProps) {
  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('uos:luxury-splash-seen');
  });

  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (!visible) return;

    const startTime = Date.now();
    const duration = 2800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor(12 + (elapsed / duration) * 88));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleDismiss();
        }, 450);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [visible]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
    } catch {
      // ignore
    }
    setVisible(false);
    onComplete?.();
  };

  const currentStage = STAGES.reduce((acc, stage) => {
    return progress >= stage.threshold ? stage : acc;
  }, STAGES[0]);

  const CurrentIcon = currentStage.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="olympic-luxury-splash-overlay"
          id="olympic-luxury-splash-root"
          role="dialog"
          aria-label="United Olympics Sports Welcome Screen"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#05070c] text-white select-none"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18)_0%,rgba(245,215,127,0.06)_40%,transparent_70%)] blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/4 left-1/3 w-[360px] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(197,160,89,0.12)_0%,transparent_65%)] blur-xl" />
            <div className="absolute bottom-1/4 right-1/3 w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.09)_0%,transparent_65%)] blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 py-8 max-w-lg w-full mx-auto">
            <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#d4af37]/20 animate-spin" style={{ animationDuration: '18s', animationTimingFunction: 'linear' }}>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f5d77f] shadow-[0_0_12px_#f5d77f]" />
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#d4af37] shadow-[0_0_8px_#d4af37]" />
              </div>

              <div className="absolute inset-3 rounded-full border border-dashed border-[#d4af37]/45 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '12s', animationTimingFunction: 'linear' }} />
              <div className="absolute inset-6 rounded-full border-2 border-transparent border-t-[#f5d77f] border-r-[#d4af37] border-b-[#c5a059]/30 animate-spin" style={{ animationDuration: '2.5s', animationTimingFunction: 'linear' }} />

              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 w-28 h-28 rounded-full p-2 bg-gradient-to-b from-[#1c222e] to-[#0c1017] border border-[#d4af37]/60 shadow-[0_0_40px_rgba(212,175,55,0.45),0_12px_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden"
              >
                <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports Emblem" className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(245,215,127,0.6)]" />
              </motion.div>

              <motion.div
                key={`splash-stage-icon-${currentStage.threshold}`}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute -bottom-1 -right-1 z-20 w-11 h-11 rounded-full bg-[#121722] border-2 border-[#f5d77f] shadow-[0_4px_16px_rgba(0,0,0,0.7),0_0_15px_rgba(212,175,55,0.5)] flex items-center justify-center text-[#f5d77f]"
              >
                <CurrentIcon className="w-5 h-5" />
              </motion.div>
            </div>

            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-6 space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#f5d77f] font-semibold tracking-wider uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f5d77f]" />
                <span>UNITED OLYMPICS SPORTS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-['Cabinet_Grotesk',sans-serif]">يونايتد أوليمبيكس سبورت</h1>
              <p className="text-xs sm:text-sm text-[#c8d1e0]/80 tracking-wide">منظومة رياضية متكاملة لتطوير الناشئين وصناعة الأبطال</p>
            </motion.div>

            <motion.div
              key={`splash-stage-text-${currentStage.threshold}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-[#0f141f]/80 backdrop-blur-md border border-[#d4af37]/25 rounded-xl p-4 mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#f5d77f] flex items-center gap-1.5"><CurrentIcon className="w-4 h-4" />{currentStage.ar}</span>
                <span className="text-[11px] font-mono font-medium text-[#d4af37]/90">{progress}%</span>
              </div>
              <p className="text-[12px] text-gray-300 text-start leading-relaxed">{currentStage.detailAr}</p>
              <p className="text-[11px] text-gray-400 text-start mt-0.5 italic">{currentStage.en}</p>
            </motion.div>

            <div className="w-full mb-6">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative p-0.5 border border-white/5">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#c5a059] via-[#f5d77f] to-[#d4af37] shadow-[0_0_12px_#f5d77f]" style={{ width: `${progress}%` }} transition={{ ease: 'easeOut', duration: 0.1 }} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                id="olympic-splash-skip-btn"
                onClick={handleDismiss}
                className="group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-[#d4af37]/15 border border-[#d4af37]/35 hover:border-[#f5d77f] text-xs sm:text-sm font-medium text-[#e2e8f0] hover:text-[#f5d77f] transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 cursor-pointer"
              >
                <span>تخطي المقدمة</span>
                <span className="text-xs opacity-60">| Skip Intro</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#f5d77f] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default OlympicLuxurySplash;