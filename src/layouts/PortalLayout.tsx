import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, Award, Bell, CalendarDays, CheckCircle2, ChevronLeft, CreditCard, FileText,
  Home, IdCard, Menu, MessageSquareText, Settings, ShieldCheck, Target, UserRound, UsersRound, X,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import type { BilingualText as BilingualValue } from '../domain/contracts';
import '../styles/admin.css';
import '../styles/portal-shell.css';
import '../styles/player-portal.css';
import { PlayerPortrait } from '../components/player/PlayerIdentity';
import { usePlayerSession } from '../portals/player/PlayerSessionContext';

type PortalKind = 'player' | 'parent' | 'coach';
type PortalNavItem = { path: string; label: BilingualValue; icon: LucideIcon };

const portalMeta: Record<PortalKind, { title: BilingualValue; role: BilingualValue; nav: PortalNavItem[] }> = {
  player: {
    title: bi('Player Portal', 'بوابة اللاعب'), role: bi('Athlete Workspace', 'مساحة اللاعب'),
    nav: [
      { path: '', label: bi('Overview', 'نظرة عامة'), icon: Home },
      { path: 'schedule', label: bi('Schedule', 'الجدول'), icon: CalendarDays },
      { path: 'attendance', label: bi('Attendance', 'الحضور'), icon: CheckCircle2 },
      { path: 'performance', label: bi('Performance', 'الأداء'), icon: Activity },
      { path: 'feedback', label: bi('Feedback', 'الملاحظات'), icon: MessageSquareText },
      { path: 'achievements', label: bi('Achievements', 'الإنجازات'), icon: Award },
      { path: 'documents', label: bi('Documents', 'المستندات'), icon: FileText },
      { path: 'subscription', label: bi('Membership', 'العضوية'), icon: ShieldCheck },
      { path: 'payments', label: bi('Payments', 'المدفوعات'), icon: CreditCard },
      { path: 'messages', label: bi('Messages', 'الرسائل'), icon: MessageSquareText },
      { path: 'notifications', label: bi('Notifications', 'الإشعارات'), icon: Bell },
      { path: 'profile', label: bi('Profile', 'الملف الشخصي'), icon: IdCard },
      { path: 'settings', label: bi('Settings', 'الإعدادات'), icon: Settings },
    ],
  },
  parent: {
    title: bi('Parent Portal', 'بوابة ولي الأمر'), role: bi('Family Workspace', 'مساحة الأسرة'),
    nav: [
      { path: '', label: bi('Overview', 'نظرة عامة'), icon: Home },
      { path: 'children', label: bi('Children', 'الأبناء'), icon: UsersRound },
      { path: 'schedule', label: bi('Schedule', 'الجدول'), icon: CalendarDays },
      { path: 'performance', label: bi('Performance', 'الأداء'), icon: Activity },
      { path: 'feedback', label: bi('Feedback', 'الملاحظات'), icon: MessageSquareText },
      { path: 'subscriptions', label: bi('Subscriptions', 'الاشتراكات'), icon: ShieldCheck },
      { path: 'payments', label: bi('Payments', 'المدفوعات'), icon: CreditCard },
      { path: 'documents', label: bi('Documents', 'المستندات'), icon: FileText },
      { path: 'messages', label: bi('Messages', 'الرسائل'), icon: MessageSquareText },
      { path: 'profile', label: bi('Profile', 'الملف الشخصي'), icon: UserRound },
    ],
  },
  coach: {
    title: bi('Coach Portal', 'بوابة المدرب'), role: bi('Training Workspace', 'مساحة التدريب'),
    nav: [
      { path: '', label: bi('Overview', 'نظرة عامة'), icon: Home },
      { path: 'schedule', label: bi('Schedule', 'الجدول'), icon: CalendarDays },
      { path: 'groups', label: bi('Groups', 'المجموعات'), icon: UsersRound },
      { path: 'players', label: bi('Players', 'اللاعبون'), icon: UserRound },
      { path: 'attendance', label: bi('Attendance', 'الحضور'), icon: CheckCircle2 },
      { path: 'evaluations', label: bi('Evaluations', 'التقييمات'), icon: Activity },
      { path: 'programs', label: bi('Programs', 'البرامج'), icon: Target },
      { path: 'messages', label: bi('Messages', 'الرسائل'), icon: MessageSquareText },
      { path: 'profile', label: bi('Profile', 'الملف الشخصي'), icon: IdCard },
    ],
  },
};

