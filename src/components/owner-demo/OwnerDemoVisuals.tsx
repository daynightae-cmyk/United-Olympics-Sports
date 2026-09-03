import { ArrowLeft, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { ThemeToggle } from '../ui/ThemeToggle';
import SafeBrandLogo from '../ui/SafeBrandLogo';

export function PreviewBadge({ label = bi('Preview Experience', 'تجربة تجريبية') }: { label?: BilingualValue }) {
  return <span className="od-preview-badge"><span aria-hidden="true" /><BilingualText value={label} /></span>;
}

export function PreviewAvatar({ id, large = false }: { id: string; large?: boolean }) {
  return <div className={`od-avatar ${large ? 'large' : ''}`} aria-label={`Preview athlete avatar ${id} | صورة رياضي تجريبية ${id}`}><UserRound aria-hidden="true" /><span>{id.slice(-3)}</span></div>;
}

export function MetricRing({ value, label }: { value: number; label: BilingualValue }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="od-metric-ring" style={{ '--metric-progress': `${safeValue * 3.6}deg` } as React.CSSProperties}><div><strong>{safeValue}</strong><small>/100</small><BilingualText value={label} /></div></div>;
}

export function SportConceptVisual({ sportId, compact = false }: { sportId: string; compact?: boolean }) {
  return <div className={`od-sport-concept ${sportId} ${compact ? 'compact' : ''}`} role="img" aria-label={`${sportId} concept visual | تصور بصري لرياضة ${sportId}`}>
    <div className="od-concept-grid" aria-hidden="true" />
    {sportId === 'tennis' && <><div className="od-tennis-court" aria-hidden="true"><i /><i /><i /></div><div className="od-tennis-racket" aria-hidden="true" /><div className="od-tennis-ball" aria-hidden="true" /></>}
    {sportId === 'gymnastics' && <><div className="od-gym-ring r1" aria-hidden="true" /><div className="od-gym-ring r2" aria-hidden="true" /><div className="od-gym-ribbon" aria-hidden="true" /><div className="od-gym-beam" aria-hidden="true" /></>}
    {sportId === 'martial-arts' && <><div className="od-dojo-mat" aria-hidden="true" /><div className="od-martial-belt" aria-hidden="true"><i /></div><div className="od-martial-arc" aria-hidden="true" /></>}
    <span className="od-concept-label"><BilingualText value={sportId === 'tennis' ? bi('Tennis Concept', 'تصور التنس') : sportId === 'gymnastics' ? bi('Gymnastics Concept', 'تصور الجمباز') : bi('Martial Arts Concept', 'تصور الفنون القتالية')} /></span>
  </div>;
}

export function ProductPreviewHeader({ product }: { product: BilingualValue }) {
  return <header className="od-product-header">
    <Link to="/" className="od-product-brand"><SafeBrandLogo className="od-product-logo" /><span><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small></span></Link>
    <div className="od-product-title"><BilingualText value={product} /><PreviewBadge /></div>
    <div className="od-product-header-actions"><ThemeToggle compact /><Link className="od-public-return" to="/"><ArrowLeft aria-hidden="true" /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link></div>
  </header>;
}
