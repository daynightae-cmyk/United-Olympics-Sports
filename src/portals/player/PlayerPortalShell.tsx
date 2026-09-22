import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Activity,
  CheckCircle2,
  Trophy,
  MessageSquareText,
  CreditCard,
  Receipt,
  FileText,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  Globe,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { usePlayerSession } from "./PlayerSessionContext";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { PlayerPortrait } from "./components/PlayerPortrait";
import { useUiSettings } from "../../ui/theme/useUiSettings";
import SafeBrandLogo from "../../components/ui/SafeBrandLogo";
import { usePortalDrawerA11y } from "../../components/portal/usePortalDrawerA11y";
interface NavItemDef {
  path: string;
  label: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number | string;
}

function readPreviewSession() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem("uos:player-portal:session");
    if (!raw) return false;
    return (JSON.parse(raw) as { provider?: string }).provider === "preview";
  } catch {
    return false;
  }
}

export function PlayerPortalShell({ children }: { children: React.ReactNode }) {
  const {
    player,
    allPlayers,
    sport,
    activePlayerId,
    setActivePlayerId,
    unreadNotificationCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    logout,
  } = usePlayerSession();

  const location = useLocation();
  const navigate = useNavigate();
  const { bilingualOrder, setSetting, resolvedTheme, setAppearance } = useUiSettings();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [athleteModalOpen, setAthleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const isArabic = bilingualOrder === "ar-first";
  const isPreviewSession = readPreviewSession();

  usePortalDrawerA11y({
    open: mobileMenuOpen,
    onClose: () => setMobileMenuOpen(false),
    drawerRef: mobileDrawerRef,
    triggerRef: mobileMenuButtonRef,
    initialFocusRef: mobileCloseButtonRef,
  });

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setAppearance(nextTheme);
  };

  const toggleLanguage = () => {
    const nextLang = isArabic ? "en" : "ar";
    const nextOrder = nextLang === "ar" ? "ar-first" : "en-first";
    setSetting("bilingualOrder", nextOrder);
    document.documentElement.setAttribute("lang", nextLang);
    document.documentElement.setAttribute("dir", nextLang === "ar" ? "rtl" : "ltr");
    document.documentElement.dataset.bilingualOrder = nextOrder;
  };

  const handleLogout = () => {
    logout();
    setLogoutModalOpen(false);
    navigate("/player/login");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDrawerOpen(false);
    setNotifPopoverOpen(false);
    setAthleteModalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileMenuOpen(false);
        setMoreDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-xl font-bold text-white">
          <BilingualText value={bi("Player session unavailable", "جلسة اللاعب غير متاحة")} />
        </h2>
        <p className="text-sm text-slate-400 max-w-sm">
          <BilingualText
            value={bi(
              "Please sign in with a player identity that is connected to an athlete record.",
              "يرجى تسجيل الدخول بهوية لاعب مرتبطة بسجل رياضي."
            )}
          />
        </p>
        <button
          onClick={() => navigate("/player/login")}
          className="px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all"
        >
          <BilingualText value={bi("Return to Sign In", "العودة لتسجيل الدخول")} />
        </button>
      </div>
    );
  }

  const navItems: NavItemDef[] = [
    { path: "/player/home", label: { en: "Dashboard", ar: "الرئيسية" }, icon: Home },
    { path: "/player/profile", label: { en: "My Profile", ar: "ملفي الشخصي" }, icon: User },
    { path: "/player/schedule", label: { en: "Training Schedule", ar: "الجدول التدريبي" }, icon: Calendar },
    { path: "/player/attendance", label: { en: "Attendance", ar: "الحضور والغياب" }, icon: CheckCircle2 },
    { path: "/player/performance", label: { en: "Performance", ar: "الأداء والتطوير" }, icon: Activity },
    { path: "/player/achievements", label: { en: "Achievements", ar: "الإنجازات" }, icon: Trophy },
    {
      path: "/player/messages",
      label: { en: "Messages", ar: "الرسائل" },
      icon: MessageCircle,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
    { path: "/player/documents", label: { en: "Documents", ar: "المستندات" }, icon: FileText },
    { path: "/player/feedback", label: { en: "Coach Feedback", ar: "ملاحظات المدرب" }, icon: MessageSquareText },
    { path: "/player/settings", label: { en: "Settings", ar: "الإعدادات" }, icon: Settings },
  ];

  const mobilePrimaryTabs = [
    { path: "/player/home", label: { en: "Home", ar: "الرئيسية" }, icon: Home },
    { path: "/player/schedule", label: { en: "Schedule", ar: "الجدول" }, icon: Calendar },
    { path: "/player/performance", label: { en: "Performance", ar: "الأداء" }, icon: Activity },
    { path: "/player/messages", label: { en: "Messages", ar: "الرسائل" }, icon: MessageCircle },
  ];

  return (
    <>
      <div className="player-shell-container" id="player-portal-shell">
        <aside ref={mobileDrawerRef} className={`athlete-sidebar ${mobileMenuOpen ? "is-open" : ""}`} id="athlete-desktop-sidebar" aria-modal={mobileMenuOpen || undefined} role={mobileMenuOpen ? "dialog" : undefined} tabIndex={-1}>
        <div className="athlete-sidebar-header">
          <div className="athlete-sidebar-brand-block">
            <SafeBrandLogo className="athlete-sidebar-logo" />
            <div className="athlete-sidebar-brand-text">
              <span className="athlete-sidebar-brand-title">UNITED OLYMPICS</span>
              <span className="athlete-sidebar-brand-sports">- SPORTS -</span>
              <span className="athlete-sidebar-brand-tagline">UNITE. COMPETE. CONQUER.</span>
            </div>
          </div>
          {mobileMenuOpen && (
            <button ref={mobileCloseButtonRef} onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden absolute top-4 right-4 rtl:right-auto rtl:left-4" aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="athlete-nav-scroller">
          <nav className="athlete-nav-list" aria-label="Player navigation | ملاحة اللاعب">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === "/player/home" && location.pathname === "/player");
              return (
                <NavLink key={item.path} to={item.path} className={`athlete-nav-item ${isActive ? "active" : ""}`}>
                  <Icon size={18} className="athlete-nav-icon flex-shrink-0" />
                  <div className="athlete-nav-labels min-w-0 flex-1">
                    <span className="athlete-nav-label-en">{item.label.en}</span>
                    <span className="athlete-nav-label-ar">{item.label.ar}</span>
                  </div>
                  {item.badge !== undefined && <span className="athlete-nav-badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="athlete-sidebar-footer">
          <div className="athlete-sidebar-footer-motto">
            <span>MORE THAN SPORTS</span>
            <span className="athlete-sidebar-footer-sub">A BRIGHTER TOMORROW</span>
          </div>
          <Link to="/" className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] text-slate-400 hover:text-amber-300 transition-colors">
            <ExternalLink size={12} />
            <span><BilingualText value={bi("Public Site", "الموقع العام")} /></span>
          </Link>
        </div>
      </aside>

      <div className="athlete-workspace">
        <header className="athlete-topbar" id="athlete-topbar">
          <div className="flex items-center gap-3 min-w-0">
            <button ref={mobileMenuButtonRef} onClick={() => setMobileMenuOpen(true)} className="athlete-mobile-only p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 border border-white/10" aria-label="Open sidebar" aria-expanded={mobileMenuOpen} aria-controls="athlete-desktop-sidebar">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex flex-col text-[10px] font-extrabold uppercase tracking-[.18em] leading-tight select-none">
              <span className="text-slate-400">ATHLETES TODAY</span>
              <span className="text-amber-400/90">CHAMPIONS TOMORROW</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isPreviewSession && (
              <button
                onClick={() => setAthleteModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-all shadow-sm"
                id="switch-athlete-topbar-btn"
              >
                <Sparkles size={13} className="text-amber-400" />
                <span><BilingualText value={bi("Switch Preview Athlete", "تبديل لاعب المعاينة")} /></span>
              </button>
            )}

            <div className="relative">
              <button onClick={() => setNotifPopoverOpen(!notifPopoverOpen)} className="relative p-2.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10" aria-label="Notifications" id="athlete-notif-bell">
                <Bell size={17} />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {unreadNotificationCount > 0 ? unreadNotificationCount : 3}
                </span>
              </button>

              {notifPopoverOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/10" onClick={() => setNotifPopoverOpen(false)} />
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 athlete-glass-card z-50 p-4 border border-amber-400/30 shadow-2xl" id="athlete-notifications-popover">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-amber-400" />
                        <strong className="text-sm text-slate-100"><BilingualText value={bi("Athlete Alerts", "تنبيهات الرياضي")} /></strong>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button onClick={markAllNotificationsRead} className="text-xs text-amber-400 hover:underline">
                          <BilingualText value={bi("Mark all read", "تحديد الكل كمقروء")} />
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-white/5 max-h-72 overflow-y-auto my-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${notif.isRead ? "opacity-70 hover:bg-white/5" : "bg-amber-400/5 hover:bg-amber-400/10"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-100"><BilingualText value={notif.title} /></span>
                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2"><BilingualText value={notif.description} /></p>
                          <span className="text-[9px] text-slate-500 mt-1 block">{notif.timestamp}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/player/notifications" onClick={() => setNotifPopoverOpen(false)} className="block text-center text-xs text-amber-400 hover:text-amber-300 font-semibold pt-2 border-t border-white/10">
                      <BilingualText value={bi("View all notifications", "عرض جميع الإشعارات")} /> →
                    </Link>
                  </div>
                </>
              )}
            </div>

            <button onClick={toggleLanguage} className="px-2.5 py-1.5 rounded-full text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10 flex items-center gap-1.5 text-xs font-semibold" title="Toggle Language / تبديل اللغة" aria-label="Toggle language">
              <Globe size={15} />
              <span>{isArabic ? "عربي | EN" : "EN | عربي"}</span>
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10" title="Toggle Theme / تبديل المظهر" aria-label="Toggle theme">
              {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <Link
              to="/player/profile"
              className="flex items-center gap-2.5 px-2 py-1 rounded-full border border-white/10 hover:border-amber-400/40 bg-white/[.02] hover:bg-white/5 transition-all text-slate-200 no-underline"
              id="topbar-player-identity-pill"
            >
              <PlayerPortrait
                photoUrl={player.photo}
                name={player.nameEn}
                className="w-8 h-8 rounded-full border border-amber-400/50 object-cover text-xs"
              />
              <div className="hidden sm:block text-start leading-tight">
                <span className="block text-xs font-bold text-slate-100 truncate max-w-[130px]">{player.nameEn}</span>
                <span className="block text-[10px] text-slate-400 font-medium"><BilingualText value={bi("Player", "لاعب")} /></span>
              </div>
            </Link>

            <button onClick={() => setLogoutModalOpen(true)} className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors border border-white/10" title="Sign Out | تسجيل الخروج" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="athlete-content-area" id="athlete-content-area">{children}</main>

        <nav className="athlete-mobile-bottom-bar" id="athlete-mobile-bottom-nav">
          {mobilePrimaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || (tab.path === "/player/home" && location.pathname === "/player");
            return (
              <NavLink key={tab.path} to={tab.path} className={`athlete-mobile-tab ${isActive ? "active" : ""}`}>
                <Icon size={20} />
                <span className="truncate"><BilingualText value={tab.label} /></span>
              </NavLink>
            );
          })}
          <button onClick={() => setMoreDrawerOpen(true)} className={`athlete-mobile-tab ${moreDrawerOpen ? "active" : ""}`} aria-label="More navigation options">
            <Menu size={20} />
            <span><BilingualText value={bi("More", "المزيد")} /></span>
          </button>
        </nav>
      </div>
    </div>

    {mobileMenuOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
    )}

    {moreDrawerOpen && (
        <>
          <div className="athlete-drawer-overlay" onClick={() => setMoreDrawerOpen(false)} />
          <div className="athlete-drawer-sheet" id="athlete-more-drawer">
            <div className="athlete-drawer-handle" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="athlete-mini-avatar !w-8 !h-8 !text-xs">{player.nameEn.charAt(0)}</div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{player.nameEn}</h3>
                  <p className="text-[11px] text-amber-400">{sport?.name.en ?? "—"}</p>
                </div>
              </div>
              {isPreviewSession && (
                <button onClick={() => setAthleteModalOpen(true)} className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  <BilingualText value={bi("Switch Athlete", "تبديل اللاعب")} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link to="/player/attendance" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <CheckCircle2 size={18} className="text-emerald-400" /><span className="text-xs font-medium"><BilingualText value={bi("Attendance", "الحضور")} /></span>
              </Link>
              <Link to="/player/achievements" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <Trophy size={18} className="text-amber-400" /><span className="text-xs font-medium"><BilingualText value={bi("Achievements", "الإنجازات")} /></span>
              </Link>
              <Link to="/player/feedback" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <MessageSquareText size={18} className="text-blue-400" /><span className="text-xs font-medium"><BilingualText value={bi("Coach Notes", "ملاحظات المدرب")} /></span>
              </Link>
              <Link to="/player/subscription" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <CreditCard size={18} className="text-purple-400" /><span className="text-xs font-medium"><BilingualText value={bi("Membership", "العضوية")} /></span>
              </Link>
              <Link to="/player/payments" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <Receipt size={18} className="text-teal-400" /><span className="text-xs font-medium"><BilingualText value={bi("Payments", "الدفعات")} /></span>
              </Link>
              <Link to="/player/documents" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <FileText size={18} className="text-sky-400" /><span className="text-xs font-medium"><BilingualText value={bi("Documents", "المستندات")} /></span>
              </Link>
              <Link to="/player/notifications" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <Bell size={18} className="text-yellow-400" /><span className="text-xs font-medium"><BilingualText value={bi("Alerts", "الإشعارات")} /></span>
              </Link>
              <Link to="/player/profile" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <User size={18} className="text-indigo-400" /><span className="text-xs font-medium"><BilingualText value={bi("Profile", "الملف الشخصي")} /></span>
              </Link>
              <Link to="/player/settings" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200">
                <Settings size={18} className="text-slate-400" /><span className="text-xs font-medium"><BilingualText value={bi("Settings", "الإعدادات")} /></span>
              </Link>
              <button
                onClick={() => { setMoreDrawerOpen(false); setLogoutModalOpen(true); }}
                className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 text-red-400"
              >
                <LogOut size={18} /><span className="text-xs font-medium"><BilingualText value={bi("Sign Out", "تسجيل الخروج")} /></span>
              </button>
            </div>
          </div>
        </>
      )}

      {isPreviewSession && athleteModalOpen && (
        <div className="athlete-modal-overlay" onClick={() => setAthleteModalOpen(false)}>
          <div className="athlete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <BilingualText value={bi("Select Preview Athlete", "اختر لاعب المعاينة")} />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  <BilingualText value={bi("Preview switching is isolated from production authentication.", "تبديل لاعبي المعاينة معزول عن مصادقة الإنتاج.")} />
                </p>
              </div>
              <button onClick={() => setAthleteModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white" aria-label="Close athlete switcher">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              {allPlayers.map((p) => {
                const isCurrent = p.id === activePlayerId;
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActivePlayerId(p.id); setAthleteModalOpen(false); }}
                    className={`p-3.5 rounded-xl text-left rtl:text-right border transition-all flex items-center gap-3.5 ${isCurrent ? "bg-amber-400/15 border-amber-400 shadow-md shadow-amber-400/10" : "bg-white/5 border-white/10 hover:border-amber-400/40 hover:bg-white/10"}`}
                  >
                    <div className="athlete-mini-avatar !w-10 !h-10 !text-sm flex-shrink-0">{p.nameEn.charAt(0)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-slate-100 truncate block">{p.nameEn}</strong>
                        {isCurrent && <Check size={16} className="text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-amber-400 font-medium truncate mt-0.5">{p.sportId.toUpperCase()} · {p.level?.en}</p>
                      <span className="text-[10px] text-slate-400 block truncate">{p.nameAr}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button onClick={() => setAthleteModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors">
                <BilingualText value={bi("Close", "إغلاق")} />
              </button>
            </div>
          </div>
        </div>
      )}

      {logoutModalOpen && (
        <div className="athlete-modal-overlay" onClick={() => setLogoutModalOpen(false)}>
          <div className="athlete-modal-content !max-w-md text-center p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
              <LogOut size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-100"><BilingualText value={bi("Sign Out of Athlete Portal?", "تسجيل الخروج من بوابة اللاعب؟")} /></h3>
            <p className="text-xs text-slate-400 mt-2">
              <BilingualText value={isPreviewSession
                ? bi("You will return to the athlete login screen. Preview mode can be opened again from there.", "ستعود إلى شاشة تسجيل دخول اللاعب، ويمكن فتح وضع المعاينة منها مرة أخرى.")
                : bi("You will return to the athlete login screen and the current player session will be cleared.", "ستعود إلى شاشة تسجيل دخول اللاعب وسيتم مسح جلسة اللاعب الحالية.")}
              />
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setLogoutModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors">
                <BilingualText value={bi("Cancel", "إلغاء")} />
              </button>
              <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-600/20">
                <BilingualText value={bi("Sign Out", "تأكيد الخروج")} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
