import { Star, Dumbbell, BarChart2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PerformanceRecord } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

interface PlayerPerformanceSnapshotCardProps {
  overallScore?: number | null;
  metrics?: PerformanceRecord[];
}

export function PlayerPerformanceSnapshotCard({
  overallScore,
  metrics = [],
}: PlayerPerformanceSnapshotCardProps) {
  const hasScore = typeof overallScore === 'number' && Number.isFinite(overallScore);

  const trainingMetric = metrics.find((m) => /training|rating/i.test(m.metricId));
  const hasTraining = trainingMetric && typeof trainingMetric.value === 'number' && Number.isFinite(trainingMetric.value);

  const fitnessMetric = metrics.find((m) => /fitness|stamina|endurance/i.test(m.metricId));
  const hasFitness = fitnessMetric && typeof fitnessMetric.value === 'number' && Number.isFinite(fitnessMetric.value);
  const fitnessScore = hasFitness ? `${Math.round(fitnessMetric.value)} / 100` : null;

  const skillMetric = metrics.find((m) => /skill|tech|ball/i.test(m.metricId));
  const hasSkill = skillMetric && typeof skillMetric.value === 'number' && Number.isFinite(skillMetric.value);
  const skillRating = hasSkill ? `${(skillMetric.value / 20).toFixed(1)} / 5` : null;

  const disciplineMetric = metrics.find((m) => /discipline|attitude|focus/i.test(m.metricId));
  const hasDiscipline = disciplineMetric && typeof disciplineMetric.value === 'number' && Number.isFinite(disciplineMetric.value);
  const disciplineScore = hasDiscipline ? `${(disciplineMetric.value / 20).toFixed(1)} / 5` : null;

  const firstTileLabel = hasTraining
    ? { en: 'Training Rating', ar: 'تقييم التدريب' }
    : { en: 'Overall Score', ar: 'النتيجة العامة' };
  const firstTileScore = hasTraining
    ? `${(trainingMetric.value / 20).toFixed(1)} / 5`
    : (hasScore ? `${Math.round(overallScore)} / 100` : null);

  return (
    <article className="athlete-dark-card performance-snapshot-reference-card" aria-labelledby="ref-perf-title">
      <header className="athlete-dark-card__header">
        <h2 id="ref-perf-title" className="athlete-dark-card__title">
          <BilingualText value={bi('Performance Snapshot', 'لمحة عن الأداء')} />
        </h2>
        <Link to="/player/performance" className="athlete-dark-card__period-link">
          <BilingualText value={bi('Recorded Performance', 'الأداء المسجل')} />
        </Link>
      </header>

      <div className="performance-snapshot-reference-grid">
        {/* Overall Score / Training Rating */}
        <div className="performance-snapshot-tile">
          <div className="performance-snapshot-icon-circle">
            <Star size={16} className="text-amber-400 fill-amber-400" />
          </div>
          <div className="performance-snapshot-labels">
            <span className="performance-snapshot-label-en">{firstTileLabel.en}</span>
            <span className="performance-snapshot-label-ar">{firstTileLabel.ar}</span>
          </div>
          <strong className="performance-snapshot-val" dir="ltr">
            {firstTileScore ?? <span className="text-slate-500 text-xs font-normal"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>}
          </strong>
        </div>

        {/* Fitness Score */}
        <div className="performance-snapshot-tile">
          <div className="performance-snapshot-icon-circle">
            <Dumbbell size={16} className="text-amber-400" />
          </div>
          <div className="performance-snapshot-labels">
            <span className="performance-snapshot-label-en">Fitness Score</span>
            <span className="performance-snapshot-label-ar">اللياقة البدنية</span>
          </div>
          <strong className="performance-snapshot-val" dir="ltr">
            {fitnessScore ?? <span className="text-slate-500 text-xs font-normal"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>}
          </strong>
        </div>

        {/* Skill Rating */}
        <div className="performance-snapshot-tile">
          <div className="performance-snapshot-icon-circle">
            <BarChart2 size={16} className="text-amber-400" />
          </div>
          <div className="performance-snapshot-labels">
            <span className="performance-snapshot-label-en">Skill Rating</span>
            <span className="performance-snapshot-label-ar">المهارات</span>
          </div>
          <strong className="performance-snapshot-val" dir="ltr">
            {skillRating ?? <span className="text-slate-500 text-xs font-normal"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>}
          </strong>
        </div>

        {/* Discipline */}
        <div className="performance-snapshot-tile">
          <div className="performance-snapshot-icon-circle">
            <Shield size={16} className="text-amber-400" />
          </div>
          <div className="performance-snapshot-labels">
            <span className="performance-snapshot-label-en">Discipline</span>
            <span className="performance-snapshot-label-ar">الانضباط</span>
          </div>
          <strong className="performance-snapshot-val" dir="ltr">
            {disciplineScore ?? <span className="text-slate-500 text-xs font-normal"><BilingualText value={bi('Not recorded', 'غير مسجل')} /></span>}
          </strong>
        </div>
      </div>
    </article>
  );
}
