import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Flame, Trophy } from 'lucide-react';

interface OlympicLuxurySplashProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const INTERNAL_PRODUCT_ROUTE = /^\/(admin|player|parent|coach|store)(\/|$)/i;

export function OlympicLuxurySplash({ onComplete, forceShow = false }: OlympicLuxurySplashProps) {
  const location = useLocation();
  const isInternalProductRoute = INTERNAL_PRODUCT_ROUTE.test(location.pathname);

  const [visible, setVisible] = useState(() => {
    if (forceShow) return true;
    if (typeof window === 'undefined') return false;
    if (INTERNAL_PRODUCT_ROUTE.test(window.location.pathname)) return false;
    return !sessionStorage.getItem('uos:luxury-splash-seen') && !sessionStorage.getItem('uos:splash-seen');
  });
  const [progress, setProgress] = useState(12);

  const dismiss = () => {
    try {
      sessionStorage.setItem('uos:luxury-splash-seen', 'true');
      sessionStorage.setItem('uos:splash-seen', 'true');
    } catch {
      // Session storage is optional. Never block navigation if storage is unavailable.
    }
    setVisible(false);
    onComplete?.();
  };

  useEffect(() => {
    if (!forceShow && isInternalProductRoute && visible) {
      dismiss();
    }
  }, [forceShow, isInternalProductRoute, visible]);

  useEffect(() => {
    if (!visible) return;

    const startedAt = Date.now();
    const duration = 1800;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, Math.floor(12 + (elapsed / duration) * 88));
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(interval);
        window.setTimeout(dismiss, 220);
      }
    }, 40);

    const failSafe = window.setTimeout(dismiss, 2800);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(failSafe);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="olympic-luxury-splash"
          id="olympic-luxury-splash-root"
          className="olympic-luxury-splash"
          role="dialog"
          aria-label="United Olympics Sports welcome screen"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="olympic-splash-backdrop" aria-hidden="true">
            <div className="olympic-splash-rings-bg" />
            <div className="olympic-splash-orbit-outer" />
            <div className="olympic-splash-orbit-inner" />
            <div className="olympic-splash-pulse-wave" />
          </div>

          <div className="olympic-splash-center">
            <div className="olympic-splash-logo-container">
              <img
                src="/brand/united-olympics-sports-logo.png"
                alt="United Olympics Sports"
                className="official-logo"
              />
              <div className="olympic-splash-crown-aura" aria-hidden="true" />
              <span className="olympic-splash-stage-icon" aria-hidden="true">
                {progress < 80 ? <Flame /> : <Trophy />}
              </span>
            </div>

            <span className="olympic-splash-eyebrow">UNITED OLYMPICS SPORTS</span>
            <h1 className="olympic-splash-title">United Olympics Sports</h1>
            <p className="olympic-splash-arabic" lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</p>

            <div className="olympic-splash-progress-track" aria-hidden="true">
              <div className="olympic-splash-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="olympic-splash-status-text">
              {progress < 80
                ? 'Preparing the sports experience · جاري تجهيز التجربة الرياضية'
                : 'Ready · المنصة جاهزة'}
            </p>
          </div>

          <button id="olympic-splash-skip-btn" className="olympic-splash-skip-btn" type="button" onClick={dismiss}>
            <span>Skip Intro · تخطي المقدمة</span>
            <ArrowRight aria-hidden="true" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default OlympicLuxurySplash;
