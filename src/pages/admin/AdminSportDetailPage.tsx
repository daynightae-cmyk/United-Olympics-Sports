import { ArrowRight, BarChart3, Dumbbell, FolderCog, ShieldCheck, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, StatCard, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { SportMediaManager } from '../../components/admin/SportMediaManager';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoSportMediaAssets } from '../../data/demo/media';
import { getSport, getSportGroups, getSportMetrics, getSportPlayers } from '../../data/demo/selectors';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') }, { id: 'groups', label: bi('Training Groups / Teams', 'الفرق / مجموعات التدريب') },
  { id: 'players', label: bi('Players', 'اللاعبون') }, { id: 'coaches', label: bi('Coaches', 'المدربون') },
  { id: 'programs', label: bi('Programs', 'البرامج') }, { id: 'metrics', label: bi('Performance Metrics', 'مؤشرات الأداء') }, { id: 'media', label: bi('Media', 'الوسائط') },
];

export function AdminSportDetailPage() {
  const { sportId } = useParams(); const sport = getSport(sportId); const [active, setActive] = useState('overview');
  if (!sport) return <FuturePanel title={bi('Sport not found', 'الرياضة غير موجودة')} description={bi('Choose a valid preview sport from the Sports Center.', 'اختر رياضة تجريبية صالحة من مركز الرياضات.')} />;
  const groups = getSportGroups(sport.id); const players = getSportPlayers(sport.id); const metrics = getSportMetrics(sport.id);
  const coaches = new Set(groups.flatMap(group => group.coachIds));
  const sportMedia = demoSportMediaAssets.filter(asset => asset.sportId === sport.id);
  return <div className="admin-page">
    <PageHeader eyebrow={bi('Sport Detail', 'تفاصيل الرياضة')} title={sport.name} description={sport.description} actions={<StatusBadge active={sport.status === 'active'} />} />
    <section className="admin-stat-grid compact"><StatCard label={bi('Players Count', 'عدد اللاعبين')} value={players.length} icon={Users} /><StatCard label={bi('Groups Count', 'عدد المجموعات')} value={groups.length} icon={Dumbbell} /><StatCard label={bi('Programs Count', 'عدد البرامج')} value={sport.programIds.length} icon={FolderCog} /><StatCard label={bi('Coaches Count', 'عدد المدربين')} value={coaches.size} icon={ShieldCheck} /></section>
    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="overview-grid"><article className="admin-panel feature-panel"><Trophy /><BilingualText value={bi('Sport Foundation', 'أساس الرياضة')} className="admin-eyebrow" /><h2><BilingualText value={sport.name} /></h2><p><BilingualText value={bi('This sport connects its own training groups, players, coaches, programmes and metric definitions without universal sport assumptions.', 'تربط هذه الرياضة مجموعاتها ولاعبيها ومدربيها وبرامجها وتعريفات مؤشراتها دون افتراضات عامة موحدة لكل الرياضات.')} /></p></article><article className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Age Groups', 'الفئات العمرية')} /></div><div className="tag-list">{sport.ageGroups.map(item => <BilingualText key={item.en} value={item} />)}</div></article></div>}
      {active === 'groups' && <div className="group-grid">{groups.map(group => <article className="group-card" key={group.id}><div><BilingualText value={group.name} className="group-title" /><StatusBadge active={group.status === 'active'} /></div><dl><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={group.level} /></dd></div><div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{group.playerIds.length}</dd></div><div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{group.coachIds.length}</dd></div></dl><Link className="admin-link-button" to={`/admin/sports/${sport.id}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /><ArrowRight /></Link></article>)}</div>}
      {active === 'players' && <div className="linked-player-list">{players.map(player => <Link to={`/admin/players/${player.id}`} key={player.id}><span className="list-index">{player.id.slice(-3)}</span><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><BilingualText value={player.level} /><ArrowRight /></Link>)}</div>}
      {active === 'metrics' && <div className="metric-definition-grid">{metrics.map((metric, index) => <article key={metric.id}><span>0{index + 1}</span><BarChart3 /><BilingualText value={metric.name} /><small><BilingualText value={bi('Sport-specific definition', 'تعريف خاص بالرياضة')} /></small></article>)}</div>}
      {active === 'coaches' && <FuturePanel title={bi('Coach Management', 'إدارة المدربين')} />}
      {active === 'programs' && <FuturePanel title={bi('Program Management', 'إدارة البرامج')} />}
      {active === 'media' && (sport.id === 'swimming' ? <SportMediaManager assets={sportMedia} /> : <FuturePanel title={bi('Sport Media Collection', 'مجموعة وسائط الرياضة')} description={bi('No verified user media assets are connected to this sport yet.', 'لا توجد أصول وسائط معتمدة من المستخدم مرتبطة بهذه الرياضة حتى الآن.')} />)}
    </section>
  </div>;
}
