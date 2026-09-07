import { Activity, CalendarDays, FileBarChart, FileText, Flag, LayoutGrid, Plus, Trophy, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useGenerateReport, useGroups, usePlayers, usePrograms, useReports, useSessions, useSports } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterprisePanel, EnterpriseStatus, EnterpriseTable, ExportMenu, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const reportTypes = [
  { id: 'organization', label: bi('Organization pulse', 'نبض المؤسسة'), detail: bi('Sports, programs, groups and player scope', 'نطاق الرياضات والبرامج والمجموعات واللاعبين'), icon: LayoutGrid },
  { id: 'attendance', label: bi('Attendance review', 'مراجعة الحضور'), detail: bi('Player attendance summary coverage', 'تغطية ملخص حضور اللاعبين'), icon: CalendarDays },
  { id: 'performance', label: bi('Performance brief', 'ملخص الأداء'), detail: bi('Available player performance summary fields', 'حقول ملخص الأداء المتاحة للاعبين'), icon: Trophy },
  { id: 'programs', label: bi('Programs reach', 'انتشار البرامج'), detail: bi('Programs and linked training groups', 'البرامج ومجموعات التدريب المرتبطة'), icon: Flag },
  { id: 'activity', label: bi('Activity snapshot', 'لقطة النشاط'), detail: bi('Current provider record counts', 'أعداد سجلات موفر البيانات الحالي'), icon: Activity },
];

