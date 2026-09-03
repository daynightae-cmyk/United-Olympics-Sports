import { useMemo } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Info, TrendingUp, Zap } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalPerformancePage() {
  const { player, sport, metrics, overallScore } = usePlayerSession();
  if (!player) return null;

  const availableMetrics = useMemo(
    () => metrics.filter((metric) => typeof metric.current?.value === 'number'),
    [metrics],
  );

  const latestEvaluation = useMemo(() => availableMetrics
    .filter((metric) => metric.current?.recordedAt)
    .sort((a, b) => new Date(b.current!.recordedAt).getTime() - new Date(a.current!.recordedAt).getTime())
    .at(0)?.current ?? null,
  [availableMetrics]);

  const radarData = useMemo(() => {
    if (availableMetrics.length < 3) return null;
    const center = 140;
    const maxRadius = 95;
    const points = availableMetrics.map((metric, index) => {
      const value = metric.current!.value;
      const angle = (Math.PI * 2 * index) / availableMetrics.length - Math.PI / 2;
      const radius = maxRadius * (Math.min(100, Math.max(0, value)) / 100);
      const labelRadius = maxRadius + 26;
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        lx: center + Math.cos(angle) * labelRadius,
        ly: center + Math.sin(angle) * labelRadius,
        name: metric.definition.name,
      };
    });
    const gridLevels = [0.25, 0.5, 0.75, 1].map((level) => availableMetrics.map((_, index) => {
      const angle = (Math.PI * 2 * index) / availableMetrics.length - Math.PI / 2;
      const radius = maxRadius * level;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    }).join(' '));
    return { center, points, gridLevels, polygonPoints: points.map((point) => `${point.x},${point.y}`).join(' ') };
  }, [availableMetrics]);

  return (
    <div className="space-y-6" id="player-performance-page">
      <section className="athlete-hero-card p-6 sm:p-7 border-amber-400/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2"><span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400"><Activity size={18} /></span><span className="text-xs font-semibold uppercase tracking-wider text-amber-400"><BilingualText value={bi('Recorded performance', 'الأداء المسجل')} /></span></div>
            <h1 className="text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Athlete Performance', 'أداء اللاعب')} /></h1>
            <p className="text-xs text-slate-300"><BilingualText value={bi(`Available skill records for ${player.nameEn}`, `سجلات المهارات المتاحة للاعب ${player.nameAr}`)} /></p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-amber-400/10 border border-amber-400/25 min-w-36 text-center">
            <span className="text-[10px] text-amber-300 font-semibold block uppercase"><BilingualText value={bi('Overall signal', 'المؤشر الإجمالي')} /></span>
            <strong className="text-2xl font-extrabold text-amber-400 font-mono">{overallScore === null ? <BilingualText value={bi('Not recorded', 'غير مسجل')} /> : <>{overallScore}<span className="text-xs font-normal text-slate-400">/100</span></>}</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <PerformanceStat label={bi('Metrics with records', 'المؤشرات ذات السجلات')} value={String(availableMetrics.length)} />
          <PerformanceStat label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
          <PerformanceStat label={bi('Last record', 'آخر سجل')} value={latestEvaluation?.recordedAt ? new Date(latestEvaluation.recordedAt).toLocaleDateString() : undefined} />
        </div>
      </section>

      {availableMetrics.length === 0 ? (
        <section className="athlete-glass-card p-10 text-center">
          <Activity size={30} className="mx-auto text-slate-500" />
          <h2 className="mt-4 text-base font-bold text-slate-200"><BilingualText value={bi('No performance records yet', 'لا توجد سجلات أداء حتى الآن')} /></h2>
          <p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Charts remain empty until a real metric record is available for this athlete.', 'تظل الرسوم فارغة حتى يتوفر سجل قياس حقيقي لهذا اللاعب.')} /></p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-6 athlete-glass-card p-6">
            <header className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4"><h2 className="text-sm font-bold text-white flex items-center gap-2"><Zap size={16} className="text-amber-400" /><BilingualText value={bi('Skill balance', 'توازن المهارات')} /></h2><span className="text-[10px] text-slate-500">0–100</span></header>
            {radarData ? (
              <div className="py-4 flex justify-center">
                <svg viewBox="0 0 280 280" className="w-full max-w-[320px] overflow-visible athlete-radar-svg" role="img" aria-label="Recorded skill balance · توازن المهارات المسجلة">
                  {radarData.gridLevels.map((points) => <polygon key={points} points={points} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />)}
                  {radarData.points.map((point) => <line key={`${point.lx}-${point.ly}`} x1={radarData.center} y1={radarData.center} x2={point.lx} y2={point.ly} stroke="rgba(255,255,255,.08)" />)}
                  <polygon points={radarData.polygonPoints} fill="rgba(212,175,55,.22)" stroke="#d4af37" strokeWidth="2.5" />
                  {radarData.points.map((point) => <g key={point.name.en}><circle cx={point.x} cy={point.y} r="4" fill="#f3ce5a" stroke="#07090e" strokeWidth="2" /><text x={point.lx} y={point.ly} textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="9" fontWeight="600">{point.name.en}</text></g>)}
                </svg>
              </div>
            ) : (
              <div className="py-10 text-center"><TrendingUp size={26} className="mx-auto text-amber-400/70" /><h3 className="mt-3 text-sm font-bold text-slate-200"><BilingualText value={bi('Radar needs at least three recorded metrics', 'يتطلب الرادار ثلاثة مؤشرات مسجلة على الأقل')} /></h3><p className="mt-2 text-xs text-slate-400"><BilingualText value={bi('The available one or two metrics are shown individually without adding zero-value axes.', 'يتم عرض المؤشر أو المؤشرين المتاحين بشكل منفصل دون إضافة محاور بقيمة صفرية.')} /></p></div>
            )}
          </section>

          <section className="lg:col-span-6 athlete-glass-card p-6">
            <header className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 mb-4"><h2 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp size={16} className="text-amber-400" /><BilingualText value={bi('Recorded metrics', 'المؤشرات المسجلة')} /></h2><span className="text-[10px] text-slate-500"><BilingualText value={bi('Current / previous when present', 'الحالي / السابق عند توفره')} /></span></header>
            <div className="space-y-4">
              {availableMetrics.map((metric) => {
                const currentValue = metric.current!.value;
                const previousValue = metric.previous?.value;
                const delta = typeof previousValue === 'number' ? currentValue - previousValue : null;
                return (
                  <article key={metric.definition.id} className="p-3.5 rounded-xl bg-white/[.035] border border-white/7 space-y-2">
                    <div className="flex items-center justify-between gap-3"><div><strong className="text-xs font-bold text-slate-100 block"><BilingualText value={metric.definition.name} /></strong><small className="text-[10px] text-slate-500">{metric.current?.recordedAt ? new Date(metric.current.recordedAt).toLocaleDateString() : ''}</small></div><div className="flex items-center gap-2"><span className="font-mono font-bold text-amber-400 text-sm">{currentValue}</span>{delta !== null && delta !== 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${delta > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{delta > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{delta > 0 ? `+${delta}` : delta}</span>}</div></div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${Math.min(100, Math.max(0, currentValue))}%` }} /></div>
                    {typeof previousValue !== 'number' && <p className="text-[10px] text-slate-500"><BilingualText value={bi('No previous comparison recorded.', 'لا توجد مقارنة سابقة مسجلة.')} /></p>}
                  </article>
                );
              })}
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex gap-2 text-[11px] text-slate-400"><Info size={14} className="text-amber-400 flex-shrink-0" /><BilingualText value={bi('Only values present in the athlete record are rendered. Missing metrics are never converted to zero.', 'يتم عرض القيم الموجودة في سجل اللاعب فقط. ولا يتم تحويل المؤشرات المفقودة إلى صفر.')} /></div>
          </section>
        </div>
      )}
    </div>
  );
}

function PerformanceStat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-slate-100 text-sm font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}
