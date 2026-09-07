import { CalendarDays, CreditCard, FileText, HeartHandshake, MessageSquareText, ShieldCheck, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
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

  if (loading && !parent) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family overview…', 'جارٍ تحميل نظرة الأسرة…')} /></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Family provider is unavailable.', 'موفر بيانات الأسرة غير متاح.')} /></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page to select an active provider record.', 'سجّل الدخول مجددًا من صفحة ولي الأمر لاختيار سجل نشط من موفر البيانات.')} />;

  const attendanceRate = children.length
    ? Math.round(children.reduce((sum, child) => sum + child.attendanceRate, 0) / children.length)
    : null;
  const measuredChildren = children.filter((child) => child.performanceScore !== null);
  const performanceAverage = measuredChildren.length
    ? Math.round(measuredChildren.reduce((sum, child) => sum + (child.performanceScore ?? 0), 0) / measuredChildren.length)
    : null;
  const upcomingSessions = familySessions.filter((session) => new Date(session.startsAt).getTime() >= Date.now());

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Parent Portal', 'بوابة ولي الأمر')}
      title={bi('Family Overview', 'نظرة عامة للأسرة')}
      description={bi('Provider-backed children, schedule, performance and finance context in one family workspace.', 'سياق الأبناء والجدول والأداء والمالية من موفر البيانات في مساحة أسرية واحدة.')}
      icon={<HeartHandshake aria-hidden="true" />}
    />

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="01" icon={<UsersRound aria-hidden="true" />} title={bi('Family Snapshot', 'لمحة عن الأسرة')} />
      <div className="bm-grid bm-grid-3">
        <BmIdentityCard
          avatar={<HeartHandshake aria-hidden="true" />}
          name={{ en: parent.nameEn, ar: parent.nameAr }}
          id={parent.id}
          fields={[
            { label: bi('Children', 'الأبناء'), value: children.length },
            { label: bi('Language', 'اللغة'), value: parent.preferredLanguage === 'ar' ? 'العربية' : 'English' },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Linked Children', 'الأبناء المرتبطون')} value={children.length} detail={bi('Shared provider relationship', 'علاقة موفر البيانات المشترك')} tier="featured" />
        <BmMetricCard icon={<TrendingUp aria-hidden="true" />} label={bi('Attendance Average', 'متوسط الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} detail={bi('Current player summaries', 'ملخصات اللاعبين الحالية')} />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi('Operational Snapshot', 'لمحة تشغيلية')} />
      <div className="bm-grid bm-grid-4">
        <BmMetricCard icon={<CalendarDays aria-hidden="true" />} label={bi('Upcoming Sessions', 'الحصص القادمة')} value={upcomingSessions.length} detail={bi('Linked training groups', 'مجموعات التدريب المرتبطة')} />
        <BmMetricCard icon={<TrendingUp aria-hidden="true" />} label={bi('Performance Average', 'متوسط الأداء')} value={performanceAverage === null ? '—' : `${performanceAverage}/100`} detail={bi('Measured linked profiles', 'الملفات المرتبطة المقاسة')} />
        <BmMetricCard icon={<ShieldCheck aria-hidden="true" />} label={bi('Subscriptions', 'الاشتراكات')} value={familySubscriptions.length} detail={bi('Provider membership records', 'سجلات العضوية لدى الموفر')} />
        <BmMetricCard icon={<CreditCard aria-hidden="true" />} label={bi('Payments', 'المدفوعات')} value={familyPayments.length} detail={bi('Read-only provider ledger', 'دفتر موفر البيانات للقراءة فقط')} />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<CalendarDays aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Children', 'الأبناء')} description={bi('Review linked athlete profiles', 'مراجعة ملفات الرياضيين المرتبطين')} to="/parent/children" />
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Family Schedule', 'جدول الأسرة')} description={bi('Current provider sessions', 'جلسات موفر البيانات الحالية')} to="/parent/schedule" />
        <BmActionCard icon={<TrendingUp aria-hidden="true" />} title={bi('Performance', 'الأداء')} description={bi('Provider performance summaries', 'ملخصات الأداء من موفر البيانات')} to="/parent/performance" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Communication workspace', 'مساحة التواصل')} to="/parent/messages" />
        <BmActionCard icon={<CreditCard aria-hidden="true" />} title={bi('Payments', 'المدفوعات')} description={bi('Read provider payment records', 'عرض سجلات الدفع لدى الموفر')} to="/parent/payments" />
        <BmActionCard icon={<ShieldCheck aria-hidden="true" />} title={bi('Subscriptions', 'الاشتراكات')} description={bi('Review membership records', 'مراجعة سجلات العضوية')} to="/parent/subscriptions" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Documents', 'المستندات')} description={bi('Family document preview', 'معاينة مستندات الأسرة')} to="/parent/documents" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="04" icon={<UsersRound aria-hidden="true" />} title={bi('Children Snapshot', 'لمحة عن الأبناء')} />
      {children.length ? <div className="bm-grid bm-grid-2">
        {children.map((child) => {
          const sport = sports.find((item) => item.id === child.sportId);
          const group = child.groupId ? groups.find((item) => item.id === child.groupId) : undefined;
          const next = upcomingSessions.find((session) => session.groupId === child.groupId);
          const subscription = familySubscriptions.find((item) => item.playerId === child.id);
          return <div key={child.id} className="bm-card bm-card-clickable" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <span className="bm-cell-avatar" style={{ width: '48px', height: '48px' }}><UserRound aria-hidden="true" /></span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '15px' }}>{child.nameEn}</strong>
                <div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{child.nameAr}</div>
                <div style={{ fontSize: '10px', color: 'var(--uos-text-muted, #a5a29c)', marginTop: '3px' }}><BilingualText value={sport?.name ?? bi(child.sportId, child.sportId)} />{group ? ` · ${group.name.en}` : ''}</div>
              </div>
              <EnterpriseStatus label={child.status} tone="info" />
            </div>
            <div className="bm-grid bm-grid-3" style={{ gap: '10px' }}>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Next training', 'التدريب القادم')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{next ? new Date(next.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : <BilingualText value={bi('None scheduled', 'لا يوجد مجدول')} />}</strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{child.attendanceRate}%</strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Performance', 'الأداء')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{child.performanceScore === null ? <BilingualText value={bi('Not measured', 'غير مقاس')} /> : `${child.performanceScore}/100`}</strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Subscription', 'الاشتراك')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{subscription ? <BilingualText value={bi(subscription.status, subscription.status === 'active' ? 'نشط' : 'غير نشط')} /> : <BilingualText value={bi('No record', 'لا يوجد سجل')} />}</strong></div>
            </div>
            <Link to={`/parent/children/${child.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '14px' }}><BilingualText value={bi('View Child Profile', 'عرض ملف الابن')} /></Link>
          </div>;
        })}
      </div> : <EnterpriseEmpty title={bi('No linked children', 'لا يوجد أبناء مرتبطون')} description={bi('Link an athlete to this parent profile from Admin to populate the family workspace.', 'اربط لاعبًا بملف ولي الأمر من الإدارة لملء مساحة الأسرة.')} />}
    </div>
  </div>;
}
