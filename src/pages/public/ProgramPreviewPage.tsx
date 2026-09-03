import { ArrowRight, CheckCircle2, CircleDot, Compass, UsersRound } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewBadge, SportConceptVisual } from '../../components/owner-demo/OwnerDemoVisuals';
import { getDemoProgram } from '../../data/demo/programs';
import { getSportPreviewMedia } from '../../data/media';
import '../../styles/owner-demo.css';
import React, { useState } from 'react';

const stages = [bi('Foundation', 'الأساس'), bi('Development', 'التطوير'), bi('Performance', 'الأداء'), bi('Advanced Focus', 'التركيز المتقدم')];

export function ProgramPreviewPage() {
  const { programSlug } = useParams();
  const program = getDemoProgram(programSlug);
  if (!program) return <Navigate to="/programs" replace />;
  const media = getSportPreviewMedia(program.sportId);
  const [mediaAvailable, setMediaAvailable] = useState(true);
  return <div className={`od-public-page od-program-detail sport-${program.sportId}`}>
    <section className="od-program-detail-hero">
      <div className="od-program-detail-media">{media && mediaAvailable ? <img src={media.url} alt={`${media.altEn} | ${media.altAr}`} width={1648} height={928} loading="eager" decoding="async" onError={() => setMediaAvailable(false)} /> : <SportConceptVisual sportId={program.sportId} />}<div className="od-program-detail-shade" /></div>
      <div className="od-program-detail-copy"><PreviewBadge /><Link className="od-back-link" to="/programs"><BilingualText value={bi('All Programs', 'كل البرامج')} /></Link><span className="od-kicker"><BilingualText value={program.sport} /></span><h1><BilingualText value={program.name} /></h1><p><BilingualText value={program.description} /></p><div className="od-program-chips"><span><BilingualText value={program.ageGroup} /></span><span><BilingualText value={program.level} /></span></div></div>
    </section>

    <section className="od-detail-section"><div className="od-section-heading"><span><BilingualText value={bi('Development Path', 'مسار التطور')} /></span><h2><BilingualText value={bi('A clear progression concept', 'تصور واضح للتدرج')} /></h2></div><div className="od-pathway">{stages.map((stage, index) => <div key={stage.en} className="od-path-stage"><span>{String(index + 1).padStart(2, '0')}</span><BilingualText value={stage} />{index < stages.length - 1 && <ArrowRight aria-hidden="true" />}</div>)}</div><p className="od-preview-note"><BilingualText value={bi('This progression is a UI concept for the owner demo and does not claim current operational availability.', 'هذا التدرج تصور واجهة للعرض التجريبي ولا يمثل ادعاءً بتوفر تشغيلي حالي.')} /></p></section>

    <section className="od-detail-section od-detail-split"><div><div className="od-section-heading"><span><BilingualText value={bi('Training Pillars', 'ركائز التدريب')} /></span><h2><BilingualText value={program.focus} /></h2></div><div className="od-pillar-list">{program.pillars.map((pillar, index) => <article key={pillar.en}><CheckCircle2 /><span>{String(index + 1).padStart(2, '0')}</span><BilingualText value={pillar} /></article>)}</div></div><div className="od-coach-approach"><UsersRound /><small><BilingualText value={bi('Coach Approach', 'منهج المدرب')} /></small><h3><BilingualText value={program.coachApproach} /></h3><p><BilingualText value={bi('Role-based coaching presentation only; no real coach identity is implied.', 'عرض لدور التدريب فقط ولا يشير إلى هوية مدرب حقيقية.')} /></p></div></section>

    <section className="od-detail-section"><div className="od-section-heading"><span><BilingualText value={bi('Session Experience', 'تجربة الحصة')} /></span><h2><BilingualText value={bi('What the training flow can feel like', 'كيف يمكن أن تبدو رحلة التدريب')} /></h2></div><div className="od-session-flow"><article><CircleDot /><BilingualText value={bi('Prepare', 'التهيئة')} /></article><article><Compass /><BilingualText value={program.sessionExperience} /></article><article><CheckCircle2 /><BilingualText value={bi('Review & next focus', 'المراجعة والتركيز القادم')} /></article></div></section>

    <section className="od-owner-cta"><div><PreviewBadge label={bi('UI Preview', 'معاينة الواجهة')} /><h2><BilingualText value={bi('Interested in this training direction?', 'هل يناسبك هذا التوجه التدريبي؟')} /></h2><p><BilingualText value={bi('Use the public enquiry screen to prepare an interest message without claiming a live registration backend.', 'استخدم شاشة الاستفسار العامة لإعداد رسالة اهتمام دون الإيحاء بوجود تسجيل فعلي عبر خادم.')} /></p></div><Link className="button primary" to="/contact"><BilingualText value={bi('Registration Interest', 'إبداء الاهتمام بالتسجيل')} /><ArrowRight /></Link></section>
  </div>;
}
