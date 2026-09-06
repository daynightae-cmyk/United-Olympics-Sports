/**
 * United Olympics Sports — Shared Portal Layout Primitives (Mission 00.13).
 *
 * Provides responsive, accessible, unified structural foundations for all portals:
 * - PortalAppShell
 * - PortalSidebar
 * - PortalTopbar
 * - PortalMobileHeader
 * - PortalBottomNav
 * - PortalPageHeader
 * - PortalSectionHeader
 * - PortalContentGrid
 * - PortalActionBar
 * - PortalNotificationBadge
 * - PortalUserMenu
 */
import {
  useState,
  type ReactNode,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  User,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue, ProductPortal } from '../../domain/contracts';
import { SafeBrandLogo } from '../ui/SafeBrandLogo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageOrderToggle } from '../ui/LanguageOrderToggle';

export interface PortalNavItem {
  id: string;
  path: string;
  label: BilingualValue;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
  exact?: boolean;
}

export interface PortalUserSession {
  name: BilingualValue;
  roleTitle: BilingualValue;
  avatarUrl?: string;
  email?: string;
  portal: ProductPortal;
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. PORTAL PAGE HEADER & SECTION HEADER
───────────────────────────────────────────────────────────────────────────── */
export function PortalPageHeader({
  title,
  subtitle,
  kicker,
  actions,
  badge,
  className = '',
}: {
  title: BilingualValue;
  subtitle?: BilingualValue;
  kicker?: BilingualValue;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`uos-portal-page-header ${className}`.trim()}>
      <div className="uos-portal-page-header-content">
        {kicker && (
          <span className="uos-kicker text-gold">
            <BilingualText value={kicker} />
          </span>
        )}
        <div className="uos-portal-page-title-row">
          <h1 className="uos-portal-page-title">
            <BilingualText value={title} />
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="uos-portal-page-subtitle">
            <BilingualText value={subtitle} />
          </p>
        )}
      </div>
      {actions && <div className="uos-portal-page-actions">{actions}</div>}
    </header>
  );
}

