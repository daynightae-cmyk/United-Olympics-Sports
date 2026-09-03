import { Activity, Award, CalendarDays, CheckCircle2, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';
import { getGroup, getSport } from '../../../data/demo/selectors';

export function PlayerPortalOverviewPage() {
  const player = demoPlayers[0]; const sport = getSport(player.sportId); const group = getGroup(player.groupId);
  const attendance = player.attendanceSummary;
  return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal', 'بوابة اللاعب')} title={bi('Overview', 'نظرة عامة')} description={bi('A focused athlete workspace using anonymized preview records only.', 'مساحة مركزة للاعب تستخدم سجلات تجريبية مجهولة فقط.')} />
    <section className="portal-overview-hero"><article className="portal-overview-primary"><span><ShieldCheck /></span><div><h2>{player.nameEn}<span lang="ar" dir="rtl"> · {player.nameAr}</span></h2><p><BilingualText value={bi('Your sport, group and development tools remain connected in one calm view.', 'تظل رياضتك ومجموعتك وأدوات تطورك مترابطة في واجهة واحدة هادئة.')} /></p></div></article><article className="portal-overview-score"><small><BilingualText value={bi('Attendance Preview', 'معاينة الحضور')} /></small><strong>{attendance ? `${attendance.attended}/${attendance.scheduled}` : '—'}</strong><BilingualText value={sport?.name ?? bi('Sport Preview', 'معاينة الرياضة')} /></article></section>
    <section className="portal-action-grid"><Link to="/player/schedule"><CalendarDays /><BilingualText value={bi('My Schedule', 'جدولي')} /><small><BilingualText value={bi('Open training timeline', 'فتح الخط الزمني للتدريب')} /></small></Link><Link to="/player/performance"><Activity /><BilingualText value={bi('Performance', 'الأداء')} /><small><BilingualText value={bi('Review sport-aware metrics', 'مراجعة مؤشرات الرياضة')} /></small></Link><Link to="/player/achievements"><Award /><BilingualText value={bi('Achievements', 'الإنجازات')} /><small><BilingualText value={bi('Truthful empty state ready', 'حالة فارغة صادقة وجاهزة')} /></small></Link></section>
    <section className="portal-overview-list"><header><BilingualText value={bi('Training Context', 'سياق التدريب')} /><CheckCircle2 /></header><div><article><strong><BilingualText value={bi('Current Group', 'المجموعة الحالية')} /></strong><small><BilingualText value={group?.name ?? bi('Not linked', 'غير مرتبطة')} /></small></article><article><strong><BilingualText value={bi('Documents', 'المستندات')} /></strong><small><BilingualText value={bi('No verified documents yet', 'لا توجد مستندات موثقة بعد')} /></small></article></div><Link className="admin-link-button" to="/player/documents"><FileText /><BilingualText value={bi('Open Documents', 'فتح المستندات')} /></Link></section>
  </div>;
}
