import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export type UiButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'danger'
  | 'icon'
  | 'link'
  | 'success';

export interface UiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UiButtonVariant;
  loading?: boolean;
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function UiButton({
  variant = 'secondary',
  loading = false,
  disabled = false,
  iconPrefix,
  iconSuffix,
  size = 'md',
  className = '',
  children,
  ...props
}: UiButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      className={`ui-button ui-button-${variant} ui-button-size-${size} uos-touch ${loading ? 'is-loading' : ''} ${className}`.trim()}
    >
      {loading ? <LoaderCircle size={16} className="animate-spin uos-btn-spinner" /> : iconPrefix}
      <span>{children}</span>
      {!loading && iconSuffix}
    </button>
  );
}

export function UosSplitButton({
  mainLabel,
  onMainClick,
  actions,
  variant = 'primary',
  disabled = false,
}: {
  mainLabel: BilingualValue;
  onMainClick: () => void;
  actions: Array<{ label: BilingualValue; onClick: () => void }>;
  variant?: UiButtonVariant;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="uos-split-button-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`ui-button ui-button-${variant} uos-split-main`}
        onClick={onMainClick}
        disabled={disabled}
      >
        <BilingualText value={mainLabel} />
      </button>
      <button
        type="button"
        className={`ui-button ui-button-${variant} uos-split-trigger`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="More actions | إجراءات إضافية"
        disabled={disabled}
      >
        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="uos-split-menu uos-glass-4" role="menu">
          {actions.map((act, i) => (
            <button
              key={i}
              type="button"
              className="uos-split-menu-item"
              onClick={() => {
                act.onClick();
                setOpen(false);
              }}
            >
              <BilingualText value={act.label} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function UiDialog({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: BilingualValue;
  description?: BilingualValue;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="ui-dialog-layer" role="presentation">
      <div className="ui-dialog-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        ref={dialogRef}
        tabIndex={-1}
        className="ui-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-dialog-title"
      >
        <div className="ui-dialog-heading">
          <div>
            <h2 id="ui-dialog-title">
              <BilingualText value={title} />
            </h2>
            {description && (
              <p>
                <BilingualText value={description} />
              </p>
            )}
          </div>
          <button
            type="button"
            className="ui-icon-button"
            onClick={onClose}
            aria-label="Close dialog | إغلاق النافذة"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

const statusIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
  info: Info,
  preview: Info,
} as const;

export function UiStatusBadge({
  tone = 'info',
  label,
}: {
  tone?: keyof typeof statusIcons;
  label: BilingualValue;
}) {
  const Icon = statusIcons[tone];
  return (
    <span className={`ui-status ui-status-${tone}`}>
      <Icon aria-hidden="true" />
      <BilingualText value={label} />
    </span>
  );
}

function StateShell({
  kind,
  title,
  description,
}: {
  kind: 'empty' | 'error' | 'preview';
  title: BilingualValue;
  description: BilingualValue;
}) {
  const Icon = kind === 'error' ? AlertTriangle : kind === 'preview' ? Info : LoaderCircle;
  return (
    <div className={`ui-state ui-state-${kind}`}>
      <Icon aria-hidden="true" />
      <h3>
        <BilingualText value={title} />
      </h3>
      <p>
        <BilingualText value={description} />
      </p>
    </div>
  );
}

export const UiEmptyState = ({
  title = bi('Nothing here yet', 'لا توجد عناصر بعد'),
  description = bi(
    'This view will populate when verified data is available.',
    'ستظهر العناصر هنا عند توفر بيانات موثقة.',
  ),
}: {
  title?: BilingualValue;
  description?: BilingualValue;
}) => <StateShell kind="empty" title={title} description={description} />;

export const UiErrorState = ({
  title = bi('Unable to display this view', 'تعذر عرض هذه الواجهة'),
  description = bi(
    'Try again after checking the current source state.',
    'حاول مرة أخرى بعد التحقق من حالة المصدر الحالية.',
  ),
}: {
  title?: BilingualValue;
  description?: BilingualValue;
}) => <StateShell kind="error" title={title} description={description} />;

export const UiPreviewState = ({
  title = bi('Preview Experience', 'تجربة تجريبية'),
  description = bi(
    'This is a truthful visual prototype and does not claim live backend operations.',
    'هذا نموذج بصري صادق ولا يدعي وجود عمليات خادم فعلية.',
  ),
}: {
  title?: BilingualValue;
  description?: BilingualValue;
}) => <StateShell kind="preview" title={title} description={description} />;

export function UiSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="ui-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}
