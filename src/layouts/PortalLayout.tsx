import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity, Award, CalendarDays, CheckCircle2, ChevronLeft, CreditCard, FileText,
  Home, IdCard, Menu, MessageSquareText, ShieldCheck, Target, UserRound, UsersRound, X,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import type { BilingualText as BilingualValue } from '../domain/contracts';
import '../styles/admin.css';
import '../styles/portal-shell.css';

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
      { path: 'profile', label: bi('Profile', 'الملف الشخصي'), icon: IdCard },
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
      <div className="portal-role"><small><BilingualText value={bi('Preview Product', 'منتج تجريبي')} /></small><BilingualText value={meta.title} /><span><BilingualText value={meta.role} /></span></div>
      <nav className="portal-nav">{meta.nav.map(({ path, label, icon: Icon }) => <NavLink key={path || 'overview'} to={path ? `${base}/${path}` : base} end={!path}><Icon /><BilingualText value={label} /><ChevronLeft /></NavLink>)}</nav>
      <Link className="portal-public-link" to="/"><ChevronLeft /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link>
    </aside>
    {open && <button type="button" className="portal-overlay" onClick={() => setOpen(false)} aria-label="Close navigation | إغلاق القائمة" />}
    <section className="portal-workspace">
      <header className="portal-topbar">
        <button type="button" className="portal-icon-button portal-mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation | فتح القائمة"><Menu /></button>
        <div><small><BilingualText value={meta.title} /></small><strong><BilingualText value={current.label} /></strong></div>
        <span className="portal-preview-badge"><span /><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>
        <ThemeToggle compact />
      </header>
      <main className="portal-main">{children}</main>
    </section>
  </div>;
}
