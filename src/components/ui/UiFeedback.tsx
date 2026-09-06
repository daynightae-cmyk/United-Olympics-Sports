/**
 * United Olympics Sports — Feedback & Toast System (Mission 00.7).
 *
 * Provides:
 * - ToastProvider & useToast (Success, Error, Warning, Info, Preview)
 * - UiEmptyState (with custom icon & bilingual CTA)
 * - UiPermissionState (Access restricted with role requirement notice)
 * - UiSkeleton (Lines, Card skeleton, Table skeleton, Metric skeleton)
 * - UiRouteError (Graceful boundary fallback with retry CTA)
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  X,
  Lock,
  RefreshCw,
  ArrowLeft,
  FolderOpen,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { UiButton } from './UiPrimitives';

/* ─────────────────────────────────────────────────────────────────────────────
   1. TOAST NOTIFICATION SYSTEM
───────────────────────────────────────────────────────────────────────────── */
export type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'preview';

export interface ToastItem {
  id: string;
  title: BilingualValue;
  message?: BilingualValue;
  tone: ToastTone;
  duration?: number;
  action?: {
    label: BilingualValue;
    onClick: () => void;
  };
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  success: (title: BilingualValue, message?: BilingualValue) => void;
  error: (title: BilingualValue, message?: BilingualValue) => void;
  warning: (title: BilingualValue, message?: BilingualValue) => void;
  info: (title: BilingualValue, message?: BilingualValue) => void;
  preview: (title?: BilingualValue, message?: BilingualValue) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCount = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `uos-toast-${++toastCount}`;
      const item: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, item]);

      const duration = toast.duration ?? (toast.tone === 'error' ? 8000 : 5000);
      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
      return id;
    },
    [dismissToast],
  );

  const success = useCallback(
    (title: BilingualValue, message?: BilingualValue) => {
      showToast({ title, message, tone: 'success' });
    },
    [showToast],
  );

  const error = useCallback(
    (title: BilingualValue, message?: BilingualValue) => {
      showToast({ title, message, tone: 'error' });
    },
    [showToast],
  );

  const warning = useCallback(
    (title: BilingualValue, message?: BilingualValue) => {
      showToast({ title, message, tone: 'warning' });
    },
    [showToast],
  );

  const info = useCallback(
    (title: BilingualValue, message?: BilingualValue) => {
      showToast({ title, message, tone: 'info' });
    },
    [showToast],
  );

  const preview = useCallback(
    (
      title = bi('Preview Mode Action', 'إجراء في وضع المعاينة'),
      message = bi('Local state updated. Changes do not write to live backend.', 'تم تحديث الحالة المحلية. لا يتم الحفظ في خادم فعلي.'),
    ) => {
      showToast({ title, message, tone: 'preview' });
    },
    [showToast],
  );

  return (
    <ToastContext.Provider
      value={{ showToast, dismissToast, success, error, warning, info, preview }}
    >
      {children}
      <UiToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      showToast: () => '',
      dismissToast: () => {},
      success: (t) => console.log('[Toast success]', t),
      error: (t) => console.error('[Toast error]', t),
      warning: (t) => console.warn('[Toast warning]', t),
      info: (t) => console.info('[Toast info]', t),
      preview: (t) => console.info('[Toast preview]', t),
    };
  }
  return ctx;
}

