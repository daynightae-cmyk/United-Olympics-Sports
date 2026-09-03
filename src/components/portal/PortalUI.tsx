import { ArrowRight, CheckCircle2, LockKeyhole } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { EnterpriseProgress, EnterpriseSparkline } from '../enterprise/EnterpriseUI';

export function PortalMetric({ label, value, detail, tone = 'gold' }: { label: BilingualValue; value: string | number; detail?: BilingualValue; tone?: 'gold' | 'green' | 'blue' }) {
  return <article className={`portal-metric portal-metric-${tone}`}><strong>{value}</strong><BilingualText value={label} />{detail && <small><BilingualText value={detail} /></small>}</article>;
}

export function PortalSection({ title, description, actions, children, className = '' }: { title: BilingualValue; description?: BilingualValue; actions?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`portal-section ${className}`.trim()}><header><div><h2><BilingualText value={title} /></h2>{description && <p><BilingualText value={description} /></p>}</div>{actions}</header>{children}</section>;
}

export function PortalCard({ icon: Icon, title, description, children, className = '' }: { icon?: React.ComponentType<{ size?: number }>; title?: BilingualValue; description?: BilingualValue; children?: ReactNode; className?: string }) {
  return <article className={`portal-card ${className}`.trim()}>{Icon && <span className="portal-card-icon"><Icon size={18} /></span>}{title && <h3><BilingualText value={title} /></h3>}{description && <p><BilingualText value={description} /></p>}{children}</article>;
}

export function PortalAction({ to, icon: Icon, label, detail }: { to: string; icon: React.ComponentType<{ size?: number }>; label: BilingualValue; detail: BilingualValue }) {
  return <Link className="portal-action" to={to}><span className="portal-card-icon"><Icon size={17} /></span><span><strong><BilingualText value={label} /></strong><small><BilingualText value={detail} /></small></span><ArrowRight size={15} /></Link>;
}

export function PortalPreviewCard({ title, description, children }: { title: BilingualValue; description: BilingualValue; children?: ReactNode }) {
  return <div className="portal-preview-card"><div className="portal-preview-card-head"><span><LockKeyhole size={17} /></span><div><strong><BilingualText value={title} /></strong><small><BilingualText value={bi('Preview data boundary', 'حدود البيانات التجريبية')} /></small></div></div><p><BilingualText value={description} /></p>{children}</div>;
}

export function PortalStatus({ label, tone = 'active' }: { label: BilingualValue; tone?: 'active' | 'pending' | 'neutral' }) {
  return <span className={`portal-status portal-status-${tone}`}><CheckCircle2 size={12} /><BilingualText value={label} /></span>;
}

export function PortalTrend({ values, label, value, color = 'gold' }: { values: number[]; label: BilingualValue; value: string; color?: 'gold' | 'green' | 'blue' }) {
  return <div className="portal-trend"><div><small><BilingualText value={label} /></small><strong>{value}</strong></div><EnterpriseSparkline values={values} color={color} /></div>;
}

export { EnterpriseProgress };
export const portalCopy = {
  localUpdate: bi('Preview record updated locally', 'تم تحديث السجل التجريبي محليًا'),
};
