import { Download, MoreHorizontal, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { UiButton } from '../ui/UiPrimitives';

export function EnterprisePanel({ title, description, actions, children, className = '' }: { title?: BilingualValue; description?: BilingualValue; actions?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`enterprise-panel ${className}`.trim()}>
    {(title || actions) && <header className="enterprise-panel-header"><div>{title && <h2><BilingualText value={title} /></h2>}{description && <p><BilingualText value={description} /></p>}</div>{actions}</header>}
    {children}
  </section>;
}

export function EnterpriseKpi({ label, value, detail, icon: Icon, tone = 'gold', trend }: { label: BilingualValue; value: string | number; detail?: BilingualValue; icon: React.ComponentType<{ size?: number }>; tone?: 'gold' | 'green' | 'blue' | 'orange'; trend?: number }) {
  const TrendIcon = trend && trend < 0 ? TrendingDown : TrendingUp;
  return <article className={`enterprise-kpi tone-${tone}`}>
    <div className="enterprise-kpi-top"><span className="enterprise-kpi-icon"><Icon size={18} /></span>{typeof trend === 'number' && <span className={`enterprise-kpi-trend ${trend < 0 ? 'is-down' : ''}`}><TrendIcon size={13} /> {trend > 0 ? '+' : ''}{trend}%</span>}</div>
    <strong>{value}</strong>
    <BilingualText value={label} />
    {detail && <small><BilingualText value={detail} /></small>}
  </article>;
}

export function EnterpriseToolbar({ query, onQueryChange, queryLabel = bi('Search records', 'البحث في السجلات'), filters, actions, resultCount }: { query?: string; onQueryChange?: (value: string) => void; queryLabel?: BilingualValue; filters?: ReactNode; actions?: ReactNode; resultCount?: BilingualValue }) {
  return <section className="enterprise-toolbar" aria-label={`${queryLabel.en} | ${queryLabel.ar}`}>
    {onQueryChange && <label className="enterprise-search"><SearchIcon /><span className="sr-only"><BilingualText value={queryLabel} /></span><input value={query ?? ''} onChange={event => onQueryChange(event.target.value)} placeholder={`${queryLabel.en} | ${queryLabel.ar}`} /></label>}
    {filters && <div className="enterprise-filters">{filters}</div>}
    <div className="enterprise-toolbar-end">{resultCount && <span className="enterprise-result"><BilingualText value={resultCount} /></span>}{actions}</div>
  </section>;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="enterprise-search-icon"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

export function EnterpriseSelect({ label, value, onChange, options }: { label: BilingualValue; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: BilingualValue }> }) {
  return <label className="enterprise-field"><BilingualText value={label} /><select value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option value={option.value} key={option.value}>{option.label.en} | {option.label.ar}</option>)}</select></label>;
}

export function EnterpriseStatus({ label, tone = 'neutral' }: { label: BilingualValue; tone?: 'active' | 'warning' | 'danger' | 'info' | 'neutral' }) {
  return <span className={`enterprise-status status-${tone}`}><i /> <BilingualText value={label} /></span>;
}

export function EnterpriseProgress({ value, label, color = 'gold' }: { value: number; label?: BilingualValue; color?: 'gold' | 'green' | 'blue' }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="enterprise-progress-wrap">{label && <div className="enterprise-progress-label"><BilingualText value={label} /><strong>{safeValue}%</strong></div>}<div className="enterprise-progress"><span className={`progress-${color}`} style={{ width: `${safeValue}%` }} /></div></div>;
}

export function EnterpriseSparkline({ values, color = 'gold' }: { values: number[]; color?: 'gold' | 'green' | 'blue' }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - ((value - min) / range) * 78 - 10}`).join(' ');
  return <svg className={`enterprise-sparkline spark-${color}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} fill="none" vectorEffect="non-scaling-stroke" /></svg>;
}

export function EnterpriseTable({ caption, children, className = '' }: { caption: BilingualValue; children: ReactNode; className?: string }) {
  return <div className={`enterprise-table-shell ${className}`.trim()}><table className="enterprise-table"><caption className="sr-only"><BilingualText value={caption} /></caption>{children}</table></div>;
}

export function EnterpriseEmpty({ title, description, action }: { title: BilingualValue; description: BilingualValue; action?: ReactNode }) {
  return <div className="enterprise-empty"><Sparkles size={22} /><h3><BilingualText value={title} /></h3><p><BilingualText value={description} /></p>{action}</div>;
}

export function PreviewNotice({ children = bi('Preview data only · local interactions do not write to a production service.', 'بيانات تجريبية فقط · التفاعلات المحلية لا تكتب إلى خدمة إنتاجية.') }: { children?: BilingualValue }) {
  return <div className="preview-notice"><Sparkles size={15} /><BilingualText value={children} /></div>;
}

export function ExportMenu({ filename, headers, rows }: { filename: string; headers: string[]; rows: Array<Array<string | number>> }) {
  const [open, setOpen] = useState(false);
  const download = () => {
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };
  return <div className="enterprise-menu-wrap"><UiButton variant="outline" type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}><Download size={15} /><BilingualText value={bi('Export', 'تصدير')} /></UiButton>{open && <div className="enterprise-menu" role="menu"><button type="button" onClick={download}><Download size={14} /><BilingualText value={bi('Download CSV preview', 'تنزيل معاينة CSV')} /></button><button type="button" onClick={() => { window.print(); setOpen(false); }}><BilingualText value={bi('Print current view', 'طباعة العرض الحالي')} /></button></div>}</div>;
}

export function RowMenu({ actions }: { actions: Array<{ label: BilingualValue; onClick: () => void }> }) {
  const [open, setOpen] = useState(false);
  return <div className="enterprise-menu-wrap"><button className="enterprise-more" type="button" onClick={() => setOpen(value => !value)} aria-label="Row actions | إجراءات الصف" aria-expanded={open}><MoreHorizontal size={17} /></button>{open && <div className="enterprise-menu enterprise-menu-right" role="menu">{actions.map(action => <button type="button" key={action.label.en} onClick={() => { action.onClick(); setOpen(false); }}><BilingualText value={action.label} /></button>)}</div>}</div>;
}

export const enterpriseLabels = {
  all: bi('All', 'الكل'),
  reset: bi('Reset filters', 'إعادة ضبط الفلاتر'),
  preview: bi('Preview', 'تجريبي'),
};
