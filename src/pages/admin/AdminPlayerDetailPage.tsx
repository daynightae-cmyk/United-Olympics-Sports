import { BarChart3, CalendarCheck, FileText, Medal, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CoachFeedbackPanel } from '../../components/admin/CoachFeedbackPanel';
import { FuturePanel, PageHeader, PlayerAvatar, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { PlayerAttendance } from '../../components/admin/PlayerAttendance';
import { PlayerPerformance } from '../../components/admin/PlayerPerformance';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getGroup, getPlayer, getPlayerOverall, getSport } from '../../data/demo/selectors';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'attendance', label: bi('Attendance', 'الحضور') },
  { id: 'performance', label: bi('Performance', 'الأداء') },
  { id: 'feedback', label: bi('Coach Feedback', 'تقييمات المدربين') },
  { id: 'achievements', label: bi('Achievements', 'الإنجازات') },
  { id: 'schedule', label: bi('Schedule', 'الجدول') },
  { id: 'documents', label: bi('Documents', 'المستندات') },
];

export function AdminPlayerDetailPage() {
  const { playerId } = useParams();
  const player = getPlayer(playerId);
  const [active, setActive] = useState('overview');

  if (!player) return <FuturePanel title={bi('Player not found', 'اللاعب غير موجود')} description={bi('Choose a valid anonymized preview player from the Player Directory.', 'اختر لاعبًا تجريبيًا مجهول الهوية صالحًا من دليل اللاعبين.')} />;

  const sport = getSport(player.sportId);
  const group = getGroup(player.groupId);

  return <div className="admin-page">
    <PageHeader icon={Medal} eyebrow={bi('Athlete Record', 'سجل الرياضي')} title={{ en: player.nameEn, ar: player.nameAr }} description={bi('A serious preview athlete record without personal contact, address or medical data.', 'سجل رياضي تجريبي احترافي دون بيانات تواصل أو عنوان أو بيانات طبية شخصية.')} actions={<StatusBadge />} />

    <section className="player-identity-card"><PlayerAvatar id={player.id} large /><div className="player-identity-main"><code>{player.id}</code><h2><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></h2><span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></span></div><dl><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport && <BilingualText value={sport.name} />}</dd></div><div><dt><BilingualText value={bi('Training Group', 'مجموعة التدريب')} /></dt><dd>{group && <BilingualText value={group.name} />}</dd></div><div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd>{player.age} <BilingualText value={bi('years', 'سنة')} /></dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={player.level} /></dd></div></dl></section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="player-overview-grid"><section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Player Information', 'معلومات اللاعب')} /><small><BilingualText value={bi('Anonymized preview fixture', 'بيانات تجريبية مجهولة الهوية')} /></small></div><Medal /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Player ID', 'رقم اللاعب')} /></dt><dd><code>{player.id}</code></dd></div><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport && <BilingualText value={sport.name} />}</dd></div><div><dt><BilingualText value={bi('Group', 'المجموعة')} /></dt><dd>{group && <BilingualText value={group.name} />}</dd></div><div><dt><BilingualText value={bi('Coach Reference', 'مرجع المدرب')} /></dt><dd>{player.coachIds.join(', ') || '—'}</dd></div></dl></section><section className="overview-score-card"><Trophy /><BilingualText value={bi('Overall Development', 'التطور العام')} /><strong>{getPlayerOverall(player.id)}</strong><span>/ 100 | من 100</span><button type="button" onClick={() => setActive('performance')}><BarChart3 /><BilingualText value={bi('Open Performance', 'فتح الأداء')} /></button></section><section className="admin-panel pipeline-card"><div className="panel-heading"><BilingualText value={bi('Prepared Feedback Pipeline', 'مسار التقييم المجهز')} /><ShieldCheck /></div><div className="pipeline-flow">{[bi('Coach Evaluation', 'تقييم المدرب'), bi('Performance Record', 'سجل الأداء'), bi('Player Record', 'سجل اللاعب'), bi('Player App', 'تطبيق اللاعب'), bi('Parent Portal', 'بوابة ولي الأمر')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 4 && <i>→</i>}</span>)}</div><p><BilingualText value={bi('Contract readiness only. No realtime synchronization is active.', 'جاهزية العقود فقط. لا توجد مزامنة فورية نشطة.')} /></p></section></div>}

      {active === 'attendance' && <PlayerAttendance player={player} />}
      {active === 'performance' && <PlayerPerformance player={player} />}
      {active === 'feedback' && <CoachFeedbackPanel player={player} />}

      {active === 'achievements' && <div className="player-preview-grid"><article className="player-preview-card"><Medal /><span className="admin-eyebrow"><BilingualText value={bi('Achievement Framework', 'إطار الإنجازات')} /></span><h3><BilingualText value={bi('Milestones & Recognition', 'المراحل والتقدير')} /></h3><p><BilingualText value={bi('A visual space for verified milestones once achievements are connected to the player record.', 'مساحة بصرية للمراحل الموثقة عند ربط الإنجازات بسجل اللاعب.')} /></p><div className="preview-line"><BilingualText value={bi('Verified achievements', 'الإنجازات الموثقة')} /><strong>—</strong></div></article><article className="player-preview-card"><Trophy /><span className="admin-eyebrow"><BilingualText value={bi('Competition Record', 'سجل المنافسات')} /></span><h3><BilingualText value={bi('Participation & Results', 'المشاركات والنتائج')} /></h3><p><BilingualText value={bi('No competition result is fabricated in this preview.', 'لا يتم اختلاق أي نتيجة منافسة في هذه المعاينة.')} /></p><span className="preview-badge"><Sparkles /><BilingualText value={bi('Awaiting Verified Data', 'بانتظار بيانات موثقة')} /></span></article><article className="player-preview-card"><ShieldCheck /><span className="admin-eyebrow"><BilingualText value={bi('Certificates', 'الشهادات')} /></span><h3><BilingualText value={bi('Verified Documents Only', 'مستندات موثقة فقط')} /></h3><p><BilingualText value={bi('Certificate cards will appear here only when a real document is connected.', 'ستظهر بطاقات الشهادات هنا فقط عند ربط مستند حقيقي.')} /></p></article></div>}

      {active === 'schedule' && <div className="player-preview-grid"><article className="player-preview-card"><CalendarCheck /><span className="admin-eyebrow"><BilingualText value={bi('Schedule Preview', 'معاينة الجدول')} /></span><h3><BilingualText value={bi('Training Blocks', 'كتل التدريب')} /></h3><p><BilingualText value={bi('The final schedule will organize verified sessions without inventing operational times.', 'سينظم الجدول النهائي الحصص الموثقة دون اختلاق أوقات تشغيلية.')} /></p><div className="preview-line"><BilingualText value={bi('Training Block A', 'كتلة تدريب أ')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div><div className="preview-line"><BilingualText value={bi('Training Block B', 'كتلة تدريب ب')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div></article><article className="player-preview-card"><ShieldCheck /><span className="admin-eyebrow"><BilingualText value={bi('Session Context', 'سياق الحصة')} /></span><h3><BilingualText value={sport?.name ?? bi('Sport', 'الرياضة')} /></h3><p><BilingualText value={group?.name ?? bi('Training Group', 'مجموعة التدريب')} /></p><span className="preview-badge"><BilingualText value={bi('No Operational Times Claimed', 'دون ادعاء أوقات تشغيلية')} /></span></article></div>}

      {active === 'documents' && <div className="player-preview-grid"><article className="player-preview-card"><FileText /><span className="admin-eyebrow"><BilingualText value={bi('Player Documents', 'مستندات اللاعب')} /></span><h3><BilingualText value={bi('Document Vault Preview', 'معاينة خزنة المستندات')} /></h3><p><BilingualText value={bi('A structured visual area for verified player documents. No storage or upload action is claimed in this frontend phase.', 'مساحة بصرية منظمة لمستندات اللاعب الموثقة. لا يتم ادعاء وجود تخزين أو رفع ملفات في هذه المرحلة.')} /></p><div className="preview-line"><BilingualText value={bi('Player Document', 'مستند اللاعب')} /><strong>—</strong></div></article><article className="player-preview-card"><ShieldCheck /><span className="admin-eyebrow"><BilingualText value={bi('Verification State', 'حالة التحقق')} /></span><h3><BilingualText value={bi('Verified Assets Only', 'أصول موثقة فقط')} /></h3><p><BilingualText value={bi('No fake certificate, identity document or medical file is displayed.', 'لا يتم عرض شهادة أو مستند هوية أو ملف طبي وهمي.')} /></p></article></div>}
    </section>
  </div>;
}
