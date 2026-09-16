import { Link, Navigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, ShieldCheck, Sparkles, Target, Trophy, UsersRound } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PortalEmblem } from '../../components/brand/PortalEmblem';
import { previewModeAllowed } from '../../lib/preview-guard';

type DemoPortal = 'player' | 'parent' | 'coach';

type DemoCard = {
  title: ReturnType<typeof bi>;
  value: ReturnType<typeof bi>;
  detail: ReturnType<typeof bi>;
  icon: typeof Target;
};

const demos: Record<DemoPortal, { heading: ReturnType<typeof bi>; subheading: ReturnType<typeof bi>; cards: DemoCard[] }> = {
  player: {
    heading: bi('Player Demo Workspace', 'مساحة عرض اللاعب'),
    subheading: bi('Synthetic athlete data only. No production identity, admin query or customer record is loaded.', 'بيانات لاعب صناعية فقط. لا يتم تحميل هوية إنتاجية أو استعلام إداري أو سجل عميل.'),
    cards: [
      { title: bi('Next session', 'الحصة القادمة'), value: bi('Technical Foundations', 'أساسيات المهارة'), detail: bi('Demo schedule · 18:00', 'جدول تجريبي · 18:00'), icon: CalendarDays },
      { title: bi('Progress', 'التقدم'), value: bi('8 recorded skills', '8 مهارات مسجلة'), detail: bi('Synthetic development indicators', 'مؤشرات تطور صناعية'), icon: Target },
      { title: bi('Achievements', 'الإنجازات'), value: bi('3 demo badges', '3 شارات تجريبية'), detail: bi('No real athlete history is exposed', 'لا يتم عرض سجل لاعب حقيقي'), icon: Trophy },
    ],
  },
  parent: {
    heading: bi('Family Demo Workspace', 'مساحة عرض الأسرة'),
    subheading: bi('Synthetic family records only. This route never enumerates production guardians or children.', 'سجلات أسرية صناعية فقط. هذا المسار لا يستعرض أولياء أمور أو أطفال من الإنتاج.'),
    cards: [
      { title: bi('Children', 'الأبناء'), value: bi('2 demo athletes', 'لاعبان تجريبيان'), detail: bi('Synthetic profiles', 'ملفات صناعية'), icon: UsersRound },
      { title: bi('Schedule', 'الجدول'), value: bi('4 sessions', '4 حصص'), detail: bi('Demo week overview', 'عرض أسبوع تجريبي'), icon: CalendarDays },
      { title: bi('Progress', 'التقدم'), value: bi('Stable', 'مستقر'), detail: bi('Synthetic coaching summary', 'ملخص تدريبي صناعي'), icon: Target },
    ],
  },
  coach: {
    heading: bi('Coach Demo Workspace', 'مساحة عرض المدرب'),
    subheading: bi('Synthetic tactical data only. No production roster, player list or admin dataset is queried.', 'بيانات تكتيكية صناعية فقط. لا يتم استعلام قوائم إنتاج أو لاعبين أو بيانات إدارة.'),
    cards: [
      { title: bi('Groups', 'المجموعات'), value: bi('3 demo groups', '3 مجموعات تجريبية'), detail: bi('Synthetic assignments', 'تكليفات صناعية'), icon: UsersRound },
      { title: bi('Today', 'اليوم'), value: bi('5 demo sessions', '5 حصص تجريبية'), detail: bi('Synthetic training plan', 'خطة تدريب صناعية'), icon: CalendarDays },
      { title: bi('Evaluations', 'التقييمات'), value: bi('12 pending demo items', '12 عنصرًا تجريبيًا'), detail: bi('No real athlete data is exposed', 'لا يتم عرض بيانات رياضيين حقيقية'), icon: Target },
    ],
  },
};

// Defense in depth: the /demo/* route is unmounted on canonical production
// hosts (see AppRouter + preview-guard). This guard keeps the page inert
// even if mounted directly.
const demoEnabled = previewModeAllowed(import.meta.env.VITE_UOS_PORTAL_DEMO === 'true');

export function PortalDemoPage() {
  const { portal } = useParams();
  if (!demoEnabled) return <Navigate to="/" replace />;
  if (portal !== 'player' && portal !== 'parent' && portal !== 'coach') return <Navigate to="/" replace />;

  const data = demos[portal];
  const loginPath = `/${portal}/login`;
  return (
    <main className="portal-auth" data-portal={portal} data-safe-demo="true">
      <div className="portal-auth-atmosphere" aria-hidden="true" />
      <section className="portal-auth-panel" style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 24px' }}>
        <div className="portal-auth-card" style={{ width: '100%' }}>
          <div className="portal-auth-identity">
            <PortalEmblem portal={portal} size="auth" priority />
            <span className="portal-auth-eyebrow"><Sparkles aria-hidden="true" /> SAFE DEMO · عرض آمن</span>
            <h1><BilingualText value={data.heading} /></h1>
            <p className="portal-auth-supporting"><BilingualText value={data.subheading} /></p>
          </div>

          <div className="portal-auth-notice is-info" role="status">
            <ShieldCheck aria-hidden="true" />
            <BilingualText value={bi(
              'Production-safe demo boundary: synthetic constants only, no authenticated API calls.',
              'حد عرض آمن للإنتاج: ثوابت صناعية فقط دون أي استدعاءات API مصادق عليها.',
            )} />
          </div>

          <div className="portal-auth-feature-grid" style={{ marginTop: 24 }}>
            {data.cards.map(({ title, value, detail, icon: Icon }) => (
              <article className="portal-auth-feature" key={title.en} style={{ alignItems: 'flex-start', minHeight: 150 }}>
                <Icon aria-hidden="true" />
                <div>
                  <small><BilingualText value={title} /></small>
                  <strong style={{ display: 'block', marginTop: 6 }}><BilingualText value={value} /></strong>
                  <p style={{ marginTop: 6 }}><BilingualText value={detail} /></p>
                </div>
              </article>
            ))}
          </div>

          <div className="portal-route-state__actions" style={{ marginTop: 28 }}>
            <Link to={loginPath} className="button primary"><BilingualText value={bi('Go to real sign in', 'الذهاب لتسجيل الدخول الحقيقي')} /><ChevronRight size={15} /></Link>
            <Link to="/" className="button secondary"><BilingualText value={bi('Public website', 'الموقع العام')} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
