import { BarChart3, Trophy, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePlayers, useSports } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseProgress, EnterpriseSelect, EnterpriseTable, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

export function AdminPerformancePage() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('all');
  const { data: playerResult, loading, error } = usePlayers({ page: 1, pageSize: 1000 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const players = playerResult.items;
  const sports = sportResult.items;
  const visible = useMemo(() => players.filter(player => (sport === 'all' || player.sportId === sport) && `${player.nameEn} ${player.nameAr} ${player.id}`.toLowerCase().includes(query.trim().toLowerCase())), [players, sport, query]);
  const scored = visible.filter(player => player.performanceScore !== null);
  const average = Math.round(scored.reduce((sum, player) => sum + (player.performanceScore ?? 0), 0) / Math.max(scored.length, 1));
  const high = scored.filter(player => (player.performanceScore ?? 0) >= 85).length;

  return <div className="admin-page">
    <PageHeader icon={BarChart3} eyebrow={bi('Training Operations', 'العمليات التدريبية')} title={bi('Performance Workspace', 'مساحة الأداء')} description={bi('Gateway-backed performance summary using the aggregate score exposed by the current Admin contract. Metric histories are not fabricated.', 'ملخص أداء مدفوع ببوابة البيانات باستخدام الدرجة الإجمالية التي يعرضها عقد الإدارة الحالي. لا يتم اختلاق سجلات مؤشرات تفصيلية.')} actions={<PreviewNotice />} />
    <section className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Athletes in view','الرياضيون في العرض')} value={visible.length} icon={UsersRound} /><EnterpriseKpi label={bi('Scored athletes','الرياضيون ذوو الدرجات')} value={scored.length} icon={BarChart3} tone="blue" /><EnterpriseKpi label={bi('Average score','متوسط الدرجة')} value={scored.length ? average : '—'} icon={Trophy} tone="green" /><EnterpriseKpi label={bi('85+ score','درجة 85+')} value={high} icon={Trophy} tone="orange" /></section>
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search athletes','البحث عن الرياضيين')} filters={<EnterpriseSelect label={bi('Sport','الرياضة')} value={sport} onChange={setSport} options={[{ value: 'all', label: bi('All sports','كل الرياضات') }, ...sports.map(item => ({ value: item.id, label: item.name }))]} />} resultCount={bi(`${visible.length} athletes`, `${visible.length} رياضي`)} />
    {loading ? <div className="admin-panel" role="status"><BilingualText value={bi('Loading performance summary…','جارٍ تحميل ملخص الأداء…')} /></div> : error ? <div className="admin-panel" role="alert">{error.message}</div> : visible.length ? <EnterpriseTable caption={bi('Performance summary roster','قائمة ملخص الأداء')}><thead><tr><th><BilingualText value={bi('Player','اللاعب')} /></th><th><BilingualText value={bi('Sport','الرياضة')} /></th><th><BilingualText value={bi('Level','المستوى')} /></th><th><BilingualText value={bi('Performance','الأداء')} /></th></tr></thead><tbody>{visible.map(player => <tr key={player.id}><td><strong><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></strong><small>{player.id}</small></td><td><BilingualText value={sports.find(item => item.id === player.sportId)?.name ?? bi(player.sportId, player.sportId)} /></td><td><BilingualText value={player.level} /></td><td>{player.performanceScore === null ? <BilingualText value={bi('Not scored','غير مقيم')} /> : <EnterpriseProgress value={player.performanceScore} label={bi(`${player.performanceScore}/100`, `${player.performanceScore}/100`)} color={player.performanceScore >= 85 ? 'green' : player.performanceScore >= 70 ? 'gold' : 'red'} />}</td></tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No athletes match','لا يوجد رياضيون مطابقون')} description={bi('Adjust the search or sport filter.','عدّل البحث أو فلتر الرياضة.')} />}
  </div>;
}
