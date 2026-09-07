import { Activity, BarChart3, Info, ShieldCheck } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalPerformancePage() {
  const { player, sport, overallScore } = usePlayerSession();
  if (!player) return null;

  const hasAggregateScore = typeof overallScore === 'number' && Number.isFinite(overallScore);

  return (
    <div className="space-y-6" id="player-performance-page">
      <section className="athlete-hero-card p-6 sm:p-7 border-amber-400/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Activity size={18} />
              <BilingualText value={bi('Recorded Performance', 'الأداء المسجل')} />
            </div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Athlete Performance', 'أداء اللاعب')} />
            </h1>
            <p className="mt-1 text-xs leading-6 text-slate-300">
              <BilingualText value={bi(
                `This page shows only performance information exposed by the shared athlete data provider for ${player.nameEn}. Detailed metric history is not reconstructed from legacy fixtures.`,
                `تعرض هذه الصفحة فقط معلومات الأداء التي يتيحها مزود بيانات اللاعب المشترك للاعب ${player.nameAr}. ولا يتم إعادة بناء سجل المؤشرات التفصيلي من بيانات تجريبية قديمة.`,
              )} />
            </p>
          </div>
          <span className="athlete-data-scope">
            <ShieldCheck size={13} />
            <BilingualText value={bi('Provider-backed signal', 'مؤشر من مزود البيانات')} />
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <PerformanceStat
            label={bi('Overall performance signal', 'مؤشر الأداء الإجمالي')}
            value={hasAggregateScore ? `${Math.round(overallScore)}/100` : undefined}
          />
          <PerformanceStat
            label={bi('Sport', 'الرياضة')}
            value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined}
          />
          <PerformanceStat
            label={bi('Detailed metric history', 'سجل المؤشرات التفصيلي')}
            value={undefined}
          />
        </div>
      </section>

      {hasAggregateScore ? (
        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black">
                <BilingualText value={bi('Current provider signal', 'مؤشر المزود الحالي')} />
              </span>
              <h2 className="mt-1 text-base font-black text-white">
                <BilingualText value={bi('Recorded Aggregate Score', 'الدرجة الإجمالية المسجلة')} />
              </h2>
            </div>
            <BarChart3 size={20} className="text-amber-400" />
          </header>

          <div className="mt-6 grid place-items-center rounded-3xl border border-amber-400/20 bg-amber-400/[.06] px-5 py-10 text-center">
            <span className="text-[10px] uppercase tracking-[.16em] text-slate-400 font-bold">
              <BilingualText value={bi('Performance signal', 'مؤشر الأداء')} />
            </span>
            <strong className="mt-3 text-4xl sm:text-5xl font-black font-mono text-amber-300">{Math.round(overallScore)}/100</strong>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-slate-400">
              <BilingualText value={bi(
                'This number is the aggregate performance value currently exposed on the athlete record. No metric names, trends, previous values or radar axes are inferred without a detailed performance contract.',
                'يمثل هذا الرقم قيمة الأداء الإجمالية المتاحة حاليًا في سجل اللاعب. ولا يتم استنتاج أسماء مؤشرات أو اتجاهات أو قيم سابقة أو محاور رادار دون عقد بيانات أداء تفصيلي.',
              )} />
            </p>
          </div>

          <div className="athlete-truth-note mt-5">
            <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <BilingualText value={bi(
              'Detailed performance history remains unavailable until the shared provider exposes metric definitions and timestamped records for this athlete.',
              'يبقى سجل الأداء التفصيلي غير متاح حتى يوفّر مزود البيانات المشترك تعريفات المؤشرات والسجلات المؤرخة لهذا اللاعب.',
            )} />
          </div>
        </section>
      ) : (
        <div className="athlete-empty-system">
          <div>
            <Activity size={34} className="mx-auto text-slate-500" />
            <h2 className="mt-4 text-base font-bold text-white">
              <BilingualText value={bi('No performance signal is recorded yet', 'لا يوجد مؤشر أداء مسجل حتى الآن')} />
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              <BilingualText value={bi(
                'The portal will not invent a score or rebuild metric history from preview fixtures when the provider has no performance value for this athlete.',
                'لن تنشئ البوابة درجة مصطنعة أو تعيد بناء سجل المؤشرات من بيانات معاينة عندما لا يوفّر مزود البيانات قيمة أداء لهذا اللاعب.',
              )} />
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PerformanceStat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return (
    <div className="athlete-stat-pill">
      <span><BilingualText value={label} /></span>
      <strong className={value ? 'text-slate-100 text-sm font-bold' : 'text-slate-500 text-xs font-semibold'}>
        {value ?? <BilingualText value={bi('Not available', 'غير متاح')} />}
      </strong>
    </div>
  );
}
