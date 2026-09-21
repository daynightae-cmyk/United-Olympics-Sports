import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity, Award, Bell, CalendarDays, CheckCircle2, ChevronLeft, CreditCard, FileText,
  Home, IdCard, Menu, MessageSquareText, Settings, ShieldCheck, Target, UserRound, UsersRound, X,
  type LucideIcon,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LanguageOrderToggle } from '../components/ui/LanguageOrderToggle';
import { PortalUtilityNav } from '../components/navigation/PortalUtilityNav';
import { usePortalDrawerA11y } from '../components/portal/usePortalDrawerA11y';
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
      { path: 'attendance', label: bi('Attendance', 'الحضور'), icon: CheckCircle2 },
      { path: 'performance', label: bi('Performance', 'الأداء'), icon: Activity },
      { path: 'feedback', label: bi('Feedback', 'الملاحظات'), icon: MessageSquareText },
      { path: 'subscriptions', label: bi('Subscriptions', 'الاشتراكات'), icon: ShieldCheck },
      { path: 'payments', label: bi('Payments', 'المدفوعات'), icon: CreditCard },
      { path: 'documents', label: bi('Documents', 'المستندات'), icon: FileText },
      { path: 'messages', label: bi('Messages', 'الرسائل'), icon: MessageSquareText },
      { path: 'notifications', label: bi('Notifications', 'الإشعارات'), icon: Bell },
      { path: 'profile', label: bi('Profile', 'الملف الشخصي'), icon: UserRound },
      { path: 'settings', label: bi('Settings', 'الإعدادات'), icon: Settings },
    ],
  },
  coach: {
    title: bi('Coach Portal', 'بوابة المدرب'), role: bi('Training Workspace', 'مساحة التدريب'),
    nav: [
      { path: 'home', label: bi('Overview', 'نظرة عامة'), icon: Home },
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

export function PortalLayout({ portal, children, statusMode = 'preview' }: { portal: PortalKind; children: ReactNode; statusMode?: 'preview' | 'production' | 'unlinked' }) {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const meta = portalMeta[portal];
  const base = `/${portal}`;
  const current = useMemo(() => {
    const relative = location.pathname.slice(base.length).replace(/^\//, '').split('/')[0];
    return meta.nav.find(item => item.path === relative) ?? meta.nav[0];
  }, [base, location.pathname, meta.nav]);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  usePortalDrawerA11y({
    open,
    onClose: () => setOpen(false),
    drawerRef,
    triggerRef: openButtonRef,
    initialFocusRef: closeButtonRef,
  });

  return <div className={`portal-shell portal-${portal}`} data-portal={portal}>
    <aside
      ref={drawerRef}
      id={`${portal}-portal-navigation`}
      className={`portal-sidebar ${open ? 'is-open' : ''}`}
      aria-label={`${meta.title.en} navigation | تنقل ${meta.title.ar}`}
      aria-modal={open || undefined}
      role={open ? 'dialog' : undefined}
      tabIndex={-1}
    >
      <div className="portal-brand">
        <img className="official-logo portal-brand-logo" src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
        <div><strong>United Olympics Sports</strong><span lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</span></div>
        <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="portal-icon-button portal-mobile-only" aria-label="Close navigation | إغلاق القائمة"><X /></button>
      </div>
      <div className="portal-role"><small><BilingualText value={bi('Portal Workspace', 'مساحة البوابة')} /></small><BilingualText value={meta.title} /><span><BilingualText value={meta.role} /></span></div>
      <nav className="portal-nav">{meta.nav.map(({ path, label, icon: Icon }) => <NavLink key={path || 'overview'} to={path ? `${base}/${path}` : base} end={!path} className={({ isActive }) => isActive ? 'active' : undefined}><Icon /><BilingualText value={label} /><ChevronLeft /></NavLink>)}</nav>
      <Link className="portal-public-link" to="/"><ChevronLeft /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link>
    </aside>
    {open && <button type="button" className="portal-overlay" onClick={() => setOpen(false)} aria-label="Close navigation | إغلاق القائمة" />}
    <section className="portal-workspace">
      <header className="portal-topbar">
        <button ref={openButtonRef} type="button" className="portal-icon-button portal-mobile-only" onClick={() => setOpen(true)} aria-label="Open navigation | فتح القائمة" aria-expanded={open} aria-controls={`${portal}-portal-navigation`}><Menu /></button>
        <div><small><BilingualText value={meta.title} /></small><strong><BilingualText value={current.label} /></strong></div>
        <PortalUtilityNav homeTo={portal === 'coach' ? '/coach/home' : base} compact />
        <span className="portal-preview-badge" data-status-mode={statusMode}>
          <span />
          <BilingualText value={
            statusMode === 'unlinked'
              ? bi('Google Verified', 'Google موثّق')
              : statusMode === 'production'
                ? bi('Live Portal', 'بوابة مباشرة')
                : bi('Preview Data', 'بيانات تجريبية')
          } />
        </span>
        <LanguageOrderToggle compact />
        <ThemeToggle compact />
      </header>
      <main className="portal-main">{children}</main>
    </section>
  </div>;
}