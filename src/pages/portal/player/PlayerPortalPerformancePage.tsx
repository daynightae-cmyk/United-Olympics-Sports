import React, { useMemo } from 'react';
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  Award,
  Sparkles,
  Info,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalPerformancePage() {
  const { player, sport, metrics, overallScore } = usePlayerSession();

  if (!player) return null;

  const radarData = useMemo(() => {
    // Filter out metrics that have no current value to handle sparse data
    const activeMetrics = metrics.filter((m) => m.current?.value !== undefined);
    const count = activeMetrics.length;

    // If fewer than 3 metrics have values, drawing a polygon radar might not make sense or we just draw it anyway.
    // We will draw it anyway for consistency, but using 0 for missing values if we keep all metrics.
    // The instruction says "handle sparse data without injecting fake values".
    // Let's use all metrics, but if value is missing, it's 0.
    const fullCount = metrics.length;
    if (fullCount === 0) return null;

    const center = 140;
    const maxRadius = 95;

    const points = metrics.map((m, idx) => {
      const angle = (Math.PI * 2 * idx) / fullCount - Math.PI / 2;
      const val = m.current?.value ?? 0;
      const radius = maxRadius * (val / 100);
      const x = center + Math.cos(angle) * radius;
      const y = center + Math.sin(angle) * radius;

      // Label positioning slightly outside maxRadius
      const labelRadius = maxRadius + 26;
      const lx = center + Math.cos(angle) * labelRadius;
      const ly = center + Math.sin(angle) * labelRadius;

      return {
        x,
        y,
        lx,
        ly,
        value: val,
        name: m.definition.name,
      };
    });

    const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

    // Concentric grid circles / polygons at 25%, 50%, 75%, 100%
    const gridLevels = [0.25, 0.5, 0.75, 1.0].map((level) => {
      return metrics
        .map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / fullCount - Math.PI / 2;
          const r = maxRadius * level;
          return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
        })
        .join(' ');
    });

    return { center, maxRadius, points, polygonPoints, gridLevels };
  }, [metrics]);

  const latestEvaluation = useMemo(() => {
    const validMetrics = metrics.filter((m) => m.current?.recordedAt);
    if (validMetrics.length === 0) return null;
    return validMetrics.sort((a, b) => new Date(b.current!.recordedAt).getTime() - new Date(a.current!.recordedAt).getTime())[0].current;
  }, [metrics]);

  return (
    <div className="space-y-6" id="player-performance-page">
      {/* Header Card */}
      <div className="athlete-hero-card p-6 sm:p-7 border-amber-400/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <Activity size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Sport-Specific Analytics', 'التحليلات الفنية المتخصصة')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Athlete Performance Lab', 'مختبر أداء وتطوير الرياضي')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Skill evaluations on record for ${player.nameEn} · ${sport?.name.en || '—'}`,
                  `تقييم المهارات المسجل للاعب ${player.nameAr} · ${sport?.name.ar || '—'}`
                )}
              />
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-center">
              <span className="text-[10px] text-amber-300 font-semibold block uppercase">
                <BilingualText value={bi('Overall Skill Score', 'التقييم الإجمالي')} />
              </span>
              <strong className="text-2xl font-extrabold text-amber-400 font-mono">
                {overallScore !== null ? overallScore : <BilingualText value={bi('—', '—')} />}
                {overallScore !== null && <span className="text-xs font-normal text-slate-400">/100</span>}
              </strong>
            </div>
          </div>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Evaluated Skills', 'المهارات المقيمة')} /></span>
            <strong className="text-white text-xl font-bold">{metrics.length}</strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Sport Domain', 'التخصص الرياضي')} /></span>
            <strong className="text-amber-400 text-sm sm:text-base font-bold truncate">
              <BilingualText value={sport ? sport.name : bi('Athletics', 'رياضي')} />
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Last Evaluation', 'تاريخ التقييم الأخير')} /></span>
            <strong className="text-slate-300 text-sm font-semibold">
              {latestEvaluation?.recordedAt ? new Date(latestEvaluation.recordedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : <BilingualText value={bi('—', '—')} />}
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Status', 'الحالة')} /></span>
            <strong className="text-emerald-400 text-sm font-semibold">
              {latestEvaluation?.coachId ? <BilingualText value={bi('Coach Assessed', 'تقييم المدرب')} /> : <BilingualText value={bi('Pending', 'قيد الانتظار')} />}
            </strong>
          </div>
        </div>
      </div>

      {/* Radar Chart & Training Pulse Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Visualizer */}
        <div className="lg:col-span-6">
          <div className="athlete-glass-card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <BilingualText value={bi('Skill Radar Balance', 'رادار توازن المهارات')} />
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Scale: 0 – 100
                </span>
              </div>

              {radarData ? (
                <div className="py-4 flex justify-center items-center">
                  <svg
                    viewBox="0 0 280 280"
                    className="w-full max-w-[320px] overflow-visible athlete-radar-svg"
                    role="img"
                    aria-label="Skill Radar Balance Chart"
                  >
                    {/* Concentric Grid Polygons */}
                    {radarData.gridLevels.map((pts, i) => (
                      <polygon
                        key={i}
                        points={pts}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Radial Axis Lines */}
                    {radarData.points.map((p, i) => (
                      <line
                        key={i}
                        x1={radarData.center}
                        y1={radarData.center}
                        x2={p.lx}
                        y2={p.ly}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Active Skill Area Polygon */}
                    <polygon
                      points={radarData.polygonPoints}
                      fill="rgba(212, 175, 55, 0.25)"
                      stroke="#d4af37"
                      strokeWidth="2.5"
                    />

                    {/* Skill Point Circles */}
                    {radarData.points.map((p, i) => (
                      <g key={i}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="#f3ce5a"
                          stroke="#07090e"
                          strokeWidth="2"
                        />
                        <text
                          x={p.lx}
                          y={p.ly}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#cbd5e1"
                          fontSize="9"
                          fontWeight="600"
                          className="select-none"
                        >
                          {p.name.en}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <BilingualText value={bi('No metric coordinates available.', 'لا تتوفر إحداثيات للمؤشرات.')} />
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-3 border-t border-white/5">
              <BilingualText
                value={bi(
                  'Multi-axis representation of foundational attributes developed in training.',
                  'تمثيل متعدد المحاور للقدرات والمهارات الفنية المطورة في التدريب.'
                )}
              />
            </p>
          </div>
        </div>

        {/* Metric Benchmarks Breakdown */}
        <div className="lg:col-span-6">
          <div className="athlete-glass-card p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-400" />
                  <BilingualText value={bi('Sport Metric Benchmarks', 'مؤشرات الأداء التخصصية')} />
                </h3>
                <span className="text-[10px] text-slate-400">
                  <BilingualText value={bi('Latest vs. Previous', 'الأحدث مقارنة بالسابق')} />
                </span>
              </div>

              <div className="space-y-4">
                {metrics.map((m) => {
                  const currentVal = m.current?.value ?? 0;
                  const prevVal = m.previous?.value ?? 0;
                  const delta = currentVal - prevVal;
                  const pct = Math.min(100, Math.round((currentVal / 100) * 100));

                  return (
                    <div key={m.definition.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-100 block">
                            <BilingualText value={m.definition.name} />
                          </strong>
                          <span className="text-[10px] text-slate-400 block">
                            <BilingualText value={sport?.name || bi('Skill', 'مهارة')} />
                          </span>
                        </div>

                        <div className="text-right flex items-center gap-2">
                          <div>
                            <span className="font-mono font-bold text-amber-400 text-sm">
                              {currentVal}
                            </span>
                            <span className="text-[10px] text-slate-500">/100</span>
                          </div>

                          {delta !== 0 && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                delta > 0
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-red-500/15 text-red-400'
                              }`}
                            >
                              <ArrowUpRight size={11} className={delta < 0 ? 'rotate-90' : ''} />
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-start gap-2 text-[11px] text-slate-400">
              <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p>
                <BilingualText
                  value={bi(
                    'Performance values shown here are derived from athlete records available to this portal.',
                    'تعتمد مؤشرات الأداء المعروضة على سجلات اللاعب المتاحة في البوابة.'
                  )}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
