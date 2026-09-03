import { Activity, Award, CalendarDays, CheckCircle2, ChevronRight, FileText, MessageSquareText, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getLatestPlayerMetrics, getPlayerOverall } from '../../../data/demo/selectors';
import { demoSessions } from '../../../data/demo/sessions';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalOverviewPage() {
  const { player, sport, group } = usePlayerSession();
  const records = player.attendanceRecords;
  const attendance = records.length ? Math.round(records.filter(record => record.status !== 'absent').length / records.length * 100) : null;
  const metrics = getLatestPlayerMetrics(player.id);
  const overall = metrics.length ? getPlayerOverall(player.id) : null;
  const nextSession = demoSessions.filter(session => session.groupId === player.groupId).sort((a,b) => a.startsAt.localeCompare(b.startsAt))[0];
  return <div className="player-page player-home">
    <header className="player-welcome"><div><span><BilingualText value={bi('Your athlete space', 'مساحتك الرياضية')}/></span><h1>Welcome back, {player.nameEn.replace('Player Demo ', 'Player ')}<b lang="ar" dir="rtl">مرحبًا بعودتك، {player.nameAr}</b></h1></div><p><BilingualText value={bi('Build today. Become tomorrow.', 'ابنِ يومك. واصنع مستقبلك.')}/></p></header>
    <section className="player-hero-card" aria-label="Player identity card | بطاقة هوية اللاعب">
      <div className="player-hero-light" aria-hidden="true"/>
      <div className="player-portrait"><span><UserRound size={62}/></span><small><BilingualText value={bi('Athlete portrait', 'صورة الرياضي')}/></small></div>
      <div className="player-identity"><span className="player-identity-kicker"><BilingualText value={sport?.name ?? bi('Sport not linked','الرياضة غير مرتبطة')}/></span><h2>{player.nameEn}<b lang="ar" dir="rtl">{player.nameAr}</b></h2><div className="player-id"><ShieldCheck size={15}/>{player.id}</div><div className="player-tags"><span><BilingualText value={player.status}/></span><span><BilingualText value={player.level}/></span>{group && <span><BilingualText value={group.name}/></span>}</div></div>
      <div className="player-hero-stats"><div><strong>{attendance === null ? '—' : `${attendance}%`}</strong><BilingualText value={bi('Attendance','الحضور')}/></div><div><strong>{overall === null ? '—' : overall}</strong><BilingualText value={bi('Performance','الأداء')}/></div><div><strong>{player.achievements.length || '—'}</strong><BilingualText value={bi('Achievements','الإنجازات')}/></div></div>
      <div className="player-card-mark"><img src="/brand/united-olympics-sports-logo.png" alt=""/><span>UNITED<br/>ATHLETE</span></div>
    </section>
    <div className="player-home-grid">
      <section className="player-next-session"><header><span><CalendarDays/><BilingualText value={bi('Next session','الحصة القادمة')}/></span><Link to="/player/schedule"><BilingualText value={bi('Full schedule','الجدول الكامل')}/><ChevronRight/></Link></header>{nextSession ? <div className="next-session-body"><time dateTime={nextSession.startsAt}><strong>{new Date(nextSession.startsAt).toLocaleDateString('en-GB',{weekday:'short',day:'2-digit'})}</strong><span>{new Date(nextSession.startsAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</span></time><div><h3><BilingualText value={sport?.name ?? bi('Training session','حصة تدريبية')}/></h3><p><BilingualText value={group?.name ?? bi('Training group','مجموعة التدريب')}/></p><span className="player-state"><i/><BilingualText value={bi('Scheduled','مجدولة')}/></span></div></div> : <div className="compact-empty"><BilingualText value={bi('No upcoming sessions','لا توجد حصص قادمة')}/></div>}</section>
      <section className="player-progress-card"><span><Activity/><BilingualText value={bi('Performance pulse','نبض الأداء')}/></span><strong>{overall === null ? '—' : overall}</strong><p><BilingualText value={metrics.length ? bi(`${metrics.length} verified sport metrics`, `${metrics.length} مؤشرات رياضية موثقة`) : bi('No performance records yet','لا توجد سجلات أداء حتى الآن')}/></p><Link to="/player/performance"><BilingualText value={bi('Explore performance','استكشف الأداء')}/><ChevronRight/></Link></section>
    </div>
    <section className="player-quick"><header><h2><BilingualText value={bi('Your world','عالمك')}/></h2><p><BilingualText value={bi('Everything you need, without the noise.','كل ما تحتاجه، دون تشتيت.')}/></p></header><div>{[
      ['/player/attendance',CheckCircle2,bi('Attendance','الحضور'),bi('Your training rhythm','إيقاع تدريبك')],['/player/achievements',Award,bi('Achievements','الإنجازات'),bi('Your milestones','محطات إنجازك')],['/player/feedback',MessageSquareText,bi('Coach feedback','ملاحظات المدرب'),bi('Your next focus','تركيزك القادم')],['/player/documents',FileText,bi('Documents','المستندات'),bi('Your secure vault','خزنتك الآمنة')]
    ].map(([to, Icon, title, detail]) => { const IconComponent = Icon as typeof Activity; return <Link to={to as string} key={to as string}><span><IconComponent/></span><strong><BilingualText value={title as ReturnType<typeof bi>}/></strong><small><BilingualText value={detail as ReturnType<typeof bi>}/></small><ChevronRight/></Link>; })}</div></section>
  </div>;
}
