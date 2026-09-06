import { ArrowRight, FolderCog, Gamepad2, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiButton, UiPreviewState } from '../../components/ui/UiPrimitives';
import { useDeleteProgram, useGroups, usePlayers, useProgram, useSport, useUpdateProgram } from '../../admin/data/adminHooks';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'groups', label: bi('Groups', 'المجموعات') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
];

export function AdminProgramDetailPage() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: program, loading, error, refetch } = useProgram(programId);
  const { data: groupsData } = useGroups({ page: 1, pageSize: 500 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 1000 });
  const { update, loading: updating } = useUpdateProgram();
  const { delete: remove, loading: deleting } = useDeleteProgram();
  const { item: sport } = useSport(program?.sportId);

  if (loading) return <div className="admin-page"><UiPreviewState title={bi('Loading program', 'جارٍ تحميل البرنامج')} description={bi('Reading the Admin data gateway.', 'جارٍ قراءة بوابة بيانات الإدارة.')} /></div>;
  if (error || !program) return <div className="admin-page"><PageHeader icon={FolderCog} eyebrow={bi('Program Profile', 'ملف البرنامج')} title={bi('Program not found', 'البرنامج غير موجود')} description={bi('Choose a valid program from the Programs directory.', 'اختر برنامجاً صالحاً من دليل البرامج.')} /></div>;

  const groups = groupsData.items.filter(group => group.programIds.includes(program.id));
  const groupIds = new Set(groups.map(group => group.id));
  const players = playersData.items.filter(player => player.programId === program.id || (player.groupId ? groupIds.has(player.groupId) : false));
  const hasRelations = groups.length > 0 || players.length > 0;
  const setStatus = async (status: 'active' | 'inactive') => { await update(program.id, { status }); await refetch(); };
  const deleteProgram = async () => {
    if (hasRelations) return;
    if (!window.confirm('Delete this Preview program? | حذف برنامج المعاينة؟')) return;
    await remove(program.id);
    navigate('/admin/programs');
  };

  return <div className="admin-page">
    <PageHeader icon={FolderCog} eyebrow={bi('Program Profile', 'ملف البرنامج')} title={program.name} description={program.description} actions={<StatusBadge active={program.status === 'active'} />} />
    <section className="program-identity-card"><div className="program-identity-main"><Gamepad2 /><h2><BilingualText value={program.name} /></h2><StatusBadge active={program.status === 'active'} /></div><dl><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <BilingualText value={sport.name} /> : <code>{program.sportId}</code>}</dd></div><div><dt><BilingualText value={bi('Age Groups', 'الفئات العمرية')} /></dt><dd>{program.ageGroups.length ? program.ageGroups.map((item, index) => <span key={`${item.en}-${index}`}><BilingualText value={item} />{index < program.ageGroups.length - 1 ? ', ' : ''}</span>) : '—'}</dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={program.level} /></dd></div><div><dt><BilingualText value={bi('Groups', 'المجموعات')} /></dt><dd>{groups.length}</dd></div><div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{players.length}</dd></div></dl></section>
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Program Controls', 'ضوابط البرنامج')} /><ShieldCheck /></div><div className="preview-form-grid"><label><BilingualText value={bi('Operating status', 'حالة التشغيل')} /><select value={program.status} disabled={updating} onChange={event => void setStatus(event.target.value as 'active' | 'inactive')}><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label></div><p className="preview-warning"><BilingualText value={bi('Changes persist in the browser Preview store.', 'تستمر التغييرات في مخزن المعاينة بالمتصفح.')} /></p></section>
    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="admin-entity-grid"><article><FolderCog /><small><BilingualText value={bi('Description', 'الوصف')} /></small><p><BilingualText value={program.description} /></p></article><article><Gamepad2 /><small><BilingualText value={bi('Sport relationship', 'علاقة الرياضة')} /></small>{sport ? <Link className="admin-link-button" to={`/admin/sports/${sport.id}`}><BilingualText value={sport.name} /><ArrowRight /></Link> : <code>{program.sportId}</code>}</article><article><Users /><small><BilingualText value={bi('Delivery coverage', 'نطاق التقديم')} /></small><strong>{groups.length} <BilingualText value={bi('groups', 'مجموعات')} /></strong><strong>{players.length} <BilingualText value={bi('players', 'لاعبين')} /></strong></article></div>}
      {active === 'groups' && <div className="group-grid">{groups.map(group => <article className="group-card" key={group.id}><BilingualText value={group.name} className="group-title" /><StatusBadge active={group.status === 'active'} /><dl><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{group.playerCount}</dd></div></dl><Link className="admin-link-button" to={`/admin/sports/${group.sportId}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /><ArrowRight /></Link></article>)}{!groups.length && <p className="empty-message"><BilingualText value={bi('No groups linked to this program.', 'لا توجد مجموعات مرتبطة بهذا البرنامج.')} /></p>}</div>}
      {active === 'players' && <div className="linked-player-list">{players.map(player => <Link to={`/admin/players/${player.id}`} key={player.id}><span className="list-index">{player.id.slice(-3)}</span><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><BilingualText value={player.level} /><ArrowRight /></Link>)}{!players.length && <p className="empty-message"><BilingualText value={bi('No players linked to this program.', 'لا يوجد لاعبون مرتبطون بهذا البرنامج.')} /></p>}</div>}
    </section>
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Danger Zone', 'منطقة الخطر')} /><ShieldCheck /></div>{hasRelations && <p className="preview-warning"><BilingualText value={bi('Remove or reassign related groups and players before deleting the program.', 'احذف أو أعد تعيين المجموعات واللاعبين المرتبطين قبل حذف البرنامج.')} /></p>}<UiButton variant="danger" disabled={deleting || hasRelations} onClick={() => void deleteProgram()}><Trash2 /><BilingualText value={bi(deleting ? 'Deleting…' : 'Delete Preview program', deleting ? 'جارٍ الحذف…' : 'حذف برنامج المعاينة')} /></UiButton></section>
  </div>;
}
