import { ArrowRight, Dumbbell, FolderCog, ShieldCheck, Trash2, Trophy, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCoaches, useDeleteGroup, useGroup, usePlayers, usePrograms, useSport, useUpdateGroup } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader, StatCard, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminGroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { item: group, loading: groupLoading, error: groupError } = useGroup(groupId);
  const { item: sport } = useSport(group?.sportId);
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 200 });
  const { data: coachResult } = useCoaches({ page: 1, pageSize: 200 });
  const { data: programResult } = usePrograms({ page: 1, pageSize: 200 });
  const { update, loading: updateLoading } = useUpdateGroup();
  const { delete: deleteGroup, loading: deleteLoading } = useDeleteGroup();

  if (groupLoading) return <FuturePanel title={bi('Loading training group', 'جارٍ تحميل مجموعة التدريب')} description={bi('Reading the current record from the Admin data gateway.', 'جارٍ قراءة السجل الحالي من بوابة بيانات الإدارة.')} />;
  if (groupError || !group) return <FuturePanel title={bi('Training group not found', 'مجموعة التدريب غير موجودة')} description={bi('The requested group is not available in the current data provider.', 'المجموعة المطلوبة غير متاحة في موفر البيانات الحالي.')} />;

  const players = playerResult.items.filter((player) => player.groupId === group.id);
  const coaches = coachResult.items.filter((coach) => coach.groupIds.includes(group.id));
  const programs = programResult.items.filter((program) => group.programIds.includes(program.id));
  const busy = updateLoading || deleteLoading;
  const toggleStatus = async () => {
    await update(group.id, { status: group.status === 'active' ? 'inactive' : 'active' });
  };
  const archiveGroup = async () => {
    if (group.playerCount > 0 || group.coachCount > 0 || players.length > 0 || coaches.length > 0) return;
    await deleteGroup(group.id);
    navigate('/admin/groups');
  };

  return <div className="admin-page">
    <PageHeader
      icon={Dumbbell}
      eyebrow={bi('Training Group Detail', 'تفاصيل مجموعة التدريب')}
      title={group.name}
      description={bi('A gateway-backed relationship across sport, programme, coaches and players.', 'علاقة مدعومة ببوابة البيانات بين الرياضة والبرنامج والمدربين واللاعبين.')}
      actions={<div className="admin-header-actions"><StatusBadge active={group.status === 'active'} /><button type="button" className="admin-secondary-button" disabled={busy} onClick={() => void toggleStatus()}><BilingualText value={group.status === 'active' ? bi('Deactivate', 'تعطيل') : bi('Activate', 'تفعيل')} /></button><button type="button" className="admin-danger-button" disabled={busy || group.playerCount > 0 || group.coachCount > 0 || players.length > 0 || coaches.length > 0} onClick={() => void archiveGroup()}><Trash2 size={15} /><BilingualText value={bi('Archive Group', 'أرشفة المجموعة')} /></button></div>}
    />

    {(group.playerCount > 0 || group.coachCount > 0 || players.length > 0 || coaches.length > 0) && <div className="preview-warning" role="status"><BilingualText value={bi('Archive is disabled while players or coaches remain linked to this group.', 'تم تعطيل الأرشفة ما دام هناك لاعبون أو مدربون مرتبطون بهذه المجموعة.')} /></div>}

    <section className="admin-stat-grid compact">
      <StatCard label={bi('Sport', 'الرياضة')} value={sport?.name.en ?? group.sportId} icon={Trophy} note={sport?.name} />
      <StatCard label={bi('Players', 'اللاعبون')} value={players.length || group.playerCount} icon={Users} />
      <StatCard label={bi('Coaches', 'المدربون')} value={coaches.length || group.coachCount} icon={ShieldCheck} />
      <StatCard label={bi('Programs', 'البرامج')} value={programs.length} icon={FolderCog} />
    </section>

    <div className="overview-grid">
      <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Group Profile', 'ملف المجموعة')} /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Group Name', 'اسم المجموعة')} /></dt><dd><BilingualText value={group.name} /></dd></div><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <Link to={`/admin/sports/${sport.id}`}><BilingualText value={sport.name} /></Link> : group.sportId}</dd></div><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={group.level} /></dd></div></dl></section>

      <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Linked Players', 'اللاعبون المرتبطون')} /><Users /></div>{players.length ? <div className="linked-player-list">{players.map((player) => <Link to={`/admin/players/${player.id}`} key={player.id}><span className="list-index">{player.id.slice(-3)}</span><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No players are linked to this group in the current provider.', 'لا يوجد لاعبون مرتبطون بهذه المجموعة في موفر البيانات الحالي.')} /></p>}</section>

      <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Linked Coaches', 'المدربون المرتبطون')} /><ShieldCheck /></div>{coaches.length ? <div className="linked-player-list">{coaches.map((coach) => <Link to={`/admin/coaches/${coach.id}`} key={coach.id}><span className="list-index">{coach.id.slice(-3)}</span><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No coaches are linked to this group in the current provider.', 'لا يوجد مدربون مرتبطون بهذه المجموعة في موفر البيانات الحالي.')} /></p>}</section>

      <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Linked Programs', 'البرامج المرتبطة')} /><FolderCog /></div>{programs.length ? <div className="linked-player-list">{programs.map((program) => <Link to={`/admin/programs/${program.id}`} key={program.id}><BilingualText value={program.name} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No programmes are linked to this group.', 'لا توجد برامج مرتبطة بهذه المجموعة.')} /></p>}</section>
    </div>
  </div>;
}
