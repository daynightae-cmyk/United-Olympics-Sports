import { Building2, Medal, ShieldCheck, Trash2, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBranches, useCoach, useDeleteCoach, useGroups, usePlayers, useSports, useUpdateCoach } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader, PlayerAvatar, StatCard, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'groups', label: bi('Groups', 'المجموعات') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
  { id: 'certifications', label: bi('Certifications', 'الشهادات') },
];

export function AdminCoachDetailPage() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: coach, loading, error } = useCoach(coachId);
  const { data: groupResult } = useGroups({ page: 1, pageSize: 200 });
  const { data: branchResult } = useBranches({ page: 1, pageSize: 100 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 300 });
  const { update, loading: updateLoading } = useUpdateCoach();
  const { delete: deleteCoach, loading: deleteLoading } = useDeleteCoach();

  if (loading) return <FuturePanel title={bi('Loading coach record', 'جارٍ تحميل سجل المدرب')} description={bi('Reading the coach from the Admin data gateway.', 'جارٍ قراءة المدرب من بوابة بيانات الإدارة.')} />;
  if (error || !coach) return <FuturePanel title={bi('Coach not found', 'المدرب غير موجود')} description={bi('The requested coach is not available in the current data provider.', 'المدرب المطلوب غير متاح في موفر البيانات الحالي.')} />;

  const groups = groupResult.items.filter((group) => coach.groupIds.includes(group.id));
  const branches = branchResult.items.filter((branch) => coach.branchIds.includes(branch.id));
  const sports = sportResult.items.filter((sport) => coach.sportIds.includes(sport.id));
  const players = playerResult.items.filter((player) => Boolean(player.groupId) && coach.groupIds.includes(player.groupId!));
  const deleteBlocked = coach.groupIds.length > 0 || coach.branchIds.length > 0;
  const busy = updateLoading || deleteLoading;

  const toggleStatus = async () => {
    await update(coach.id, { status: coach.status === 'active' ? 'inactive' : 'active' });
  };
  const remove = async () => {
    if (deleteBlocked || busy) return;
    await deleteCoach(coach.id);
    navigate('/admin/coaches');
  };

  return <div className="admin-page">
    <PageHeader icon={Medal} eyebrow={bi('Coach Profile', 'ملف المدرب')} title={{ en: coach.nameEn, ar: coach.nameAr }} description={bi('Gateway-backed coach record with current sport, branch and group assignments.', 'سجل مدرب مدعوم ببوابة البيانات مع تكليفات الرياضة والفرع والمجموعة الحالية.')} actions={<div className="admin-header-actions"><StatusBadge active={coach.status === 'active'} /><button type="button" className="admin-secondary-button" disabled={busy} onClick={() => void toggleStatus()}><BilingualText value={coach.status === 'active' ? bi('Deactivate', 'تعطيل') : bi('Activate', 'تفعيل')} /></button><button type="button" className="admin-danger-button" disabled={busy || deleteBlocked} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>} />

    {deleteBlocked && <div className="preview-warning" role="status"><BilingualText value={bi('Deletion is protected while branch or group assignments remain linked.', 'الحذف محمي ما دامت تكليفات الفروع أو المجموعات مرتبطة.')} /></div>}

    <section className="coach-identity-card">
      <PlayerAvatar id={coach.id} large />
      <div className="coach-identity-main"><h2><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></h2><code>{coach.id}</code><span className="preview-badge"><BilingualText value={bi('Gateway Record', 'سجل بوابة البيانات')} /></span></div>
      <dl><div><dt><BilingualText value={bi('Sports', 'الرياضات')} /></dt><dd>{sports.length}</dd></div><div><dt><BilingualText value={bi('Groups', 'المجموعات')} /></dt><dd>{groups.length}</dd></div><div><dt><BilingualText value={bi('Branches', 'الفروع')} /></dt><dd>{branches.length}</dd></div><div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{coach.playerCount}</dd></div></dl>
    </section>

    <section className="admin-stat-grid compact"><StatCard label={bi('Sports', 'الرياضات')} value={sports.length} icon={Trophy} /><StatCard label={bi('Groups', 'المجموعات')} value={groups.length} icon={Users} /><StatCard label={bi('Branches', 'الفروع')} value={branches.length} icon={Building2} /><StatCard label={bi('Roster Reach', 'نطاق اللاعبين')} value={coach.playerCount} icon={Users} /></section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="coach-overview-grid"><section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Coach Information', 'معلومات المدرب')} /><small><BilingualText value={bi('Current provider record', 'سجل موفر البيانات الحالي')} /></small></div><Medal /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Coach ID', 'معرف المدرب')} /></dt><dd><code>{coach.id}</code></dd></div><div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd>{coach.status}</dd></div><div><dt><BilingualText value={bi('Specializations', 'التخصصات')} /></dt><dd>{coach.specializations.length ? coach.specializations.map((item, index) => <span key={index} className="specialization-tag"><BilingualText value={item} /></span>) : '—'}</dd></div></dl></section><section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Assigned Sports', 'الرياضات المكلف بها')} /><Trophy /></div>{sports.length ? <div className="linked-player-list">{sports.map((sport) => <Link key={sport.id} to={`/admin/sports/${sport.id}`}><BilingualText value={sport.name} /></Link>)}</div> : <p><BilingualText value={bi('No sports assigned.', 'لا توجد رياضات معينة.')} /></p>}</section></div>}

      {active === 'groups' && <div className="preview-list">{groups.map((group) => <div className="preview-line" key={group.id}><Users /><BilingualText value={group.name} /><Link className="admin-link-button small" to={`/admin/sports/${group.sportId}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /></Link></div>)}{!groups.length && <p className="empty-message"><BilingualText value={bi('No groups assigned.', 'لا توجد مجموعات معينة.')} /></p>}</div>}

      {active === 'players' && <div className="preview-list">{players.map((player) => <div className="preview-line" key={player.id}><Medal /><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><Link className="admin-link-button small" to={`/admin/players/${player.id}`}><BilingualText value={bi('View Player', 'عرض اللاعب')} /></Link></div>)}{!players.length && <p className="empty-message"><BilingualText value={bi('No player records can be derived from current group assignments.', 'لا توجد سجلات لاعبين يمكن اشتقاقها من تكليفات المجموعات الحالية.')} /></p>}</div>}

      {active === 'certifications' && <div className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Certifications', 'الشهادات')} /><ShieldCheck /></div>{coach.certifications.length ? coach.certifications.map((certificate, index) => <div className="preview-line" key={index}><BilingualText value={certificate} /></div>) : <p><BilingualText value={bi('No certifications are recorded in the current provider.', 'لا توجد شهادات مسجلة في موفر البيانات الحالي.')} /></p>}</div>}
    </section>
  </div>;
}
