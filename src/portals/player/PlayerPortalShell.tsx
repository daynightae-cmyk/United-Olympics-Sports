import React, { useState, useEffect } from "react";
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
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  Globe,
  Award,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import { usePlayerSession } from "./PlayerSessionContext";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { PlayerPortrait } from "./components/PlayerPortrait";
import { useUiSettings } from "../../ui/theme/useUiSettings";
import SafeBrandLogo from "../../components/ui/SafeBrandLogo";

interface NavItemDef {
  path: string;
  label: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number | string;
}

interface NavGroupDef {
  label: { en: string; ar: string };
  items: NavItemDef[];
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
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [athleteModalOpen, setAthleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const isArabic = bilingualOrder === "ar-first";
  const currentLang = isArabic ? "ar" : "en";

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

  // Close mobile navigation on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDrawerOpen(false);
    setNotifPopoverOpen(false);
  }, [location.pathname]);

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
              "Please sign in or select an active athlete identity to access your private portal.",
              "يرجى تسجيل الدخول أو اختيار هوية الرياضي النشط للوصول إلى البوابة الخاصة."
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

  const navGroups: NavGroupDef[] = [
    {
      label: { en: "Core Overview", ar: "الرئيسية" },
      items: [
        { path: "/player/home", label: { en: "Athlete Home", ar: "لوحة الرياضي" }, icon: Home },
        {
          path: "/player/schedule",
          label: { en: "Training Schedule", ar: "جدول التدريب" },
          icon: Calendar,
        },
      ],
    },
    {
      label: { en: "Development & Progress", ar: "التطوير والتقدم" },
      items: [
        {
          path: "/player/performance",
          label: { en: "Performance Lab", ar: "مختبر الأداء" },
          icon: Activity,
        },
        {
          path: "/player/attendance",
          label: { en: "Attendance Journey", ar: "مسيرة الحضور" },
          icon: CheckCircle2,
        },
        {
          path: "/player/achievements",
          label: { en: "Achievements & Badges", ar: "الإنجازات والأوسمة" },
          icon: Trophy,
        },
        {
          path: "/player/feedback",
          label: { en: "Coach Feedback", ar: "ملاحظات المدرب" },
          icon: MessageSquareText,
        },
      ],
    },
    {
      label: { en: "Club & Operations", ar: "النادي والعمليات" },
      items: [
        {
          path: "/player/subscription",
          label: { en: "Membership & Card", ar: "العضوية والبطاقة" },
          icon: CreditCard,
        },
        {
          path: "/player/payments",
          label: { en: "Payments & Receipts", ar: "الدفعات والإيصالات" },
          icon: Receipt,
        },
        {
          path: "/player/documents",
          label: { en: "Document Vault", ar: "خزنة المستندات" },
          icon: FileText,
        },
      ],
    },
    {
      label: { en: "Communication", ar: "التواصل" },
      items: [
        {
          path: "/player/messages",
          label: { en: "Messages Hub", ar: "مركز الرسائل" },
          icon: MessageCircle,
        },
        {
          path: "/player/notifications",
          label: { en: "Notifications", ar: "الإشعارات" },
          icon: Bell,
          badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
        },
      ],
    },
    {
      label: { en: "Account Settings", ar: "الحساب والإعدادات" },
      items: [
        {
          path: "/player/profile",
          label: { en: "Athlete Profile", ar: "الملف الرياضي" },
          icon: User,
        },
        {
          path: "/player/settings",
          label: { en: "Portal Settings", ar: "إعدادات البوابة" },
          icon: Settings,
        },
      ],
    },
  ];

  // Mobile Bottom Tabs: 4 primary + 1 more button
  const mobilePrimaryTabs = [
    { path: "/player/home", label: { en: "Home", ar: "الرئيسية" }, icon: Home },
    { path: "/player/schedule", label: { en: "Schedule", ar: "الجدول" }, icon: Calendar },
    { path: "/player/performance", label: { en: "Performance", ar: "الأداء" }, icon: Activity },
    { path: "/player/messages", label: { en: "Messages", ar: "الرسائل" }, icon: MessageCircle },
  ];

  return (
    <div className="player-shell-container" id="player-portal-shell">
      {/* DESKTOP SIDEBAR */}
      <aside
        className={`athlete-sidebar ${mobileMenuOpen ? "is-open" : ""}`}
        id="athlete-desktop-sidebar"
      >
        {/* Brand Header */}
        <div className="athlete-sidebar-header">
          <SafeBrandLogo className="athlete-sidebar-logo" />
          <div className="min-w-0">
            <h1 className="athlete-sidebar-brand-title">UNITED OLYMPICS SPORTS</h1>
            <span className="athlete-sidebar-brand-subtitle">يونايتد أوليمبيكس سبورت</span>
          </div>
          {mobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Athlete Mini Badge */}
        <div className="athlete-mini-badge" id="athlete-mini-identity">
          <PlayerPortrait name={player.nameEn} className="athlete-mini-avatar" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] truncate text-slate-100">{player.nameEn}</span>
            </div>
            <p className="text-[11px] text-amber-400/90 font-medium truncate flex items-center gap-1 mt-0.5">
              <span>{sport?.name.en || "Sports"}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-normal">{player.level?.en || "Athlete"}</span>
            </p>
          </div>
          <button
            onClick={() => setAthleteModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
            title="Switch Demo Athlete | تبديل اللاعب التجريبي"
            aria-label="Switch athlete"
          >
            <Sparkles size={16} />
          </button>
        </div>

        {/* Navigation Scroller */}
        <div className="athlete-nav-scroller">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="athlete-nav-group-label">
                <BilingualText value={group.label} />
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path === "/player/home" && location.pathname === "/player");
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`athlete-nav-item ${isActive ? "active" : ""}`}
                  >
                    <Icon size={17} />
                    <span className="truncate">
                      <BilingualText value={item.label} />
                    </span>
                    {item.badge !== undefined && (
                      <span className="athlete-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-2 px-3 text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ExternalLink size={14} />
            <span>
              <BilingualText
                value={bi(
                  "United Olympics Sports Public Site",
                  "موقع يونايتد أوليمبيكس سبورت العام"
                )}
              />
            </span>
          </Link>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN WORKSPACE */}
      <div className="athlete-workspace">
        {/* TOPBAR */}
        <header className="athlete-topbar" id="athlete-topbar">
          {/* Topbar Left: Mobile Toggle & Player Mini-Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/5 border border-white/10"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Player Mini-Identity */}
            <div
              onClick={() => setAthleteModalOpen(true)}
              className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors cursor-pointer group min-w-0"
              title="Switch athlete profile / تبديل اللاعب"
              id="topbar-player-mini-identity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-black flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md shadow-amber-400/20 flex-shrink-0 group-hover:scale-105 transition-transform ring-1 ring-amber-400/30">
                {player.nameEn.charAt(0)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                    {player.nameEn}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    <BilingualText value={sport ? sport.name : bi("Athlete", "لاعب")} />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                  <span className="font-mono text-amber-400/90 text-[10px]">
                    ID: {player.id.toUpperCase()}
                  </span>
                  <span className="text-slate-600 hidden md:inline">·</span>
                  <span className="hidden md:inline text-slate-400 text-[10px]">
                    <BilingualText value={player.level} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Athlete Switcher Pill */}
            <button
              onClick={() => setAthleteModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/30 transition-all shadow-sm"
              id="switch-athlete-topbar-btn"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>
                <BilingualText value={bi("Switch Sport / Athlete", "تبديل الرياضة / اللاعب")} />
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10 flex items-center gap-1 text-xs font-semibold"
              title="Toggle Language / تبديل اللغة"
              aria-label="Toggle language"
            >
              <Globe size={16} />
              <span className="uppercase">{currentLang === "en" ? "عربي" : "EN"}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10"
              title="Toggle Theme / تبديل المظهر"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifPopoverOpen(!notifPopoverOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-colors border border-white/10"
                aria-label="Notifications"
                id="athlete-notif-bell"
              >
                <Bell size={17} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Popover Dropdown & Backdrop */}
              {notifPopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setNotifPopoverOpen(false)}
                  />
                  <div
                    className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 athlete-glass-card z-50 p-4 border border-amber-400/30 shadow-2xl"
                    id="athlete-notifications-popover"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-amber-400" />
                        <strong className="text-sm text-slate-100">
                          <BilingualText value={bi("Athlete Alerts", "تنبيهات الرياضي")} />
                        </strong>
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-amber-400 hover:underline"
                        >
                          <BilingualText value={bi("Mark all read", "تحديد الكل كمقروء")} />
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-white/5 max-h-72 overflow-y-auto my-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationRead(notif.id)}
                          className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                            notif.isRead
                              ? "opacity-70 hover:bg-white/5"
                              : "bg-amber-400/5 hover:bg-amber-400/10"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-100">
                              <BilingualText value={notif.title} />
                            </span>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            <BilingualText value={notif.description} />
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {notif.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/player/notifications"
                      onClick={() => setNotifPopoverOpen(false)}
                      className="block text-center text-xs text-amber-400 hover:text-amber-300 font-semibold pt-2 border-t border-white/10"
                    >
                      <BilingualText value={bi("View all notifications", "عرض جميع الإشعارات")} /> →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Logout Trigger */}
            <button
              onClick={() => setLogoutModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors border border-white/10"
              title="Sign Out | تسجيل الخروج"
              aria-label="Sign out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="athlete-content-area" id="athlete-content-area">
          {children}
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="athlete-mobile-bottom-bar" id="athlete-mobile-bottom-nav">
          {mobilePrimaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              location.pathname === tab.path ||
              (tab.path === "/player/home" && location.pathname === "/player");
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={`athlete-mobile-tab ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span className="truncate">
                  <BilingualText value={tab.label} />
                </span>
              </NavLink>
            );
          })}

          {/* More Tab Trigger */}
          <button
            onClick={() => setMoreDrawerOpen(true)}
            className={`athlete-mobile-tab ${moreDrawerOpen ? "active" : ""}`}
            aria-label="More navigation options"
          >
            <Menu size={20} />
            <span>
              <BilingualText value={bi("More", "المزيد")} />
            </span>
          </button>
        </nav>
      </div>

      {/* MOBILE "MORE" DRAWER BOTTOM SHEET */}
      {moreDrawerOpen && (
        <>
          <div className="athlete-drawer-overlay" onClick={() => setMoreDrawerOpen(false)} />
          <div className="athlete-drawer-sheet" id="athlete-more-drawer">
            <div className="athlete-drawer-handle" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="athlete-mini-avatar !w-8 !h-8 !text-xs">
                  {player.nameEn.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{player.nameEn}</h3>
                  <p className="text-[11px] text-amber-400">{sport?.name.en}</p>
                </div>
              </div>
              <button
                onClick={() => setAthleteModalOpen(true)}
                className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30"
              >
                <BilingualText value={bi("Switch Sport", "تبديل الرياضة")} />
              </button>
            </div>

            {/* Grid of secondary items */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/player/attendance"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Attendance", "الحضور")} />
                </span>
              </Link>

              <Link
                to="/player/achievements"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <Trophy size={18} className="text-amber-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Achievements", "الإنجازات")} />
                </span>
              </Link>

              <Link
                to="/player/feedback"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <MessageSquareText size={18} className="text-blue-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Coach Notes", "ملاحظات المدرب")} />
                </span>
              </Link>

              <Link
                to="/player/subscription"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <CreditCard size={18} className="text-purple-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Membership", "العضوية")} />
                </span>
              </Link>

              <Link
                to="/player/payments"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <Receipt size={18} className="text-teal-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Payments", "الدفعات")} />
                </span>
              </Link>

              <Link
                to="/player/documents"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <FileText size={18} className="text-sky-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Documents", "المستندات")} />
                </span>
              </Link>

              <Link
                to="/player/notifications"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <Bell size={18} className="text-yellow-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Alerts", "الإشعارات")} />
                </span>
              </Link>

              <Link
                to="/player/profile"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <User size={18} className="text-indigo-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Profile", "الملف الشخصي")} />
                </span>
              </Link>

              <Link
                to="/player/settings"
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-slate-200"
              >
                <Settings size={18} className="text-slate-400" />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Settings", "الإعدادات")} />
                </span>
              </Link>

              <button
                onClick={() => {
                  setMoreDrawerOpen(false);
                  setLogoutModalOpen(true);
                }}
                className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center gap-3 text-red-400"
              >
                <LogOut size={18} />
                <span className="text-xs font-medium">
                  <BilingualText value={bi("Sign Out", "تسجيل الخروج")} />
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ATHLETE / SPORT SWITCHER MODAL */}
      {athleteModalOpen && (
        <div className="athlete-modal-overlay" onClick={() => setAthleteModalOpen(false)}>
          <div className="athlete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  <BilingualText
                    value={bi("Select Sport & Demo Athlete", "اختر الرياضة واللاعب التجريبي")}
                  />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  <BilingualText
                    value={bi(
                      "Switch between sports to experience truthful sport-specific metrics and schedules.",
                      "بدّل بين الرياضات لاستعراض المقاييس والجداول الخاصة بكل رياضة."
                    )}
                  />
                </p>
              </div>
              <button
                onClick={() => setAthleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
              {allPlayers.map((p) => {
                const isCurrent = p.id === activePlayerId;
                const pSport = p.sportId.toUpperCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePlayerId(p.id);
                      setAthleteModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl text-left rtl:text-right border transition-all flex items-center gap-3.5 ${
                      isCurrent
                        ? "bg-amber-400/15 border-amber-400 shadow-md shadow-amber-400/10"
                        : "bg-white/5 border-white/10 hover:border-amber-400/40 hover:bg-white/10"
                    }`}
                  >
                    <div className="athlete-mini-avatar !w-10 !h-10 !text-sm flex-shrink-0">
                      {p.nameEn.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-slate-100 truncate block">
                          {p.nameEn}
                        </strong>
                        {isCurrent && <Check size={16} className="text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-amber-400 font-medium truncate mt-0.5">
                        {pSport} · {p.level?.en}
                      </p>
                      <span className="text-[10px] text-slate-400 block truncate">{p.nameAr}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setAthleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                <BilingualText value={bi("Close", "إغلاق")} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutModalOpen && (
        <div className="athlete-modal-overlay" onClick={() => setLogoutModalOpen(false)}>
          <div
            className="athlete-modal-content !max-w-md text-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4">
              <LogOut size={26} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              <BilingualText
                value={bi("Sign Out of Athlete Portal?", "تسجيل الخروج من بوابة اللاعب؟")}
              />
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              <BilingualText
                value={bi(
                  "You will return to the athlete login screen. You can re-enter preview mode anytime.",
                  "ستعود إلى شاشة تسجيل دخول اللاعب. يمكنك العودة لوضع المعاينة في أي وقت."
                )}
              />
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                <BilingualText value={bi("Cancel", "إلغاء")} />
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg shadow-red-600/20"
              >
                <BilingualText value={bi("Sign Out", "تأكيد الخروج")} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
