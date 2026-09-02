import { Activity, CalendarCheck, Home, IdCard, MessageSquareText, MoreHorizontal, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BilingualText, bi } from '../bilingual/BilingualText';

const coreItems = [
  { to: '/player', end: true, label: bi('Home', 'الرئيسية'), icon: Home },
  { to: '/player/id', label: bi('ID', 'الهوية'), icon: IdCard },
  { to: '/player/progress', label: bi('Progress', 'التقدم'), icon: TrendingUp },
  { to: '/player/performance', label: bi('Performance', 'الأداء'), icon: Activity },
];

export function PlayerBottomNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const moreActive = ['/player/attendance', '/player/feedback'].some(path => location.pathname.startsWith(path));
  return <nav className="player-bottom-nav" aria-label="Player navigation | تنقل تطبيق اللاعب">
    {coreItems.map(({ to, end, label, icon: Icon }) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon aria-hidden="true" /><BilingualText value={label} /></NavLink>)}
    <button type="button" className={moreActive || open ? 'active' : ''} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="player-more-menu"><MoreHorizontal aria-hidden="true" /><BilingualText value={bi('More', 'المزيد')} /></button>
    {open && <div className="player-more-menu" id="player-more-menu">
      <NavLink to="/player/attendance" onClick={() => setOpen(false)}><CalendarCheck aria-hidden="true" /><BilingualText value={bi('Attendance', 'الحضور')} /></NavLink>
      <NavLink to="/player/feedback" onClick={() => setOpen(false)}><MessageSquareText aria-hidden="true" /><BilingualText value={bi('Coach Feedback', 'تقييم المدرب')} /></NavLink>
      <Link to="/" onClick={() => setOpen(false)}><Home aria-hidden="true" /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link>
    </div>}
  </nav>;
}
