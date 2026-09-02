import { ArrowRight, CheckCircle2, Focus } from 'lucide-react';
import type { CoachFeedback } from '../../domain/contracts';
import { getSportMetrics } from '../../data/demo/selectors';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { formatBilingualDate } from './playerFormat';

export function PlayerFeedbackCard({ feedback, compact = false }: { feedback: CoachFeedback; compact?: boolean }) {
  const definitions = getSportMetrics(feedback.sportId);
  return <article className={`player-feedback-card ${compact ? 'compact' : ''}`}>
    <header><div><BilingualText value={bi('Coach Feedback', 'تقييم المدرب')} /><small><BilingualText value={formatBilingualDate(feedback.createdAt)} /></small></div><code>{feedback.coachId}</code></header>
    <p><BilingualText value={feedback.summary} /></p>
    {!compact && <><div className="player-feedback-columns"><section><h3><CheckCircle2 /><BilingualText value={bi('Strengths', 'نقاط القوة')} /></h3>{feedback.strengths.map(item => <span key={item.en}><BilingualText value={item} /></span>)}</section><section><h3><Focus /><BilingualText value={bi('Focus Areas', 'نقاط التركيز')} /></h3>{feedback.focusAreas.map(item => <span key={item.en}><BilingualText value={item} /></span>)}</section></div><div className="metric-change-list"><h3><BilingualText value={bi('Metric Changes', 'تغير المؤشرات')} /></h3>{feedback.metricChanges.map(change => { const definition = definitions.find(item => item.id === change.metricId); return <div key={change.metricId}><span>{definition ? <BilingualText value={definition.name} /> : <code>{change.metricId}</code>}</span><strong>{change.previousValue}<ArrowRight size={14} />{change.currentValue}</strong></div>; })}</div></>}
    <footer><span><BilingualText value={bi('Evaluation Date', 'تاريخ التقييم')} /><strong><BilingualText value={formatBilingualDate(feedback.createdAt)} /></strong></span><span><BilingualText value={bi('Coach Reference', 'مرجع المدرب')} /><strong><code>{feedback.coachId}</code></strong></span></footer>
  </article>;
}
