import { Activity, Building2, CheckCircle2, ClipboardCheck, FileText, Target, UserRound, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseProgress, EnterpriseTable, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalMetric, PortalPreviewCard, PortalSection, PortalStatus } from '../../../components/portal/PortalUI';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

function LoadingState({ label }: { label: ReturnType<typeof bi> }) {
  return <div className="admin-page"><div className="ui-skeleton" role="status" aria-live="polite"><span><BilingualText value={label} /></span><i /><i /><i /></div></div>;
}

function ErrorState({ title, description }: { title: ReturnType<typeof bi>; description: ReturnType<typeof bi> }) {
  return <div className="admin-page"><div className="enterprise-empty" role="status"><ClipboardCheck size={24} /><h3><BilingualText value={title} /></h3><p><BilingualText value={description} /></p></div></div>;
}

export function CoachPortalGroupsPage() {
  const { groups, players, programs, sports, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading groups…', 'جارٍ تحميل المجموعات…')} />;
  if (error) return <ErrorState title={bi('Groups unavailable', 'المجموعات غير متاحة')} description={bi('The current data provider could not supply assigned groups.', 'تعذر على مصدر البيانات الحالي توفير المجموعات المكلف بها.')} />;

  return <div className="admin-page">
    <PageHeader icon={UsersRound} eyebrow={bi('Coach Portal · Groups', 'بوابة المدرب · المجموعات')} title={bi('Training Groups', 'مجموعات التدريب')} description={bi('Only groups assigned to the active coach are shown.', 'تظهر فقط المجموعات المكلف بها المدرب النشط.')} actions={<PreviewNotice />} />
    <section className="portal-metric-grid"><PortalMetric label={bi('Assigned groups', 'المجموعات المكلف بها')} value={groups.length} /><PortalMetric label={bi('Roster size', 'حجم القائمة')} value={players.length} tone="green" /><PortalMetric label={bi('Programs', 'البرامج')} value={programs.length} tone="blue" /><PortalMetric label={bi('Sports', 'الرياضات')} value={sports.length} tone="gold" /></section>
    {groups.length ? <PortalSection title={bi('Assigned group roster', 'قائمة المجموعات المكلف بها')}><div className="portal-card-grid">{groups.map((group) => {
      const rosterCount = players.filter((player) => player.groupId === group.id).length;
      const sport = sports.find((item) => item.id === group.sportId);
      return <article className="portal-card" key={group.id}><div className="child-card-head"><span className="portal-card-icon"><UsersRound size={16} /></span><div><h3><BilingualText value={group.name} /></h3><small><BilingualText value={group.level} /></small></div><PortalStatus label={group.status === 'active' ? bi('Active', 'نشطة') : bi('Inactive', 'غير نشطة')} tone={group.status === 'active' ? 'active' : 'neutral'} /></div><p><BilingualText value={sport?.name ?? bi('Sport unavailable', 'الرياضة غير متاحة')} /> · {rosterCount} <BilingualText value={bi('athletes', 'رياضيين')} /></p><Link className="admin-link-button" to={`/coach/groups/${group.id}`}><BilingualText value={bi('Open group workspace', 'فتح مساحة المجموعة')} /></Link></article>;
    })}</div></PortalSection> : <div className="enterprise-empty"><UsersRound size={24} /><h3><BilingualText value={bi('No assigned groups', 'لا توجد مجموعات مكلف بها')} /></h3><p><BilingualText value={bi('No group relationship exists for this coach in the current provider records.', 'لا توجد علاقة مجموعة لهذا المدرب ضمن سجلات مصدر البيانات الحالية.')} /></p></div>}
  </div>;
}

export function CoachPortalPlayersPage() {
  const { groups, players, sports, loading, error } = useCoachPortalGatewayData();
  const [query, setQuery] = useState('');
  const [groupId, setGroupId] = useState('all');
  if (loading) return <LoadingState label={bi('Loading athletes…', 'جارٍ تحميل الرياضيين…')} />;
  if (error) return <ErrorState title={bi('Roster unavailable', 'القائمة غير متاحة')} description={bi('The current data provider could not supply the coach roster.', 'تعذر على مصدر البيانات الحالي توفير قائمة المدرب.')} />;

  const filtered = players.filter((player) => (groupId === 'all' || player.groupId === groupId) && `${player.nameEn} ${player.nameAr} ${player.id}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-page">
    <PageHeader icon={UserRound} eyebrow={bi('Coach Portal · Players', 'بوابة المدرب · اللاعبون')} title={bi('Coach Roster', 'قائمة المدرب')} description={bi('Athletes are derived only from groups assigned to the active coach.', 'يتم اشتقاق الرياضيين فقط من المجموعات المكلف بها المدرب النشط.')} actions={<PreviewNotice />} />
    <div className="enterprise-toolbar"><label className="enterprise-search"><span>⌕</span><span className="sr-only"><BilingualText value={bi('Search players', 'البحث عن اللاعبين')} /></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players | البحث عن اللاعبين" /></label><label className="enterprise-field"><BilingualText value={bi('Group', 'المجموعة')} /><select value={groupId} onChange={(event) => setGroupId(event.target.value)}><option value="all">All groups | كل المجموعات</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name.en} | {group.name.ar}</option>)}</select></label><span className="enterprise-result"><BilingualText value={bi(`${filtered.length} players`, `${filtered.length} لاعبين`)} /></span></div>
    <EnterpriseTable caption={bi('Coach roster', 'قائمة المدرب')}><thead><tr>{[bi('Player', 'اللاعب'), bi('Sport', 'الرياضة'), bi('Group', 'المجموعة'), bi('Attendance', 'الحضور'), bi('Performance', 'الأداء'), bi('Action', 'الإجراء')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{filtered.map((player) => {
      const group = groups.find((item) => item.id === player.groupId);
      const sport = sports.find((item) => item.id === player.sportId);
      return <tr key={player.id}><td><strong><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></strong><small>{player.id}</small></td><td><BilingualText value={sport?.name ?? bi('Not available', 'غير متاحة')} /></td><td><BilingualText value={group?.name ?? bi('Not assigned', 'غير معيّنة')} /></td><td><strong>{player.attendanceRate}%</strong></td><td><strong>{player.performanceScore === null ? '—' : `${player.performanceScore}/100`}</strong></td><td><Link className="admin-link-button" to={`/coach/players/${player.id}`}><BilingualText value={bi('Open athlete', 'فتح الرياضي')} /></Link></td></tr>;
    })}</tbody></EnterpriseTable>
    {!filtered.length && <div className="enterprise-empty"><UserRound size={22} /><h3><BilingualText value={bi('No matching athletes', 'لا يوجد رياضيون مطابقون')} /></h3></div>}
  </div>;
}

export function CoachPortalAttendancePage() {
  const { players, groups, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading attendance context…', 'جارٍ تحميل سياق الحضور…')} />;
  if (error) return <ErrorState title={bi('Attendance unavailable', 'الحضور غير متاح')} description={bi('The provider could not supply attendance context.', 'تعذر على مصدر البيانات توفير سياق الحضور.')} />;
  const average = players.length ? Math.round(players.reduce((sum, player) => sum + player.attendanceRate, 0) / players.length) : null;

  return <div className="admin-page">
    <PageHeader icon={CheckCircle2} eyebrow={bi('Coach Portal · Attendance', 'بوابة المدرب · الحضور')} title={bi('Attendance Review', 'مراجعة الحضور')} description={bi('Read-only attendance summaries from the shared provider. No coach write contract is connected yet.', 'ملخصات حضور للقراءة فقط من مصدر البيانات المشترك. لا يوجد عقد كتابة للمدرب متصل حتى الآن.')} actions={<PreviewNotice />} />
    <section className="portal-metric-grid"><PortalMetric label={bi('Athletes in scope', 'الرياضيون ضمن النطاق')} value={players.length} /><PortalMetric label={bi('Average attendance', 'متوسط الحضور')} value={average === null ? '—' : `${average}%`} tone="green" /><PortalMetric label={bi('Assigned groups', 'المجموعات المكلف بها')} value={groups.length} tone="blue" /><PortalMetric label={bi('Write status', 'حالة الكتابة')} value="Read-only" tone="gold" /></section>
    <PortalSection title={bi('Provider attendance summaries', 'ملخصات الحضور من مصدر البيانات')} description={bi('Values below are existing provider summaries; this screen does not claim to save attendance.', 'القيم أدناه ملخصات موجودة في مصدر البيانات؛ هذه الشاشة لا تدعي حفظ الحضور.')}><EnterpriseTable caption={bi('Coach attendance summaries', 'ملخصات حضور المدرب')}><thead><tr><th><BilingualText value={bi('Player', 'اللاعب')} /></th><th><BilingualText value={bi('Group', 'المجموعة')} /></th><th><BilingualText value={bi('Attendance rate', 'نسبة الحضور')} /></th><th><BilingualText value={bi('Persistence', 'الحفظ')} /></th></tr></thead><tbody>{players.map((player) => <tr key={player.id}><td><strong><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></strong></td><td><BilingualText value={groups.find((group) => group.id === player.groupId)?.name ?? bi('Not assigned', 'غير معيّنة')} /></td><td><strong>{player.attendanceRate}%</strong></td><td><PortalStatus label={bi('Read-only', 'للقراءة فقط')} tone="neutral" /></td></tr>)}</tbody></EnterpriseTable></PortalSection>
    <PortalPreviewCard title={bi('Attendance write boundary', 'حدود كتابة الحضور')} description={bi('A production attendance mutation must be added to the data gateway before coach marks can be persisted.', 'يجب إضافة عملية كتابة حضور إنتاجية إلى بوابة البيانات قبل إمكانية حفظ علامات المدرب.')} />
  </div>;
}

export function CoachPortalEvaluationsPage() {
  const { players, sports, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading performance signals…', 'جارٍ تحميل مؤشرات الأداء…')} />;
  if (error) return <ErrorState title={bi('Performance unavailable', 'الأداء غير متاح')} description={bi('The provider could not supply performance signals.', 'تعذر على مصدر البيانات توفير مؤشرات الأداء.')} />;

  return <div className="admin-page">
    <PageHeader icon={ClipboardCheck} eyebrow={bi('Coach Portal · Evaluations', 'بوابة المدرب · التقييمات')} title={bi('Performance Review', 'مراجعة الأداء')} description={bi('Provider-backed performance scores are read-only until an evaluation write contract exists.', 'درجات الأداء من مصدر البيانات للقراءة فقط حتى يتوفر عقد كتابة للتقييم.')} actions={<PreviewNotice />} />
    {players.length ? <section className="portal-card-grid">{players.map((player) => <article className="portal-card" key={player.id}><div className="child-card-head"><span className="portal-card-icon"><Target size={16} /></span><div><h3>{player.nameEn}</h3><small lang="ar" dir="rtl">{player.nameAr}</small></div><strong className="score-figure">{player.performanceScore === null ? '—' : player.performanceScore}</strong></div><p><BilingualText value={sports.find((sport) => sport.id === player.sportId)?.name ?? bi('Sport unavailable', 'الرياضة غير متاحة')} /></p>{player.performanceScore === null ? <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 11 }}><BilingualText value={bi('No performance score is available in the provider record.', 'لا توجد درجة أداء متاحة في سجل مصدر البيانات.')} /></p> : <EnterpriseProgress value={player.performanceScore} label={bi('Performance score', 'درجة الأداء')} color="green" />}<PortalStatus label={bi('Read-only provider record', 'سجل مصدر بيانات للقراءة فقط')} tone="neutral" /></article>)}</section> : <div className="enterprise-empty"><Activity size={24} /><h3><BilingualText value={bi('No athletes to evaluate', 'لا يوجد رياضيون للتقييم')} /></h3></div>}
    <PortalPreviewCard title={bi('Evaluation write boundary', 'حدود كتابة التقييم')} description={bi('No local note is presented as saved. Production evaluation writes remain deferred until the gateway exposes that contract.', 'لا يتم عرض أي ملاحظة محلية على أنها محفوظة. تظل كتابة التقييمات الإنتاجية مؤجلة حتى توفر بوابة البيانات هذا العقد.')} />
  </div>;
}

export function CoachPortalProgramsPage() {
  const { programs, sports, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading programs…', 'جارٍ تحميل البرامج…')} />;
  if (error) return <ErrorState title={bi('Programs unavailable', 'البرامج غير متاحة')} description={bi('The provider could not supply assigned programs.', 'تعذر على مصدر البيانات توفير البرامج المكلف بها.')} />;

  return <div className="admin-page"><PageHeader icon={Target} eyebrow={bi('Coach Portal · Programs', 'بوابة المدرب · البرامج')} title={bi('Assigned Programs', 'البرامج المكلف بها')} description={bi('Programs are derived from the active coach group assignments.', 'يتم اشتقاق البرامج من تكليفات مجموعات المدرب النشط.')} actions={<PreviewNotice />} />{programs.length ? <div className="portal-card-grid">{programs.map((program) => <article className="portal-card" key={program.id}><span className="portal-card-icon"><Target size={18} /></span><h3><BilingualText value={program.name} /></h3><p><BilingualText value={program.description} /></p><p><BilingualText value={sports.find((sport) => sport.id === program.sportId)?.name ?? bi('Sport unavailable', 'الرياضة غير متاحة')} /> · <BilingualText value={program.level} /></p><PortalStatus label={program.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={program.status === 'active' ? 'active' : 'neutral'} /></article>)}</div> : <div className="enterprise-empty"><Target size={24} /><h3><BilingualText value={bi('No assigned programs', 'لا توجد برامج مكلف بها')} /></h3></div>}</div>;
}

export function CoachPortalGroupDetailPage() {
  const { groupId } = useParams();
  const { groups, players, sessions, programs, sports, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading group…', 'جارٍ تحميل المجموعة…')} />;
  if (error) return <ErrorState title={bi('Group unavailable', 'المجموعة غير متاحة')} description={bi('The provider could not supply this group.', 'تعذر على مصدر البيانات توفير هذه المجموعة.')} />;
  const group = groups.find((item) => item.id === groupId);
  if (!group) return <ErrorState title={bi('Group not in coach scope', 'المجموعة خارج نطاق المدرب')} description={bi('This group is not assigned to the active coach or does not exist.', 'هذه المجموعة غير مكلف بها المدرب النشط أو غير موجودة.')} />;
  const roster = players.filter((player) => player.groupId === group.id);
  const groupSessions = sessions.filter((session) => session.groupId === group.id);
  const groupPrograms = programs.filter((program) => group.programIds.includes(program.id));
  const sport = sports.find((item) => item.id === group.sportId);

  return <div className="admin-page"><PageHeader icon={UsersRound} eyebrow={bi('Coach Portal · Group', 'بوابة المدرب · المجموعة')} title={group.name} description={bi('Provider-backed group detail inside the active coach scope.', 'تفاصيل مجموعة من مصدر البيانات داخل نطاق المدرب النشط.')} actions={<Link className="admin-link-button" to="/coach/groups"><BilingualText value={bi('Back to groups', 'العودة للمجموعات')} /></Link>} /><section className="portal-metric-grid"><PortalMetric label={bi('Roster', 'القائمة')} value={roster.length} /><PortalMetric label={bi('Sessions', 'الحصص')} value={groupSessions.length} tone="green" /><PortalMetric label={bi('Programs', 'البرامج')} value={groupPrograms.length} tone="blue" /><PortalMetric label={bi('Sport', 'الرياضة')} value={sport?.name.en ?? '—'} tone="gold" /></section><PortalSection title={bi('Athletes', 'الرياضيون')}>{roster.length ? <div className="portal-card-grid">{roster.map((player) => <article className="portal-card" key={player.id}><h3><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></h3><p>{player.attendanceRate}% <BilingualText value={bi('attendance', 'حضور')} /></p><Link className="admin-link-button" to={`/coach/players/${player.id}`}><BilingualText value={bi('Open athlete', 'فتح الرياضي')} /></Link></article>)}</div> : <div className="enterprise-empty"><UsersRound size={22} /><h3><BilingualText value={bi('No athletes linked', 'لا يوجد رياضيون مرتبطون')} /></h3></div>}</PortalSection></div>;
}

export function CoachPortalPlayerDetailPage() {
  const { playerId } = useParams();
  const { players, groups, programs, sports, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading athlete…', 'جارٍ تحميل الرياضي…')} />;
  if (error) return <ErrorState title={bi('Athlete unavailable', 'الرياضي غير متاح')} description={bi('The provider could not supply this athlete.', 'تعذر على مصدر البيانات توفير هذا الرياضي.')} />;
  const player = players.find((item) => item.id === playerId);
  if (!player) return <ErrorState title={bi('Athlete not in coach scope', 'الرياضي خارج نطاق المدرب')} description={bi('This athlete is not assigned through the active coach groups or does not exist.', 'هذا الرياضي غير مرتبط عبر مجموعات المدرب النشط أو غير موجود.')} />;
  const group = groups.find((item) => item.id === player.groupId);
  const program = programs.find((item) => item.id === player.programId);
  const sport = sports.find((item) => item.id === player.sportId);

  return <div className="admin-page"><PageHeader icon={UserRound} eyebrow={bi('Coach Portal · Athlete', 'بوابة المدرب · الرياضي')} title={{ en: player.nameEn, ar: player.nameAr }} description={bi('Coach-facing provider record limited to assignment, attendance and performance context.', 'سجل من مصدر البيانات للمدرب يقتصر على التكليف والحضور وسياق الأداء.')} actions={<Link className="admin-link-button" to="/coach/players"><BilingualText value={bi('Back to roster', 'العودة للقائمة')} /></Link>} /><section className="portal-metric-grid"><PortalMetric label={bi('Attendance', 'الحضور')} value={`${player.attendanceRate}%`} /><PortalMetric label={bi('Performance', 'الأداء')} value={player.performanceScore === null ? '—' : `${player.performanceScore}/100`} tone="green" /><PortalMetric label={bi('Age', 'العمر')} value={player.age ?? '—'} tone="blue" /><PortalMetric label={bi('Sport', 'الرياضة')} value={sport?.name.en ?? '—'} tone="gold" /></section><PortalSection title={bi('Assignment', 'التكليف')}><div className="portal-card-grid"><article className="portal-card"><h3><BilingualText value={bi('Group', 'المجموعة')} /></h3><p><BilingualText value={group?.name ?? bi('Not assigned', 'غير معيّنة')} /></p></article><article className="portal-card"><h3><BilingualText value={bi('Program', 'البرنامج')} /></h3><p><BilingualText value={program?.name ?? bi('Not assigned', 'غير معيّن')} /></p></article><article className="portal-card"><h3><BilingualText value={bi('Level', 'المستوى')} /></h3><p><BilingualText value={player.level} /></p></article></div></PortalSection><PortalPreviewCard title={bi('Privacy boundary', 'حدود الخصوصية')} description={bi('Finance and unrelated family records are intentionally excluded from the coach athlete view.', 'يتم استبعاد السجلات المالية وسجلات الأسرة غير المرتبطة عمدًا من عرض الرياضي للمدرب.')} /></div>;
}

export function CoachPortalProfilePage() {
  const { coach, groups, sports, branches, loading, error } = useCoachPortalGatewayData();
  if (loading) return <LoadingState label={bi('Loading coach profile…', 'جارٍ تحميل ملف المدرب…')} />;
  if (error || !coach) return <ErrorState title={bi('Coach profile unavailable', 'ملف المدرب غير متاح')} description={bi('The current provider could not supply the active coach record.', 'تعذر على مصدر البيانات الحالي توفير سجل المدرب النشط.')} />;

  return <div className="admin-page"><PageHeader icon={UserRound} eyebrow={bi('Coach Portal · Profile', 'بوابة المدرب · الملف الشخصي')} title={{ en: coach.nameEn, ar: coach.nameAr }} description={bi('Read-only coach identity and assignment data from the shared provider.', 'بيانات هوية وتكليف المدرب للقراءة فقط من مصدر البيانات المشترك.')} actions={<PreviewNotice />} /><section className="portal-metric-grid"><PortalMetric label={bi('Assigned groups', 'المجموعات المكلف بها')} value={groups.length} /><PortalMetric label={bi('Sports', 'الرياضات')} value={sports.length} tone="green" /><PortalMetric label={bi('Branches', 'الفروع')} value={branches.length} tone="blue" /><PortalMetric label={bi('Status', 'الحالة')} value={coach.status} tone="gold" /></section><PortalSection title={bi('Coach record', 'سجل المدرب')}><div className="portal-card-grid"><article className="portal-card"><span className="portal-card-icon"><Building2 size={18} /></span><h3><BilingualText value={bi('Branches', 'الفروع')} /></h3><p>{branches.length ? branches.map((branch) => branch.name.en).join(' · ') : '—'}</p></article><article className="portal-card"><span className="portal-card-icon"><Target size={18} /></span><h3><BilingualText value={bi('Specializations', 'التخصصات')} /></h3><p>{coach.specializations.length ? coach.specializations.map((item) => item.en).join(' · ') : '—'}</p></article><article className="portal-card"><span className="portal-card-icon"><FileText size={18} /></span><h3><BilingualText value={bi('Certifications', 'الشهادات')} /></h3><p>{coach.certifications.length ? coach.certifications.map((item) => item.en).join(' · ') : '—'}</p></article></div></PortalSection><PortalPreviewCard title={bi('Profile write boundary', 'حدود كتابة الملف')} description={bi('Profile editing remains read-only until a production-safe coach update contract is enabled for this portal.', 'يبقى تعديل الملف للقراءة فقط حتى يتم تفعيل عقد تحديث آمن للمدرب في هذه البوابة.')} /></div>;
}
