import { Activity, ClipboardCheck, TrendingUp } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PlayerMetricCard } from '../../components/player/PlayerMetricCard';
import { formatBilingualDate } from '../../components/player/playerFormat';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerSectionHeader } from '../../components/player/PlayerUI';
import { getLatestPlayerFeedback, getLatestPlayerMetrics, getPlayerProgressSummary } from '../../data/demo/selectors';

export function PlayerPerformancePage() {
  const { player, sport } = usePlayerPreview();
  if (!player) return null;
  const metrics = getLatestPlayerMetrics(player.id);
  const progress = getPlayerProgressSummary(player.id);
  const feedback = getLatestPlayerFeedback(player.id);

  return <div className="player-page">
    <PlayerSectionHeader eyebrow={bi('Performance', 'الأداء')} title={bi('Sport-Aware Performance', 'أداء مرتبط بالرياضة')} description={sport ? bi(`These metric definitions come from the shared ${sport.name.en} performance model.`, `تعريفات المؤشرات هذه تأتي من نموذج أداء ${sport.name.ar} المشترك.`) : bi('Metric definitions come from the shared sport performance model.', 'تعريفات المؤشرات تأتي من نموذج الأداء الرياضي المشترك.')} />
    <div className="performance-summary-grid"><article><TrendingUp /><span><BilingualText value={bi('Overall Development', 'التطور العام')} /></span><strong>{progress.overall}<small>/100</small></strong></article><article><Activity /><span><BilingualText value={bi('Performance Trend', 'اتجاه الأداء')} /></span><strong>{progress.delta >= 0 ? '+' : ''}{progress.delta}</strong></article><article><ClipboardCheck /><span><BilingualText value={bi('Latest Evaluation', 'آخر تقييم')} /></span><strong><BilingualText value={formatBilingualDate(progress.latestDate)} /></strong></article></div>
    <section className="player-dashboard-section"><header><div><h2><BilingualText value={bi('Sport Metrics', 'مؤشرات الرياضة')} /></h2><p><BilingualText value={bi('Current and previous values are read directly from the shared preview performance records.', 'تتم قراءة القيم الحالية والسابقة مباشرة من سجلات الأداء التجريبية المشتركة.')} /></p></div></header><div className="player-metric-grid">{metrics.map(item => <PlayerMetricCard key={item.definition.id} definition={item.definition} current={item.current} previous={item.previous} />)}</div></section>
    <section className="performance-coach-assessment"><header><ClipboardCheck /><h2><BilingualText value={bi('Coach Assessment', 'تقييم المدرب')} /></h2></header>{feedback ? <><p><BilingualText value={feedback.summary} /></p><span><BilingualText value={bi('Coach Reference', 'مرجع المدرب')} /><code>{feedback.coachId}</code></span></> : <p><BilingualText value={bi('No coach assessment is recorded for this preview player.', 'لا يوجد تقييم مدرب مسجل لهذا اللاعب التجريبي.')} /></p>}</section>
  </div>;
}
