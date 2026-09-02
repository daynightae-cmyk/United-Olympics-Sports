import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { MetricDefinition, PerformanceRecord } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { formatBilingualDate, metricValue } from './playerFormat';

export function PlayerMetricCard({ definition, current, previous, compact = false }: { definition: MetricDefinition; current?: PerformanceRecord; previous?: PerformanceRecord; compact?: boolean }) {
  const currentValue = current?.value;
  const previousValue = previous?.value;
  const delta = typeof currentValue === 'number' && typeof previousValue === 'number' ? currentValue - previousValue : 0;
  const TrendIcon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight;
  const trend = delta > 0 ? bi(`Up ${delta}`, `ارتفاع ${delta}`) : delta < 0 ? bi(`Down ${Math.abs(delta)}`, `انخفاض ${Math.abs(delta)}`) : bi('Stable', 'ثابت');
  const width = Math.max(0, Math.min(100, currentValue ?? 0));

  return <article className={`player-metric-card ${compact ? 'compact' : ''}`}>
    <div className="player-metric-heading"><div><BilingualText value={definition.name} /><small><BilingualText value={bi('Sport Metric', 'مؤشر رياضي')} /></small></div><strong>{metricValue(currentValue)}</strong></div>
    <div className="player-progress-track" role="progressbar" aria-label={`${definition.name.en} | ${definition.name.ar}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={currentValue ?? 0}><span style={{ width: `${width}%` }} /></div>
    {!compact && <dl className="player-metric-details"><div><dt><BilingualText value={bi('Current Value', 'القيمة الحالية')} /></dt><dd>{metricValue(currentValue)} {definition.unit && <BilingualText value={definition.unit} />}</dd></div><div><dt><BilingualText value={bi('Previous Value', 'القيمة السابقة')} /></dt><dd>{metricValue(previousValue)}</dd></div><div><dt><BilingualText value={bi('Trend', 'الاتجاه')} /></dt><dd className={delta > 0 ? 'trend-up' : delta < 0 ? 'trend-down' : 'trend-flat'}><TrendIcon size={16} /><BilingualText value={trend} /></dd></div><div><dt><BilingualText value={bi('Recorded Date', 'تاريخ التسجيل')} /></dt><dd><BilingualText value={formatBilingualDate(current?.recordedAt)} /></dd></div></dl>}
  </article>;
}
