import { ArrowRight, ClipboardCheck, MessageSquareText, Target, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewBadge } from '../../components/owner-demo/OwnerDemoVisuals';
import { getSportMediaByUsage, getSportPreviewMedia } from '../../data/media';
import '../../styles/owner-demo.css';

const roles = [
  { id: 'football', name: bi('Football Coaching', 'تدريب كرة القدم'), focus: bi('Technique, awareness and team development', 'التقنية والوعي وتطوير الفريق') },
  { id: 'swimming', name: bi('Swimming Coaching', 'تدريب السباحة'), focus: bi('Water confidence, technique and endurance', 'الثقة في الماء والتقنية والتحمل') },
  { id: 'basketball', name: bi('Basketball Coaching', 'تدريب كرة السلة'), focus: bi('Movement, decisions and team play', 'الحركة والقرارات واللعب الجماعي') },
];

export function CoachesPage() {
  return <div className="od-public-page od-coaches-page">
    <section className="od-coaches-hero"><div><PreviewBadge /><span className="od-kicker"><BilingualText value={bi('Coaching Experience', 'تجربة التدريب')} /></span><h1><BilingualText value={bi('Guidance that turns practice into progress', 'توجيه يحول التدريب إلى تقدم')} /></h1><p><BilingualText value={bi('A role-based visual showcase of how coaching, evaluation and athlete development connect across United Olympics Sports.', 'عرض بصري قائم على الأدوار يوضح كيف يرتبط التدريب والتقييم وتطوير الرياضي داخل يونايتد أوليمبيكس سبورت.')} /></p></div><div className="od-coach-flow-visual"><div><Target /><BilingualText value={bi('Observe', 'الملاحظة')} /></div><ArrowRight /><div><ClipboardCheck /><BilingualText value={bi('Evaluate', 'التقييم')} /></div><ArrowRight /><div><MessageSquareText /><BilingualText value={bi('Guide', 'التوجيه')} /></div></div></section>

    <section className="od-coach-role-section"><div className="od-section-heading"><span><BilingualText value={bi('Sport Coaching', 'التدريب حسب الرياضة')} /></span><h2><BilingualText value={bi('The coaching role, visualized by discipline', 'دور المدرب بصورة واضحة لكل رياضة')} /></h2></div><div className="od-coach-role-grid">{roles.map(role => { const media = getSportMediaByUsage(role.id, 'coaching') ?? getSportMediaByUsage(role.id, 'coach-child') ?? getSportPreviewMedia(role.id); return <article key={role.id}>{media && <img src={media.url} alt={`${media.altEn} | ${media.altAr}`} width={1648} height={928} loading="lazy" decoding="async" />}<div className="od-role-shade" /><div className="od-role-copy"><PreviewBadge label={bi('Coach Profile Preview', 'معاينة ملف المدرب')} /><h3><BilingualText value={role.name} /></h3><small><BilingualText value={bi('Specialization', 'التخصص')} /></small><p><BilingualText value={role.focus} /></p><div className="od-role-meta"><span><BilingualText value={bi('Training Approach', 'منهج التدريب')} /></span><span><BilingualText value={bi('Athlete Focus', 'التركيز على اللاعب')} /></span></div></div></article>; })}</div></section>

    <section className="od-coaching-system"><div className="od-section-heading"><span><BilingualText value={bi('Coach-to-Player Flow', 'رحلة المدرب مع اللاعب')} /></span><h2><BilingualText value={bi('A development loop the owner can see', 'حلقة تطوير واضحة يمكن للمالك تصورها')} /></h2></div><div className="od-system-grid"><article><UsersRound /><h3><BilingualText value={bi('Training Context', 'سياق التدريب')} /></h3><p><BilingualText value={bi('Sport, group and development focus provide the coaching context.', 'الرياضة والمجموعة ومحور التطور تشكل سياق التدريب.')} /></p></article><article><ClipboardCheck /><h3><BilingualText value={bi('Structured Evaluation', 'تقييم منظم')} /></h3><p><BilingualText value={bi('Sport-aware metrics turn observation into a consistent evaluation view.', 'المؤشرات الخاصة بكل رياضة تحول الملاحظة إلى رؤية تقييم متسقة.')} /></p></article><article><MessageSquareText /><h3><BilingualText value={bi('Feedback Experience', 'تجربة الملاحظات')} /></h3><p><BilingualText value={bi('Strengths and focus areas are presented clearly to support the next training step.', 'تظهر نقاط القوة والتركيز بوضوح لدعم الخطوة التدريبية التالية.')} /></p></article></div></section>

    <section className="od-owner-cta"><div><h2><BilingualText value={bi('Explore the training experience', 'استكشف تجربة التدريب')} /></h2><p><BilingualText value={bi('Public coach identities are intentionally not invented in this preview.', 'لا يتم اختلاق هويات مدربين عامة في هذه المعاينة.')} /></p></div><Link className="button primary" to="/contact"><BilingualText value={bi('Contact Us', 'تواصل معنا')} /><ArrowRight /></Link></section>
  </div>;
}
