import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Inbox,
  Loader2,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BiValue } from '../../domain/contracts';

/* ===================================================================
   G — BUTTON FAMILY
   =================================================================== */

type BmButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'icon';

export function BmButton({
  variant = 'secondary',
  loading = false,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BmButtonVariant; loading?: boolean }) {
  return (
    <button
      {...props}
      className={`bm-btn bm-btn-${variant} ${loading ? 'bm-btn-loading' : ''} ${className}`.trim()}
      disabled={props.disabled || loading}
    >
      {children}
    </button>
  );
}

/* ===================================================================
   L — STATUS BADGES
   =================================================================== */

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function BmBadge({ tone = 'neutral', label, icon }: { tone?: BadgeTone; label: BiValue; icon?: ReactNode }) {
  return (
    <span className={`bm-badge bm-badge-${tone}`}>
      {icon}
      <BilingualText value={label} />
    </span>
  );
}

/* ===================================================================
   A — CARD FAMILY
   =================================================================== */

type CardTier = 'featured' | 'standard' | 'compact' | 'utility';

function cardTierClass(tier?: CardTier) {
  if (!tier || tier === 'standard') return '';
  return `bm-card-${tier}`;
}

export function BmCard({
  children,
  tier,
  clickable,
  onClick,
  className = '',
}: {
  children: ReactNode;
  tier?: CardTier;
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`bm-card ${cardTierClass(tier)} ${clickable ? 'bm-card-clickable' : ''} ${className}`.trim()}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } } : undefined}
    >
      {children}
    </div>
  );
}

export function BmMetricCard({
  icon,
  label,
  value,
  detail,
  trend,
  trendDirection,
  tier,
}: {
  icon: ReactNode;
  label: BiValue;
  value: string | number;
  detail?: BiValue;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  tier?: CardTier;
}) {
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp;
  return (
    <BmCard tier={tier}>
      <div className="bm-metric-card">
        <div className="bm-metric-head">
          <span className="bm-metric-icon">{icon}</span>
          {trend && (
            <span className={`bm-metric-trend ${trendDirection ?? 'flat'}`}>
              <TrendIcon aria-hidden="true" />
              {trend}
            </span>
          )}
        </div>
        <div>
          <div className="bm-metric-label">
            <BilingualText value={label} />
          </div>
          <div className="bm-metric-value">{value}</div>
        </div>
        {detail && (
          <div className="bm-metric-detail">
            <BilingualText value={detail} />
          </div>
        )}
      </div>
    </BmCard>
  );
}

export function BmActionCard({
  icon,
  title,
  description,
  to,
  onClick,
  tier,
}: {
  icon: ReactNode;
  title: BiValue;
  description: BiValue;
  to?: string;
  onClick?: () => void;
  tier?: CardTier;
}) {
  const inner = (
    <>
      <span className="bm-action-icon">{icon}</span>
      <h3>
        <BilingualText value={title} />
      </h3>
      <p>
        <BilingualText value={description} />
      </p>
      <span className="bm-action-arrow">
        <BilingualText value={bi('Open', 'فتح')} />
        <ArrowRight aria-hidden="true" />
      </span>
    </>
  );

  if (to) {
    return (
      <a href={to} className={`bm-card bm-action-card ${cardTierClass(tier)}`.trim()}>
        {inner}
      </a>
    );
  }
  return (
    <BmCard tier={tier} clickable onClick={onClick} className="bm-action-card">
      {inner}
    </BmCard>
  );
}

