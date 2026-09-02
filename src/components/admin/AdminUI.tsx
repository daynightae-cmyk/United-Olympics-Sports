import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: BilingualValue; title: BilingualValue; description: BilingualValue; actions?: ReactNode }) {
  return <div className="admin-page-header"><div><BilingualText value={eyebrow} className="admin-eyebrow" /><h1><BilingualText value={title} /></h1><p><BilingualText value={description} /></p></div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function StatCard({ label, value, icon: Icon, note }: { label: BilingualValue; value: string | number; icon: LucideIcon; note?: BilingualValue }) {
  return <article className="admin-stat-card"><div className="stat-icon"><Icon /></div><div><BilingualText value={label} /><strong>{value}</strong>{note && <BilingualText value={note} className="stat-note" />}</div></article>;
}

export function StatusBadge({ active = true }: { active?: boolean }) { return <span className={`status-badge ${active ? 'active' : 'inactive'}`}><span /><BilingualText value={active ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} /></span>; }

export function PlayerAvatar({ id, large = false }: { id: string; large?: boolean }) { return <div className={`player-avatar ${large ? 'large' : ''}`} aria-label={`Preview player avatar ${id} | صورة لاعب تجريبية ${id}`}><UserRound /><span>{id.slice(-3)}</span></div>; }

export function Trend({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  return <span className={`metric-trend ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>{delta > 0 ? <ArrowUpRight /> : delta < 0 ? <ArrowDownRight /> : <Minus />}<BilingualText value={delta > 0 ? bi(`Up ${delta}`, `ارتفاع ${delta}`) : delta < 0 ? bi(`Down ${Math.abs(delta)}`, `انخفاض ${Math.abs(delta)}`) : bi('Stable', 'ثابت')} /></span>;
}

export function FuturePanel({ title, description }: { title: BilingualValue; description?: BilingualValue }) {
  return <div className="future-panel"><div className="future-mark">02</div><BilingualText value={bi('Architecture Ready', 'البنية جاهزة')} className="admin-eyebrow" /><h2><BilingualText value={title} /></h2><p><BilingualText value={description ?? bi('This module is scheduled for a later focused mission. No live operations are claimed in this preview.', 'هذه الوحدة مجدولة لمهمة مركزة لاحقة. لا توجد عمليات فعلية مزعومة في هذه المعاينة.')} /></p><span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Preview Only', 'معاينة فقط')} /></span></div>;
}

export function Tabs({ items, active, onChange }: { items: Array<{ id: string; label: BilingualValue }>; active: string; onChange: (id: string) => void }) {
  return <div className="admin-tabs" role="tablist">{items.map(item => <button key={item.id} role="tab" aria-selected={active === item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><BilingualText value={item.label} /></button>)}</div>;
}
