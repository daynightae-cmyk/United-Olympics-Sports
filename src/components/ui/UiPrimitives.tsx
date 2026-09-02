import { AlertTriangle, CheckCircle2, Info, LoaderCircle, X } from 'lucide-react';
import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export type UiButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'icon' | 'link';

export function UiButton({ variant = 'secondary', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: UiButtonVariant }) {
  return <button {...props} className={`ui-button ui-button-${variant} ${className}`.trim()}>{children}</button>;
}

export function UiDialog({ open, title, description, children, onClose }: { open: boolean; title: BilingualValue; description?: BilingualValue; children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, open]);
  if (!open) return null;
  return <div className="ui-dialog-layer" role="presentation">
    <button className="ui-dialog-backdrop" type="button" aria-label="Close dialog | إغلاق النافذة" onClick={onClose} />
    <section className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby="ui-dialog-title">
      <div className="ui-dialog-heading">
        <div><h2 id="ui-dialog-title"><BilingualText value={title} /></h2>{description && <p><BilingualText value={description} /></p>}</div>
        <button type="button" className="ui-icon-button" onClick={onClose} aria-label="Close dialog | إغلاق النافذة"><X aria-hidden="true" /></button>
      </div>
      {children}
    </section>
  </div>;
}

const statusIcons = { success: CheckCircle2, warning: AlertTriangle, error: AlertTriangle, info: Info, preview: Info } as const;
export function UiStatusBadge({ tone = 'info', label }: { tone?: keyof typeof statusIcons; label: BilingualValue }) {
  const Icon = statusIcons[tone];
  return <span className={`ui-status ui-status-${tone}`}><Icon aria-hidden="true" /><BilingualText value={label} /></span>;
}

function StateShell({ kind, title, description }: { kind: 'empty' | 'error' | 'preview'; title: BilingualValue; description: BilingualValue }) {
  const Icon = kind === 'error' ? AlertTriangle : kind === 'preview' ? Info : LoaderCircle;
  return <div className={`ui-state ui-state-${kind}`}><Icon aria-hidden="true" /><h3><BilingualText value={title} /></h3><p><BilingualText value={description} /></p></div>;
}
export const UiEmptyState = ({ title = bi('Nothing here yet', 'لا توجد عناصر بعد'), description = bi('This view will populate when verified data is available.', 'ستظهر العناصر هنا عند توفر بيانات موثقة.') }: { title?: BilingualValue; description?: BilingualValue }) => <StateShell kind="empty" title={title} description={description} />;
export const UiErrorState = ({ title = bi('Unable to display this view', 'تعذر عرض هذه الواجهة'), description = bi('Try again after checking the current source state.', 'حاول مرة أخرى بعد التحقق من حالة المصدر الحالية.') }: { title?: BilingualValue; description?: BilingualValue }) => <StateShell kind="error" title={title} description={description} />;
export const UiPreviewState = ({ title = bi('Preview Experience', 'تجربة تجريبية'), description = bi('This is a truthful visual prototype and does not claim live backend operations.', 'هذا نموذج بصري صادق ولا يدعي وجود عمليات خادم فعلية.') }: { title?: BilingualValue; description?: BilingualValue }) => <StateShell kind="preview" title={title} description={description} />;
export function UiSkeleton({ lines = 3 }: { lines?: number }) { return <div className="ui-skeleton" aria-hidden="true">{Array.from({ length: lines }, (_, index) => <i key={index} />)}</div>; }
