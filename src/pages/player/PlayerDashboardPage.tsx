import { Activity, ArrowRight, CalendarCheck, IdCard, MessageSquareText, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PlayerFeedbackCard } from '../../components/player/PlayerFeedbackCard';
import { PlayerMetricCard } from '../../components/player/PlayerMetricCard';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerAvatar, PlayerSectionHeader } from '../../components/player/PlayerUI';
import { getLatestPlayerFeedback, getLatestPlayerMetrics, getPlayerAttendanceStats, getPlayerProgressSummary } from '../../data/demo/selectors';

export function PlayerDashboardPage() {
  const { player, sport, group } = usePlayerPreview();
  if (!player) return null;
  const progress = getPlayerProgressSummary(player.id);
  const attendance = getPlayerAttendanceStats(player.id);
  const latestFeedback = getLatestPlayerFeedback(player.id);
  const strongestMetrics = getLatestPlayerMetrics(player.id).filter(item => item.current).sort((a, b) => (b.current?.value ?? 0) - (a.current?.value ?? 0)).slice(0, 3);

  return <div className="player-page player-dashboard-page">
    <PlayerSectionHeader eyebrow={bi('Player Dashboard', 'لوحة اللاعب')} title={bi('Your Development, Clearly Visible', 'تطورك واضح أمامك')} description={bi('Shared preview data brings your sport, training group, attendance, performance and coach evaluation into one personal view.', 'تجمع بيانات المعاينة المشتركة رياضتك ومجموعة التدريب والحضور والأداء وتقييم المدرب في واجهة شخصية واحدة.')} />

    <section className="player-athlete-hero"><PlayerAvatar id={player.id} large /><div className="player-athlete-copy"><span><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></span><h2><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></h2><div className="player-athlete-meta"><span><small><BilingualText value={bi('Sport', 'الرياضة')} /></small><strong>{sport && <BilingualText value={sport.name} />}</strong></span><span><small><BilingualText value={bi('Training Group', 'مجموعة التدريب')} /></small><strong>{group && <BilingualText value={group.name} />}</strong></span><span><small><BilingualText value={bi('Level', 'المستوى')} /></small><strong><BilingualText value={player.level} /></strong></span></div></div></section>

    <div className="player-dashboard-grid">
      <section className="player-score-card"><div><span><BilingualText value={bi('Overall Development', 'التطور العام')} /></span><strong>{progress.overall}<small>/100</small></strong></div><div className="score-trend"><TrendingUp aria-hidden="true" /><span><BilingualText value={bi('Performance Trend', 'اتجاه الأداء')} /><strong>{progress.delta >= 0 ? '+' : ''}{progress.delta}</strong></span></div><div className="player-progress-track" role="progressbar" aria-label="Overall Development | التطور العام" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.overall}><span style={{ width: `${Math.max(0, Math.min(100, progress.overall))}%` }} /></div><Link to="/player/progress"><BilingualText value={bi('Open Progress', 'فتح التقدم')} /><ArrowRight size={16} /></Link></section>

      <section className="player-attendance-card"><header><div><BilingualText value={bi('Attendance Snapshot', 'ملخص الحضور')} /><small><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></small></div><CalendarCheck aria-hidden="true" /></header><div className="attendance-numbers"><span><strong>{attendance.attended}</strong><BilingualText value={bi('Attended', 'حضر')} /></span><span><strong>{attendance.scheduled}</strong><BilingualText value={bi('Scheduled', 'مجدول')} /></span><span><strong>{attendance.rate}%</strong><BilingualText value={bi('Attendance Rate', 'معدل الحضور')} /></span></div><Link to="/player/attendance"><BilingualText value={bi('View Attendance', 'عرض الحضور')} /><ArrowRight size={16} /></Link></section>
    </div>

    <section className="player-dashboard-section"><header><div><h2><BilingualText value={bi('Sport Performance Snapshot', 'ملخص الأداء الرياضي')} /></h2><p><BilingualText value={sport ? bi(`Current metrics for ${sport.name.en}.`, `المؤشرات الحالية لرياضة ${sport.name.ar}.`) : bi('Current sport metrics.', 'مؤشرات الرياضة الحالية.')} /></p></div><Link to="/player/performance"><BilingualText value={bi('All Performance', 'كل الأداء')} /><ArrowRight size={16} /></Link></header><div className="player-metric-grid compact-grid">{strongestMetrics.map(item => <PlayerMetricCard key={item.definition.id} definition={item.definition} current={item.current} previous={item.previous} compact />)}</div></section>

    <section className="player-dashboard-section"><header><div><h2><BilingualText value={bi('Latest Coach Feedback', 'آخر تقييم للمدرب')} /></h2><p><BilingualText value={bi('Shared preview data demonstrates the intended cross-product contract.', 'بيانات المعاينة المشتركة توضح عقد الربط المقصود بين المنتجات.')} /></p></div><Link to="/player/feedback"><BilingualText value={bi('View Feedback', 'عرض التقييم')} /><ArrowRight size={16} /></Link></header>{latestFeedback ? <PlayerFeedbackCard feedback={latestFeedback} compact /> : <p className="player-muted"><BilingualText value={bi('No preview feedback is recorded for this player.', 'لا يوجد تقييم تجريبي مسجل لهذا اللاعب.')} /></p>}</section>

    <section className="player-quick-actions"><h2><BilingualText value={bi('Quick Actions', 'إجراءات سريعة')} /></h2><div><Link to="/player/id"><IdCard /><BilingualText value={bi('My ID', 'هويتي')} /><ArrowRight /></Link><Link to="/player/progress"><TrendingUp /><BilingualText value={bi('Progress', 'التقدم')} /><ArrowRight /></Link><Link to="/player/performance"><Activity /><BilingualText value={bi('Performance', 'الأداء')} /><ArrowRight /></Link><Link to="/player/attendance"><CalendarCheck /><BilingualText value={bi('Attendance', 'الحضور')} /><ArrowRight /></Link><Link to="/player/feedback"><MessageSquareText /><BilingualText value={bi('Coach Feedback', 'تقييم المدرب')} /><ArrowRight /></Link></div></section>
  </div>;
}
