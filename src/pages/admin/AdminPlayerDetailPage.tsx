import { BarChart3, CalendarCheck, FileText, Medal, ShieldCheck, Trash2, Trophy, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAchievements, useCoaches, useDeletePlayer, useGroup, useParents, usePayments, usePlayer, useRegistrations, useSessions, useSport, useSubscriptions, useUpdatePlayer } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader, PlayerAvatar, StatCard, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'attendance', label: bi('Attendance', 'الحضور') },
  { id: 'performance', label: bi('Performance', 'الأداء') },
  { id: 'relationships', label: bi('Relationships', 'العلاقات') },
  { id: 'achievements', label: bi('Achievements', 'الإنجازات') },
  { id: 'schedule', label: bi('Schedule', 'الجدول') },
  { id: 'documents', label: bi('Documents', 'المستندات') },
];

export function AdminPlayerDetailPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: player, loading, error } = usePlayer(playerId);
  const { item: sport } = useSport(player?.sportId);
  const { item: group } = useGroup(player?.groupId);
  const { data: coachResult } = useCoaches({ page: 1, pageSize: 200 });
  const { data: parentResult } = useParents({ page: 1, pageSize: 200 });
  const { data: sessionResult } = useSessions({ page: 1, pageSize: 300 });
  const { data: achievementResult } = useAchievements({ page: 1, pageSize: 300 });
  const { data: registrationResult } = useRegistrations({ page: 1, pageSize: 300 });
  const { data: subscriptionResult } = useSubscriptions({ page: 1, pageSize: 300 });
  const { data: paymentResult } = usePayments({ page: 1, pageSize: 300 });
  const { update, loading: updateLoading } = useUpdatePlayer();
  const { delete: deletePlayer, loading: deleteLoading } = useDeletePlayer();

  if (loading) return <FuturePanel title={bi('Loading player record', 'جارٍ تحميل سجل اللاعب')} description={bi('Reading the athlete from the Admin data gateway.', 'جارٍ قراءة الرياضي من بوابة بيانات الإدارة.')} />;
  if (error || !player) return <FuturePanel title={bi('Player not found', 'اللاعب غير موجود')} description={bi('The requested athlete is not available in the current data provider.', 'الرياضي المطلوب غير متاح في موفر البيانات الحالي.')} />;

  const coaches = coachResult.items.filter(coach => player.groupId ? coach.groupIds.includes(player.groupId) : coach.sportIds.includes(player.sportId));
  const parents = parentResult.items.filter(parent => parent.playerIds.includes(player.id));
  const sessions = sessionResult.items.filter(session => Boolean(player.groupId) && session.groupId === player.groupId);
  const achievements = achievementResult.items.filter(item => item.playerId === player.id || (player.groupId && item.groupId === player.groupId));
  const registrations = registrationResult.items.filter(item => item.playerId === player.id);
  const subscriptions = subscriptionResult.items.filter(item => item.playerId === player.id);
  const payments = paymentResult.items.filter(item => item.playerId === player.id);
  const deleteBlocked = registrations.length > 0 || subscriptions.length > 0 || payments.length > 0 || achievements.some(item => item.playerId === player.id);
  const busy = updateLoading || deleteLoading;
  const isActive = player.status.en.toLowerCase() === 'active';

  const toggleStatus = async () => {
    await update(player.id, { status: isActive ? bi('Inactive', 'غير نشط') : bi('Active', 'نشط') });
  };

  const remove = async () => {
    if (deleteBlocked || busy) return;
    await deletePlayer(player.id);
    navigate('/admin/players');
  };

  return <div className="admin-page">
    <PageHeader
      icon={Medal}
      eyebrow={bi('Athlete Record', 'سجل الرياضي')}
      title={{ en: player.nameEn, ar: player.nameAr }}
      description={bi('Gateway-backed athlete record with truthful relationship and operational state.', 'سجل رياضي مدفوع ببوابة البيانات مع علاقات وحالة تشغيلية صادقة.')}
      actions={<div className="admin-header-actions"><StatusBadge active={isActive} /><button type="button" className="admin-secondary-button" disabled={busy} onClick={() => void toggleStatus()}><BilingualText value={isActive ? bi('Deactivate', 'تعطيل') : bi('Activate', 'تفعيل')} /></button><button type="button" className="admin-danger-button" disabled={busy || deleteBlocked} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>}
    />

    {deleteBlocked && <div className="preview-warning" role="status"><BilingualText value={bi('Deletion is protected while registrations, finance records, or direct achievements reference this player.', 'الحذف محمي طالما توجد تسجيلات أو سجلات مالية أو إنجازات مباشرة تشير إلى هذا اللاعب.')} /></div>}

    <section className="player-identity-card">
      <PlayerAvatar id={player.id} large />
      <div className="player-identity-main"><code>{player.id}</code><h2><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></h2><span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Gateway Record', 'سجل بوابة البيانات')} /></span></div>
      <dl>
        <div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <Link to={`/admin/sports/${sport.id}`}><BilingualText value={sport.name} /></Link> : player.sportId}</dd></div>
        <div><dt><BilingualText value={bi('Training Group', 'مجموعة التدريب')} /></dt><dd>{group ? <Link to={`/admin/sports/${player.sportId}/groups/${group.id}`}><BilingualText value={group.name} /></Link> : <BilingualText value={bi('Not assigned', 'غير معين')} />}</dd></div>
        <div><dt><BilingualText value={bi('Age', 'العمر')} /></dt><dd>{player.age ?? '—'}</dd></div>
        <div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={player.level} /></dd></div>
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="player-overview-grid">
        <section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Player Information', 'معلومات اللاعب')} /><small><BilingualText value={bi('Current provider record', 'سجل موفر البيانات الحالي')} /></small></div><Medal /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Player ID', 'رقم اللاعب')} /></dt><dd><code>{player.id}</code></dd></div><div><dt><BilingualText value={bi('Program', 'البرنامج')} /></dt><dd>{player.programId ?? '—'}</dd></div><div><dt><BilingualText value={bi('Guardians', 'أولياء الأمور')} /></dt><dd>{parents.length}</dd></div><div><dt><BilingualText value={bi('Coach coverage', 'تغطية المدربين')} /></dt><dd>{coaches.length}</dd></div></dl></section>
        <section className="admin-stat-grid compact"><StatCard label={bi('Attendance Rate', 'معدل الحضور')} value={`${player.attendanceRate}%`} icon={CalendarCheck} /><StatCard label={bi('Performance', 'الأداء')} value={player.performanceScore === null ? '—' : `${player.performanceScore}/100`} icon={BarChart3} /><StatCard label={bi('Achievements', 'الإنجازات')} value={achievements.length} icon={Trophy} /><StatCard label={bi('Sessions', 'الجلسات')} value={sessions.length} icon={CalendarCheck} /></section>
      </div>}

      {active === 'attendance' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Attendance Summary', 'ملخص الحضور')} /><CalendarCheck /></div><div className="admin-stat-grid compact"><StatCard label={bi('Attendance Rate', 'معدل الحضور')} value={`${player.attendanceRate}%`} icon={CalendarCheck} /><StatCard label={bi('Scheduled Group Sessions', 'جلسات المجموعة المجدولة')} value={sessions.length} icon={CalendarCheck} /></div><p><BilingualText value={bi('The current Admin contract exposes an attendance percentage, not fabricated per-session attendance records.', 'يعرض عقد الإدارة الحالي نسبة حضور، ولا يتم اختلاق سجلات حضور تفصيلية لكل جلسة.')} /></p></div>}

      {active === 'performance' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Performance Summary', 'ملخص الأداء')} /><BarChart3 /></div><div className="overview-score-card"><Trophy /><BilingualText value={bi('Overall Development', 'التطور العام')} /><strong>{player.performanceScore === null ? '—' : player.performanceScore}</strong>{player.performanceScore !== null && <span>/ 100 | من 100</span>}</div><p><BilingualText value={bi('Metric-level history is shown only when a dedicated performance provider is connected.', 'يتم عرض سجل المؤشرات التفصيلي فقط عند ربط موفر أداء مخصص.')} /></p></div>}

      {active === 'relationships' && <div className="overview-grid">
        <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Guardians', 'أولياء الأمور')} /><UsersRound /></div>{parents.length ? <div className="linked-player-list">{parents.map(parent => <Link key={parent.id} to={`/admin/parents/${parent.id}`}><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No guardian is linked.', 'لا يوجد ولي أمر مرتبط.')} /></p>}</section>
        <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Coaching Coverage', 'تغطية التدريب')} /><ShieldCheck /></div>{coaches.length ? <div className="linked-player-list">{coaches.map(coach => <Link key={coach.id} to={`/admin/coaches/${coach.id}`}><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No coach relationship is available.', 'لا توجد علاقة مدرب متاحة.')} /></p>}</section>
      </div>}

      {active === 'achievements' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Achievements', 'الإنجازات')} /><Trophy /></div>{achievements.length ? <div className="linked-player-list">{achievements.map(item => <Link key={item.id} to={`/admin/achievements/${item.id}`}><BilingualText value={item.title} /><span>{item.awardedAt}</span><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No verified achievements are linked.', 'لا توجد إنجازات موثقة مرتبطة.')} /></p>}</div>}

      {active === 'schedule' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Group Sessions', 'جلسات المجموعة')} /><CalendarCheck /></div>{sessions.length ? <div className="linked-player-list">{sessions.map(session => <Link key={session.id} to={`/admin/schedules/${session.id}`}><span>{new Date(session.startsAt).toLocaleString()}</span><BilingualText value={session.status} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No sessions are linked to the current group.', 'لا توجد جلسات مرتبطة بالمجموعة الحالية.')} /></p>}</div>}

      {active === 'documents' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Document Workspace', 'مساحة المستندات')} /><FileText /></div><p><BilingualText value={bi('No document-storage provider is connected to this Admin view yet. The interface does not invent files or upload state.', 'لا يوجد موفر تخزين مستندات متصل بهذه الواجهة الإدارية حتى الآن. لا تختلق الواجهة ملفات أو حالة رفع.')} /></p></div>}
    </section>
  </div>;
}
