import { Activity, ArrowRight, CalendarClock, FileText, Gauge, MessageSquareText, ShieldCheck, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerAthleteIdentityCard } from '../../../portals/player/components/PlayerAthleteIdentityCard';
import { PlayerEmptyState } from '../../../portals/player/components/PlayerEmptyState';
import { PlayerSessionSummaryCard } from '../../../portals/player/components/PlayerSessionSummaryCard';
import { TrainingLog } from '../../../portals/player/components/TrainingLog';
import { useTrainingLog } from '../../../portals/player/hooks/useTrainingLog';
import { selectPlayerOverallScore, selectUpcomingSession } from '../../../portals/player/foundation/playerSelectors';

export function PlayerPortalOverviewPage() {
  const { player, sport, group, coach, sessions, attendanceStats, feedback } = usePlayerSession();
  const navigate = useNavigate();
  const [identityOpen, setIdentityOpen] = useState(false);
  if (!player) return null;

  const nextSession = selectUpcomingSession(sessions);
  const score = selectPlayerOverallScore(player);
  const attendanceRate = attendanceStats.rate;
  const latestFeedback = [...feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).at(0);
  const training = useTrainingLog(player.id);

  return (
    <div className="space-y-7" id="player-overview-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><span className="text-[10px] font-black uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Athlete workspace', 'مساحة اللاعب')} /></span><h1 className="mt-1 text-xl sm:text-2xl font-black text-white"><BilingualText value={bi('Your Player Portal', 'بوابة اللاعب الخاصة بك')} /></h1></div>
        <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Player-owned preview records', 'سجلات معاينة مرتبطة باللاعب')} /></span>
      </div>

      <PlayerAthleteIdentityCard player={player} sport={sport} group={group} coach={coach} nextSession={nextSession} attendanceRate={attendanceRate} overallScore={score} preview onOpenIdentity={() => setIdentityOpen(true)} />

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_.75fr] gap-5">
        <section className="athlete-glass-card p-5 sm:p-6 space-y-4">
          <header className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Training pulse', 'نبض التدريب')} /></span><h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Next on your schedule', 'القادم في جدولك')} /></h2></div><CalendarClock size={20} className="text-amber-400" /></header>
          {nextSession ? <PlayerSessionSummaryCard session={nextSession} sport={sport} group={group} coach={coach} onOpen={() => navigate(`/player/schedule/${nextSession.id}`)} /> : <PlayerEmptyState compact title={bi('No upcoming training', 'لا يوجد تدريب قادم')} description={bi('No future session is linked to the assigned group in the current records.', 'لا توجد حصة مستقبلية مرتبطة بالمجموعة المعينة ضمن السجلات الحالية.')} />}
        </section>

        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="mb-5"><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Athlete snapshot', 'ملخص اللاعب')} /></span><h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Current recorded signals', 'المؤشرات المسجلة حاليًا')} /></h2></header>
          <div className="grid grid-cols-2 gap-3">
            <Snapshot icon={<Activity size={16} />} label={bi('Attendance', 'الحضور')} value={attendanceRate === null ? undefined : `${attendanceRate}%`} />
            <Snapshot icon={<Gauge size={16} />} label={bi('Performance', 'الأداء')} value={score === null ? undefined : `${score}/100`} />
            <Snapshot icon={<Trophy size={16} />} label={bi('Achievements', 'الإنجازات')} value={player.achievements.length ? String(player.achievements.length) : undefined} />
            <Snapshot icon={<MessageSquareText size={16} />} label={bi('Coach feedback', 'ملاحظات المدرب')} value={feedback.length ? String(feedback.length) : undefined} />
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5">
        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-4"><div><span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Coach perspective', 'رؤية المدرب')} /></span><h2 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Latest recorded feedback', 'أحدث الملاحظات المسجلة')} /></h2></div><MessageSquareText size={19} className="text-amber-400" /></header>
          {latestFeedback ? <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><p className="text-sm leading-7 text-slate-200"><BilingualText value={latestFeedback.summary} /></p><Link to="/player/feedback" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300"><BilingualText value={bi('Open feedback center', 'فتح مركز الملاحظات')} /><ArrowRight size={13} className="rtl:rotate-180" /></Link></div> : <PlayerEmptyState compact title={bi('No coach feedback recorded', 'لا توجد ملاحظات مدرب مسجلة')} description={bi('This area remains empty until a feedback record is linked to the athlete.', 'تبقى هذه المساحة فارغة حتى يتم ربط سجل ملاحظات باللاعب.')} />}
        </section>

        <TrainingLog entries={training.entries} weeklyGoal={training.weeklyGoal} currentWeekMinutes={training.currentWeekMinutes} onAddEntry={training.addEntry} onDeleteEntry={training.deleteEntry} onUpdateGoal={training.updateWeeklyGoal} />
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Player quick links | روابط اللاعب السريعة">
        <QuickLink to="/player/attendance" icon={<Activity size={17} />} title={bi('Attendance', 'الحضور')} />
        <QuickLink to="/player/performance" icon={<Gauge size={17} />} title={bi('Performance', 'الأداء')} />
        <QuickLink to="/player/achievements" icon={<Trophy size={17} />} title={bi('Achievements', 'الإنجازات')} />
        <QuickLink to="/player/documents" icon={<FileText size={17} />} title={bi('Documents', 'المستندات')} />
      </section>

      {identityOpen && (
        <div className="athlete-modal-overlay" role="presentation" onClick={() => setIdentityOpen(false)}>
          <div className="athlete-modal-content w-full max-w-lg athlete-glass-card p-6 border-amber-400/30" role="dialog" aria-modal="true" aria-labelledby="athlete-identity-title" onClick={(event) => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Identity preview', 'معاينة الهوية')} /></span><h2 id="athlete-identity-title" className="mt-1 text-xl font-black text-white">{player.nameEn}<span lang="ar" dir="rtl" className="block text-base text-amber-300 mt-1 text-left rtl:text-right">{player.nameAr}</span></h2></div><button type="button" onClick={() => setIdentityOpen(false)} className="p-2 rounded-xl border border-white/10 text-slate-300" aria-label="Close athlete identity | إغلاق هوية اللاعب"><X size={18} /></button></header>
            <div className="athlete-field-grid mt-5"><IdentityField label={bi('Player ID', 'معرف اللاعب')} value={player.id} mono /><IdentityField label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} /><IdentityField label={bi('Level', 'المستوى')} value={`${player.level.en} · ${player.level.ar}`} /><IdentityField label={bi('Group', 'المجموعة')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} /><IdentityField label={bi('Coach', 'المدرب')} value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined} /><IdentityField label={bi('Status', 'الحالة')} value={`${player.status.en} · ${player.status.ar}`} /></div>
            <div className="athlete-truth-note mt-5"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('This is a visual player-record preview, not an issued credential, access token or official membership card.', 'هذه معاينة بصرية لسجل اللاعب وليست بطاقة اعتماد صادرة أو رمز دخول أو بطاقة عضوية رسمية.')} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Snapshot({ icon, label, value }: { icon?: React.ReactNode; label: { en: string; ar: string }; value?: string }) {
  return <div className="rounded-2xl border border-white/9 bg-white/[.025] p-4"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-slate-500">{icon}<BilingualText value={label} /></div><strong className={`mt-2 block text-base font-black ${value ? 'text-white' : 'text-slate-600'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function QuickLink({ to, icon, title }: { to: string; icon: React.ReactNode; title: { en: string; ar: string } }) {
  return <Link to={to} className="athlete-glass-card athlete-glass-card-interactive p-4 flex min-h-24 flex-col justify-between gap-3 text-slate-200 no-underline"><span className="text-amber-400">{icon}</span><strong className="text-xs"><BilingualText value={title} /></strong></Link>;
}

function IdentityField({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}
