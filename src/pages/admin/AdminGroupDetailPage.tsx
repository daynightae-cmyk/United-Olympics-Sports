import { ArrowRight, Dumbbell, FolderCog, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, StatCard, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getGroup, getGroupPlayers, getSport } from '../../data/demo/selectors';

export function AdminGroupDetailPage() {
  const { groupId } = useParams(); const group = getGroup(groupId); const sport = getSport(group?.sportId);
  if (!group || !sport) return <FuturePanel title={bi('Training group not found', 'مجموعة التدريب غير موجودة')} />;
  const players = getGroupPlayers(group.id);
  return <div className="admin-page"><PageHeader eyebrow={bi('Training Group Detail', 'تفاصيل مجموعة التدريب')} title={group.name} description={bi('A direct Sport → Training Group → Player relationship using preview fixtures.', 'علاقة مباشرة بين الرياضة ← مجموعة التدريب ← اللاعب باستخدام بيانات تجريبية.')} actions={<StatusBadge active={group.status === 'active'} />} />
    <section className="admin-stat-grid compact"><StatCard label={bi('Sport', 'الرياضة')} value={sport.name.en} icon={Trophy} note={sport.name} /><StatCard label={bi('Players', 'اللاعبون')} value={players.length} icon={Users} /><StatCard label={bi('Coaches', 'المدربون')} value={group.coachIds.length} icon={ShieldCheck} /><StatCard label={bi('Programs', 'البرامج')} value={group.programIds.length} icon={FolderCog} /></section>
    <div className="overview-grid"><section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Group Profile', 'ملف المجموعة')} /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Group Name', 'اسم المجموعة')} /></dt><dd><BilingualText value={group.name} /></dd></div><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd><BilingualText value={sport.name} /></dd></div><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={group.level} /></dd></div></dl></section><section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Linked Players', 'اللاعبون المرتبطون')} /><Dumbbell /></div>{players.length ? <div className="linked-player-list">{players.map(player => <Link to={`/admin/players/${player.id}`} key={player.id}><span className="list-index">{player.id.slice(-3)}</span><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /><ArrowRight /></Link>)}</div> : <p><BilingualText value={bi('No preview players are linked to this group.', 'لا يوجد لاعبون تجريبيون مرتبطون بهذه المجموعة.')} /></p>}</section></div>
  </div>;
}
