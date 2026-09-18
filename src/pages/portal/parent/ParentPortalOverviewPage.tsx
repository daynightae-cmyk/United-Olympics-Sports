import type { CSSProperties } from 'react';
import { CalendarDays, CreditCard, FileText, HeartHandshake, MessageSquareText, ShieldCheck, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmIdentityCard, BmMetricCard, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { EnterpriseEmpty, EnterpriseStatus } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalOverviewPage() {
  const {
    parent,
    children,
    familySessions,
    familySubscriptions,
    familyPayments,
    sports,
    groups,
    loading,
    error,
  } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="parent-empty" role="status"><BilingualText value={bi('Loading family overview…', 'جارٍ تحميل نظرة الأسرة…')} /></div>;
  if (error) return <div className="parent-empty" role="alert"><BilingualText value={bi('Family provider is unavailable.', 'موفر بيانات الأسرة غير متاح.')} /></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page to select an active provider record.', 'سجّل الدخول مجددًا من صفحة ولي الأمر لاختيار سجل نشط من موفر البيانات.')} />;

  const attendanceRate = children.length
    ? Math.round(children.reduce((sum, child) => sum + child.attendanceRate, 0) / children.length)
    : null;
  const measuredChildren = children.filter((child) => child.performanceScore !== null);
  const performanceAverage = measuredChildren.length
    ? Math.round(measuredChildren.reduce((sum, child) => sum + (child.performanceScore ?? 0), 0) / measuredChildren.length)
    : null;
  const upcomingSessions = familySessions.filter((session) => new Date(session.startsAt).getTime() >= Date.now());

  return <div className="parent-page parent-overview-page" id="parent-overview-page">
    <section className="parent-hero parent-family-hero" aria-labelledby="parent-family-overview-title">
      <div className="parent-hero-row">
        <div>
          <span className="parent-kicker"><HeartHandshake size={18} /><BilingualText value={bi('Family Sports Workspace', 'مساحة الأسرة الرياضية')} /></span>
          <h1 id="parent-family-overview-title"><BilingualText value={bi('Family Overview', 'نظرة عامة للأسرة')} /></h1>
          <p><BilingualText value={bi('Children, training, development and membership context from the shared provider in one focused family dashboard.', 'الأبناء والتدريب والتطور وسياق العضوية من موفر البيانات المشترك في لوحة أسرية واحدة مركزة.')} /></p>
        </div>
        <span className="parent-scope"><ShieldCheck size={12} /><BilingualText value={bi('Relationship-scoped records', 'سجلات محكومة بعلاقة الأسرة')} /></span>
      </div>

      <div className="parent-metrics parent-family-metrics">
        <FamilyMetric icon={<UsersRound size={15} />} label={bi('Linked children', 'الأبناء المرتبطون')} value={String(children.length)} tone="gold" />
        <FamilyMetric icon={<TrendingUp size={15} />} label={bi('Attendance average', 'متوسط الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} tone="green" />
        <FamilyMetric icon={<CalendarDays size={15} />} label={bi('Upcoming sessions', 'الحصص القادمة')} value={String(upcomingSessions.length)} />
        <FamilyMetric icon={<TrendingUp size={15} />} label={bi('Performance average', 'متوسط الأداء')} value={performanceAverage === null ? '—' : `${performanceAverage}/100`} />
      </div>
    </section>

    <section className="parent-section-block">
      <BmSectionLabel num="01" icon={<HeartHandshake aria-hidden="true" />} title={bi('Family Identity', 'هوية الأسرة')} />
      <div className="bm-grid bm-grid-3 parent-family-identity-grid">
        <BmIdentityCard
          avatar={<HeartHandshake aria-hidden="true" />}
          name={{ en: parent.nameEn, ar: parent.nameAr }}
          id={parent.id}
          fields={[
            { label: bi('Children', 'الأبناء'), value: children.length },
            { label: bi('Language', 'اللغة'), value: parent.preferredLanguage === 'ar' ? 'العربية' : 'English' },
          ]}
        />
        <BmMetricCard icon={<ShieldCheck aria-hidden="true" />} label={bi('Subscriptions', 'الاشتراكات')} value={familySubscriptions.length} detail={bi('Provider membership records', 'سجلات العضوية لدى الموفر')} tier="featured" />
        <BmMetricCard icon={<CreditCard aria-hidden="true" />} label={bi('Payments', 'المدفوعات')} value={familyPayments.length} detail={bi('Read-only family ledger', 'دفتر الأسرة للقراءة فقط')} />
      </div>
    </section>

    <section className="parent-section-block">
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi('Family Actions', 'إجراءات الأسرة')} />
      <div className="bm-grid bm-grid-4 parent-family-action-grid">
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Children', 'الأبناء')} description={bi('Review linked athlete profiles', 'مراجعة ملفات الرياضيين المرتبطين')} to="/parent/children" />
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Family Schedule', 'جدول الأسرة')} description={bi('Current provider sessions', 'حصص موفر البيانات الحالية')} to="/parent/schedule" />
        <BmActionCard icon={<TrendingUp aria-hidden="true" />} title={bi('Performance', 'الأداء')} description={bi('Provider performance summaries', 'ملخصات الأداء من موفر البيانات')} to="/parent/performance" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Family communication workspace', 'مساحة تواصل الأسرة')} to="/parent/messages" />
        <BmActionCard icon={<CreditCard aria-hidden="true" />} title={bi('Payments', 'المدفوعات')} description={bi('Read provider payment records', 'عرض سجلات الدفع لدى الموفر')} to="/parent/payments" />
        <BmActionCard icon={<ShieldCheck aria-hidden="true" />} title={bi('Subscriptions', 'الاشتراكات')} description={bi('Review membership records', 'مراجعة سجلات العضوية')} to="/parent/subscriptions" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Documents', 'المستندات')} description={bi('Family document preview', 'معاينة مستندات الأسرة')} to="/parent/documents" />
      </div>
    </section>

    <section className="parent-section-block">
      <BmSectionLabel num="03" icon={<UsersRound aria-hidden="true" />} title={bi('Athlete Cards', 'بطاقات الرياضيين')} />
      {children.length ? <div className="parent-grid-2 parent-athlete-grid">
        {children.map((child) => {
          const sport = sports.find((item) => item.id === child.sportId);
          const group = child.groupId ? groups.find((item) => item.id === child.groupId) : undefined;
          const next = upcomingSessions.find((session) => session.groupId === child.groupId);
          const subscription = familySubscriptions.find((item) => item.playerId === child.id);
          const accent = sport?.accent ?? '#d4af37';

          return <article
            key={child.id}
            className="parent-athlete-card"
            style={{ '--parent-sport-accent': accent } as CSSProperties}
          >
            <div className="parent-athlete-card__head">
              <span className="parent-athlete-card__avatar"><UserRound aria-hidden="true" /></span>
              <div className="parent-athlete-card__identity">
                <strong>{child.nameEn}</strong>
                <span lang="ar" dir="rtl">{child.nameAr}</span>
                <small><BilingualText value={sport?.name ?? bi(child.sportId, child.sportId)} />{group ? <> · <BilingualText value={group.name} /></> : null}</small>
              </div>
              <EnterpriseStatus label={child.status} tone="info" />
            </div>

            <div className="parent-athlete-signals">
              <AthleteSignal label={bi('Next training', 'التدريب القادم')} value={next ? new Date(next.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : undefined} />
              <AthleteSignal label={bi('Attendance', 'الحضور')} value={`${child.attendanceRate}%`} tone="success" />
              <AthleteSignal label={bi('Performance', 'الأداء')} value={child.performanceScore === null ? undefined : `${child.performanceScore}/100`} tone="gold" />
              <AthleteSignal label={bi('Subscription', 'الاشتراك')} value={subscription?.status} />
            </div>

            <Link to={`/parent/children/${child.id}`} className="parent-athlete-card__action">
              <BilingualText value={bi('Open Athlete Profile', 'فتح ملف الرياضي')} />
            </Link>
          </article>;
        })}
      </div> : <EnterpriseEmpty title={bi('No linked children', 'لا يوجد أبناء مرتبطون')} description={bi('Link an athlete to this parent profile from Admin to populate the family workspace.', 'اربط لاعبًا بملف ولي الأمر من الإدارة لملء مساحة الأسرة.')} />}
    </section>
  </div>;
}

function FamilyMetric({ icon, label, value, tone = '' }: { icon: React.ReactNode; label: { en: string; ar: string }; value: string; tone?: string }) {
  return <div className="parent-metric parent-family-metric">
    <span className="parent-family-metric__icon">{icon}</span>
    <span><BilingualText value={label} /></span>
    <strong className={tone}>{value}</strong>
  </div>;
}

function AthleteSignal({ label, value, tone = '' }: { label: { en: string; ar: string }; value?: string; tone?: string }) {
  return <div className={`parent-athlete-signal ${tone}`.trim()}>
    <span><BilingualText value={label} /></span>
    <strong className={value ? '' : 'missing'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong>
  </div>;
}
