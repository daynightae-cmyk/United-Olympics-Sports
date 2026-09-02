import { ArrowDownRight, ArrowUpRight, Focus, Sparkles, TrendingUp } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { formatBilingualDate } from '../../components/player/playerFormat';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerSectionHeader } from '../../components/player/PlayerUI';
import { getLatestPlayerFeedback, getPlayerProgressSummary } from '../../data/demo/selectors';

export function PlayerProgressPage() {
  const { player } = usePlayerPreview();
  if (!player) return null;
  const progress = getPlayerProgressSummary(player.id);
  const feedback = getLatestPlayerFeedback(player.id);
  const improving = progress.delta >= 0;
  const TrendIcon = improving ? ArrowUpRight : ArrowDownRight;

  return <div className="player-page">
    <PlayerSectionHeader eyebrow={bi('Progress', 'التقدم')} title={bi('My Development', 'تطوري')} description={bi('A broader view of development derived only from the player’s existing preview performance and coach feedback records.', 'نظرة أوسع على التطور مستمدة فقط من سجلات الأداء والتقييم التجريبية الموجودة للاعب.')} />
    <section className="progress-overview-card"><div><BilingualText value={bi('This Period', 'هذه الفترة')} /><strong>{progress.overall}<small>/100</small></strong><span><BilingualText value={bi('Latest Evaluation', 'آخر تقييم')} /><BilingualText value={formatBilingualDate(progress.latestDate)} /></span></div><div className={improving ? 'progress-direction improving' : 'progress-direction'}><TrendIcon /><strong><BilingualText value={improving ? bi('Improving', 'يتحسن') : bi('Focus Needed', 'يحتاج تركيزًا')} /></strong><span>{progress.delta >= 0 ? '+' : ''}{progress.delta}</span></div></section>

    <div className="progress-insight-grid"><article><Sparkles /><span><BilingualText value={bi('Improving', 'يتحسن')} /></span><strong>{progress.improvingCount} / {progress.metricCount}</strong><p><BilingualText value={bi('Sport metrics currently above their previous recorded values.', 'مؤشرات رياضية أعلى حاليًا من قيمها المسجلة السابقة.')} /></p></article><article><TrendingUp /><span><BilingualText value={bi('Strongest Current Metric', 'أقوى مؤشر حالي')} /></span><strong>{progress.strongest ? <BilingualText value={progress.strongest.definition.name} /> : '—'}</strong><p>{progress.strongest?.current?.value ?? '—'} / 100</p></article><article><Focus /><span><BilingualText value={bi('Focus Next', 'التركيز القادم')} /></span><strong>{progress.focusNext ? <BilingualText value={progress.focusNext.definition.name} /> : '—'}</strong><p>{progress.focusNext?.current?.value ?? '—'} / 100</p></article></div>

    <section className="player-coach-notes"><header><h2><BilingualText value={bi('Coach Notes', 'ملاحظات المدرب')} /></h2><span><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span></header>{feedback ? <><p><BilingualText value={feedback.summary} /></p><div>{feedback.focusAreas.map(item => <span key={item.en}><BilingualText value={item} /></span>)}</div></> : <p><BilingualText value={bi('No coach notes are recorded for this preview player.', 'لا توجد ملاحظات مدرب مسجلة لهذا اللاعب التجريبي.')} /></p>}</section>
  </div>;
}