export function UiToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const toneIcons: Record<ToastTone, React.ComponentType<{ size?: number }>> = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    preview: Sparkles,
  };

  return (
    <aside
      className="uos-toast-container uos-safe-top uos-safe-x"
      role="region"
      aria-label="Notifications | الإشعارات"
    >
      {toasts.map((toast) => {
        const Icon = toneIcons[toast.tone];
        return (
          <div
            key={toast.id}
            className={`uos-toast uos-toast--${toast.tone} uos-glass-4`}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            <span className="uos-toast-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <div className="uos-toast-content">
              <strong className="uos-toast-title">
                <BilingualText value={toast.title} />
              </strong>
              {toast.message && (
                <p className="uos-toast-msg">
                  <BilingualText value={toast.message} />
                </p>
              )}
              {toast.action && (
                <button
                  type="button"
                  className="uos-toast-action-btn"
                  onClick={toast.action.onClick}
                >
                  <BilingualText value={toast.action.label} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="uos-toast-close uos-touch"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification | إغلاق الإشعار"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. SKELETON LOADERS
───────────────────────────────────────────────────────────────────────────── */
export function UiSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`uos-skeleton-wrap ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="uos-skeleton-line" />
      ))}
    </div>
  );
}

export function UiCardSkeleton() {
  return (
    <div className="uos-skeleton-card uos-glass-1" aria-hidden="true">
      <div className="uos-skeleton-rect uos-skeleton-avatar" />
      <div className="uos-skeleton-line w-3/4" />
      <div className="uos-skeleton-line w-1/2" />
    </div>
  );
}

export function UiTableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="uos-skeleton-table uos-glass-1" aria-hidden="true">
      <div className="uos-skeleton-table-head">
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className="uos-skeleton-line" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="uos-skeleton-table-row">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="uos-skeleton-line" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. EMPTY & PERMISSION STATES
───────────────────────────────────────────────────────────────────────────── */
export function UiEmptyState({
  icon: Icon = FolderOpen,
  title = bi('No records found', 'لا توجد سجلات بعد'),
  description = bi('This section is currently empty. New records will appear here once registered.', 'هذا القسم فارغ حاليًا. ستظهر السجلات الجديدة هنا بمجرد تسجيلها.'),
  action,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title?: BilingualValue;
  description?: BilingualValue;
  action?: ReactNode;
}) {
  return (
    <div className="uos-empty-state uos-glass-1">
      <div className="uos-empty-icon-wrap" aria-hidden="true">
        <Icon size={28} />
      </div>
      <h3 className="uos-empty-title">
        <BilingualText value={title} />
      </h3>
      <p className="uos-empty-desc">
        <BilingualText value={description} />
      </p>
      {action && <div className="uos-empty-action">{action}</div>}
    </div>
  );
}

export function UiPermissionState({
  title = bi('Restricted Access', 'صلاحية مقيدة'),
  description = bi('Your current account role does not have permission to view or modify this administrative workspace.', 'حسابك الحالي لا يمتلك الصلاحيات الكافية لعرض أو تعديل مساحة العمل الإدارية هذه.'),
  onReturn,
}: {
  title?: BilingualValue;
  description?: BilingualValue;
  onReturn?: () => void;
}) {
  return (
    <div className="uos-permission-state uos-glass-2" role="alert">
      <div className="uos-permission-icon-wrap" aria-hidden="true">
        <Lock size={32} />
      </div>
      <h3 className="uos-permission-title">
        <BilingualText value={title} />
      </h3>
      <p className="uos-permission-desc">
        <BilingualText value={description} />
      </p>
      {onReturn && (
        <UiButton variant="secondary" onClick={onReturn} className="mt-4">
          <ArrowLeft size={16} />
          <BilingualText value={bi('Return to Portal Home', 'العودة لرئيسية البوابة')} />
        </UiButton>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. ROUTE / NETWORK ERROR BOUNDARY
───────────────────────────────────────────────────────────────────────────── */
export function UiRouteError({
  title = bi('Unable to render workspace', 'تعذر عرض مساحة العمل'),
  description = bi('An unexpected render error occurred. You can reload the route safely.', 'حدث خطأ غير متوقع أثناء المعالجة. يمكنك إعادة تحميل المسار بأمان.'),
  onRetry,
}: {
  title?: BilingualValue;
  description?: BilingualValue;
  onRetry?: () => void;
}) {
  return (
    <div className="uos-route-error uos-glass-3" role="alert">
      <div className="uos-route-error-icon">
        <AlertTriangle size={32} />
      </div>
      <h3>
        <BilingualText value={title} />
      </h3>
      <p>
        <BilingualText value={description} />
      </p>
      <div className="uos-route-error-actions">
        {onRetry ? (
          <UiButton variant="primary" onClick={onRetry}>
            <RefreshCw size={15} />
            <BilingualText value={bi('Try Again', 'إعادة المحاولة')} />
          </UiButton>
        ) : (
          <UiButton variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw size={15} />
            <BilingualText value={bi('Reload Page', 'إعادة تحميل الصفحة')} />
          </UiButton>
        )}
      </div>
    </div>
  );
}
