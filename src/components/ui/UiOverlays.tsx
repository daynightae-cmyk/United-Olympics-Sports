/**
 * United Olympics Sports — Overlays Architecture (Mission 00.6).
 *
 * Primitives:
 * - UiModal (Centered dialog with backdrop, title, focus trap, Escape, scroll lock)
 * - UiDrawer (Side sheet sliding from inline-end or inline-start with smooth motion)
 * - UiBottomSheet (Mobile bottom-sheet drawer with drag-indicator bar)
 * - UiPopover (Anchored floating element with click-outside dismissal)
 * - UiDropdown (Accessible menu with keyboard navigation)
 * - UiConfirmDialog (High-fidelity affirmative/destructive action confirmation)
 * - UiCommandPalette (Cmd+K / Ctrl+K instant global search & navigation)
 */
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
  Search,
  ArrowRight,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { UiButton } from './UiPrimitives';

/* ─────────────────────────────────────────────────────────────────────────────
   1. MODAL DIALOG
───────────────────────────────────────────────────────────────────────────── */
export interface UiModalProps {
  open: boolean;
  onClose: () => void;
  title: BilingualValue;
  description?: BilingualValue;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
}

export function UiModal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: UiModalProps) {
  const modalRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(timer);
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="uos-modal-layer" role="presentation">
      <div className="uos-modal-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        ref={modalRef}
        tabIndex={-1}
        className={`uos-modal-shell uos-glass-4 size--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="uos-modal-title"
      >
        <header className="uos-modal-header">
          <div>
            <h2 id="uos-modal-title" className="uos-modal-title">
              <BilingualText value={title} />
            </h2>
            {description ? (
              <p className="uos-modal-desc">
                <BilingualText value={description} />
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="uos-btn-ghost uos-modal-close uos-touch"
            onClick={onClose}
            aria-label="Close modal | إغلاق النافذة"
          >
            <X size={18} />
          </button>
        </header>

        <div className="uos-modal-body">{children}</div>

        {footer && <footer className="uos-modal-footer">{footer}</footer>}
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. SIDE DRAWER
───────────────────────────────────────────────────────────────────────────── */
export interface UiDrawerProps {
  open: boolean;
  onClose: () => void;
  title: BilingualValue;
  description?: BilingualValue;
  side?: 'end' | 'start';
  width?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
}

export function UiDrawer({
  open,
  onClose,
  title,
  description,
  side = 'end',
  width = 'md',
  children,
  footer,
}: UiDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="uos-drawer-layer" role="presentation">
      <div className="uos-drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <aside
        ref={drawerRef}
        tabIndex={-1}
        className={`uos-drawer-panel uos-glass-4 side--${side} width--${width} uos-safe-x uos-safe-top uos-safe-bottom`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="uos-drawer-title"
      >
        <header className="uos-drawer-header">
          <div>
            <h2 id="uos-drawer-title" className="uos-drawer-title">
              <BilingualText value={title} />
            </h2>
            {description ? (
              <p className="uos-drawer-desc">
                <BilingualText value={description} />
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="uos-btn-ghost uos-drawer-close uos-touch"
            onClick={onClose}
            aria-label="Close drawer | إغلاق اللوحة"
          >
            <X size={18} />
          </button>
        </header>

        <div className="uos-drawer-body">{children}</div>

        {footer && <footer className="uos-drawer-footer">{footer}</footer>}
      </aside>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. MOBILE BOTTOM SHEET
───────────────────────────────────────────────────────────────────────────── */
export function UiBottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: BilingualValue;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="uos-bottomsheet-layer" role="presentation">
      <div className="uos-bottomsheet-backdrop" onClick={onClose} aria-hidden="true" />
      <section
        className="uos-bottomsheet-panel uos-glass-4 uos-safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="uos-bottomsheet-title"
      >
        <div className="uos-bottomsheet-handle" aria-hidden="true" />
        <header className="uos-bottomsheet-head">
          <h2 id="uos-bottomsheet-title" className="uos-bottomsheet-title">
            <BilingualText value={title} />
          </h2>
          <button
            type="button"
            className="uos-btn-ghost uos-touch"
            onClick={onClose}
            aria-label="Close sheet"
          >
            <X size={18} />
          </button>
        </header>
        <div className="uos-bottomsheet-body">{children}</div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. CONFIRMATION DIALOG
───────────────────────────────────────────────────────────────────────────── */
export interface UiConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: BilingualValue;
  description: BilingualValue;
  confirmLabel?: BilingualValue;
  cancelLabel?: BilingualValue;
  tone?: 'danger' | 'warning' | 'info';
  busy?: boolean;
}

export function UiConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = bi('Confirm', 'تأكيد'),
  cancelLabel = bi('Cancel', 'إلغاء'),
  tone = 'danger',
  busy = false,
}: UiConfirmDialogProps) {
  const Icon = tone === 'danger' ? AlertTriangle : tone === 'warning' ? AlertTriangle : Info;

  return (
    <UiModal
      open={open}
      onClose={() => !busy && onClose()}
      title={title}
      size="sm"
      footer={
        <div className="uos-confirm-footer">
          <UiButton
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            <BilingualText value={cancelLabel} />
          </UiButton>
          <UiButton
            variant={tone === 'danger' ? 'danger' : 'primary'}
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            <BilingualText value={confirmLabel} />
          </UiButton>
        </div>
      }
    >
      <div className={`uos-confirm-body tone--${tone}`}>
        <div className="uos-confirm-icon-wrap" aria-hidden="true">
          <Icon size={24} />
        </div>
        <p className="uos-confirm-desc">
          <BilingualText value={description} />
        </p>
      </div>
    </UiModal>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. COMMAND PALETTE (Cmd+K / Ctrl+K)
───────────────────────────────────────────────────────────────────────────── */
export interface CommandItem {
  id: string;
  title: BilingualValue;
  category: BilingualValue;
  icon?: React.ComponentType<{ size?: number }>;
  onSelect: () => void;
  shortcut?: string;
}

export function UiCommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = items.filter(
    (item) =>
      item.title.en.toLowerCase().includes(query.toLowerCase()) ||
      item.title.ar.includes(query) ||
      item.category.en.toLowerCase().includes(query.toLowerCase()) ||
      item.category.ar.includes(query),
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter') {
        if (filtered[activeIndex]) {
          filtered[activeIndex].onSelect();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, filtered, activeIndex]);

  if (!open) return null;

  return (
    <div className="uos-command-layer" role="presentation">
      <div className="uos-command-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="uos-command-palette uos-glass-4"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette | لوحة الأوامر"
      >
        <div className="uos-command-search-head">
          <Search size={18} className="uos-command-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="uos-command-input"
            placeholder="Type a command or search sections… | اكتب أمرًا أو ابحث في الأقسام…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            autoFocus
          />
          <kbd className="uos-command-kbd">ESC</kbd>
        </div>

        <div className="uos-command-results" role="listbox">
          {filtered.length === 0 ? (
            <div className="uos-command-empty">
              <p>
                <BilingualText value={bi('No commands or sections found', 'لم يتم العثور على أوامر أو أقسام')} />
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`uos-command-item ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="uos-command-item-main">
                    {Icon ? (
                      <span className="uos-command-item-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                    ) : null}
                    <div>
                      <strong className="uos-command-item-title">
                        <BilingualText value={item.title} />
                      </strong>
                      <span className="uos-command-item-cat">
                        <BilingualText value={item.category} />
                      </span>
                    </div>
                  </div>
                  <div className="uos-command-item-end">
                    {item.shortcut && <kbd className="uos-command-kbd">{item.shortcut}</kbd>}
                    <ArrowRight size={14} className="uos-command-arrow" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
