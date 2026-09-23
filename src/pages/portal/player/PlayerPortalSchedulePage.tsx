import { CalendarDays, Clock3, MapPin, UserRound, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoCoaches } from '../../../data/demo/coaches';
import { demoSessions } from '../../../data/demo/sessions';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

type View = 'today' | 'week' | 'upcoming';
export function PlayerPortalSchedulePage() {
  const { player, sport, group } = usePlayerSession();
  const [view, setView] = useState<View>('upcoming');
  const sessions = useMemo(() => demoSessions.filter(item => item.groupId === player.groupId).sort((a,b) => a.startsAt.localeCompare(b.startsAt)), [player.groupId]);
  const visible = sessions.filter(session => {
    const date = new Date(session.startsAt); const now = new Date();
    if (view === 'today') return date.toDateString() === now.toDateString();
    if (view === 'week') return date.getTime() >= now.getTime() && date.getTime() <= now.getTime() + 7 * 86400000;
    return true;
  });
  const coach = demoCoaches.find(item => item.groupIds.includes(player.groupId ?? ''));
  return <div className="player-page schedule-page"><header className="player-page-heading"><span><BilingualText value={bi('Training calendar','تقويم التدريب')}/></span><h1><BilingualText value={bi('Your schedule','جدولك')}/></h1><p><BilingualText value={bi('Training moments connected to your athlete profile.','مواعيد التدريب المرتبطة بملفك الرياضي.')}/></p></header>
    <div className="player-tabs" role="tablist" aria-label="Schedule view | عرض الجدول">{(['today','week','upcoming'] as View[]).map(item => <button key={item} role="tab" aria-selected={view === item} onClick={() => setView(item)}><BilingualText value={{today:bi('Today','اليوم'),week:bi('This week','هذا الأسبوع'),upcoming:bi('Upcoming','القادمة')}[item]}/></button>)}</div>
    <section className="schedule-timeline">{visible.length ? visible.map((session, index) => <Link to={`/player/schedule/${session.id}`} className="player-session-card" key={session.id}><time dateTime={session.startsAt}><span>{new Date(session.startsAt).toLocaleDateString('en-GB',{month:'short'}).toUpperCase()}</span><strong>{new Date(session.startsAt).getDate()}</strong><small>{new Date(session.startsAt).toLocaleDateString('ar-AE',{weekday:'short'})}</small></time><div className="session-card-body"><span className="session-sequence">0{index + 1}</span><h2><BilingualText value={sport?.name ?? bi('Training session','حصة تدريبية')}/></h2><div className="session-facts"><span><Clock3/><b>{new Date(session.startsAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</b></span><span><UsersRound/><BilingualText value={group?.name ?? bi('Group unavailable','المجموعة غير متاحة')}/></span><span><UserRound/><BilingualText value={coach ? bi(coach.nameEn.replace(' Preview',''),coach.nameAr.replace(' تجريبي','')) : bi('Coach to be confirmed','المدرب قيد التأكيد')}/></span><span><MapPin/><BilingualText value={bi('Location to be confirmed','الموقع قيد التأكيد')}/></span></div></div><span className="session-status"><BilingualText value={session.status}/></span></Link>) : <div className="player-empty"><CalendarDays/><h2><BilingualText value={view === 'today' ? bi('No training today','لا يوجد تدريب اليوم') : view === 'week' ? bi('No sessions this week','لا توجد حصص هذا الأسبوع') : bi('No upcoming sessions','لا توجد حصص قادمة')}/></h2><p><BilingualText value={bi('New verified sessions will appear here when scheduled.','ستظهر الحصص الجديدة الموثقة هنا عند جدولتها.')}/></p></div>}</section>
  </div>;
}
