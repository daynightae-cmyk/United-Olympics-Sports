import { ArrowRight, Focus, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PreviewBadge, SportConceptVisual } from '../../components/owner-demo/OwnerDemoVisuals';
import '../../styles/owner-demo.css';

type Concept = { name: BilingualValue; headline: BilingualValue; philosophy: BilingualValue; pillars: BilingualValue[]; teaser: BilingualValue };
const concepts: Record<string, Concept> = {
  tennis: { name: bi('Tennis', 'التنس'), headline: bi('Control the point. Build the player.', 'تحكم في النقطة. وابنِ اللاعب.'), philosophy: bi('A concept experience built around repetition, footwork, control and match awareness.', 'تجربة تصورية مبنية على التكرار وحركة القدمين والتحكم ووعي المباراة.'), pillars: [bi('Control', 'التحكم'), bi('Footwork', 'حركة القدمين'), bi('Consistency', 'الثبات')], teaser: bi('Individual Skills Studio', 'استوديو المهارات الفردية') },
  gymnastics: { name: bi('Gymnastics', 'الجمباز'), headline: bi('Balance, control and confident movement.', 'توازن وتحكم وحركة واثقة.'), philosophy: bi('A concept experience focused on controlled movement, mobility, balance and execution quality.', 'تجربة تصورية تركز على الحركة المنضبطة والمرونة والتوازن وجودة التنفيذ.'), pillars: [bi('Balance', 'التوازن'), bi('Mobility', 'المرونة الحركية'), bi('Execution', 'التنفيذ')], teaser: bi('Foundation Movement Path', 'مسار الحركة التأسيسية') },
  'martial-arts': { name: bi('Martial Arts', 'الفنون القتالية'), headline: bi('Discipline in every movement.', 'انضباط في كل حركة.'), philosophy: bi('A concept experience centred on control, technique, respect and purposeful progression.', 'تجربة تصورية تتمحور حول التحكم والتقنية والاحترام والتطور الهادف.'), pillars: [bi('Technique', 'التقنية'), bi('Control', 'التحكم'), bi('Discipline', 'الانضباط')], teaser: bi('Youth Discipline Path', 'مسار انضباط الناشئين') },
};

export function SportConceptPage({ sportId }: { sportId: 'tennis' | 'gymnastics' | 'martial-arts' }) {
  const concept = concepts[sportId];
  return <div className={`od-public-page od-concept-sport sport-${sportId}`}>
    <section className="od-concept-hero"><div className="od-concept-copy"><PreviewBadge label={bi('Sport Concept Preview', 'معاينة تصور الرياضة')} /><span className="od-kicker"><BilingualText value={concept.name} /></span><h1><BilingualText value={concept.headline} /></h1><p><BilingualText value={concept.philosophy} /></p><div className="od-concept-actions"><Link className="button primary" to="/programs"><BilingualText value={bi('Explore Programs', 'استكشف البرامج')} /><ArrowRight /></Link><Link className="button secondary" to="/contact"><BilingualText value={bi('Register Interest', 'إبداء الاهتمام')} /></Link></div></div><SportConceptVisual sportId={sportId} /></section>

    <section className="od-detail-section"><div className="od-section-heading"><span><BilingualText value={bi('Training Philosophy', 'فلسفة التدريب')} /></span><h2><BilingualText value={bi('A premium visual direction without invented operational claims', 'اتجاه بصري احترافي دون ادعاءات تشغيلية مختلقة')} /></h2></div><div className="od-concept-pillars">{concept.pillars.map((pillar, index) => <article key={pillar.en}><span>{String(index + 1).padStart(2, '0')}</span><Focus /><h3><BilingualText value={pillar} /></h3></article>)}</div></section>

    <section className="od-detail-section od-concept-development"><div><Route /><small><BilingualText value={bi('Development Path', 'مسار التطور')} /></small><h2><BilingualText value={bi('Foundation → Development → Performance', 'الأساس ← التطوير ← الأداء')} /></h2><p><BilingualText value={bi('A visual progression model for the owner demo, not a statement of live programme availability.', 'نموذج بصري للتدرج ضمن عرض المالك وليس بيانًا عن توفر برامج فعلية.')} /></p></div><div><ShieldCheck /><small><BilingualText value={bi('Coach Interaction', 'تفاعل المدرب')} /></small><h3><BilingualText value={bi('Observe · guide · review', 'لاحظ · وجّه · راجع')} /></h3><p><BilingualText value={bi('Role-based coaching interactions are shown without creating fake coach identities.', 'تظهر تفاعلات التدريب القائمة على الأدوار دون إنشاء هويات مدربين وهمية.')} /></p></div></section>

    <section className="od-program-teaser"><Sparkles /><div><small><BilingualText value={bi('Program Teaser', 'لمحة عن البرنامج')} /></small><h2><BilingualText value={concept.teaser} /></h2><p><BilingualText value={bi('A future training experience represented as a high-fidelity interface concept.', 'تجربة تدريبية مستقبلية ممثلة كنموذج واجهة عالي الجودة.')} /></p></div><Link className="od-cta-link" to="/programs"><BilingualText value={bi('View Program Catalogue', 'عرض كتالوج البرامج')} /><ArrowRight /></Link></section>
  </div>;
}