export function BmInfoCard({
  title,
  children,
  rows,
  tier,
}: {
  title: BiValue;
  children?: ReactNode;
  rows?: Array<{ label: BiValue; value: ReactNode }>;
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier}>
      <div className="bm-info-card">
        <h3>
          <BilingualText value={title} />
        </h3>
        {children}
        {rows && (
          <div className="bm-info-list">
            {rows.map((row, i) => (
              <div className="bm-info-row" key={i}>
                <BilingualText value={row.label} />
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </BmCard>
  );
}

export function BmIdentityCard({
  avatar,
  name,
  id,
  fields,
  tier = 'featured',
}: {
  avatar?: ReactNode;
  name: BiValue;
  id?: string;
  fields?: Array<{ label: BiValue; value: ReactNode }>;
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier}>
      <div className="bm-identity-card">
        <div className="bm-identity-head">
          <div className="bm-identity-avatar">
            {avatar}
            <span className="bm-identity-badge">UOS</span>
          </div>
          <div>
            <h2 className="bm-identity-name">
              <BilingualText value={name} />
            </h2>
            {id && <div className="bm-identity-id">{id}</div>}
          </div>
        </div>
        {fields && (
          <dl className="bm-identity-fields">
            {fields.map((field, i) => (
              <div className="bm-identity-field" key={i}>
                <dt>
                  <BilingualText value={field.label} />
                </dt>
                <dd>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </BmCard>
  );
}

export function BmScheduleCard({
  time,
  title,
  meta,
  accentColor,
  tier,
}: {
  time: string;
  title: BiValue;
  meta?: BiValue[];
  accentColor?: string;
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier} className="bm-schedule-card" >
      <div className="bm-schedule-card" style={accentColor ? { borderLeftColor: accentColor } : undefined}>
        <span className="bm-schedule-time">
          <Info aria-hidden="true" />
          {time}
        </span>
        <h3>
          <BilingualText value={title} />
        </h3>
        {meta && (
          <div className="bm-schedule-meta">
            {meta.map((m, i) => (
              <BilingualText key={i} value={m} />
            ))}
          </div>
        )}
      </div>
    </BmCard>
  );
}

export function BmMembershipCard({
  plan,
  price,
  period,
  features,
  tier = 'featured',
}: {
  plan: BiValue;
  price: string;
  period?: BiValue;
  features: BiValue[];
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier} className="bm-membership-card">
      <div className="bm-membership-card">
        <div className="bm-membership-plan">
          <BilingualText value={plan} />
        </div>
        <div className="bm-membership-price">
          <strong>{price}</strong>
          {period && <span><BilingualText value={period} /></span>}
        </div>
        <div className="bm-membership-features">
          {features.map((feature, i) => (
            <span className="bm-membership-feature" key={i}>
              <CheckCircle2 aria-hidden="true" />
              <BilingualText value={feature} />
            </span>
          ))}
        </div>
      </div>
    </BmCard>
  );
}

export function BmActivityCard({
  icon,
  title,
  subtitle,
  time,
  tier,
}: {
  icon: ReactNode;
  title: BiValue;
  subtitle: BiValue;
  time: BiValue;
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier}>
      <div className="bm-activity-card">
        <span className="bm-activity-dot">{icon}</span>
        <div className="bm-activity-body">
          <strong>
            <BilingualText value={title} />
          </strong>
          <small>
            <BilingualText value={subtitle} />
          </small>
        </div>
        <span className="bm-activity-time"><BilingualText value={time} /></span>
      </div>
    </BmCard>
  );
}

export function BmEmptyStateCard({
  icon,
  title,
  description,
  action,
  tier = 'utility',
}: {
  icon?: ReactNode;
  title: BiValue;
  description: BiValue;
  action?: ReactNode;
  tier?: CardTier;
}) {
  return (
    <BmCard tier={tier}>
      <div className="bm-empty-card">
        {icon ?? <Inbox aria-hidden="true" />}
        <h3>
          <BilingualText value={title} />
        </h3>
        <p>
          <BilingualText value={description} />
        </p>
        {action}
      </div>
    </BmCard>
  );
}

/* ===================================================================
   J — EMPTY / LOADING / ERROR STATES
   =================================================================== */

export function BmEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: BiValue;
  description: BiValue;
  action?: ReactNode;
}) {
  return (
    <div className="bm-state">
      <span className="bm-state-icon">{icon ?? <Inbox aria-hidden="true" />}</span>
      <h3>
        <BilingualText value={title} />
      </h3>
      <p>
        <BilingualText value={description} />
      </p>
      {action}
    </div>
  );
}

export function BmErrorState({
  title = bi('Unable to display this view', 'تعذر عرض هذه الواجهة'),
  description = bi('An error occurred while loading this content. Please try again.', 'حدث خطأ أثناء تحميل هذا المحتوى. يرجى المحاولة مرة أخرى.'),
  onRetry,
}: {
  title?: BiValue;
  description?: BiValue;
  onRetry?: () => void;
}) {
  return (
    <div className="bm-state bm-state-error">
      <span className="bm-state-icon">
        <AlertTriangle aria-hidden="true" />
      </span>
      <h3>
        <BilingualText value={title} />
      </h3>
      <p>
        <BilingualText value={description} />
      </p>
      {onRetry && (
        <BmButton variant="tertiary" onClick={onRetry}>
          <BilingualText value={bi('Retry', 'إعادة المحاولة')} />
        </BmButton>
      )}
    </div>
  );
}

export function BmLoadingState({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bm-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div className="bm-skeleton-line" key={i} />
      ))}
    </div>
  );
}