export function PortalSectionHeader({
  title,
  description,
  actions,
  className = '',
}: {
  title: BilingualValue;
  description?: BilingualValue;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`uos-portal-section-header ${className}`.trim()}>
      <div>
        <h2 className="uos-portal-section-title">
          <BilingualText value={title} />
        </h2>
        {description && (
          <p className="uos-portal-section-desc">
            <BilingualText value={description} />
          </p>
        )}
      </div>
      {actions && <div className="uos-portal-section-actions">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. PORTAL CONTENT GRID & ACTION BAR
───────────────────────────────────────────────────────────────────────────── */
export function PortalContentGrid({
  columns = 3,
  children,
  className = '',
}: {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`uos-portal-grid uos-portal-grid--cols-${columns} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function PortalActionBar({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`uos-portal-action-bar uos-glass-4 uos-dock-bottom ${className}`.trim()}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. PORTAL NOTIFICATION BADGE & USER MENU
───────────────────────────────────────────────────────────────────────────── */
export function PortalNotificationBadge({
  count = 0,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="uos-icon-btn uos-touch"
      onClick={onClick}
      aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''} | الإشعارات`}
    >
      <Bell size={18} />
      {count > 0 && <span className="uos-badge-pill">{count > 99 ? '99+' : count}</span>}
    </button>
  );
}

export function PortalUserMenu({
  user,
  onLogout,
}: {
  user: PortalUserSession;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="uos-user-menu-wrap">
      <button
        type="button"
        className="uos-user-menu-trigger uos-touch"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="uos-user-avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" />
          ) : (
            <User size={16} />
          )}
        </div>
        <div className="uos-user-info-text">
          <strong className="uos-user-name">
            <BilingualText value={user.name} />
          </strong>
          <small className="uos-user-role">
            <BilingualText value={user.roleTitle} />
          </small>
        </div>
        <ChevronDown size={14} className={`uos-menu-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <div className="uos-user-menu-dropdown uos-glass-4" role="menu">
          <div className="uos-user-menu-profile">
            <p className="uos-user-menu-head-name">
              <BilingualText value={user.name} />
            </p>
            {user.email && <span className="uos-user-menu-email">{user.email}</span>}
            <span className="uos-user-portal-tag">
              <Shield size={12} />
              {user.portal.toUpperCase()} PORTAL
            </span>
          </div>

          <div className="uos-user-menu-divider" />

          <Link
            to="/"
            className="uos-user-menu-item"
            onClick={() => setOpen(false)}
          >
            <ExternalLink size={15} />
            <BilingualText value={bi('United Olympics Sports Public Site', 'موقع يونايتد أوليمبيكس العام')} />
          </Link>

          <div className="uos-user-menu-divider" />

          <button
            type="button"
            className="uos-user-menu-item item--danger"
            onClick={() => {
              setOpen(false);
              onLogout?.();
            }}
          >
            <LogOut size={15} />
            <BilingualText value={bi('Sign Out', 'تسجيل الخروج')} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. PORTAL SIDEBAR & TOPBAR
───────────────────────────────────────────────────────────────────────────── */
export function PortalSidebar({
  portalTitle,
  navItems,
  user,
  onLogout,
  collapsed = false,
  onToggleCollapse,
}: {
  portalTitle: BilingualValue;
  navItems: PortalNavItem[];
  user?: PortalUserSession;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const location = useLocation();

  return (
    <aside className={`uos-portal-sidebar uos-glass-3 ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="uos-portal-sidebar-head">
        <Link to="/" className="uos-portal-sidebar-logo" aria-label="United Olympics Sports">
          <SafeBrandLogo size="sm" />
        </Link>
        <div className="uos-portal-badge-wrap">
          <span className="uos-portal-badge">
            <BilingualText value={portalTitle} />
          </span>
        </div>
      </div>

      <nav className="uos-portal-sidebar-nav" aria-label="Portal Navigation | ملاحة البوابة">
        <ul className="uos-portal-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`uos-portal-nav-link ${isActive ? 'is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="uos-nav-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="uos-nav-label">
                    <BilingualText value={item.label} />
                  </span>
                  {item.badge !== undefined && (
                    <span className="uos-nav-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="uos-portal-sidebar-foot">
        <div className="uos-sidebar-settings-row">
          <ThemeToggle />
          <LanguageOrderToggle />
        </div>
        {user && <PortalUserMenu user={user} onLogout={onLogout} />}
      </div>
    </aside>
  );
}

export function PortalTopbar({
  portalTitle,
  user,
  onLogout,
  onOpenMobileNav,
  actions,
}: {
  portalTitle: BilingualValue;
  user?: PortalUserSession;
  onLogout?: () => void;
  onOpenMobileNav?: () => void;
  actions?: ReactNode;
}) {
  return (
    <header className="uos-portal-topbar uos-glass-3 uos-safe-top">
      <div className="uos-portal-topbar-start">
        {onOpenMobileNav && (
          <button
            type="button"
            className="uos-mobile-nav-toggle uos-touch"
            onClick={onOpenMobileNav}
            aria-label="Toggle menu | فتح القائمة"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="uos-topbar-portal-indicator">
          <span className="uos-kicker text-gold">UNITED OLYMPICS</span>
          <strong className="uos-topbar-title">
            <BilingualText value={portalTitle} />
          </strong>
        </div>
      </div>

      <div className="uos-portal-topbar-end">
        {actions}
        <ThemeToggle />
        <LanguageOrderToggle />
        {user && <PortalUserMenu user={user} onLogout={onLogout} />}
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. MOBILE BOTTOM NAV
───────────────────────────────────────────────────────────────────────────── */
export function PortalBottomNav({
  items,
}: {
  items: PortalNavItem[];
}) {
  const location = useLocation();
  const primaryItems = items.slice(0, 5);

  return (
    <nav className="uos-portal-bottom-nav uos-glass-4 uos-safe-bottom" aria-label="Mobile navigation">
      <div className="uos-portal-bottom-nav-grid">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`uos-bottom-nav-item ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="uos-bottom-nav-icon">
                <Icon size={18} />
                {item.badge !== undefined && <span className="uos-dot-badge" />}
              </span>
              <span className="uos-bottom-nav-label">
                <BilingualText value={item.label} />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. PORTAL APP SHELL (Unified outer shell)
───────────────────────────────────────────────────────────────────────────── */
export function PortalAppShell({
  portal,
  portalTitle,
  navItems,
  user,
  onLogout,
  topbarActions,
  children,
}: {
  portal: ProductPortal;
  portalTitle: BilingualValue;
  navItems: PortalNavItem[];
  user?: PortalUserSession;
  onLogout?: () => void;
  topbarActions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={`uos-portal-app-shell portal--${portal}`}>
      <PortalSidebar
        portalTitle={portalTitle}
        navItems={navItems}
        user={user}
        onLogout={onLogout}
      />

      {mobileNavOpen && (
        <div className="uos-mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)}>
          <aside className="uos-mobile-nav-drawer uos-glass-4" onClick={(e) => e.stopPropagation()}>
            <div className="uos-mobile-nav-head">
              <SafeBrandLogo size="sm" />
              <button
                type="button"
                className="uos-btn-ghost uos-touch"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <ul className="uos-mobile-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className="uos-mobile-nav-link"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Icon size={18} />
                      <BilingualText value={item.label} />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="uos-mobile-nav-foot">
              <ThemeToggle />
              <LanguageOrderToggle />
            </div>
          </aside>
        </div>
      )}

      <div className="uos-portal-main-area">
        <PortalTopbar
          portalTitle={portalTitle}
          user={user}
          onLogout={onLogout}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          actions={topbarActions}
        />
        <main className="uos-portal-main-content uos-safe-x uos-safe-bottom">
          {children}
        </main>
        <PortalBottomNav items={navItems} />
      </div>
    </div>
  );
}
