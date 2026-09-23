import { Activity, Award, Bell, CalendarDays, CheckCircle2, ChevronRight, FileText, MessageSquareText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getBranch, getLatestPlayerMetrics, getPlayerOverall } from '../../../data/demo/selectors';
import { demoSessions } from '../../../data/demo/sessions';
import { demoCoaches } from '../../../data/demo/coaches';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerIdentityCard } from '../../../components/player/PlayerIdentity';

export function PlayerPortalOverviewPage() {
  const { player, sport, group } = usePlayerSession();
  const records = player.attendanceRecords;
  const attendance = records.length ? Math.round(records.filter(record => record.status !== 'absent').length / records.length * 100) : null;
  const metrics = getLatestPlayerMetrics(player.id);
  const overall = metrics.length ? getPlayerOverall(player.id) : null;
  const nextSession = demoSessions.filter(session => session.groupId === player.groupId).sort((a,b) => a.startsAt.localeCompare(b.startsAt))[0];
  const coach = demoCoaches.find(item => player.coachIds.includes(item.id) || item.groupIds.includes(player.groupId ?? ''));
  const branch = getBranch(coach?.branchIds[0]);
  return <div className="player-page player-home">
    <header className="player-welcome"><div><span><BilingualText value={bi('Your athlete space', 'مساحتك الرياضية')}/></span><h1>Welcome back, {player.nameEn.replace('Player Demo ', 'Player ')}<b lang="ar" dir="rtl">مرحبًا بعودتك، {player.nameAr}</b></h1></div><p><BilingualText value={bi('Build today. Become tomorrow.', 'ابنِ يومك. واصنع مستقبلك.')}/></p></header>
    <PlayerIdentityCard player={player} sport={sport?.name ?? bi('Sport not linked','الرياضة غير مرتبطة')} group={group?.name} coach={coach} branch={branch?.name} attendance={attendance} performance={overall} nextSession={nextSession ? new Date(nextSession.startsAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : undefined}/>
    <div className="player-home-grid">
      <section className="player-next-session"><header><span><CalendarDays/><BilingualText value={bi('Next session','الحصة القادمة')}/></span><Link to="/player/schedule"><BilingualText value={bi('Full schedule','الجدول الكامل')}/><ChevronRight/></Link></header>{nextSession ? <div className="next-session-body"><time dateTime={nextSession.startsAt}><strong>{new Date(nextSession.startsAt).toLocaleDateString('en-GB',{weekday:'short',day:'2-digit'})}</strong><span>{new Date(nextSession.startsAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span></time><div><h3><BilingualText value={sport?.name ?? bi('Training session','حصة تدريبية')}/></h3><p><BilingualText value={group?.name ?? bi('Training group','مجموعة التدريب')}/></p><span className="player-state"><i/><BilingualText value={bi('Scheduled','مجدولة')}/></span></div></div> : <div className="compact-empty"><BilingualText value={bi('No upcoming sessions','لا توجد حصص قادمة')}/></div>}</section>
      <section className="player-progress-card"><span><Activity/><BilingualText value={bi('Performance pulse','نبض الأداء')}/></span><strong>{overall === null ? '—' : overall}</strong><p><BilingualText value={metrics.length ? bi(`${metrics.length} verified sport metrics`, `${metrics.length} مؤشرات رياضية موثقة`) : bi('No performance records yet','لا توجد سجلات أداء حتى الآن')}/></p><Link to="/player/performance"><BilingualText value={bi('Explore performance','استكشف الأداء')}/><ChevronRight/></Link></section>
    </div>
    <section className="player-quick"><header><h2><BilingualText value={bi('Your world','عالمك')}/></h2><p><BilingualText value={bi('Everything you need, without the noise.','كل ما تحتاجه، دون تشتيت.')}/></p></header><div>{[
      ['/player/attendance',CheckCircle2,bi('Attendance','الحضور'),bi('Your training rhythm','إيقاع تدريبك')],['/player/achievements',Award,bi('Achievements','الإنجازات'),bi('Your milestones','محطات إنجازك')],['/player/feedback',MessageSquareText,bi('Coach feedback','ملاحظات المدرب'),bi('Your next focus','تركيزك القادم')],['/player/documents',FileText,bi('Documents','المستندات'),bi('Your secure vault','خزنتك الآمنة')]
    ].map(([to, Icon, title, detail]) => { const IconComponent = Icon as typeof Activity; return <Link to={to as string} key={to as string}><span><IconComponent/></span><strong><BilingualText value={title as ReturnType<typeof bi>}/></strong><small><BilingualText value={detail as ReturnType<typeof bi>}/></small><ChevronRight/></Link>; })}</div></section>
    <section className="player-home-strip"><article><ShieldCheck/><div><strong><BilingualText value={bi('Membership','العضوية')}/></strong><small><BilingualText value={bi('Details awaiting a verified membership source.','التفاصيل بانتظار مصدر عضوية موثق.')}/></small></div><Link to="/player/subscription"><ChevronRight/></Link></article><article><Bell/><div><strong><BilingualText value={bi('Notifications','الإشعارات')}/></strong><small><BilingualText value={bi('No verified updates right now.','لا توجد تحديثات موثقة الآن.')}/></small></div><Link to="/player/notifications"><ChevronRight/></Link></article></section>
  </div>;
}
