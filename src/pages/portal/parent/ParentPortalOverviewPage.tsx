import { Award, CalendarDays, CreditCard, FileText, HeartHandshake, MessageSquareText, Star, TrendingUp, UserRound, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { demoCoachFeedback } from '../../../data/demo/coachFeedback';
import { demoParents } from '../../../data/demo/parents';
import { demoSessions } from '../../../data/demo/sessions';
import { getCoach, getGroup, getLatestPlayerMetrics, getPlayer, getPlayerOverall, getSport } from '../../../data/demo/selectors';
import { previewSubscriptions } from '../portalData';

function nextSessionForGroup(groupId?: string) {
  if (!groupId) return null;
  const now = Date.now();
  return demoSessions
    .filter((session) => session.groupId === groupId && new Date(session.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0] ?? null;
}

export function ParentPortalOverviewPage() {
  const parent = demoParents[0];
  const children = parent.playerIds.map(getPlayer).filter(Boolean);
  const attended = children.reduce((sum, player) => sum + (player?.attendanceSummary?.attended ?? 0), 0);
  const scheduled = children.reduce((sum, player) => sum + (player?.attendanceSummary?.scheduled ?? 0), 0);
  const attendanceRate = scheduled > 0 ? Math.round((attended / scheduled) * 100) : null;
  const feedbackCount = children.reduce((sum, player) => sum + demoCoachFeedback.filter((item) => item.playerId === player?.id).length, 0);

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Parent Portal', 'بوابة ولي الأمر')}
      title={bi('Family Overview', 'نظرة عامة للأسرة')}
      description={bi('Children, attendance and communication context in one truthful preview workspace.', 'سياق الأبناء والحضور والتواصل في مساحة معاينة صادقة واحدة.')}
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
            { label: bi('Coach feedback', 'ملاحظات المدرب'), value: feedbackCount },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Linked Children', 'الأبناء المرتبطون')} value={children.length} detail={bi('Active roster', 'القائمة النشطة')} tier="featured" />
        <BmMetricCard icon={<TrendingUp aria-hidden="true" />} label={bi('Attendance Context', 'سياق الحضور')} value={attendanceRate === null ? '—' : `${attendanceRate}%`} detail={bi(`${attended}/${scheduled} sessions`, `${attended}/${scheduled} حصص`)} />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Children', 'الأبناء')} description={bi('Review linked athlete profiles', 'مراجعة ملفات الرياضيين المرتبطين')} to="/parent/children" />
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Family Schedule', 'جدول الأسرة')} description={bi('Training context preview', 'معاينة سياق التدريب')} to="/parent/schedule" />
        <BmActionCard icon={<TrendingUp aria-hidden="true" />} title={bi('Performance', 'الأداء')} description={bi('Track child progress', 'تتبع تقدم الأبناء')} to="/parent/performance" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Communication-ready inbox', 'صندوق رسائل جاهز')} to="/parent/messages" />
        <BmActionCard icon={<CreditCard aria-hidden="true" />} title={bi('Payments', 'المدفوعات')} description={bi('Preview payment status', 'معاينة حالة المدفوعات')} to="/parent/payments" />
        <BmActionCard icon={<Award aria-hidden="true" />} title={bi('Feedback', 'الملاحظات')} description={bi('Coach feedback for your children', 'ملاحظات المدرب لأبنائك')} to="/parent/feedback" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Documents', 'المستندات')} description={bi('Family document center', 'مركز مستندات الأسرة')} to="/parent/documents" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<UsersRound aria-hidden="true" />} title={bi('Children Snapshot', 'لمحة عن الأبناء')} />
      <div className="bm-grid bm-grid-2">
        {children.map(player => {
          if (!player) return null;
          const sport = getSport(player.sportId);
          const group = getGroup(player.groupId);
          const coach = (player.coachIds ?? []).map(getCoach).find(Boolean);
          const next = nextSessionForGroup(player.groupId);
          const hasMetric = getLatestPlayerMetrics(player.id).some((metric) => typeof metric.current?.value === 'number');
          const score = hasMetric ? getPlayerOverall(player.id) : null;
          const feedback = demoCoachFeedback.filter((item) => item.playerId === player.id);
          const subscription = previewSubscriptions.find((item) => item.playerId === player.id);
          return (
            <div key={player.id} className="bm-card bm-card-clickable" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <span className="bm-cell-avatar" style={{ width: '48px', height: '48px' }}><UserRound aria-hidden="true" /></span>
                <div>
                  <strong style={{ fontSize: '15px' }}>{player.nameEn}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{player.nameAr}</div>
                  <div style={{ fontSize: '10px', color: 'var(--uos-text-muted, #a5a29c)', marginTop: '3px' }}>
                    <BilingualText value={sport?.name ?? bi('Sport preview', 'معاينة الرياضة')} />{group ? ` · ${group.name.en}` : ''}
                  </div>
                </div>
              </div>
              <div className="bm-grid bm-grid-3" style={{ gap: '10px' }}>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Next training', 'التدريب القادم')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{next ? new Date(next.startsAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : <BilingualText value={bi('None scheduled', 'لا يوجد مجدول')} />}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{player.attendanceSummary ? `${player.attendanceSummary.attended}/${player.attendanceSummary.scheduled}` : <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Performance', 'الأداء')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{score === null ? <BilingualText value={bi('Not available', 'غير متاح')} /> : `${score}/100`}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Coach', 'المدرب')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{coach?.nameEn ?? <BilingualText value={bi('Not assigned', 'غير معين')} />}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Star size={10} /><BilingualText value={bi('Feedback', 'الملاحظات')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{feedback.length ? <BilingualText value={bi(`${feedback.length} note${feedback.length === 1 ? '' : 's'}`, `${feedback.length} من الملاحظات`)} /> : <BilingualText value={bi('None yet', 'لا يوجد بعد')} />}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Subscription', 'الاشتراك')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{subscription ? <BilingualText value={subscription.status === 'active' ? bi('Active', 'نشط') : bi('Pending', 'معلق')} /> : <BilingualText value={bi('No record', 'لا سجل')} />}</strong></div>
              </div>
              <Link to={`/parent/children/${player.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '14px' }}>
                <BilingualText value={bi('View Child Profile', 'عرض ملف الابن')} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  </div>;
}
