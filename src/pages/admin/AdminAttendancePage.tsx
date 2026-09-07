import { CalendarCheck, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePlayers, useSports } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseProgress, EnterpriseSelect, EnterpriseTable, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

export function AdminAttendancePage() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const { data: playerResult, loading, error } = usePlayers({ page: 1, pageSize: 1000 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const players = playerResult.items;
  const sports = sportResult.items;
  const visible = useMemo(() => players.filter(player => (sport === 'all' || player.sportId === sport) && `${player.nameEn} ${player.nameAr} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase())), [players, sport, query]);
  const average = Math.round(visible.reduce((sum, player) => sum + player.attendanceRate, 0) / Math.max(visible.length, 1));
  const high = visible.filter(player => player.attendanceRate >= 90).length;
  const attention = visible.filter(player => player.attendanceRate < 75).length;

  return <div className="admin-page">
    <PageHeader icon={CalendarCheck} eyebrow={bi('Training Operations', 'العمليات التدريبية')} title={bi('Attendance Workspace', 'مساحة الحضور')} description={bi('Gateway-backed attendance summary using the percentage exposed by the current Admin contract. Per-session marks are not invented.', 'ملخص حضور مدفوع ببوابة البيانات باستخدام النسبة التي يعرضها عقد الإدارة الحالي. لا يتم اختلاق علامات حضور لكل جلسة.')} actions={<PreviewNotice />} />
    <section className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Athletes in view','الرياضيون في العرض')} value={visible.length} icon={UsersRound} /><EnterpriseKpi label={bi('Average attendance','متوسط الحضور')} value={`${average}%`} icon={CalendarCheck} tone="green" /><EnterpriseKpi label={bi('90% or higher','90% أو أكثر')} value={high} icon={CalendarCheck} tone="blue" /><EnterpriseKpi label={bi('Needs attention','يحتاج متابعة')} value={attention} icon={UsersRound} tone="orange" /></section>
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search players','البحث عن اللاعبين')} filters={<EnterpriseSelect label={bi('Sport','الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports','كل الرياضات') }, ...sports.map(item => ({ value: item.id, label: item.name }))]} />} resultCount={bi(`${visible.length} athletes`, `${visible.length} رياضي`)} />
    {loading ? <div className="admin-panel" role="status"><BilingualText value={bi('Loading attendance summary…','جارٍ تحميل ملخص الحضور…')} /></div> : error ? <div className="admin-panel" role="alert">{error.message}</div> : visible.length ? <EnterpriseTable caption={bi('Attendance summary roster','قائمة ملخص الحضور')}><thead><tr><th><BilingualText value={bi('Player','اللاعب')} /></th><th><BilingualText value={bi('Sport','الرياضة')} /></th><th><BilingualText value={bi('Attendance','الحضور')} /></th></tr></thead><tbody>{visible.map(player => <tr key={player.id}><td><strong><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></strong><small>{player.id}</small></td><td><BilingualText value={sports.find(item => item.id === player.sportId)?.name ?? bi(player.sportId, player.sportId)} /></td><td><EnterpriseProgress value={player.attendanceRate} label={bi(`${player.attendanceRate}%`, `${player.attendanceRate}%`)} color={player.attendanceRate >= 90 ? 'green' : player.attendanceRate >= 75 ? 'gold' : 'red'} /></td></tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No players match','لا يوجد لاعبون مطابقون')} description={bi('Adjust the search or sport filter.','عدّل البحث أو فلتر الرياضة.')} />}
  </div>;
}
