import { Activity, ArrowDownRight, ArrowUpRight, Info, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalPerformancePage() {
  const { player, sport, metrics, overallScore } = usePlayerSession();
  if (!player) return null;

  const availableMetrics = useMemo(() => metrics.filter((metric) => typeof metric.current?.value === 'number'), [metrics]);
  const latestRecord = useMemo(() => availableMetrics
    .filter((metric) => metric.current?.recordedAt)
    .sort((a, b) => new Date(b.current!.recordedAt).getTime() - new Date(a.current!.recordedAt).getTime())
    .at(0)?.current ?? null, [availableMetrics]);

  const radar = useMemo(() => {
    if (availableMetrics.length < 3) return null;
    const center = 150;
    const maxRadius = 92;
    const points = availableMetrics.map((metric, index) => {
      const value = metric.current!.value;
      const angle = (Math.PI * 2 * index) / availableMetrics.length - Math.PI / 2;
      const radius = maxRadius * (Math.min(100, Math.max(0, value)) / 100);
      const labelRadius = maxRadius + 34;
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        lx: center + Math.cos(angle) * labelRadius,
        ly: center + Math.sin(angle) * labelRadius,
        label: metric.definition.name,
      };
    });
    const grid = [0.25, 0.5, 0.75, 1].map((level) => availableMetrics.map((_, index) => {
      const angle = (Math.PI * 2 * index) / availableMetrics.length - Math.PI / 2;
      const radius = maxRadius * level;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    }).join(' '));
    return { center, points, grid, polygon: points.map((point) => `${point.x},${point.y}`).join(' ') };
  }, [availableMetrics]);

  return (
    <div className="space-y-6" id="player-performance-page">
      <section className="athlete-hero-card p-6 sm:p-7 border-amber-400/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Activity size={18} /><BilingualText value={bi('Recorded Performance', 'الأداء المسجل')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Athlete Performance Lab', 'مختبر أداء اللاعب')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Only metric records currently attached to ${player.nameEn} are analysed. Missing metrics never become zero-value scores.`, `يتم تحليل سجلات القياس المرتبطة حاليًا باللاعب ${player.nameAr} فقط. ولا تتحول المؤشرات المفقودة إلى درجات بقيمة صفر.`)} /></p></div>
          <div className="px-4 py-3 rounded-2xl bg-amber-400/10 border border-amber-400/25 min-w-40 text-center"><span className="text-[10px] text-amber-300 font-semibold block"><BilingualText value={bi('Overall recorded signal', 'المؤشر الإجمالي المسجل')} /></span><strong className={overallScore === null ? 'mt-1 block text-xs text-slate-400' : 'mt-1 block text-2xl text-amber-300 font-black font-mono'}>{overallScore === null ? <BilingualText value={bi('Not recorded', 'غير مسجل')} /> : `${overallScore}/100`}</strong></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <PerformanceStat label={bi('Metrics with records', 'المؤشرات ذات السجلات')} value={availableMetrics.length ? String(availableMetrics.length) : undefined} />
          <PerformanceStat label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
          <PerformanceStat label={bi('Latest record', 'أحدث سجل')} value={latestRecord?.recordedAt ? formatDate(latestRecord.recordedAt) : undefined} />
        </div>
      </section>

      {!availableMetrics.length ? (
        <div className="athlete-empty-system"><div><Activity size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No performance records yet', 'لا توجد سجلات أداء حتى الآن')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Charts and scores remain unset until at least one real metric record exists for this athlete.', 'تظل الرسوم والدرجات غير محددة حتى يتوفر سجل قياس فعلي واحد على الأقل لهذا اللاعب.')} /></p></div></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <section className="xl:col-span-5 athlete-glass-card p-5 sm:p-6">
            <header className="flex items-center justify-between gap-3 pb-4 border-b border-white/10"><h2 className="text-sm font-bold text-white flex items-center gap-2"><Zap size={16} className="text-amber-400" /><BilingualText value={bi('Skill Balance', 'توازن المهارات')} /></h2><span className="text-[10px] text-slate-500">0–100</span></header>
            {radar ? (
              <div className="pt-5">
                <svg viewBox="0 0 300 300" className="w-full max-w-[360px] mx-auto overflow-visible" role="img" aria-label="Recorded skill balance | توازن المهارات المسجلة">
                  {radar.grid.map((points) => <polygon key={points} points={points} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />)}
                  {radar.points.map((point) => <line key={`axis-${point.label.en}`} x1={radar.center} y1={radar.center} x2={point.lx} y2={point.ly} stroke="rgba(255,255,255,.08)" />)}
                  <polygon points={radar.polygon} fill="rgba(212,175,55,.22)" stroke="#d4af37" strokeWidth="2.5" />
                  {radar.points.map((point) => <g key={point.label.en}><circle cx={point.x} cy={point.y} r="4" fill="#f3ce5a" stroke="#07090e" strokeWidth="2" /><text x={point.lx} y={point.ly} textAnchor="middle" dominantBaseline="middle" fill="#cbd5e1" fontSize="7.5" fontWeight="600">{point.label.en} / {point.label.ar}</text></g>)}
                </svg>
                <div className="athlete-truth-note mt-4"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Radar axes are created only for metrics that have a recorded current value.', 'يتم إنشاء محاور الرادار فقط للمؤشرات التي تحتوي على قيمة حالية مسجلة.')} /></div>
              </div>
            ) : (
              <div className="py-10 text-center"><TrendingUp size={28} className="mx-auto text-amber-400/70" /><h3 className="mt-3 text-sm font-bold text-white"><BilingualText value={bi('Three recorded metrics are required for radar view', 'يتطلب عرض الرادار ثلاثة مؤشرات مسجلة')} /></h3><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Available metrics remain visible individually instead of adding synthetic axes.', 'تبقى المؤشرات المتاحة ظاهرة بشكل فردي بدل إضافة محاور مصطنعة.')} /></p></div>
            )}
          </section>

          <section className="xl:col-span-7 athlete-glass-card p-5 sm:p-6">
            <header className="flex items-center justify-between gap-3 pb-4 border-b border-white/10"><h2 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp size={16} className="text-amber-400" /><BilingualText value={bi('Recorded Metrics', 'المؤشرات المسجلة')} /></h2><span className="text-[10px] text-slate-500"><BilingualText value={bi('Current / previous when present', 'الحالي / السابق عند توفره')} /></span></header>
            <div className="mt-4 space-y-3">
              {availableMetrics.map((metric) => {
                const current = metric.current!.value;
                const previous = metric.previous?.value;
                const delta = typeof previous === 'number' ? current - previous : null;
                return <article key={metric.definition.id} className="rounded-2xl border border-white/9 bg-white/[.025] p-4"><div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3"><div><h3 className="text-xs font-bold text-white"><BilingualText value={metric.definition.name} /></h3><span className="mt-1 block text-[10px] text-slate-500">{metric.current?.recordedAt ? formatDate(metric.current.recordedAt) : ''}</span>{metric.definition.description && <p className="mt-2 text-[11px] leading-5 text-slate-400"><BilingualText value={metric.definition.description} /></p>}</div><div className="flex items-center gap-2"><strong className="text-lg font-black font-mono text-amber-300">{current}{metric.definition.unit ? <span className="text-[10px] text-slate-500 ms-1"><BilingualText value={metric.definition.unit} /></span> : null}</strong>{delta !== null && delta !== 0 && <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${delta > 0 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>{delta > 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{delta > 0 ? `+${delta}` : delta}</span>}</div></div><div className="mt-3 h-1.5 rounded-full bg-white/8 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-300" style={{ width: `${Math.min(100, Math.max(0, current))}%` }} /></div>{typeof previous !== 'number' && <p className="mt-2 text-[10px] text-slate-500"><BilingualText value={bi('No previous comparison is recorded.', 'لا توجد مقارنة سابقة مسجلة.')} /></p>}</article>;
              })}
            </div>
            <div className="athlete-truth-note mt-5"><Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('The overall signal is an average of currently recorded metric values; it is a preview calculation, not an official certification or ranking.', 'المؤشر الإجمالي هو متوسط قيم المؤشرات المسجلة حاليًا؛ وهو حساب للمعاينة وليس اعتمادًا أو تصنيفًا رسميًا.')} /></div>
          </section>
        </div>
      )}
    </div>
  );
}

function PerformanceStat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-slate-100 text-sm font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })} · ${date.toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })}`;
}
