import { useMemo, useState } from 'react';
import { ArrowRight, Dumbbell, FolderCog, Search, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatCard, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { getSport } from '../../data/demo/selectors';

export function AdminGroupsPage() {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const sportOptions = useMemo(() => Array.from(new Set(demoTrainingGroups.map(group => group.sportId))), []);
  const groups = useMemo(() => demoTrainingGroups.filter(group => {
    const sport = getSport(group.sportId);
    const haystack = `${group.name.en} ${group.name.ar} ${group.id} ${sport?.name.en ?? ''} ${sport?.name.ar ?? ''}`.toLowerCase();
    return (sportFilter === 'all' || group.sportId === sportFilter) && haystack.includes(query.trim().toLowerCase());
  }), [query, sportFilter]);
  const coachRefs = new Set(demoTrainingGroups.flatMap(group => group.coachIds)).size;
  const programRefs = new Set(demoTrainingGroups.flatMap(group => group.programIds)).size;
  const linkedPlayers = demoTrainingGroups.reduce((total, group) => total + group.playerIds.length, 0);

  return <div className="admin-page groups-workspace">
    <PageHeader icon={Dumbbell} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Training Groups / Teams', 'الفرق / مجموعات التدريب')} description={bi('A truthful preview workspace for sport-specific groups, linked rosters and coaching coverage.', 'مساحة تجريبية صادقة للمجموعات الخاصة بكل رياضة والقوائم المرتبطة وتغطية التدريب.')} actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>} />
    <section className="admin-stat-grid compact">
      <StatCard label={bi('Preview Groups', 'المجموعات التجريبية')} value={demoTrainingGroups.length} icon={UsersRound} />
      <StatCard label={bi('Linked Players', 'اللاعبون المرتبطون')} value={linkedPlayers} icon={UsersRound} />
      <StatCard label={bi('Coach References', 'مراجع المدربين')} value={coachRefs} icon={ShieldCheck} />
      <StatCard label={bi('Program Links', 'روابط البرامج')} value={programRefs} icon={FolderCog} />
    </section>
    <section className="player-filter-bar groups-filter-bar" aria-label="Group filters | فلاتر المجموعات">
      <label className="filter-search"><Search /><span className="sr-only">Search groups | البحث في المجموعات</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search groups... | البحث في المجموعات..." /></label>
      <label className="groups-sport-filter"><BilingualText value={bi('Sport', 'الرياضة')} /><select value={sportFilter} onChange={event => setSportFilter(event.target.value)}><option value="all">All Sports | كل الرياضات</option>{sportOptions.map(id => { const sport = getSport(id); return <option key={id} value={id}>{sport ? `${sport.name.en} | ${sport.name.ar}` : id}</option>; })}</select></label>
      <span className="result-count"><BilingualText value={bi(`${groups.length} groups shown`, `عرض ${groups.length} مجموعات`)} /></span>
    </section>
    <section className="groups-table-shell" aria-label="Training groups table | جدول مجموعات التدريب">
      <div className="groups-table-heading"><div><BilingualText value={bi('Group Directory', 'دليل المجموعات')} /><small><BilingualText value={bi('Capacity is intentionally omitted until verified.', 'تم إخفاء السعة عمدًا حتى يتم التحقق منها.')} /></small></div><span><BilingualText value={bi('Dense Table View', 'عرض جدول كثيف')} /></span></div>
      <div className="groups-desktop-table"><table className="player-table groups-table"><thead><tr>
        <th><BilingualText value={bi('Group / Code', 'المجموعة / الرمز')} /></th><th><BilingualText value={bi('Sport', 'الرياضة')} /></th><th><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></th><th><BilingualText value={bi('Level', 'المستوى')} /></th><th><BilingualText value={bi('Coaches', 'المدربون')} /></th><th><BilingualText value={bi('Roster', 'القائمة')} /></th><th><BilingualText value={bi('Programs', 'البرامج')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th><th><BilingualText value={bi('Actions', 'الإجراءات')} /></th>
      </tr></thead><tbody>{groups.map(group => { const sport = getSport(group.sportId); return <tr key={group.id}>
        <td><strong><BilingualText value={group.name} /></strong><small className="mono">{group.id}</small></td><td>{sport ? <BilingualText value={sport.name} /> : group.sportId}</td><td><BilingualText value={group.ageGroup} /></td><td><span className="groups-level"><BilingualText value={group.level} /></span></td><td>{group.coachIds.length}</td><td><strong>{group.playerIds.length}</strong><small><BilingualText value={bi('linked preview players', 'لاعبون تجريبيون مرتبطون')} /></small></td><td>{group.programIds.length}</td><td><StatusBadge active={group.status === 'active'} /></td><td><Link className="row-action" to={`/admin/sports/${group.sportId}/groups/${group.id}`} aria-label={`Open ${group.name.en} | فتح ${group.name.ar}`}><ArrowRight /></Link></td>
      </tr>; })}</tbody></table></div>
      <div className="groups-mobile-list">{groups.map(group => { const sport = getSport(group.sportId); return <article key={group.id} className="group-mobile-card"><header><div><strong><BilingualText value={group.name} /></strong><small className="mono">{group.id}</small></div><StatusBadge active={group.status === 'active'} /></header><dl><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <BilingualText value={sport.name} /> : group.sportId}</dd></div><div><dt><BilingualText value={bi('Roster', 'القائمة')} /></dt><dd>{group.playerIds.length}</dd></div><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={group.ageGroup} /></dd></div><div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{group.coachIds.length}</dd></div></dl><Link className="admin-link-button" to={`/admin/sports/${group.sportId}/groups/${group.id}`}><BilingualText value={bi('Open Group', 'فتح المجموعة')} /><ArrowRight /></Link></article>; })}</div>
      {!groups.length && <div className="groups-empty"><Search /><BilingualText value={bi('No preview groups match these filters.', 'لا توجد مجموعات تجريبية تطابق هذه الفلاتر.')} /></div>}
    </section>
  </div>;
}
