import { Activity, Award, CreditCard, FileText, Gauge, ShieldCheck, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PlayerPortrait } from '../../../portals/player/components/PlayerPortrait';

export function PlayerPortalProfilePage() {
  const { player, sport, group, coach, parent, overallScore, attendanceStats } = usePlayerSession();
  if (!player) return null;

  const score = typeof overallScore === 'number' && Number.isFinite(overallScore) ? overallScore : null;
  const attendanceRate = typeof attendanceStats.rate === 'number' && Number.isFinite(attendanceStats.rate) ? attendanceStats.rate : null;

  return (
    <div className="space-y-6" id="player-profile-page">
      <section className="athlete-hero-card p-6 sm:p-8 border-amber-400/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <PlayerPortrait photoUrl={player.photo} name={player.nameEn} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-amber-300 shadow-xl shadow-amber-400/20 flex-shrink-0" />
          <div className="space-y-2 text-center sm:text-left rtl:sm:text-right flex-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"><ShieldCheck size={13} /><BilingualText value={player.status} /></span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{player.nameEn}</h1>
            <p className="text-base text-amber-400 font-medium">{player.nameAr}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-2">
              {sport && <span className="flex items-center gap-1.5"><Award size={14} className="text-amber-400" /><BilingualText value={sport.name} /></span>}
              {group && <span className="flex items-center gap-1.5"><Users size={14} className="text-amber-400" /><BilingualText value={group.name} /></span>}
              <span className="font-mono text-slate-300">ID: {player.id.toUpperCase()}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 flex-shrink-0 w-full sm:w-auto">
            <Signal label={bi('Performance signal', 'مؤشر الأداء')} value={score === null ? undefined : `${Math.round(score)}/100`} />
            <Signal label={bi('Attendance rate', 'نسبة الحضور')} value={attendanceRate === null ? undefined : `${attendanceRate}%`} accent="success" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="athlete-glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10"><Activity size={16} className="text-amber-400" /><BilingualText value={bi('Athlete Assignment', 'تعيين اللاعب')} /></h2>
          <div className="space-y-3 text-xs">
            <ProfileRow label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
            <ProfileRow label={bi('Training group', 'المجموعة التدريبية')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} />
            <ProfileRow label={bi('Level', 'المستوى')} value={`${player.level.en} · ${player.level.ar}`} accent />
            <ProfileRow label={bi('Assigned coach', 'المدرب المعيّن')} value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined} />
            <ProfileRow label={bi('Program ID', 'معرف البرنامج')} value={player.programId} mono />
          </div>
        </section>

        <section className="athlete-glass-card p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10"><User size={16} className="text-amber-400" /><BilingualText value={bi('Linked Guardian Record', 'سجل ولي الأمر المرتبط')} /></h2>
          {parent ? (
            <div className="space-y-3 text-xs">
              <ProfileRow label={bi('Guardian name', 'اسم ولي الأمر')} value={`${parent.nameEn} · ${parent.nameAr}`} />
              <ProfileRow label={bi('Registered phone', 'الهاتف المسجل')} value={parent.phone && parent.phone !== '-' ? parent.phone : undefined} mono />
              <ProfileRow label={bi('Registered email', 'البريد الإلكتروني المسجل')} value={parent.email && parent.email !== '-' ? parent.email : undefined} mono />
              <ProfileRow label={bi('Preferred language', 'اللغة المفضلة')} value={parent.preferredLanguage.toUpperCase()} />
            </div>
          ) : (
            <p className="text-xs leading-6 text-slate-400"><BilingualText value={bi('No guardian record is linked to this athlete in the current provider data.', 'لا يوجد سجل ولي أمر مرتبط بهذا اللاعب في بيانات المزود الحالية.')} /></p>
          )}
          <div className="athlete-truth-note"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('A registered guardian phone is shown only as contact data. It is not labelled as an emergency number unless a future contract explicitly provides that meaning.', 'يُعرض هاتف ولي الأمر المسجل كبيان تواصل فقط. ولا يتم وصفه كرقم طوارئ إلا إذا وفّر عقد بيانات مستقبلي هذا المعنى صراحةً.')} /></div>
        </section>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickLink to="/player/subscription" icon={<CreditCard size={20} />} label={bi('Membership', 'العضوية')} />
        <QuickLink to="/player/documents" icon={<FileText size={20} />} label={bi('Documents', 'الوثائق')} />
        <QuickLink to="/player/performance" icon={<Gauge size={20} />} label={bi('Performance', 'الأداء')} />
        <QuickLink to="/player/attendance" icon={<Activity size={20} />} label={bi('Attendance', 'الحضور')} />
      </section>
    </div>
  );
}

function Signal({ label, value, accent = 'gold' }: { label: { en: string; ar: string }; value?: string; accent?: 'gold' | 'success' }) {
  return <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-36"><span className="text-[10px] text-slate-400 block"><BilingualText value={label} /></span><strong className={`text-lg font-bold font-mono ${value ? (accent === 'success' ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-600'}`}>{value ?? '—'}</strong></div>;
}

function ProfileRow({ label, value, mono = false, accent = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean; accent?: boolean }) {
  return <div className="flex items-start justify-between gap-4 py-1.5 border-b border-white/5 last:border-b-0"><span className="text-slate-400"><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? (accent ? 'text-amber-400' : 'text-white') : 'text-slate-600'} text-right rtl:text-left break-all`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: { en: string; ar: string } }) {
  return <Link to={to} className="athlete-glass-card athlete-glass-card-interactive p-4 text-center space-y-2"><span className="mx-auto text-amber-400 flex justify-center">{icon}</span><span className="text-xs font-bold text-white block"><BilingualText value={label} /></span></Link>;
}
