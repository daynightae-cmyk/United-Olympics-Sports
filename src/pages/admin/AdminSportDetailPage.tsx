import { ArrowRight, BarChart3, ClipboardList, Dumbbell, FolderCog, ImageIcon, ShieldCheck, Trash2, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, StatCard, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { SportMediaManager } from '../../components/admin/SportMediaManager';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiButton, UiPreviewState } from '../../components/ui/UiPrimitives';
import { demoSportMediaAssets } from '../../data/demo/media';
import { useCoaches, useDeleteSport, useGroups, usePlayers, usePrograms, useSport, useUpdateSport } from '../../admin/data/adminHooks';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'groups', label: bi('Training Groups / Teams', 'الفرق / مجموعات التدريب') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
  { id: 'coaches', label: bi('Coaches', 'المدربون') },
  { id: 'programs', label: bi('Programs', 'البرامج') },
  { id: 'metrics', label: bi('Performance Metrics', 'مؤشرات الأداء') },
  { id: 'media', label: bi('Media', 'الوسائط') },
];

export function AdminSportDetailPage() {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: sport, loading, error, refetch } = useSport(sportId);
  const { data: groupsData } = useGroups({ page: 1, pageSize: 500 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 1000 });
  const { data: coachesData } = useCoaches({ page: 1, pageSize: 500 });
  const { data: programsData } = usePrograms({ page: 1, pageSize: 500 });
  const { update, loading: updating } = useUpdateSport();
  const { delete: remove, loading: deleting } = useDeleteSport();

  if (loading) return <div className="admin-page"><UiPreviewState title={bi('Loading sport', 'جارٍ تحميل الرياضة')} description={bi('Reading the Admin data gateway.', 'جارٍ قراءة بوابة بيانات الإدارة.')} /></div>;
  if (error || !sport) return <div className="admin-page"><PageHeader icon={Trophy} eyebrow={bi('Sport Detail', 'تفاصيل الرياضة')} title={bi('Sport not found', 'الرياضة غير موجودة')} description={bi('Choose a valid sport from the Sports Center.', 'اختر رياضة صالحة من مركز الرياضات.')} /></div>;

  const groups = groupsData.items.filter(group => group.sportId === sport.id);
  const players = playersData.items.filter(player => player.sportId === sport.id);
  const coaches = coachesData.items.filter(coach => coach.sportIds.includes(sport.id) || coach.groupIds.some(groupId => groups.some(group => group.id === groupId)));
  const programs = programsData.items.filter(program => program.sportId === sport.id);
  const sportMedia = demoSportMediaAssets.filter(asset => asset.sportId === sport.id);
  const hasRelations = groups.length > 0 || players.length > 0 || programs.length > 0 || coaches.length > 0;

  const setStatus = async (status: 'active' | 'inactive') => { await update(sport.id, { status }); await refetch(); };
  const deleteSport = async () => {
    if (hasRelations) return;
    if (!window.confirm('Delete this Preview sport? | حذف رياضة المعاينة؟')) return;
    await remove(sport.id);
    navigate('/admin/sports');
  };

  return <div className="admin-page">
    <PageHeader icon={Trophy} eyebrow={bi('Sport Detail', 'تفاصيل الرياضة')} title={sport.name} description={sport.description} actions={<StatusBadge active={sport.status === 'active'} />} />
    <section className="admin-stat-grid compact"><StatCard label={bi('Players Count', 'عدد اللاعبين')} value={players.length} icon={Users} /><StatCard label={bi('Groups Count', 'عدد المجموعات')} value={groups.length} icon={Dumbbell} /><StatCard label={bi('Programs Count', 'عدد البرامج')} value={programs.length} icon={FolderCog} /><StatCard label={bi('Coaches Count', 'عدد المدربين')} value={coaches.length} icon={ShieldCheck} /></section>
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Sport Controls', 'ضوابط الرياضة')} /><ShieldCheck /></div><div className="preview-form-grid"><label><BilingualText value={bi('Operating status', 'حالة التشغيل')} /><select value={sport.status} disabled={updating} onChange={event => void setStatus(event.target.value as 'active' | 'inactive')}><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label></div><p className="preview-warning"><BilingualText value={bi('Changes persist in the browser Preview store.', 'تستمر التغييرات في مخزن المعاينة بالمتصفح.')} /></p></section>
    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="overview-grid"><article className="admin-panel feature-panel"><Trophy /><BilingualText value={bi('Sport Foundation', 'أساس الرياضة')} className="admin-eyebrow" /><h2><BilingualText value={sport.name} /></h2><p><BilingualText value={sport.description} /></p></article><article className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Age Groups', 'الفئات العمرية')} /></div><div className="tag-list">{sport.ageGroups.map((item, index) => <BilingualText key={`${item.en}-${index}`} value={item} />)}{!sport.ageGroups.length && <span>—</span>}</div></article></div>}
      {active === 'groups' && <div className="group-grid">{groups.map(group => <article className="group-card" key={group.id}><div><BilingualText value={group.name} className="group-title" /><StatusBadge active={group.status === 'active'} /></div><dl><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={group.level} /></dd></div><div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{group.playerCount}</dd></div><div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{group.coachCount}</dd></div></dl><Link className="admin-link-button" to={`/admin/sports/${sport.id}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /><ArrowRight /></Link></article>)}{!groups.length && <p className="empty-message"><BilingualText value={bi('No groups assigned to this sport.', 'لا توجد مجموعات مخصصة لهذه الرياضة.')} /></p>}</div>}
      {active === 'players' && <div className="linked-player-list">{players.map(player => <Link to={`/admin/players/${player.id}`} key={player.id}><span className="list-index">{player.id.slice(-3)}</span><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><BilingualText value={player.level} /><ArrowRight /></Link>)}{!players.length && <p className="empty-message"><BilingualText value={bi('No players assigned to this sport.', 'لا يوجد لاعبون مخصصون لهذه الرياضة.')} /></p>}</div>}
      {active === 'coaches' && <div className="admin-entity-grid">{coaches.map(coach => <article key={coach.id}><span className="section-icon"><ClipboardList /></span><small><BilingualText value={bi('Coach', 'المدرب')} /></small><h3>{coach.nameEn} | {coach.nameAr}</h3><BilingualText value={bi('Assigned groups', 'المجموعات المكلف بها')} /><strong>{coach.groupIds.filter(groupId => groups.some(group => group.id === groupId)).length}</strong><Link className="admin-link-button small" to={`/admin/coaches/${coach.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link></article>)}{!coaches.length && <article><ClipboardList /><p><BilingualText value={bi('No coach assignment is represented for this sport.', 'لا يوجد تكليف مدرب ممثل لهذه الرياضة.')} /></p></article>}</div>}
      {active === 'programs' && <div className="admin-entity-grid">{programs.map(program => <article key={program.id}><span className="section-icon"><FolderCog /></span><small><BilingualText value={program.level} /></small><h3><BilingualText value={program.name} /></h3><p><BilingualText value={program.description} /></p><Link className="admin-link-button small" to={`/admin/programs/${program.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link></article>)}{!programs.length && <p className="empty-message"><BilingualText value={bi('No programs linked to this sport.', 'لا توجد برامج مرتبطة بهذه الرياضة.')} /></p>}</div>}
      {active === 'metrics' && <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Performance Metrics', 'مؤشرات الأداء')} /><BarChart3 /></div><p><BilingualText value={bi('Sport-level metric definitions are not represented in the current Admin data contract. No synthetic metrics are shown here.', 'تعريفات مؤشرات الأداء على مستوى الرياضة غير ممثلة في عقد بيانات الإدارة الحالي، لذلك لا يتم عرض مؤشرات مصطنعة هنا.')} /></p><Link className="admin-link-button" to="/admin/performance"><BilingualText value={bi('Open Performance Operations', 'فتح عمليات الأداء')} /><ArrowRight /></Link></section>}
      {active === 'media' && (sportMedia.length > 0 ? <><p className="preview-warning"><BilingualText value={bi('These are verified static media assets; they are not claimed as editable Admin data records.', 'هذه أصول وسائط ثابتة موثقة؛ ولا يتم الادعاء بأنها سجلات بيانات إدارة قابلة للتحرير.')} /></p><SportMediaManager assets={sportMedia} sportName={sport.name} /></> : <div className="admin-entity-grid"><article><span className="section-icon"><ImageIcon /></span><h3><BilingualText value={bi('Verified Media Collection', 'مجموعة الوسائط الموثقة')} /></h3><p><BilingualText value={bi('No verified static media assets are attached to this sport.', 'لا توجد أصول وسائط ثابتة موثقة مرتبطة بهذه الرياضة.')} /></p></article></div>)}
    </section>
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Danger Zone', 'منطقة الخطر')} /><ShieldCheck /></div>{hasRelations && <p className="preview-warning"><BilingualText value={bi('Remove or reassign related programs, groups, players and coaches before deleting this sport.', 'احذف أو أعد تعيين البرامج والمجموعات واللاعبين والمدربين المرتبطين قبل حذف هذه الرياضة.')} /></p>}<UiButton variant="danger" disabled={deleting || hasRelations} onClick={() => void deleteSport()}><Trash2 /><BilingualText value={bi(deleting ? 'Deleting…' : 'Delete Preview sport', deleting ? 'جارٍ الحذف…' : 'حذف رياضة المعاينة')} /></UiButton></section>
  </div>;
}
