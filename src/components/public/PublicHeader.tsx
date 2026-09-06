import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Languages,
  LogIn,
  Menu,
  Shield,
  ShoppingBag,
  User,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { PORTAL_LINKS } from '../../data/public/publicContent';
import type { LocalizedText, PublicLocale } from '../../data/public/publicMedia';

export interface PublicHeaderProps {
  locale: PublicLocale;
  onToggleLocale: () => void;
  className?: string;
}

export const PUBLIC_NAV_ITEMS = [
  { path: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { path: '/about', label: { ar: 'من نحن', en: 'About' } },
  { path: '/sports', label: { ar: 'الرياضات', en: 'Sports' } },
  { path: '/programs', label: { ar: 'البرامج', en: 'Programs' } },
  { path: '/philosophy', label: { ar: 'فلسفة التدريب', en: 'Philosophy' } },
  { path: '/contact', label: { ar: 'تواصل معنا', en: 'Contact' } },
] as const;

const PORTAL_ICONS: Record<string, typeof User> = {
  '/player/login': User,
  '/parent/login': Users,
  '/coach/login': UserCheck,
  '/store/login': ShoppingBag,
  '/admin/login': Shield,
};

export function PublicHeader({ locale, onToggleLocale, className = '' }: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalDropdownOpen, setIsPortalDropdownOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isRtl = locale === 'ar';

  // Handle scroll state for header transparency / shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and portal dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPortalDropdownOpen(false);
  }, [location.pathname]);

  // Handle click outside portal dropdown
  useEffect(() => {
    if (!isPortalDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        portalDropdownRef.current &&
        !portalDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPortalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPortalDropdownOpen]);

  // Handle accessible focus trap & Escape key on drawer
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a, button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const initialFocusTimer = setTimeout(() => {
      focusable()[0]?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(initialFocusTimer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      id="uos-public-header"
      className={`uos-site-header ${isScrolled ? 'is-scrolled' : ''} ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="uos-header-inner">
        {/* Brand Identity */}
        <Link
          id="uos-header-brand"
          className="uos-brand"
          to="/"
          aria-label="United Olympics Sports | يونايتد أوليمبيكس سبورت"
        >
          <img
            src="/brand/united-olympics-sports-logo.png"
            alt="United Olympics Sports"
            width={52}
            height={52}
            className="uos-brand-logo"
            loading="eager"
          />
          <span className="uos-brand-text">
            <strong className="uos-brand-en">United Olympics Sports</strong>
            <small className="uos-brand-ar">يونايتد أوليمبيكس سبورت</small>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          id="uos-desktop-navigation"
          className="uos-desktop-nav"
          aria-label={isRtl ? 'التنقل الرئيسي' : 'Primary navigation'}
        >
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isPhilosophyActive =
              item.path === '/philosophy' &&
              (location.pathname === '/philosophy' || location.pathname === '/coaches');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `uos-nav-link ${isActive || isPhilosophyActive ? 'active' : ''}`
                }
              >
                {item.label[locale]}
              </NavLink>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div id="uos-header-action-group" className="uos-header-actions">
          {/* Language Toggle Button */}
          <button
            id="uos-language-toggle-btn"
            className="uos-language"
            type="button"
            onClick={onToggleLocale}
            aria-label={
              isRtl ? 'Switch interface to English' : 'التبديل إلى الواجهة العربية'
            }
            title={isRtl ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Languages aria-hidden="true" className="w-4 h-4" />
            <span className="font-bold tracking-wider">{isRtl ? 'EN' : 'ع'}</span>
          </button>

          {/* Portal Access Dropdown */}
          <div
            id="uos-portal-access-container"
            ref={portalDropdownRef}
            className="uos-login-menu relative"
          >
            <button
              id="uos-portal-access-trigger"
              type="button"
              onClick={() => setIsPortalDropdownOpen((prev) => !prev)}
              aria-expanded={isPortalDropdownOpen}
              aria-haspopup="true"
              aria-controls="uos-portal-dropdown-menu"
              className="uos-portal-trigger-button"
            >
              <LogIn aria-hidden="true" className="w-4 h-4" />
              <span>{isRtl ? 'دخول البوابات' : 'Portals Access'}</span>
              <ChevronDown
                aria-hidden="true"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isPortalDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isPortalDropdownOpen && (
              <div
                id="uos-portal-dropdown-menu"
                className="uos-portal-dropdown-panel"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="uos-portal-dropdown-header">
                  <span>{isRtl ? 'بوابات النظام الرياضي' : 'System Portals'}</span>
                </div>
                <div className="uos-portal-links-grid">
                  {PORTAL_LINKS.map((portal) => {
                    const IconComponent = PORTAL_ICONS[portal.path] || User;
                    return (
                      <Link
                        key={portal.path}
                        to={portal.path}
                        role="menuitem"
                        className="uos-portal-item-link"
                        onClick={() => setIsPortalDropdownOpen(false)}
                      >
                        <div className="uos-portal-item-info">
                          <IconComponent aria-hidden="true" className="w-4 h-4 text-[#b9954e]" />
                          <span>{portal.label[locale]}</span>
                        </div>
                        <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            id="uos-mobile-menu-trigger"
            ref={menuButtonRef}
            className="uos-menu-trigger"
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="uos-mobile-drawer"
            aria-label={isRtl ? 'فتح القائمة الرئيسية' : 'Open main menu'}
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        id="uos-drawer-backdrop-overlay"
        className={`uos-drawer-backdrop ${isMobileMenuOpen ? 'is-open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile Off-Canvas Drawer */}
      <div
        ref={drawerRef}
        id="uos-mobile-drawer"
        className={`uos-mobile-drawer ${isMobileMenuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={isRtl ? 'قائمة التنقل' : 'Navigation menu'}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Drawer Header */}
        <div className="uos-drawer-head">
          <Link
            to="/"
            className="uos-brand is-compact"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src="/brand/united-olympics-sports-logo.png"
              alt="United Olympics Sports"
              width={44}
              height={44}
              loading="lazy"
            />
            <span className="uos-brand-text">
              <strong className="uos-brand-en text-xs">United Olympics Sports</strong>
              <small className="uos-brand-ar text-[9px]">يونايتد أوليمبيكس سبورت</small>
            </span>
          </Link>
          <button
            id="uos-close-drawer-btn"
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={isRtl ? 'إغلاق القائمة' : 'Close menu'}
            className="uos-drawer-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav
          className="uos-drawer-nav"
          aria-label={isRtl ? 'روابط القائمة' : 'Mobile links'}
        >
          {PUBLIC_NAV_ITEMS.map((item) => {
            const isPhilosophyActive =
              item.path === '/philosophy' &&
              (location.pathname === '/philosophy' || location.pathname === '/coaches');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `uos-drawer-nav-item ${isActive || isPhilosophyActive ? 'active' : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{item.label[locale]}</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 rtl:rotate-180" />
              </NavLink>
            );
          })}
        </nav>

        {/* Portals Section */}
        <div className="uos-drawer-portals">
          <span className="uos-drawer-section-heading">
            {isRtl ? 'بوابات المنصة الرسمية' : 'Official Portals'}
          </span>
          <div className="uos-drawer-portals-grid">
            {PORTAL_LINKS.map((portal) => {
              const IconComponent = PORTAL_ICONS[portal.path] || User;
              return (
                <Link
                  key={portal.path}
                  to={portal.path}
                  className="uos-drawer-portal-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className="w-4 h-4 text-[#b9954e]" />
                    <span>{portal.label[locale]}</span>
                  </div>
                  <ArrowRight aria-hidden="true" className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Language Switcher in Mobile Drawer */}
        <div className="uos-drawer-footer">
          <button
            id="uos-drawer-language-btn"
            className="uos-drawer-language"
            type="button"
            onClick={() => {
              onToggleLocale();
              setIsMobileMenuOpen(false);
            }}
          >
            <Globe aria-hidden="true" className="w-4 h-4 text-[#b9954e]" />
            <span>{isRtl ? 'Switch to English' : 'التبديل إلى العربية'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default PublicHeader;