export function BmLoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="bm-grid bm-grid-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="bm-skeleton-card" key={i}>
          <div className="bm-skeleton-circle" />
          <div className="bm-skeleton-line" />
          <div className="bm-skeleton-line" />
        </div>
      ))}
    </div>
  );
}

export function BmLoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bm-skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="bm-skeleton-table-row" key={i}>
          <div className="bm-skeleton-circle" style={{ width: 36, height: 36 }} />
          <div className="bm-skeleton-line" />
          <div className="bm-skeleton-line" />
          <div className="bm-skeleton-line" />
          <div className="bm-skeleton-line" />
          <div className="bm-skeleton-line" />
        </div>
      ))}
    </div>
  );
}

/* ===================================================================
   E — FORM SYSTEM
   =================================================================== */

type FieldState = 'default' | 'error' | 'success';

export function BmFormField({
  label,
  icon,
  placeholder,
  helper,
  error,
  success,
  required,
  disabled,
  readonly,
  loading,
  type = 'text',
  value,
  onChange,
  inputId,
}: {
  label: BiValue;
  icon?: ReactNode;
  placeholder?: string;
  helper?: BiValue;
  error?: BiValue;
  success?: BiValue;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  inputId?: string;
}) {
  const state: FieldState = error ? 'error' : success ? 'success' : 'default';
  const stateClass = error ? 'bm-field-error-state' : success ? 'bm-field-success-state' : '';
  return (
    <div className={`bm-field ${stateClass} ${loading ? 'bm-field-loading' : ''}`.trim()}>
      <label className="bm-field-label" htmlFor={inputId}>
        {icon && <span className="bm-field-icon">{icon}</span>}
        <BilingualText value={label} />
        {required && <span className="bm-field-required">*</span>}
      </label>
      <div className="bm-field-input-wrap">
        {icon && <span className="bm-field-input-icon">{icon}</span>}
        <input
          id={inputId}
          type={type}
          className="bm-field-input"
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readonly}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        />
      </div>
      {state === 'error' && error && (
        <span className="bm-field-error">
          <AlertTriangle aria-hidden="true" />
          <BilingualText value={error} />
        </span>
      )}
      {state === 'success' && success && (
        <span className="bm-field-success">
          <CheckCircle2 aria-hidden="true" />
          <BilingualText value={success} />
        </span>
      )}
      {state === 'default' && helper && (
        <span className="bm-field-helper">
          <BilingualText value={helper} />
        </span>
      )}
    </div>
  );
}

