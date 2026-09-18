import { ArrowRight, ClipboardCheck, MessageSquareText, Target, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { SportConceptVisual } from '../../components/owner-demo/OwnerDemoVisuals';
import { getSportMediaByUsage, getSportPreviewMedia } from '../../data/media';
import '../../styles/owner-demo.css';

const roles = [
  { id: 'football', name: bi('Football Coaching', 'تدريب كرة القدم'), focus: bi('Technique, awareness, communication and team development', 'التقنية والوعي والتواصل وتطوير الفريق') },
  { id: 'swimming', name: bi('Swimming Coaching', 'تدريب السباحة'), focus: bi('Water confidence, technique, breathing and endurance', 'الثقة في الماء والتقنية والتنفس والتحمل') },
  { id: 'basketball', name: bi('Basketball Coaching', 'تدريب كرة السلة'), focus: bi('Movement, ball control, decisions and team play', 'الحركة والتحكم بالكرة واتخاذ القرار واللعب الجماعي') },
  { id: 'tennis', name: bi('Tennis Coaching', 'تدريب التنس'), focus: bi('Ready position, footwork, timing and consistency', 'وضعية الاستعداد وحركة القدمين والتوقيت والثبات') },
  { id: 'gymnastics', name: bi('Gymnastics Coaching', 'تدريب الجمباز'), focus: bi('Balance, mobility, body control and coordination', 'الاتزان والمرونة الحركية والتحكم بالجسم والتناسق') },
  { id: 'martial-arts', name: bi('Martial Arts Coaching', 'تدريب الفنون القتالية'), focus: bi('Respect, stance, movement, technique and control', 'الاحترام والوقفة والحركة والتقنية والتحكم') },
];

export function CoachesPage() {
  return <div className="od-public-page od-coaches-page">
    <section className="od-coaches-hero">
      <div>
        <span className="od-kicker"><BilingualText value={bi('Coaching Experience', 'تجربة التدريب')} /></span>
        <h1><BilingualText value={bi('Guidance that turns practice into progress', 'توجيه يحول التدريب إلى تقدم')} /></h1>
        <p><BilingualText value={bi(
          'Coaching at United Olympics Sports connects observation, structured practice, evaluation and clear feedback across all six sports.',
          'يربط التدريب في يونايتد أوليمبيكس سبورت بين الملاحظة والتدريب المنظم والتقييم والتغذية الراجعة الواضحة عبر الرياضات الست.'
        )} /></p>
      </div>
      <div className="od-coach-flow-visual">
        <div><Target /><BilingualText value={bi('Observe', 'الملاحظة')} /></div>
        <ArrowRight />
        <div><ClipboardCheck /><BilingualText value={bi('Evaluate', 'التقييم')} /></div>
        <ArrowRight />
        <div><MessageSquareText /><BilingualText value={bi('Guide', 'التوجيه')} /></div>
      </div>
    </section>

    <section className="od-coach-role-section">
      <div className="od-section-heading">
        <span><BilingualText value={bi('Sport Coaching', 'التدريب حسب الرياضة')} /></span>
        <h2><BilingualText value={bi('A clear coaching focus for every discipline', 'محور تدريبي واضح لكل رياضة')} /></h2>
      </div>
      <div className="od-coach-role-grid">
        {roles.map(role => {
          const media = getSportMediaByUsage(role.id, 'coaching')
            ?? getSportMediaByUsage(role.id, 'coach-child')
            ?? getSportPreviewMedia(role.id);

          return <article key={role.id}>
            {media ? (
              <img
                src={media.url}
                alt={`${media.altEn} | ${media.altAr}`}
                width={1648}
                height={928}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <SportConceptVisual sportId={role.id} compact />
            )}
            <div className="od-role-shade" />
            <div className="od-role-copy">
              <h3><BilingualText value={role.name} /></h3>
              <small><BilingualText value={bi('Training Focus', 'محور التدريب')} /></small>
              <p><BilingualText value={role.focus} /></p>
              <div className="od-role-meta">
                <span><BilingualText value={bi('Demonstrate', 'اشرح')} /></span>
                <span><BilingualText value={bi('Observe', 'لاحظ')} /></span>
                <span><BilingualText value={bi('Guide', 'وجّه')} /></span>
              </div>
            </div>
          </article>;
        })}
      </div>
    </section>

    <section className="od-coaching-system">
      <div className="od-section-heading">
        <span><BilingualText value={bi('Coach-to-Player Flow', 'رحلة المدرب مع اللاعب')} /></span>
        <h2><BilingualText value={bi('A consistent development loop', 'حلقة تطوير متسقة')} /></h2>
      </div>
      <div className="od-system-grid">
        <article>
          <UsersRound />
          <h3><BilingualText value={bi('Training Context', 'سياق التدريب')} /></h3>
          <p><BilingualText value={bi(
            'Sport, athlete readiness and the session focus shape the coaching context.',
            'تشكل الرياضة وجاهزية الرياضي ومحور الحصة سياق التدريب.'
          )} /></p>
        </article>
        <article>
          <ClipboardCheck />
          <h3><BilingualText value={bi('Structured Evaluation', 'تقييم منظم')} /></h3>
          <p><BilingualText value={bi(
            'Sport-specific observations create a clear view of strengths and the next development focus.',
            'تكوّن الملاحظات الخاصة بكل رياضة رؤية واضحة لنقاط القوة ومحور التطور التالي.'
          )} /></p>
        </article>
        <article>
          <MessageSquareText />
          <h3><BilingualText value={bi('Feedback Experience', 'تجربة الملاحظات')} /></h3>
          <p><BilingualText value={bi(
            'Clear feedback helps athletes understand what improved and what to practise next.',
            'تساعد الملاحظات الواضحة الرياضي على فهم ما تطور وما الذي يحتاج إلى التدريب لاحقًا.'
          )} /></p>
        </article>
      </div>
    </section>

    <section className="od-owner-cta">
      <div>
        <h2><BilingualText value={bi('Explore the training experience', 'استكشف تجربة التدريب')} /></h2>
        <p><BilingualText value={bi(
          'Coach names, profiles and credentials are published only when verified by the organization.',
          'تُنشر أسماء المدربين وملفاتهم ومؤهلاتهم فقط بعد اعتمادها من المؤسسة.'
        )} /></p>
      </div>
      <Link className="button primary" to="/contact">
        <BilingualText value={bi('Contact Us', 'تواصل معنا')} />
        <ArrowRight />
      </Link>
    </section>
  </div>;
}