export function AdminReportsPage() {
  const [selected, setSelected] = useState('organization');
  const [notice, setNotice] = useState(false);
  const { data: reportResult, loading, error } = useReports({ page: 1, pageSize: 100 });
  const { data: sportResult } = useSports({ page: 1, pageSize: 100 });
  const { data: programResult } = usePrograms({ page: 1, pageSize: 300 });
  const { data: groupResult } = useGroups({ page: 1, pageSize: 500 });
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 1000 });
  const { data: sessionResult } = useSessions({ page: 1, pageSize: 1000 });
  const { generate, loading: generateLoading } = useGenerateReport();
  const reports = reportResult.items;
  const sports = sportResult.items;
  const programs = programResult.items;
  const groups = groupResult.items;
  const players = playerResult.items;
  const sessions = sessionResult.items;
  const selectedReport = reportTypes.find((report) => report.id === selected) ?? reportTypes[0];

  const rows = useMemo(() => sports.map((sport) => [
    sport.name.en,
    programs.filter((program) => program.sportId === sport.id).length,
    groups.filter((group) => group.sportId === sport.id).length,
    players.filter((player) => player.sportId === sport.id).length,
    sessions.filter((session) => session.sportId === sport.id).length,
  ]), [sports, programs, groups, players, sessions]);

  const generateSelected = async () => {
    await generate(selected);
    globalThis.dispatchEvent(new Event('uos:admin-data-changed'));
    setNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={FileBarChart} eyebrow={bi('Insights & Governance', 'الرؤى والحوكمة')} title={bi('Reports Studio', 'استوديو التقارير')} description={bi('Generate and review persistent preview report records from the current Admin data provider.', 'أنشئ وراجع سجلات تقارير معاينة مستمرة من موفر بيانات الإدارة الحالي.')} actions={<div className="admin-header-actions"><PreviewNotice /><ExportMenu filename="organization-report-preview.csv" headers={['Sport','Programs','Groups','Players','Sessions']} rows={rows} /></div>} />
    {notice && <div className="preview-warning" role="status"><BilingualText value={bi('A report record was generated in browser Preview data.', 'تم إنشاء سجل تقرير في بيانات المعاينة بالمتصفح.')} /></div>}

    <section className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Generated reports', 'التقارير المنشأة')} value={reports.length} icon={FileText} /><EnterpriseKpi label={bi('Sports', 'الرياضات')} value={sports.length} icon={Trophy} tone="green" /><EnterpriseKpi label={bi('Players', 'اللاعبون')} value={players.length} icon={UsersRound} tone="blue" /><EnterpriseKpi label={bi('Sessions', 'الجلسات')} value={sessions.length} icon={CalendarDays} tone="orange" /></section>

    <section className="portal-card-grid" style={{ marginTop: 14 }}>{reportTypes.map((report) => { const Icon = report.icon; return <button className={`portal-card report-card ${selected === report.id ? 'is-selected' : ''}`} type="button" key={report.id} onClick={() => setSelected(report.id)}><span className="portal-card-icon"><Icon size={18} /></span><h3><BilingualText value={report.label} /></h3><p><BilingualText value={report.detail} /></p></button>; })}</section>

    <section className="enterprise-grid-2" style={{ marginTop: 14 }}><EnterprisePanel title={selectedReport.label} description={selectedReport.detail}><p><BilingualText value={bi('Generation creates a report record only; it does not claim a production analytics pipeline or external file delivery.', 'الإنشاء ينشئ سجل تقرير فقط؛ ولا يدعي وجود مسار تحليلات إنتاجي أو تسليم ملف خارجي.')} /></p><button type="button" className="admin-primary-button" disabled={generateLoading} onClick={() => void generateSelected()}><Plus size={15} /><BilingualText value={generateLoading ? bi('Generating…', 'جارٍ الإنشاء…') : bi('Generate Preview Report', 'إنشاء تقرير معاينة')} /></button></EnterprisePanel><EnterprisePanel title={bi('Current Data Scope', 'نطاق البيانات الحالي')} description={bi('Counts read directly from the Admin gateway.', 'أعداد تُقرأ مباشرة من بوابة الإدارة.')}><div className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Programs', 'البرامج')} value={programs.length} icon={Flag} /><EnterpriseKpi label={bi('Groups', 'المجموعات')} value={groups.length} icon={UsersRound} /><EnterpriseKpi label={bi('Players', 'اللاعبون')} value={players.length} icon={UsersRound} /><EnterpriseKpi label={bi('Sessions', 'الجلسات')} value={sessions.length} icon={CalendarDays} /></div></EnterprisePanel></section>

    <EnterprisePanel title={bi('Live Scope Table', 'جدول النطاق الحالي')} description={bi('Derived from the current provider, not static fixtures.', 'مشتق من موفر البيانات الحالي وليس من بيانات ثابتة.')} className="report-table-panel"><EnterpriseTable caption={bi('Current organization scope', 'نطاق المؤسسة الحالي')}><thead><tr>{[bi('Sport','الرياضة'),bi('Programs','البرامج'),bi('Groups','المجموعات'),bi('Players','اللاعبون'),bi('Sessions','الجلسات')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{sports.map((sport) => <tr key={sport.id}><td><strong><BilingualText value={sport.name} /></strong></td><td>{programs.filter((program) => program.sportId === sport.id).length}</td><td>{groups.filter((group) => group.sportId === sport.id).length}</td><td>{players.filter((player) => player.sportId === sport.id).length}</td><td>{sessions.filter((session) => session.sportId === sport.id).length}</td></tr>)}</tbody></EnterpriseTable></EnterprisePanel>

    <EnterprisePanel title={bi('Generated Report Records', 'سجلات التقارير المنشأة')} description={bi('Persistent Preview records generated by this workspace.', 'سجلات معاينة مستمرة أنشأتها هذه المساحة.')}>
      {loading ? <p role="status"><BilingualText value={bi('Loading reports…','جارٍ تحميل التقارير…')} /></p> : error ? <p role="alert">{error.message}</p> : reports.length ? <EnterpriseTable caption={bi('Generated reports','التقارير المنشأة')}><thead><tr><th><BilingualText value={bi('Title','العنوان')} /></th><th><BilingualText value={bi('Type','النوع')} /></th><th><BilingualText value={bi('Generated At','وقت الإنشاء')} /></th><th><BilingualText value={bi('Status','الحالة')} /></th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><strong><BilingualText value={report.title} /></strong><small>{report.id}</small></td><td><BilingualText value={report.type} /></td><td>{report.generatedAt}</td><td><EnterpriseStatus label={bi(report.status, report.status === 'ready' ? 'جاهز' : report.status === 'generating' ? 'جارٍ الإنشاء' : 'فشل')} tone={report.status === 'ready' ? 'active' : report.status === 'generating' ? 'warning' : 'danger'} /></td></tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No generated reports yet','لا توجد تقارير منشأة بعد')} description={bi('Choose a report type and generate a Preview record.','اختر نوع تقرير وأنشئ سجل معاينة.')} />}
    </EnterprisePanel>
  </div>;
}