export function PortalLayout({ portal, children }: { portal: PortalKind; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const meta = portalMeta[portal];
  const base = `/${portal}`;
  const current = useMemo(() => {
    const relative = location.pathname.slice(base.length).replace(/^\//, '').split('/')[0];
    return meta.nav.find(item => item.path === relative) ?? meta.nav[0];
  }, [base, location.pathname, meta.nav]);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return <div className={`portal-shell portal-${portal}`}>
    <aside className={`portal-sidebar ${open ? 'is-open' : ''}`} aria-label={`${meta.title.en} navigation | تنقل ${meta.title.ar}`}>
      <div className="portal-brand">
        <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
        <div><strong>United Olympics Sports</strong><span lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</span></div>
        <button type="button" onClick={() => setOpen(false)} className="portal-icon-button portal-mobile-only" aria-label="Close navigation | إغلاق القائمة"><X /></button>
      </div>
      {portal === 'player' ? <PlayerMiniProfile/> : <div className="portal-role"><BilingualText value={meta.title} /><span><BilingualText value={meta.role} /></span></div>}
      <nav className="portal-nav">{meta.nav.map(({ path, label, icon: Icon }) => <NavLink key={path || 'overview'} to={path ? `${base}/${path}` : base} end={!path}><Icon /><BilingualText value={label} /><ChevronLeft /></NavLink>)}</nav>
      <Link className="portal-public-link" to="/"><ChevronLeft /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link>
    </aside>
    {open && <button type="button" className="portal-overlay" onClick={() => setOpen(false)} aria-label="Close navigation | إغلاق القائمة" />}
    <section className="portal-workspace">
      <header className="portal-topbar">
        <button type="button" className="portal-icon-button portal-mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation | فتح القائمة"><Menu /></button>
        <div><small><BilingualText value={meta.title} /></small><strong><BilingualText value={current.label} /></strong></div>
        {portal === 'player' ? <Link className="portal-icon-button player-notification-link" to="/player/notifications" aria-label="Notifications | الإشعارات"><Bell/></Link> : <span className="portal-preview-badge"><span /><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
        <ThemeToggle compact />
      </header>
      <main className="portal-main">{children}</main>
      {portal === 'player' && <PlayerMobileNav/>}
    </section>
  </div>;
}

function PlayerMiniProfile() { const { player, sport } = usePlayerSession(); return <div className="player-mini-profile"><PlayerPortrait player={player} size="small"/><div><strong>{player.nameEn}</strong><span lang="ar" dir="rtl">{player.nameAr}</span><small><BilingualText value={sport?.name ?? bi('Athlete','رياضي')}/></small></div><i title="Preview mode | وضع المعاينة">P</i></div>; }

function PlayerMobileNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMoreOpen(false), [location.pathname]);
  useEffect(() => {
    if (!moreOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMoreOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [moreOpen]);
  const primary = [{ path: '/player/home', label: bi('Home','الرئيسية'), icon: Home }, { path: '/player/schedule', label: bi('Schedule','الجدول'), icon: CalendarDays }, { path: '/player/performance', label: bi('Performance','الأداء'), icon: Activity }, { path: '/player/messages', label: bi('Messages','الرسائل'), icon: MessageSquareText }];
  const more = portalMeta.player.nav.filter(item => !['','schedule','performance','messages'].includes(item.path));
  return <><nav className="player-bottom-nav" aria-label="Player navigation | تنقل اللاعب">{primary.map(({path,label,icon:Icon}) => <NavLink key={path} to={path}><Icon/><BilingualText value={label}/></NavLink>)}<button type="button" className={moreOpen ? 'active' : ''} onClick={() => setMoreOpen(true)} aria-expanded={moreOpen}><Menu/><BilingualText value={bi('More','المزيد')}/></button></nav>{moreOpen && <><button className="player-more-backdrop" aria-label="Close more menu | إغلاق قائمة المزيد" onClick={() => setMoreOpen(false)}/><section className="player-more-sheet" role="dialog" aria-modal="true" aria-labelledby="player-more-title"><header><h2 id="player-more-title"><BilingualText value={bi('More','المزيد')}/></h2><button onClick={() => setMoreOpen(false)} aria-label="Close | إغلاق"><X/></button></header><nav>{more.map(({path,label,icon:Icon}) => <Link key={path} to={`/player/${path}`}><Icon/><BilingualText value={label}/><ChevronLeft/></Link>)}</nav></section></>}</>;
}
