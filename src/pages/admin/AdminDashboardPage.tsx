import { Activity, ArrowRight, BarChart3, CalendarClock, CheckCircle2, CircleDollarSign, Flag, LayoutDashboard, MapPin, Medal, ShieldCheck, TrendingDown, TrendingUp, Trophy, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { BmActionCard, BmActivityCard, BmBadge, BmButton, BmFilterSelect, BmMetricCard, BmPageHeader, BmScheduleCard, BmSectionLabel } from '../../components/benchmark/BenchmarkComponents';
import { demoBranches, demoCountries } from '../../data/demo/business';
import { demoPlayers } from '../../data/demo/players';
import { demoSessions, demoActivity } from '../../data/demo/sessions';
import { demoSports } from '../../data/demo/sports';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { previewPayments, previewSubscriptions } from '../../data/demo/adminRecords';
import { getSport } from '../../data/demo/selectors';

export function AdminDashboardPage() {
  const [country, setCountry] = useState('all');
  const [branch, setBranch] = useState('all');
  const [sport, setSport] = useState('all');
  const scopedBranches = useMemo(() => demoBranches.filter(item => (country === 'all' || item.countryId === country) && (branch === 'all' || item.id === branch) && (sport === 'all' || item.sportIds.includes(sport))), [country, branch, sport]);
  const branchIds = new Set(scopedBranches.map(item => item.id));
  const playerIds = new Set(scopedBranches.flatMap(item => item.playerIds));
  const players = scopedBranches.length ? demoPlayers.filter(player => playerIds.has(player.id)) : [];
  const groups = demoTrainingGroups.filter(group => (sport === 'all' || group.sportId === sport) && (scopedBranches.length ? scopedBranches.some(item => item.groupIds.includes(group.id)) : false));
  const sessions = demoSessions.filter(session => (sport === 'all' || session.sportId === sport) && groups.some(group => group.id === session.groupId));
  const attendance = players.reduce((sum, player) => sum + ((player.attendanceSummary?.attended ?? 0) / Math.max(player.attendanceSummary?.scheduled ?? 1, 1)), 0) / Math.max(players.length, 1) * 100;
  const collected = previewPayments.filter(payment => payment.status === 'completed' && (!players.length || playerIds.has(payment.playerId))).reduce((sum, payment) => sum + payment.amount, 0);
  const activeSubscriptions = previewSubscriptions.filter(subscription => subscription.status === 'active' && (!players.length || playerIds.has(subscription.playerId))).length;
  const reset = () => { setCountry('all'); setBranch('all'); setSport('all'); };

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Operations Overview', 'نظرة عامة على العمليات')}
      title={bi('Executive Dashboard', 'لوحة القيادة التنفيذية')}
      description={bi('A scoped command center calculated from anonymized organization, roster, attendance and finance preview fixtures.', 'مركز قيادة مخصص محسوب من بيانات المؤسسة والقائمة والحضور والمالية التجريبية المجهولة.')}
      icon={<LayoutDashboard aria-hidden="true" />}
      actions={<BmButton variant="primary" onClick={reset}><BilingualText value={bi('Clear scope', 'مسح النطاق')} /></BmButton>}
    />

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="01" icon={<MapPin aria-hidden="true" />} title={bi('Global Scope Controls', 'عناصر التحكم في النطاق')} />
      <div className="bm-filter-bar">
        <BmFilterSelect label={bi('Country', 'الدولة')} value={country} onChange={value => { setCountry(value); setBranch('all'); }} options={[{ value: 'all', label: bi('All countries', 'كل الدول') }, ...demoCountries.map(item => ({ value: item.id, label: item.name }))]} />
        <BmFilterSelect label={bi('Branch', 'الفرع')} value={branch} onChange={setBranch} options={[{ value: 'all', label: bi('All branches', 'كل الفروع') }, ...demoBranches.filter(item => country === 'all' || item.countryId === country).map(item => ({ value: item.id, label: item.name }))]} />
        <BmFilterSelect label={bi('Sport', 'الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports', 'كل الرياضات') }, ...demoSports.map(item => ({ value: item.id, label: item.name }))]} />
        <BmBadge tone="info" label={bi(`${scopedBranches.length} branches in scope`, `${scopedBranches.length} فروع في النطاق`)} />
      </div>
    </div>

    <div className="bm-grid bm-grid-4" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmMetricCard icon={<Flag aria-hidden="true" />} label={bi('Countries', 'الدول')} value={country === 'all' ? demoCountries.length : 1} detail={bi('Organization scope', 'نطاق المؤسسة')} />
      <BmMetricCard icon={<MapPin aria-hidden="true" />} label={bi('Branches', 'الفروع')} value={scopedBranches.length} detail={bi('Filtered scope', 'النطاق المفلتر')} tier="featured" />
      <BmMetricCard icon={<Trophy aria-hidden="true" />} label={bi('Sports', 'الرياضات')} value={new Set(scopedBranches.flatMap(item => item.sportIds)).size} detail={bi('Active sport reach', 'انتشار الرياضات النشطة')} />
      <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Players', 'اللاعبون')} value={players.length} detail={bi('Roster records', 'سجلات القائمة')} tier="featured" />
      <BmMetricCard icon={<Medal aria-hidden="true" />} label={bi('Training Groups', 'مجموعات التدريب')} value={groups.length} detail={bi('Operational teams', 'الفرق التشغيلية')} />
      <BmMetricCard icon={<CalendarClock aria-hidden="true" />} label={bi('Upcoming Sessions', 'الحصص القادمة')} value={sessions.length} detail={bi('Preview calendar', 'تقويم تجريبي')} tier="featured" />
      <BmMetricCard icon={<CheckCircle2 aria-hidden="true" />} label={bi('Attendance Rate', 'معدل الحضور')} value={`${Math.round(attendance)}%`} detail={bi('Derived from roster', 'مشتق من القائمة')} trend="+6%" trendDirection="up" />
      <BmMetricCard icon={<CircleDollarSign aria-hidden="true" />} label={bi('Collected Preview', 'المحصل التجريبي')} value={`${collected}`} detail={bi('AED · completed rows', 'درهم · الصفوف المكتملة')} tier="featured" />
    </div>

    <div className="bm-grid bm-grid-2" style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <div className="bm-card" style={{ padding: '24px' }}>
        <div className="bm-section-label" style={{ marginBottom: '16px', paddingBottom: '14px' }}>
          <CalendarClock aria-hidden="true" />
          <h2 style={{ fontSize: '18px' }}><BilingualText value={bi('Operations Pulse', 'نبض العمليات')} /></h2>
        </div>
        <div className="bm-stack">
          {sessions.slice(0, 4).map(session => (
            <BmScheduleCard
              key={session.id}
              time={new Date(session.startsAt).toLocaleDateString('en-GB')}
              title={getSport(session.sportId)?.name ?? bi(session.sportId, session.sportId)}
              meta={[bi(`Session ${session.id}`, `الحصة ${session.id}`), bi('Scheduled', 'مجدولة')]}
            />
          ))}
          {!sessions.length && (
            <div className="bm-state" style={{ padding: '32px 20px' }}>
              <CalendarClock aria-hidden="true" />
              <h3 style={{ fontSize: '14px' }}><BilingualText value={bi('No sessions in scope', 'لا توجد حصص في النطاق')} /></h3>
            </div>
          )}
        </div>
      </div>

      <div className="bm-card" style={{ padding: '24px' }}>
        <div className="bm-section-label" style={{ marginBottom: '16px', paddingBottom: '14px' }}>
          <BarChart3 aria-hidden="true" />
          <h2 style={{ fontSize: '18px' }}><BilingualText value={bi('Attendance & Finance', 'الحضور والمالية')} /></h2>
        </div>
        <div className="bm-stack">
          <div className="bm-card bm-card-compact" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Attendance Consistency', 'انتظام الحضور')} /></span>
              <BmBadge tone="success" label={bi(`${Math.round(attendance)}%`, `${Math.round(attendance)}٪`)} icon={<TrendingUp aria-hidden="true" />} />
            </div>
            <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(attendance)}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #d4b23a, #f0c75e)' }} />
            </div>
          </div>
          <div className="bm-grid bm-grid-2">
            <div className="bm-card bm-card-compact" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Active Subscriptions', 'الاشتراكات النشطة')} /></span>
              <strong style={{ display: 'block', fontSize: '28px', marginTop: '8px' }}>{activeSubscriptions}</strong>
            </div>
            <div className="bm-card bm-card-compact" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Pending Value', 'القيمة المعلقة')} /></span>
              <strong style={{ display: 'block', fontSize: '28px', marginTop: '8px' }}>{previewPayments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<MapPin aria-hidden="true" />} title={bi('Branch Performance', 'أداء الفروع')} />
      <div className="bm-grid bm-grid-2">
        {scopedBranches.map(item => {
          const readiness = Math.round((item.sportIds.length / Math.max(demoSports.length, 1) * 30) + (item.programIds.length / 4 * 25) + (item.groupIds.length / 4 * 25) + (item.playerIds.length / 8 * 20));
          return (
            <div key={item.id} className="bm-card bm-card-clickable" style={{ padding: '22px' }} >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <strong style={{ fontSize: '16px' }}><BilingualText value={item.name} /></strong>
                  <div style={{ fontSize: '10px', color: 'var(--uos-text-muted, #a5a29c)', marginTop: '4px' }}>{item.id}</div>
                </div>
                <BmBadge tone="success" label={bi('Active', 'نشط')} icon={<CheckCircle2 aria-hidden="true" />} />
              </div>
              <div className="bm-grid bm-grid-4" style={{ gap: '10px', marginBottom: '14px' }}>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Players', 'اللاعبون')} /></span><strong style={{ display: 'block', fontSize: '18px' }}>{item.playerIds.length}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Coaches', 'المدربون')} /></span><strong style={{ display: 'block', fontSize: '18px' }}>{item.coachIds.length}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Programs', 'البرامج')} /></span><strong style={{ display: 'block', fontSize: '18px' }}>{item.programIds.length}</strong></div>
                <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Sports', 'الرياضات')} /></span><strong style={{ display: 'block', fontSize: '18px' }}>{item.sportIds.length}</strong></div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Readiness', 'الجاهزية')} /></span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--bm-gold, #d8b35a)' }}>{readiness}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${readiness}%`, borderRadius: '999px', background: 'linear-gradient(90deg, #d4b23a, #f0c75e)' }} />
                </div>
              </div>
              <Link to={`/admin/branches/${item.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%' }}>
                <BilingualText value={bi('Open Branch Cockpit', 'فتح مركز الفرع')} />
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<Activity aria-hidden="true" />} title={bi('Recent Activity', 'النشاط الحديث')} />
      <div className="bm-stack">
        {demoActivity.map((item) => (
          <BmActivityCard key={item.id} icon={<Activity aria-hidden="true" />} title={item.title} subtitle={item.time} time={item.time} />
        ))}
      </div>
    </div>
  </div>;
}