export function BmFormSelect({
  label,
  icon,
  options,
  value,
  onChange,
  required,
  disabled,
  inputId,
}: {
  label: BiValue;
  icon?: ReactNode;
  options: Array<{ value: string; label: BiValue }>;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  inputId?: string;
}) {
  return (
    <div className="bm-field">
      <label className="bm-field-label" htmlFor={inputId}>
        {icon && <span className="bm-field-icon">{icon}</span>}
        <BilingualText value={label} />
        {required && <span className="bm-field-required">*</span>}
      </label>
      <div className="bm-field-input-wrap">
        {icon && <span className="bm-field-input-icon">{icon}</span>}
        <select
          id={inputId}
          className="bm-field-select"
          disabled={disabled}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label.en} | {opt.label.ar}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function BmFormTextarea({
  label,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  readonly,
  inputId,
}: {
  label: BiValue;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  inputId?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="bm-field">
      <label className="bm-field-label" htmlFor={inputId}>
        <BilingualText value={label} />
        {required && <span className="bm-field-required">*</span>}
      </label>
      <textarea
        id={inputId}
        className="bm-field-textarea"
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
    </div>
  );
}

/* ===================================================================
   F — FORM SECTION
   =================================================================== */

export function BmFormSection({
  icon,
  title,
  description,
  children,
  cols = 2,
}: {
  icon?: ReactNode;
  title: BiValue;
  description?: BiValue;
  children: ReactNode;
  cols?: 1 | 2 | 3;
}) {
  return (
    <section className="bm-form-section">
      <div className="bm-form-section-head">
        {icon && <span className="bm-form-section-icon">{icon}</span>}
        <div>
          <h3>
            <BilingualText value={title} />
          </h3>
          {description && (
            <p style={{ fontSize: '12px', color: 'var(--uos-text-muted, #a5a29c)', margin: '5px 0 0' }}>
              <BilingualText value={description} />
            </p>
          )}
        </div>
      </div>
      <div className={`bm-form-section-body ${cols === 2 ? 'bm-form-cols-2' : cols === 3 ? 'bm-form-cols-3' : ''}`.trim()}>
        {children}
      </div>
    </section>
  );
}

/* ===================================================================
   D — FILTER BAR
   =================================================================== */

export function BmFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  chips,
  onRemoveChip,
  onMobileOpen,
}: {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: BiValue;
  filters?: ReactNode;
  chips?: Array<{ key: string; label: BiValue }>;
  onRemoveChip?: (key: string) => void;
  onMobileOpen?: () => void;
}) {
  return (
    <>
      <div className="bm-filter-bar">
        <div className="bm-table-search">
          <Search aria-hidden="true" />
          <input
            type="text"
            placeholder={searchPlaceholder ? `${searchPlaceholder.en} | ${searchPlaceholder.ar}` : 'Search...'}
            value={searchValue}
            onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
          />
        </div>
        {filters}
        {chips && chips.length > 0 && (
          <div className="bm-filter-chips">
            {chips.map((chip) => (
              <span className="bm-filter-chip" key={chip.key}>
                <BilingualText value={chip.label} />
                <button onClick={() => onRemoveChip?.(chip.key)} aria-label={`Remove ${chip.label.en}`}>
                  <X aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {onMobileOpen && (
        <button className="bm-filter-mobile-trigger bm-btn bm-btn-secondary" onClick={onMobileOpen}>
          <SlidersHorizontal aria-hidden="true" />
          <BilingualText value={bi('Filters', 'الفلاتر')} />
        </button>
      )}
    </>
  );
}

export function BmFilterSelect({
  label,
  icon,
  options,
  value,
  onChange,
}: {
  label: BiValue;
  icon?: ReactNode;
  options: Array<{ value: string; label: BiValue }>;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="bm-filter-select">
      {icon}
      <BilingualText value={label} />
      <select value={value} onChange={onChange ? (e) => onChange(e.target.value) : undefined}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label.en} | {opt.label.ar}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ===================================================================
   I — MODAL + DRAWER
   =================================================================== */

export function BmModal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: BiValue;
  description?: BiValue;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => modalRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="bm-modal-layer" role="presentation">
      <div className="bm-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <section ref={modalRef} tabIndex={-1} className="bm-modal uos-focus-quiet" role="dialog" aria-modal="true" aria-labelledby="bm-modal-title">
        <div className="bm-modal-head">
          <div>
            <h2 id="bm-modal-title">
              <BilingualText value={title} />
            </h2>
            {description && (
              <p>
                <BilingualText value={description} />
              </p>
            )}
          </div>
          <button type="button" className="bm-modal-close" onClick={onClose} aria-label="Close dialog | إغلاق النافذة">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="bm-modal-body">{children}</div>
        {footer && <div className="bm-modal-footer">{footer}</div>}
      </section>
    </div>
  );
}

export function BmDrawer({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: BiValue;
  description?: BiValue;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => drawerRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="bm-drawer-layer" role="presentation">
      <div className="bm-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside ref={drawerRef} tabIndex={-1} className="bm-drawer uos-focus-quiet" role="dialog" aria-modal="true" aria-labelledby="bm-drawer-title">
        <div className="bm-drawer-head">
          <div>
            <h2 id="bm-drawer-title">
              <BilingualText value={title} />
            </h2>
            {description && (
              <p>
                <BilingualText value={description} />
              </p>
            )}
          </div>
          <button type="button" className="bm-modal-close" onClick={onClose} aria-label="Close drawer | إغلاق اللوحة">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="bm-drawer-body">{children}</div>
        {footer && <div className="bm-drawer-footer">{footer}</div>}
      </aside>
    </div>
  );
}

/* ===================================================================
   H — LOGIN VISUAL
   =================================================================== */

export function BmLoginCard({
  title = bi('Sign in to your account', 'تسجيل الدخول إلى حسابك'),
  subtitle = bi('Access the United Olympics Sports portal', 'الوصول إلى بوابة يونايتد أوليمبيكس سبورت'),
  children,
  footer,
}: {
  title?: BiValue;
  subtitle?: BiValue;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="bm-login-shell">
      <div className="bm-login-visual">
        <div className="bm-login-brand">
          <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
          <div>
            <strong>United Olympics Sports</strong>
            <span>يونايتد أوليمبيكس سبورت</span>
          </div>
        </div>
        <div className="bm-login-tagline">
          <h2>
            <BilingualText value={bi('Where discipline meets progress', 'حيث يلتقي الانضباط بالتقدم')} />
          </h2>
          <p>
            <BilingualText value={bi('A structured sports development environment for athletes, families and coaches.', 'بيئة تطوير رياضي منظمة للاعبين والعائلات والمدربين.')} />
          </p>
        </div>
      </div>
      <div className="bm-login-form-side">
        <div className="bm-login-card">
          <div className="bm-login-card-head">
            <h3>
              <BilingualText value={title} />
            </h3>
            <p>
              <BilingualText value={subtitle} />
            </p>
          </div>
          {children}
          {footer && <div className="bm-login-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   B — DATA TABLE
   =================================================================== */

export type BmColumn<T> = {
  key: string;
  label: BiValue;
  sortable?: boolean;
  width?: string;
  render: (row: T, index: number) => ReactNode;
  mobileRender?: (row: T) => ReactNode;
};

export function BmDataTable<T extends { id: string }>({
  columns,
  rows,
  selectable,
  selectedIds,
  onToggleRow,
  onToggleAll,
  sortBy,
  sortDir,
  onSort,
  page,
  pageSize,
  total,
  onPageChange,
  loading,
  emptyState,
  toolbar,
  bulkActions,
}: {
  columns: BmColumn<T>[];
  rows: T[];
  selectable?: boolean;
  selectedIds?: string[];
  onToggleRow?: (id: string) => void;
  onToggleAll?: () => void;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  bulkActions?: ReactNode;
}) {
  const allSelected = rows.length > 0 && selectedIds ? rows.every((r) => selectedIds.includes(r.id)) : false;
  const hasSelected = selectedIds && selectedIds.length > 0;
  const totalPages = total && pageSize ? Math.ceil(total / pageSize) : 1;
  const currentPage = page ?? 1;

  if (loading) {
    return <BmLoadingTable rows={5} />;
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {hasSelected && bulkActions && (
        <div className="bm-bulk-bar">
          <span>{selectedIds!.length} selected</span>
          <div className="bm-bulk-actions">{bulkActions}</div>
        </div>
      )}
      <div className="bm-table-container">
        {toolbar && <div className="bm-table-toolbar">{toolbar}</div>}
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                {selectable && (
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      className="bm-table-checkbox"
                      checked={allSelected}
                      onChange={onToggleAll}
                      aria-label="Select all | تحديد الكل"
                    />
                  </th>
                )}
                {columns.map((col) => {
                  const sorted = sortBy === col.key;
                  const nextDir = sorted && sortDir === 'asc' ? 'descending' : 'ascending';
                  return (
                    <th
                      key={col.key}
                      className={`${col.sortable ? 'bm-sortable' : ''} ${sorted ? 'bm-sorted' : ''}`.trim()}
                      style={col.width ? { width: col.width } : undefined}
                      aria-sort={col.sortable ? (sorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                    >
                      {col.sortable ? (
                        <button
                          type="button"
                          className="bm-sort-btn"
                          onClick={() => onSort?.(col.key)}
                          aria-label={`${col.label.en} — sort ${nextDir} | ${col.label.ar} — ترتيب ${sorted && sortDir === 'asc' ? 'تنازلي' : 'تصاعدي'}`}
                        >
                          <BilingualText value={col.label} />
                          <span className="bm-sort-icon">
                            {sorted && sortDir === 'asc' ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                          </span>
                        </button>
                      ) : (
                        <BilingualText value={col.label} />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={selectedIds?.includes(row.id) ? 'bm-row-selected' : ''}>
                  {selectable && (
                    <td>
                      <input
                        type="checkbox"
                        className="bm-table-checkbox"
                        checked={selectedIds?.includes(row.id) ?? false}
                        onChange={() => onToggleRow?.(row.id)}
                        aria-label={`Select row ${i + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row, i)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(total && onPageChange) && (
          <div className="bm-table-footer">
            <div className="bm-table-info">
              <BilingualText value={bi(`Showing ${(currentPage - 1) * (pageSize ?? 10) + 1}–${Math.min(currentPage * (pageSize ?? 10), total)} of ${total}`, `عرض ${(currentPage - 1) * (pageSize ?? 10) + 1}–${Math.min(currentPage * (pageSize ?? 10), total)} من ${total}`)} />
            </div>
            <div className="bm-table-pagination">
              <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page">
                <ChevronDown style={{ transform: 'rotate(90deg)' }} aria-hidden="true" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={p === currentPage ? 'active' : ''} onClick={() => onPageChange(p)}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page">
                <ChevronDown style={{ transform: 'rotate(-90deg)' }} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="bm-mobile-cards">
        {rows.map((row) => (
          <div className="bm-mobile-card" key={row.id}>
            {columns.map((col) => (
              <div key={col.key}>
                {col.mobileRender ? col.mobileRender(row) : col.render(row, 0)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ===================================================================
   PAGE HEADER
   =================================================================== */

export function BmPageHeader({
  eyebrow,
  title,
  description,
  icon,
  actions,
}: {
  eyebrow?: BiValue;
  title: BiValue;
  description?: BiValue;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="bm-hero">
      {eyebrow && (
        <div className="bm-hero-eyebrow">
          <BilingualText value={eyebrow} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0 }}>
          <h1>
            <BilingualText value={title} />
          </h1>
          {description && (
            <p>
              <BilingualText value={description} />
            </p>
          )}
        </div>
        {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
      </div>
    </div>
  );
}

/* ===================================================================
   SECTION LABEL
   =================================================================== */

export function BmSectionLabel({ num, icon, title }: { num: string; icon?: ReactNode; title: BiValue }) {
  return (
    <div className="bm-section-label">
      <span className="bm-section-num">{num}</span>
      {icon}
      <h2>
        <BilingualText value={title} />
      </h2>
    </div>
  );
}
