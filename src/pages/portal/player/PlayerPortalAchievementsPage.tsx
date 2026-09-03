import { Award, Trophy } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalAchievementsPage() {
  const { player, achievements } = usePlayerSession();
  if (!player) return null;

  return (
    <div className="space-y-6" id="player-achievements-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2"><Trophy size={17} /><BilingualText value={bi('Athlete record', 'سجل اللاعب')} /></span>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Achievements', 'الإنجازات')} /></h1>
            <p className="mt-1 text-xs text-slate-400"><BilingualText value={bi('Only achievement facts present in the canonical athlete record are shown.', 'يتم عرض حقائق الإنجازات الموجودة في سجل اللاعب الأساسي فقط.')} /></p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-white/[.035] border border-white/10 text-xs text-slate-300"><BilingualText value={bi('Recorded', 'المسجل')} /> · {achievements.length}</span>
        </div>
      </section>

      {achievements.length ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Recorded achievements · الإنجازات المسجلة">
          {achievements.map((achievement) => (
            <article key={achievement.id} className="athlete-glass-card p-5 border-amber-400/15">
              <span className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/25 grid place-items-center text-amber-400"><Award size={22} /></span>
              <h2 className="mt-4 text-sm font-bold text-white"><BilingualText value={achievement.title} /></h2>
              <p className="mt-3 pt-3 border-t border-white/7 text-[10px] leading-5 text-slate-500"><BilingualText value={bi('No tier, category, description, award date or status is inferred when it is absent from the source record.', 'لا يتم استنتاج فئة أو تصنيف أو وصف أو تاريخ منح أو حالة إذا كانت غير موجودة في السجل المصدر.')} /></p>
            </article>
          ))}
        </section>
      ) : (
        <section className="athlete-glass-card p-10 text-center border-dashed border-white/15">
          <Trophy size={30} className="mx-auto text-slate-500" />
          <h2 className="mt-4 text-sm font-bold text-slate-200"><BilingualText value={bi('No achievement record yet', 'لا يوجد سجل إنجازات حتى الآن')} /></h2>
          <p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Nothing is generated to fill this space. A recorded achievement will appear when it exists in the athlete data.', 'لا يتم إنشاء بيانات لملء هذه المساحة. سيظهر الإنجاز عند وجوده فعليًا في بيانات اللاعب.')} /></p>
        </section>
      )}
    </div>
  );
}
