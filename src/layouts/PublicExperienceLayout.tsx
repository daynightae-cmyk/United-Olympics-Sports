import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { PublicSite } from '../pages/public/PublicSite';

const splashSessionKey = 'uos:splash-seen';
const brand = { en: 'United Olympics Sports', ar: 'يونايتد أوليمبيكس سبورت' };
const tagline = { en: 'From Childhood, We Build Champions', ar: 'من الطفولة نصنع الأبطال' };

function Bilingual({ value }: { value: { en: string; ar: string } }) {
  return <span><span className="en">{value.en}</span><span className="ar">{value.ar}</span></span>;
}

function PublicSplash({ onComplete }: { onComplete: () => void }) {
  const motionPreference = useReducedMotion();
  const [mediaReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const reducedMotion = mediaReduced || motionPreference === true;

  useEffect(() => {
    const timer = window.setTimeout(onComplete, reducedMotion ? 400 : 2500);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);

  return <motion.div
    className={`splash splash-refined ${reducedMotion ? 'splash-reduced' : ''}`}
    initial={reducedMotion ? false : { opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: reducedMotion ? .04 : .45 }}
    data-reduced-motion={reducedMotion ? 'true' : 'false'}
  >
    {!reducedMotion && <>
      <div className="splash-particles" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
      <div className="splash-shield-outline" aria-hidden="true" />
      <div className="splash-energy-ring" aria-hidden="true" />
      <div className="gold-orbit" aria-hidden="true" />
    </>}
    <div className="splash-logo-wrap"><img className="official-logo" src="/brand/united-olympics-sports-logo.png" alt={`${brand.en} | ${brand.ar}`} /></div>
    <div className="splash-copy"><Bilingual value={brand} /><Bilingual value={tagline} /></div>
    <button className="splash-skip" type="button" onClick={onComplete}><Bilingual value={{ en: 'Skip Intro', ar: 'تخطي المقدمة' }} /><ArrowRight size={15} /></button>
  </motion.div>;
}

export function PublicExperienceLayout() {
  const [showSplash, setShowSplash] = useState(() => {
    try { return window.sessionStorage.getItem(splashSessionKey) !== '1'; }
    catch { return true; }
  });

  const completeSplash = useCallback(() => {
    try { window.sessionStorage.setItem(splashSessionKey, '1'); } catch { /* session storage may be unavailable */ }
    setShowSplash(false);
  }, []);

  return <>
    <AnimatePresence>{showSplash && <PublicSplash onComplete={completeSplash} />}</AnimatePresence>
    {!showSplash && <PublicSite />}
  </>;
}
