import { Activity, CalendarDays, ClipboardCheck, MessageSquareText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoSessions } from '../../../data/demo/sessions';
import { demoTrainingGroups } from '../../../data/demo/trainingGroups';
import { getSport } from '../../../data/demo/selectors';

export function CoachPortalOverviewPage() {
  const group = demoTrainingGroups[0]; const sport = getSport(group.sportId);
  const sessions = demoSessions.filter(session => session.groupId === group.id);
  return <div className="admin-page"><PageHeader eyebrow={bi('Coach Portal', 'بوابة المدرب')} title={bi('Training Overview', 'نظرة عامة للتدريب')} description={bi('Group, roster and evaluation tools organized around preview assignments.', 'أدوات المجموعة والقائمة والتقييم منظمة حول تكليفات تجريبية.')} />
    <section className="portal-overview-hero"><article className="portal-overview-primary"><span><ClipboardCheck /></span><div><h2><BilingualText value={group.name} /></h2><p><BilingualText value={bi('A tablet-ready coaching workspace with truthful roster and session context.', 'مساحة تدريب جاهزة للأجهزة اللوحية مع سياق صادق للقائمة والجلسات.')} /></p></div></article><article className="portal-overview-score"><small><BilingualText value={bi('Linked Roster', 'القائمة المرتبطة')} /></small><strong>{group.playerIds.length}</strong><BilingualText value={sport?.name ?? bi('Sport Preview', 'معاينة الرياضة')} /></article></section>
    <section className="portal-action-grid"><Link to="/coach/schedule"><CalendarDays /><BilingualText value={bi('Schedule', 'الجدول')} /><small><BilingualText value={bi(`${sessions.length} linked preview sessions`, `${sessions.length} جلسات تجريبية مرتبطة`)} /></small></Link><Link to="/coach/attendance"><ClipboardCheck /><BilingualText value={bi('Attendance', 'الحضور')} /><small><BilingualText value={bi('Open operational workflow', 'فتح سير العمل التشغيلي')} /></small></Link><Link to="/coach/evaluations"><Activity /><BilingualText value={bi('Evaluations', 'التقييمات')} /><small><BilingualText value={bi('Sport-aware assessment preview', 'معاينة تقييم خاصة بالرياضة')} /></small></Link></section>
    <section className="portal-overview-list"><header><BilingualText value={bi('Assignment Snapshot', 'لمحة عن التكليف')} /><UsersRound /></header><div><article><strong><BilingualText value={bi('Training Group', 'مجموعة التدريب')} /></strong><small><BilingualText value={group.name} /></small></article><article><strong><BilingualText value={bi('Program Links', 'روابط البرامج')} /></strong><small><BilingualText value={bi(`${group.programIds.length} preview link`, `${group.programIds.length} رابط تجريبي`)} /></small></article></div><Link className="admin-link-button" to="/coach/messages"><MessageSquareText /><BilingualText value={bi('Open Messages', 'فتح الرسائل')} /></Link></section>
  </div>;
}
