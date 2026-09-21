/**
 * United Olympics Sports — SPARK Premium Accessories
 * Reusable component library for the premium experience layer.
 *
 * Components:
 * - SparkIconCapsule: illuminated icon container
 * - SparkChip: status/tag chip system
 * - SparkBreadcrumbs: accessible breadcrumb navigation
 * - SparkContextBar: unified page context bar
 * - SparkBack: premium back button
 * - SparkSectionDivider: labeled section separator
 * - SparkProgressRail: thin progress bar
 * - SparkUnsavedBar: sticky unsaved-changes indicator
 * - SparkFilterPill: removable filter tag
 * - SparkFilterBar: container for filter chips
 * - SparkKbd: keyboard shortcut chip
 * - SparkStepper: multi-step form indicator
 * - SparkEmptyState: premium empty state
 * - SparkPageHero: compact operational page header
 * - SparkVerified: verified/ready marker
 * - SparkNewIndicator: new/updated badge
 * - SparkMetricCard: KPI metric card
 * - SparkFormSection: grouped form section card
 * - SparkTooltipWrap: smart tooltip
 * - SparkSkeletonLine / SparkSkeletonRect: enhanced skeleton
 * - SparkNotifBadge: notification counter badge
 */

import {
  type ReactNode,
  type ComponentType,
  useRef,
  useCallback,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../domain/contracts';

// ─────────────────────────────────────────────────────────────────────────────
//  Icon Capsule
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkIconCapsuleProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gold';
  className?: string;
}
export function SparkIconCapsule({
  icon: Icon,
  size = 'md',
  variant = 'default',
  className = '',
}: SparkIconCapsuleProps) {
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 24 : 19;
  return (
    <span
      aria-hidden="true"
      className={`spark-icon-capsule ${size !== 'md' ? size : ''} ${variant !== 'default' ? variant : ''} ${className}`.trim()}
    >
      <Icon size={iconSize} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Status Chip
// ─────────────────────────────────────────────────────────────────────────────
export type SparkChipTone =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'warning'
  | 'error'
  | 'danger'
  | 'info'
  | 'brand'
  | 'gold';

export interface SparkChipProps {
  tone?: SparkChipTone;
  label: BilingualValue;
  dot?: boolean;
  className?: string;
}
export function SparkChip({ tone = 'info', label, dot = true, className = '' }: SparkChipProps) {
  return (
    <span className={`spark-chip spark-chip-${tone} ${className}`.trim()}>
      {dot && <span className="spark-chip-dot" aria-hidden="true" />}
      <BilingualText value={label} />
    </span>
  );
}

// Convenience shorthand chips for common statuses
export const SparkChipActive = () => (
  <SparkChip tone="active" label={bi('Active', 'نشط')} />
);
export const SparkChipInactive = () => (
  <SparkChip tone="inactive" label={bi('Inactive', 'غير نشط')} />
);
export const SparkChipPending = () => (
  <SparkChip tone="pending" label={bi('Pending', 'قيد الانتظار')} />
);

// ─────────────────────────────────────────────────────────────────────────────
//  Breadcrumbs
// ─────────────────────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label: BilingualValue;
  href?: string;
  onClick?: () => void;
}
export interface SparkBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}
export function SparkBreadcrumbs({ items, className = '' }: SparkBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb | مسار التنقل"
      className={`spark-breadcrumbs ${className}`.trim()}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const key = `bc-${idx}`;
        const isExternal = item.href ? /^https?:\/\//.test(item.href) : false;
        return (
          <span key={key} style={{ display: 'contents' }}>
            {idx > 0 && (
              <span className="spark-breadcrumb-sep" aria-hidden="true" />
            )}
            {isLast ? (
              <span className="current" aria-current="page">
                <BilingualText value={item.label} />
              </span>
            ) : item.href ? (
              isExternal ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  <BilingualText value={item.label} />
                </a>
              ) : (
                <Link to={item.href}>
                  <BilingualText value={item.label} />
                </Link>
              )
            ) : (
              <button type="button" onClick={item.onClick}>
                <BilingualText value={item.label} />
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Back Button
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkBackProps {
  label?: BilingualValue;
  onClick?: () => void;
  href?: string;
  className?: string;
}
export function SparkBack({
  label = bi('Back', 'رجوع'),
  onClick,
  href,
  className = '',
}: SparkBackProps) {
  const navigate = useNavigate();
  const isExternal = href ? /^https?:\/\//.test(href) : false;
  const ariaText = typeof label === 'object' ? `${label.en} | ${label.ar}` : label;

  if (href) {
    if (isExternal) {
      return (
        <a href={href} className={`spark-back ${className}`.trim()} aria-label={ariaText}>
          <ChevronLeft size={16} aria-hidden="true" />
          <BilingualText value={label} />
        </a>
      );
    }
    return (
      <Link to={href} className={`spark-back ${className}`.trim()} aria-label={ariaText}>
        <ChevronLeft size={16} aria-hidden="true" />
        <BilingualText value={label} />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick ?? (() => navigate(-1))}
      className={`spark-back ${className}`.trim()}
      aria-label={ariaText}
    >
      <ChevronLeft size={16} aria-hidden="true" />
      <BilingualText value={label} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Context Bar
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkContextBarProps {
  back?: SparkBackProps;
  breadcrumbs?: BreadcrumbItem[];
  title?: BilingualValue;
  end?: ReactNode;
  className?: string;
  children?: ReactNode;
}
export function SparkContextBar({
  back,
  breadcrumbs,
  title,
  end,
  className = '',
  children,
}: SparkContextBarProps) {
  return (
    <div className={`spark-context-bar ${className}`.trim()}>
      {back && <SparkBack {...back} />}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <SparkBreadcrumbs items={breadcrumbs} />
      )}
      {title && (
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            color: 'var(--color-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minWidth: 0,
          }}
        >
          <BilingualText value={title} />
        </span>
      )}
      {children}
      {end && <div className="spark-context-bar-end">{end}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Section Divider
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkSectionDividerProps {
  label: BilingualValue;
  icon?: ComponentType<{ size?: number }>;
  className?: string;
}
export function SparkSectionDivider({ label, icon: Icon, className = '' }: SparkSectionDividerProps) {
  return (
    <div className={`spark-section-divider ${className}`.trim()}>
      <div className="spark-section-divider-line" />
      <div className="spark-section-divider-label">
        {Icon && <Icon size={14} />}
        <BilingualText value={label} />
      </div>
      <div className="spark-section-divider-line" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Progress Rail
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkProgressRailProps {
  value: number;   // 0–100
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}
export function SparkProgressRail({ value, size = 'md', label, className = '' }: SparkProgressRailProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`spark-rail ${size !== 'md' ? size : ''} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="spark-rail-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Unsaved Changes Bar
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkUnsavedBarProps {
  visible: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
  saving?: boolean;
  className?: string;
}
export function SparkUnsavedBar({ visible, onSave, onDiscard, saving = false, className = '' }: SparkUnsavedBarProps) {
  if (!visible) return null;
  return (
    <div className={`spark-unsaved-bar ${className}`.trim()} role="status" aria-live="polite">
      <div className="spark-unsaved-label">
        <span className="spark-unsaved-dot" aria-hidden="true" />
        <BilingualText value={bi('Unsaved changes', 'تغييرات غير محفوظة')} />
      </div>
      <div className="spark-unsaved-actions">
        {onDiscard && (
          <button
            type="button"
            className="ui-button ui-button-ghost ui-button-size-sm"
            onClick={onDiscard}
            disabled={saving}
          >
            <BilingualText value={bi('Discard', 'تجاهل')} />
          </button>
        )}
        {onSave && (
          <button
            type="button"
            className="ui-button ui-button-primary ui-button-size-sm"
            onClick={onSave}
            disabled={saving}
            aria-busy={saving}
          >
            <BilingualText value={saving ? bi('Saving…', 'جاري الحفظ…') : bi('Save', 'حفظ')} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Filter Pill
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkFilterPillProps {
  label: BilingualValue;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}
export function SparkFilterPill({ label, active, onRemove, onClick, className = '' }: SparkFilterPillProps) {
  return (
    <span className={`spark-filter-pill-wrap ${active ? 'active' : ''} ${className}`.trim()}>
      <button
        type="button"
        onClick={onClick}
        className={`spark-filter-pill ${active ? 'active' : ''}`}
        aria-pressed={active}
      >
        <BilingualText value={label} />
      </button>
      {onRemove && (
        <button
          type="button"
          className="spark-filter-pill-remove"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove filter: ${typeof label === 'object' ? label.en : label} | إزالة الفلتر`}
        >
          <X size={11} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Filter Bar
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkFilterBarProps {
  onReset?: () => void;
  children: ReactNode;
  className?: string;
}
export function SparkFilterBar({ onReset, children, className = '' }: SparkFilterBarProps) {
  return (
    <div className={`spark-filter-bar ${className}`.trim()} role="group" aria-label="Active filters | الفلاتر النشطة">
      {children}
      {onReset && (
        <button type="button" className="spark-filter-reset" onClick={onReset}>
          <X size={13} aria-hidden="true" />
          <BilingualText value={bi('Clear', 'مسح')} />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Keyboard Hint Chip
// ─────────────────────────────────────────────────────────────────────────────
export function SparkKbd({ children }: { children: ReactNode }) {
  return <kbd className="spark-kbd">{children}</kbd>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Step Indicator
// ─────────────────────────────────────────────────────────────────────────────
export type SparkStepStatus = 'done' | 'active' | 'future' | 'error';
export interface SparkStep {
  label: BilingualValue;
  status: SparkStepStatus;
}
export interface SparkStepperProps {
  steps: SparkStep[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}
export function SparkStepper({ steps, orientation = 'horizontal', className = '' }: SparkStepperProps) {
  return (
    <nav
      aria-label="Progress | التقدم"
      className={`spark-stepper ${orientation === 'vertical' ? 'vertical' : ''} ${className}`.trim()}
    >
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div
            key={idx}
            className={`spark-step ${step.status}`}
            aria-current={step.status === 'active' ? 'step' : undefined}
          >
            {orientation === 'horizontal' && idx > 0 && (
              <div className="spark-step-connector" aria-hidden="true" />
            )}
            <div className="spark-step-node" aria-hidden="true">
              {step.status === 'done' ? (
                <CheckCircle2 size={16} />
              ) : step.status === 'error' ? (
                <AlertCircle size={16} />
              ) : (
                idx + 1
              )}
            </div>
            <div className="spark-step-label">
              <BilingualText value={step.label} />
            </div>
            {orientation === 'vertical' && !isLast && (
              <div className="spark-step-connector" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Empty State
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkEmptyStateProps {
  icon?: ComponentType<{ size?: number; className?: string }>;
  title: BilingualValue;
  description?: BilingualValue;
  action?: ReactNode;
  className?: string;
}
export function SparkEmptyState({ icon: Icon, title, description, action, className = '' }: SparkEmptyStateProps) {
  return (
    <div className={`spark-empty ${className}`.trim()} role="status">
      {Icon && (
        <div className="spark-empty-icon" aria-hidden="true">
          <Icon size={28} />
        </div>
      )}
      <p className="spark-empty-title">
        <BilingualText value={title} />
      </p>
      {description && (
        <p className="spark-empty-description">
          <BilingualText value={description} />
        </p>
      )}
      {action && <div className="spark-empty-action">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Page Hero (compact operational)
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkPageHeroProps {
  title: BilingualValue;
  description?: BilingualValue;
  actions?: ReactNode;
  meta?: Array<{
    icon?: ComponentType<{ size?: number }>;
    label: BilingualValue;
    value: BilingualValue;
  }>;
  className?: string;
}
export function SparkPageHero({ title, description, actions, meta, className = '' }: SparkPageHeroProps) {
  return (
    <div className={`spark-page-hero ${className}`.trim()}>
      <h1 className="spark-page-hero-title">
        <BilingualText value={title} />
      </h1>
      {description && (
        <p className="spark-page-hero-description">
          <BilingualText value={description} />
        </p>
      )}
      {meta && meta.length > 0 && (
        <div className="spark-page-hero-meta">
          {meta.map(({ icon: Icon, label, value }, idx) => (
            <span key={idx} className="spark-page-hero-meta-item">
              {Icon && <Icon size={14} aria-hidden="true" />}
              <BilingualText value={label} />
              <strong><BilingualText value={value} /></strong>
            </span>
          ))}
        </div>
      )}
      {actions && <div className="spark-page-hero-actions">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Verified Marker
// ─────────────────────────────────────────────────────────────────────────────
export function SparkVerified({ label = bi('Verified', 'موثق') }: { label?: BilingualValue }) {
  return (
    <span className="spark-verified">
      <CheckCircle2 size={13} aria-hidden="true" />
      <BilingualText value={label} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  New / Updated Badge
// ─────────────────────────────────────────────────────────────────────────────
export function SparkNewIndicator({ label = bi('New', 'جديد') }: { label?: BilingualValue }) {
  return (
    <span className="spark-new-indicator">
      <BilingualText value={label} />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Metric Card
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkMetricCardProps {
  value: string | number;
  label: BilingualValue;
  delta?: { value: string; direction: 'up' | 'down' | 'neutral' };
  icon?: ComponentType<{ size?: number }>;
  className?: string;
}
export function SparkMetricCard({ value, label, delta, icon: Icon, className = '' }: SparkMetricCardProps) {
  return (
    <div className={`spark-card spark-metric-card ${className}`.trim()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {Icon && <SparkIconCapsule icon={Icon} size="md" />}
        {delta && delta.direction !== 'neutral' && (
          <span className={`spark-metric-delta ${delta.direction}`}>
            {delta.direction === 'up' ? (
              <TrendingUp size={12} aria-hidden="true" />
            ) : (
              <TrendingDown size={12} aria-hidden="true" />
            )}
            {delta.value}
          </span>
        )}
      </div>
      <div className="spark-metric-value" aria-label={typeof label === 'object' ? `${label.en} | ${label.ar}` : label}>
        {value}
      </div>
      <div className="spark-metric-label">
        <BilingualText value={label} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Form Section Card
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkFormSectionProps {
  id?: string;
  icon?: ComponentType<{ size?: number }>;
  title: BilingualValue;
  helper?: BilingualValue;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}
export function SparkFormSection({ id, icon: Icon, title, helper, children, actions, className = '' }: SparkFormSectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      className={`spark-form-section ${className}`.trim()}
      aria-labelledby={headingId}
    >
      <div className="spark-form-section-header">
        {Icon && <SparkIconCapsule icon={Icon} size="md" />}
        <div className="spark-form-section-title">
          <h2 id={headingId} style={{ margin: 0, fontSize: 'inherit', fontWeight: 800 }}>
            <BilingualText value={title} />
          </h2>
          {helper && (
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
              <BilingualText value={helper} />
            </p>
          )}
        </div>
        {actions && <div style={{ marginInlineStart: 'auto' }}>{actions}</div>}
      </div>
      <div className="spark-form-section-body">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tooltip Wrap
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkTooltipWrapProps {
  label: BilingualValue;
  children: ReactNode;
  className?: string;
}
export function SparkTooltipWrap({ label, children, className = '' }: SparkTooltipWrapProps) {
  return (
    <div className={`spark-tooltip-wrap ${className}`.trim()}>
      {children}
      <span className="spark-tooltip" role="tooltip">
        <BilingualText value={label} />
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Skeleton components
// ─────────────────────────────────────────────────────────────────────────────
export function SparkSkeletonLine({ width = '100%', short }: { width?: string; short?: boolean }) {
  return (
    <div
      className={`spark-skeleton-line ${short ? 'short' : ''}`.trim()}
      style={{ width }}
      aria-hidden="true"
    />
  );
}
export function SparkSkeletonRect({ height = 80, radius = 14 }: { height?: number; radius?: number }) {
  return (
    <div
      className="spark-skeleton-rect"
      style={{ height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
export function SparkSkeletonCard() {
  return (
    <div className="spark-skeleton" style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--uos-radius-lg, 18px)', background: 'var(--color-surface-1)' }} aria-busy="true">
      <SparkSkeletonRect height={40} radius={10} />
      <SparkSkeletonLine width="65%" />
      <SparkSkeletonLine width="85%" />
      <SparkSkeletonLine short />
    </div>
  );
}
export function SparkSkeletonTableRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }} aria-hidden="true">
      <SparkSkeletonLine width="80%" />
      <SparkSkeletonLine width="60%" />
      <SparkSkeletonLine width="50%" />
      <SparkSkeletonLine width="40%" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Notification Badge
// ─────────────────────────────────────────────────────────────────────────────
export function SparkNotifBadge({ count, label }: { count: number; label?: BilingualValue }) {
  if (count <= 0) return null;
  const defaultLabel = bi(`${count} unread notifications`, `${count} إشعارات غير مقروءة`);
  const ariaText = typeof label === 'object' ? `${label.en} | ${label.ar}` : label ?? `${defaultLabel.en} | ${defaultLabel.ar}`;
  return (
    <span className="spark-notif-badge" aria-label={ariaText}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Interactive Card with hover-light (pointer tracking)
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkCardProps {
  interactive?: boolean;
  hoverLight?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  to?: string;
}
export function SparkCard({
  interactive = false,
  hoverLight = false,
  className = '',
  children,
  onClick,
  to,
}: SparkCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoverLight || !ref.current) return;
    if (typeof window !== 'undefined') {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    }
    const clientX = e.clientX;
    const clientY = e.clientY;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      ref.current.style.setProperty('--spark-mx', `${x}%`);
      ref.current.style.setProperty('--spark-my', `${y}%`);
    });
  }, [hoverLight]);

  const handleMouseLeave = useCallback(() => {
    if (!hoverLight || !ref.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    ref.current.style.setProperty('--spark-mx', '50%');
    ref.current.style.setProperty('--spark-my', '50%');
  }, [hoverLight]);

  const isClickable = Boolean(onClick || to);
  const isInteractive = interactive || isClickable;
  const cardClasses = `spark-card ${isInteractive ? 'spark-card-interactive' : ''} ${hoverLight ? 'spark-card-light' : ''} ${className}`.trim();

  if (to) {
    return (
      <Link
        to={to}
        className={cardClasses}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={cardClasses}
        onClick={onClick}
        style={{ width: '100%', textAlign: 'start', font: 'inherit', color: 'inherit', background: 'var(--color-surface-1)' }}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClasses}
      onMouseMove={hoverLight ? handleMouseMove : undefined}
      onMouseLeave={hoverLight ? handleMouseLeave : undefined}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Drawer Handle (mobile)
// ─────────────────────────────────────────────────────────────────────────────
export function SparkDrawerHandle({ className = '' }: { className?: string }) {
  return <div className={`spark-drawer-handle ${className}`.trim()} aria-hidden="true" />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Action Cluster
// ─────────────────────────────────────────────────────────────────────────────
export interface SparkActionProps {
  label: BilingualValue;
  onClick?: () => void;
  href?: string;
  icon?: ComponentType<{ size?: number }>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
export function SparkAction({ label, onClick, href, icon: Icon, variant = 'secondary', disabled, type = 'button' }: SparkActionProps) {
  const cls = `spark-action-${variant}`;
  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
          {Icon && <Icon size={15} />}
          <BilingualText value={label} />
        </a>
      );
    }
    return (
      <Link to={href} className={cls}>
        {Icon && <Icon size={15} />}
        <BilingualText value={label} />
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {Icon && <Icon size={15} />}
      <BilingualText value={label} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Quick Action Cluster (wrapping container)
// ─────────────────────────────────────────────────────────────────────────────
export function SparkActionCluster({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`spark-action-cluster ${className}`.trim()}>{children}</div>;
}
