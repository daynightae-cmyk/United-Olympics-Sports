import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, Bell, Calendar, Check, CheckCircle2, CreditCard, ExternalLink, FileText,
  Globe, Home, LogOut, Menu, MessageCircle, MessageSquareText, Moon, Receipt, Settings,
  Sparkles, Sun, Trophy, User, X,
} from 'lucide-react';
import { usePlayerSession } from './PlayerSessionContext';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PlayerPortrait } from './components/PlayerPortrait';
import { useUiSettings } from '../../ui/theme/useUiSettings';
import { getSport } from '../../data/demo/selectors';

type Label = { en: string; ar: string };
type Icon = ComponentType<{ size?: number; className?: string }>;
type NavItem = { path: string; label: Label; icon: Icon; badge?: number };
type NavGroup = { label: Label; items: NavItem[] };

export function PlayerPortalShell({ children }: { children: ReactNode }) {
  const {
    player, allPlayers, sport, activePlayerId, setActivePlayerId,
    unreadNotificationCount, notifications, markNotificationRead, markAllNotificationsRead, logout,
  } = usePlayerSession();
  const location = useLocation();
  const navigate = useNavigate();
  const { bilingualOrder, setSetting, resolvedTheme, setAppearance } = useUiSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [athleteOpen, setAthleteOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const isArabic = bilingualOrder === 'ar-first';
  const isPreviewSession = useMemo(() => {
    try {
      const raw = localStorage.getItem('uos:player-portal:session');
      if (!raw) return false;
      return (JSON.parse(raw) as { provider?: string }).provider === 'preview';
    } catch {
      return false;
    }
  }, [activePlayerId]);

  const navGroups = useMemo<NavGroup[]>(() => [
    { label: bi('Overview', 'نظرة عامة'), items: [
      { path: '/player/home', label: bi('Athlete Home', 'الرئيسية'), icon: Home },
      { path: '/player/schedule', label: bi('Training Schedule', 'جدول التدريب'), icon: Calendar },
    ] },
    { label: bi('Development', 'التطور'), items: [
      { path: '/player/performance', label: bi('Performance Lab', 'مختبر الأداء'), icon: Activity },
      { path: '/player/attendance', label: bi('Attendance', 'الحضور'), icon: CheckCircle2 },
      { path: '/player/achievements', label: bi('Achievements', 'الإنجازات'), icon: Trophy },
      { path: '/player/feedback', label: bi('Coach Feedback', 'ملاحظات المدرب'), icon: MessageSquareText },
    ] },
    { label: bi('Records & Operations', 'السجلات والعمليات'), items: [
      { path: '/player/subscription', label: bi('Membership', 'العضوية'), icon: CreditCard },
      { path: '/player/payments', label: bi('Payments', 'المدفوعات'), icon: Receipt },
      { path: '/player/documents', label: bi('Documents', 'المستندات'), icon: FileText },
    ] },
    { label: bi('Communication', 'التواصل'), items: [
      { path: '/player/messages', label: bi('Messages', 'الرسائل'), icon: MessageCircle },
      { path: '/player/notifications', label: bi('Notifications', 'الإشعارات'), icon: Bell, badge: unreadNotificationCount || undefined },
    ] },
    { label: bi('Account', 'الحساب'), items: [
      { path: '/player/profile', label: bi('Athlete Profile', 'ملف اللاعب'), icon: User },
      { path: '/player/settings', label: bi('Portal Settings', 'إعدادات البوابة'), icon: Settings },
    ] },
  ], [unreadNotificationCount]);

  const mobileTabs = navGroups.flatMap((group) => group.items).filter((item) => ['/player/home', '/player/schedule', '/player/performance', '/player/messages'].includes(item.path));
  const routeActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`) || (path === '/player/schedule' && location.pathname.startsWith('/player/session/'));

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen && !moreOpen && !notificationsOpen && !athleteOpen && !logoutOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileMenuOpen(false);
      setMoreOpen(false);
      setNotificationsOpen(false);
      setAthleteOpen(false);
      setLogoutOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [athleteOpen, logoutOpen, mobileMenuOpen, moreOpen, notificationsOpen]);

  if (!player) {
    return <div className="min-h-screen bg-slate-950 grid place-items-center p-6 text-center"><div className="max-w-md"><CheckCircle2 size={34} className="mx-auto text-amber-400" /><h1 className="mt-4 text-xl font-black text-white"><BilingualText value={bi('Player session unavailable', 'جلسة اللاعب غير متاحة')} /></h1><p className="mt-2 text-sm leading-7 text-slate-400"><BilingualText value={bi('Sign in or enter an explicit Preview Athlete session to access the private Player Portal.', 'سجل الدخول أو ادخل إلى جلسة معاينة لاعب صريحة للوصول إلى بوابة اللاعب الخاصة.')} /></p><button type="button" onClick={() => navigate('/player/login')} className="athlete-action-primary mt-5"><BilingualText value={bi('Return to sign in', 'العودة لتسجيل الدخول')} /></button></div></div>;
  }

  const toggleLanguage = () => {
    const next = isArabic ? 'en' : 'ar';
    setSetting('bilingualOrder', next === 'ar' ? 'ar-first' : 'en-first');
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };
  const handleLogout = () => { logout(); setLogoutOpen(false); navigate('/player/login'); };

  return (
    <div className="player-shell-container" id="player-portal-shell">
      <aside className={`athlete-sidebar ${mobileMenuOpen ? 'is-open' : ''}`} id="athlete-desktop-sidebar" aria-label="Player navigation | تنقل بوابة اللاعب">
        <div className="athlete-sidebar-header">
          <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" className="athlete-sidebar-logo" />
          <div className="min-w-0 flex-1"><strong className="athlete-sidebar-brand-title block truncate">UNITED OLYMPICS SPORTS</strong><span className="athlete-sidebar-brand-subtitle block">يونايتد أوليمبيكس سبورت</span></div>
          <button type="button" onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 rounded-xl text-slate-400" aria-label="Close navigation | إغلاق التنقل"><X size={18} /></button>
        </div>

        <div className="athlete-mini-badge" id="athlete-mini-identity">
          <PlayerPortrait photoUrl={player.photo} name={player.nameEn} alt={`${player.nameEn} · ${player.nameAr}`} className="athlete-mini-avatar" />
          <div className="min-w-0 flex-1"><strong className="block text-[13px] text-slate-100 truncate">{player.nameEn}</strong><span lang="ar" dir="rtl" className="block text-[10px] text-amber-300 truncate text-left rtl:text-right">{player.nameAr}</span><p className="mt-1 text-[10px] text-slate-400 truncate"><BilingualText value={sport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /></p></div>
          {isPreviewSession && <button type="button" onClick={() => setAthleteOpen(true)} className="p-2 text-amber-400 hover:bg-amber-400/10 rounded-xl" aria-label="Switch preview athlete | تبديل لاعب المعاينة"><Sparkles size={16} /></button>}
        </div>

        <div className="athlete-nav-scroller">
          {navGroups.map((group) => <section key={group.label.en} className="space-y-1"><div className="athlete-nav-group-label"><BilingualText value={group.label} /></div>{group.items.map((item) => { const NavIcon = item.icon; return <NavLink key={item.path} to={item.path} className={`athlete-nav-item ${routeActive(item.path) ? 'active' : ''}`}><NavIcon size={17} /><span className="truncate"><BilingualText value={item.label} /></span>{item.badge ? <span className="athlete-nav-badge">{item.badge}</span> : null}</NavLink>; })}</section>)}
        </div>

        <div className="p-3 border-t border-white/5"><Link to="/" className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg"><ExternalLink size={14} /><BilingualText value={bi('Public website', 'الموقع العام')} /></Link></div>
      </aside>

      {mobileMenuOpen && <button type="button" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation backdrop | إغلاق خلفية التنقل" />}

      <div className="athlete-workspace">
        <header className="athlete-topbar" id="athlete-topbar">
          <div className="flex items-center gap-2 min-w-0">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-300 border border-white/10" aria-label="Open navigation | فتح التنقل"><Menu size={19} /></button>
            <button type="button" onClick={() => isPreviewSession && setAthleteOpen(true)} disabled={!isPreviewSession} className="flex items-center gap-2.5 min-w-0 p-1.5 rounded-xl text-left rtl:text-right disabled:cursor-default">
              <PlayerPortrait photoUrl={player.photo} name={player.nameEn} alt={`${player.nameEn} · ${player.nameAr}`} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0" />
              <div className="min-w-0"><strong className="block text-xs sm:text-sm text-slate-100 truncate">{player.nameEn}</strong><span className="block text-[9px] sm:text-[10px] text-amber-300 truncate">{player.nameAr}</span></div>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {isPreviewSession && <button type="button" onClick={() => setAthleteOpen(true)} className="hidden md:inline-flex athlete-data-scope"><Sparkles size={12} /><BilingualText value={bi('Switch preview athlete', 'تبديل لاعب المعاينة')} /></button>}
            <button type="button" onClick={toggleLanguage} className="p-2 rounded-xl text-slate-300 border border-white/10 inline-flex items-center gap-1 text-xs" aria-label="Toggle language | تبديل اللغة"><Globe size={16} /><span>{isArabic ? 'EN' : 'عربي'}</span></button>
            <button type="button" onClick={() => setAppearance(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-xl text-slate-300 border border-white/10" aria-label="Toggle appearance | تبديل المظهر">{resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button>
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((value) => !value)} className="relative p-2 rounded-xl text-slate-300 border border-white/10" aria-expanded={notificationsOpen} aria-label="Open notifications | فتح الإشعارات"><Bell size={17} />{unreadNotificationCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-black text-[9px] font-black grid place-items-center">{unreadNotificationCount}</span>}</button>
              {notificationsOpen && <><button type="button" className="fixed inset-0 z-40 bg-black/10" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications | إغلاق الإشعارات" /><div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 athlete-glass-card z-50 p-4 border border-amber-400/30 shadow-2xl" id="athlete-notifications-popover"><div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10"><strong className="text-sm text-white"><BilingualText value={bi('Athlete Notifications', 'إشعارات اللاعب')} /></strong>{unreadNotificationCount > 0 && <button type="button" onClick={markAllNotificationsRead} className="text-[10px] font-bold text-amber-300"><BilingualText value={bi('Mark all read', 'تحديد الكل كمقروء')} /></button>}</div>{notifications.length ? <div className="max-h-72 overflow-y-auto divide-y divide-white/5">{notifications.slice(0, 6).map((item) => <button key={item.id} type="button" onClick={() => markNotificationRead(item.id)} className={`w-full py-3 px-1 text-left rtl:text-right ${item.isRead ? 'opacity-65' : ''}`}><strong className="block text-xs text-white"><BilingualText value={item.title} /></strong><p className="mt-1 text-[10px] leading-5 text-slate-400 line-clamp-2"><BilingualText value={item.description} /></p></button>)}</div> : <div className="py-8 text-center"><Bell size={24} className="mx-auto text-slate-600" /><p className="mt-3 text-xs text-slate-400"><BilingualText value={bi('No current notifications', 'لا توجد إشعارات حالية')} /></p></div>}<Link to="/player/notifications" className="block pt-3 border-t border-white/10 text-center text-[11px] font-bold text-amber-300"><BilingualText value={bi('Open notification center', 'فتح مركز الإشعارات')} /></Link></div></>}
            </div>
            <button type="button" onClick={() => setLogoutOpen(true)} className="p-2 rounded-xl text-slate-400 border border-white/10 hover:text-red-300" aria-label="Sign out | تسجيل الخروج"><LogOut size={17} /></button>
          </div>
        </header>

        <main className="athlete-content-area" id="athlete-content-area">{children}</main>

        <nav className="athlete-mobile-bottom-bar" id="athlete-mobile-bottom-nav" aria-label="Player mobile navigation | تنقل اللاعب على الهاتف">
          {mobileTabs.map((item) => { const TabIcon = item.icon; return <NavLink key={item.path} to={item.path} className={`athlete-mobile-tab ${routeActive(item.path) ? 'active' : ''}`}><TabIcon size={19} /><span className="truncate"><BilingualText value={item.label} /></span></NavLink>; })}
          <button type="button" onClick={() => setMoreOpen(true)} className={`athlete-mobile-tab ${moreOpen ? 'active' : ''}`} aria-label="More player sections | المزيد من أقسام اللاعب"><Menu size={19} /><BilingualText value={bi('More', 'المزيد')} /></button>
        </nav>
      </div>

      {moreOpen && <><button type="button" className="athlete-drawer-overlay" onClick={() => setMoreOpen(false)} aria-label="Close more menu | إغلاق قائمة المزيد" /><div className="athlete-drawer-sheet" id="athlete-more-drawer" role="dialog" aria-modal="true" aria-label="More player sections | المزيد من أقسام اللاعب"><div className="athlete-drawer-handle" /><div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4"><div><strong className="text-sm text-white">{player.nameEn}</strong><span lang="ar" dir="rtl" className="block text-[10px] text-amber-300">{player.nameAr}</span></div>{isPreviewSession && <button type="button" onClick={() => { setMoreOpen(false); setAthleteOpen(true); }} className="athlete-data-scope"><Sparkles size={12} /><BilingualText value={bi('Switch athlete', 'تبديل اللاعب')} /></button>}</div><div className="grid grid-cols-2 gap-2">{navGroups.flatMap((group) => group.items).filter((item) => !mobileTabs.some((tab) => tab.path === item.path)).map((item) => { const MoreIcon = item.icon; return <Link key={item.path} to={item.path} className="p-3 min-h-14 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5 text-slate-200"><MoreIcon size={17} className="text-amber-400" /><span className="text-[11px] font-medium"><BilingualText value={item.label} /></span></Link>; })}<button type="button" onClick={() => { setMoreOpen(false); setLogoutOpen(true); }} className="p-3 min-h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-red-300"><LogOut size={17} /><span className="text-[11px] font-medium"><BilingualText value={bi('Sign out', 'تسجيل الخروج')} /></span></button></div></div></>}

      {athleteOpen && isPreviewSession && <div className="athlete-modal-overlay" onClick={() => setAthleteOpen(false)} role="presentation"><div className="athlete-modal-content !max-w-2xl p-5 sm:p-6" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="switch-preview-athlete-title"><header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Preview session', 'جلسة معاينة')} /></span><h2 id="switch-preview-athlete-title" className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Switch Preview Athlete', 'تبديل لاعب المعاينة')} /></h2><p className="mt-1 text-xs text-slate-400"><BilingualText value={bi('This switcher changes only the explicit local preview identity.', 'يغيّر هذا الاختيار هوية المعاينة المحلية الصريحة فقط.')} /></p></div><button type="button" onClick={() => setAthleteOpen(false)} className="p-2 rounded-xl text-slate-400" aria-label="Close athlete switcher | إغلاق تبديل اللاعب"><X size={18} /></button></header><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 max-h-[56vh] overflow-y-auto">{allPlayers.map((item) => { const current = item.id === activePlayerId; const itemSport = getSport(item.sportId); return <button key={item.id} type="button" onClick={() => { setActivePlayerId(item.id); setAthleteOpen(false); }} className={`p-3.5 rounded-2xl text-left rtl:text-right border flex items-center gap-3 ${current ? 'bg-amber-400/12 border-amber-400/35' : 'bg-white/[.025] border-white/10 hover:bg-white/5'}`}><PlayerPortrait photoUrl={item.photo} name={item.nameEn} alt={`${item.nameEn} · ${item.nameAr}`} className="w-11 h-11 rounded-xl flex-shrink-0" /><div className="min-w-0 flex-1"><strong className="text-xs text-white block truncate">{item.nameEn}</strong><span lang="ar" dir="rtl" className="text-[10px] text-amber-300 block truncate">{item.nameAr}</span><span className="mt-1 text-[9px] text-slate-500 block truncate"><BilingualText value={itemSport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /> · <BilingualText value={item.level} /></span></div>{current && <Check size={16} className="text-amber-400 flex-shrink-0" />}</button>; })}</div></div></div>}

      {logoutOpen && <div className="athlete-modal-overlay" onClick={() => setLogoutOpen(false)} role="presentation"><div className="athlete-modal-content !max-w-md text-center p-6" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="player-logout-title"><div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto grid place-items-center"><LogOut size={25} /></div><h2 id="player-logout-title" className="mt-4 text-lg font-black text-white"><BilingualText value={bi('Sign out of Player Portal?', 'تسجيل الخروج من بوابة اللاعب؟')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('The active portal session will be cleared from this browser.', 'سيتم مسح جلسة البوابة النشطة من هذا المتصفح.')} /></p><div className="athlete-action-row mt-6 justify-center"><button type="button" onClick={() => setLogoutOpen(false)} className="athlete-action-secondary"><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center justify-center px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"><BilingualText value={bi('Sign out', 'تأكيد الخروج')} /></button></div></div></div>}
    </div>
  );
}
