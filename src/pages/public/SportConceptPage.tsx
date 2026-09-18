import { ArrowRight, Focus, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { Sports3DIcon, Sports3DStage } from '../../design/sports3d';
import { SportConceptVisual } from '../../components/owner-demo/OwnerDemoVisuals';
import '../../styles/owner-demo.css';

type Concept = {
  name: BilingualValue;
  headline: BilingualValue;
  philosophy: BilingualValue;
  pillars: BilingualValue[];
  teaser: BilingualValue;
};

const concepts: Record<string, Concept> = {
  tennis: {
    name: bi('Tennis', 'التنس'),
    headline: bi('Control the point. Build the player.', 'تحكم في النقطة. وابنِ اللاعب.'),
    philosophy: bi(
      'Tennis development combines ready position, footwork, timing, stroke control and point awareness through purposeful repetition.',
      'يربط تطوير التنس بين وضعية الاستعداد وحركة القدمين والتوقيت والتحكم في الضربات ووعي النقطة من خلال التكرار الهادف.'
    ),
    pillars: [
      bi('Ready Position', 'وضعية الاستعداد'),
      bi('Footwork', 'حركة القدمين'),
      bi('Timing & Control', 'التوقيت والتحكم'),
      bi('Consistency', 'الثبات'),
    ],
    teaser: bi('Tennis Skills Pathway', 'مسار مهارات التنس'),
  },
  gymnastics: {
    name: bi('Gymnastics', 'الجمباز'),
    headline: bi('Balance, control and confident movement.', 'توازن وتحكم وحركة واثقة.'),
    philosophy: bi(
      'Gymnastics foundations develop balance, mobility, body control, coordination and strength with movement quality first.',
      'تبني أساسيات الجمباز الاتزان والمرونة الحركية والتحكم بالجسم والتناسق والقوة مع أولوية لجودة الحركة.'
    ),
    pillars: [
      bi('Balance', 'الاتزان'),
      bi('Mobility', 'المرونة الحركية'),
      bi('Body Control', 'التحكم بالجسم'),
      bi('Coordination', 'التناسق'),
    ],
    teaser: bi('Gymnastics Movement Foundations', 'مسار الحركة التأسيسية للجمباز'),
  },
  'martial-arts': {
    name: bi('Martial Arts', 'الفنون القتالية'),
    headline: bi('Discipline in every movement.', 'انضباط في كل حركة.'),
    philosophy: bi(
      'Martial arts training connects respect, focus, stance, movement, technical control and responsibility in a disciplined pathway.',
      'يربط تدريب الفنون القتالية بين الاحترام والتركيز والوقفة والحركة والتحكم الفني والمسؤولية داخل مسار منضبط.'
    ),
    pillars: [
      bi('Respect', 'الاحترام'),
      bi('Stance & Movement', 'الوقفة والحركة'),
      bi('Technique & Control', 'التقنية والتحكم'),
      bi('Focus & Responsibility', 'التركيز والمسؤولية'),
    ],
    teaser: bi('Discipline & Technique Pathway', 'مسار الانضباط والتقنية'),
  },
};

export function SportConceptPage({ sportId }: { sportId: 'tennis' | 'gymnastics' | 'martial-arts' }) {
  const concept = concepts[sportId];

  return <div className={`od-public-page od-concept-sport sport-${sportId}`}>
    <section className="od-concept-hero">
      <div className="od-concept-copy">
        {sportId === 'tennis' ? (
          <Sports3DStage sport="tennis" variant="badge" label="Tennis identity | هوية التنس">
            <Sports3DIcon sport="tennis" size="md" decorative />
          </Sports3DStage>
        ) : null}
        <span className="od-kicker"><BilingualText value={concept.name} /></span>
        <h1><BilingualText value={concept.headline} /></h1>
        <p><BilingualText value={concept.philosophy} /></p>
        <div className="od-concept-actions">
          <Link className="button primary" to="/programs">
            <BilingualText value={bi('Explore Programs', 'استكشف البرامج')} />
            <ArrowRight />
          </Link>
          <Link className="button secondary" to="/contact">
            <BilingualText value={bi('Contact Us', 'تواصل معنا')} />
          </Link>
        </div>
      </div>
      <SportConceptVisual sportId={sportId} />
    </section>

    <section className="od-detail-section">
      <div className="od-section-heading">
        <span><BilingualText value={bi('Training Focus', 'محاور التدريب')} /></span>
        <h2><BilingualText value={bi('Core priorities for confident development', 'أولويات أساسية لتطور واثق')} /></h2>
      </div>
      <div className="od-concept-pillars">
        {concept.pillars.map((pillar, index) => (
          <article key={pillar.en}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <Focus />
            <h3><BilingualText value={pillar} /></h3>
          </article>
        ))}
      </div>
    </section>

    <section className="od-detail-section od-concept-development">
      <div>
        <Route />
        <small><BilingualText value={bi('Development Path', 'مسار التطور')} /></small>
        <h2><BilingualText value={bi('Foundation → Development → Performance', 'الأساس ← التطوير ← الأداء')} /></h2>
        <p><BilingualText value={bi(
          'Progression is based on readiness, movement quality and technical control rather than fixed age claims.',
          'يعتمد التدرج على الجاهزية وجودة الحركة والتحكم الفني بدل افتراض مستويات مرتبطة بعمر ثابت.'
        )} /></p>
      </div>
      <div>
        <ShieldCheck />
        <small><BilingualText value={bi('Coach Interaction', 'تفاعل المدرب')} /></small>
        <h3><BilingualText value={bi('Observe · guide · review', 'لاحظ · وجّه · راجع')} /></h3>
        <p><BilingualText value={bi(
          'Coaching combines demonstration, observation, correction and a clear next focus for the athlete.',
          'يجمع التدريب بين الشرح والملاحظة والتصحيح وتحديد التركيز التالي بوضوح للرياضي.'
        )} /></p>
      </div>
    </section>

    <section className="od-program-teaser">
      <Sparkles />
      <div>
        <small><BilingualText value={bi('Training Pathway', 'المسار التدريبي')} /></small>
        <h2><BilingualText value={concept.teaser} /></h2>
        <p><BilingualText value={bi(
          'Explore the full pathway, training pillars and session structure in the programs section.',
          'استكشف المسار الكامل وركائز التدريب وهيكل الحصة في قسم البرامج.'
        )} /></p>
      </div>
      <Link className="od-cta-link" to="/programs">
        <BilingualText value={bi('View Program Catalogue', 'عرض كتالوج البرامج')} />
        <ArrowRight />
      </Link>
    </section>
  </div>;
}
