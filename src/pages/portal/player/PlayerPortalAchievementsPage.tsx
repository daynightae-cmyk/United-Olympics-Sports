import { Award, ShieldCheck, Trophy } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalAchievementsPage() {
  const { player, achievements } = usePlayerSession();
  if (!player) return null;

  return (
    <div className="space-y-6" id="player-achievements-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Trophy size={18} /><BilingualText value={bi('Recorded Athlete Recognition', 'تقدير اللاعب المسجل')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Achievements', 'الإنجازات')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('Only achievement titles present in the canonical athlete record are shown. Missing category, tier, date, certificate and status metadata are never inferred.', 'يتم عرض عناوين الإنجازات الموجودة في سجل اللاعب الأساسي فقط. ولا يتم استنتاج الفئة أو المستوى أو التاريخ أو الشهادة أو الحالة عند غيابها.')} /></p></div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi(`${achievements.length} recorded`, `${achievements.length} مسجل`)} /></span>
        </div>
      </section>

      {achievements.length ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Recorded achievements | الإنجازات المسجلة">
          {achievements.map((achievement, index) => (
            <article key={achievement.id} className="athlete-glass-card p-5 border-amber-400/15 min-h-52 flex flex-col">
              <div className="flex items-start justify-between gap-3"><span className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 grid place-items-center text-amber-400"><Award size={22} /></span><span className="text-[10px] font-mono text-slate-600">#{String(index + 1).padStart(2, '0')}</span></div>
              <h2 className="mt-5 text-sm font-bold text-white"><BilingualText value={achievement.title} /></h2>
              <div className="mt-auto pt-4"><div className="athlete-truth-note"><ShieldCheck size={13} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Title-only source record. No additional award facts are attached.', 'سجل المصدر يحتوي على العنوان فقط. لا توجد حقائق إضافية مرتبطة بالإنجاز.')} /></div></div>
            </article>
          ))}
        </section>
      ) : (
        <div className="athlete-empty-system"><div><Trophy size={36} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No achievement record yet', 'لا يوجد سجل إنجازات حتى الآن')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('The page remains intentionally empty until an achievement exists in the athlete record. No badges or milestones are generated for presentation.', 'تبقى الصفحة فارغة عمدًا حتى يوجد إنجاز في سجل اللاعب. ولا يتم إنشاء أوسمة أو مراحل بهدف العرض.')} /></p></div></div>
      )}
    </div>
  );
}
