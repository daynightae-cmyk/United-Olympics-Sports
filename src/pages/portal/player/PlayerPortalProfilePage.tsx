import { Activity, Award, Clock, CreditCard, Edit3, FileText, Save, ShieldCheck, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PlayerPortrait } from '../../../portals/player/components/PlayerPortrait';

export function PlayerPortalProfilePage() {
  const { player, sport, group, coach, parent, overallScore, attendanceStats, updateProfile } = usePlayerSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ nameEn: '', nameAr: '', age: '' });
  if (!player) return null;

  useEffect(() => {
    setDraft({ nameEn: player.nameEn, nameAr: player.nameAr, age: typeof player.age === 'number' ? String(player.age) : '' });
  }, [player.id, player.nameEn, player.nameAr, player.age]);

  const savePreview = () => {
    const parsedAge = draft.age.trim() ? Number(draft.age) : undefined;
    updateProfile({
      nameEn: draft.nameEn.trim() || player.nameEn,
      nameAr: draft.nameAr.trim() || player.nameAr,
      age: typeof parsedAge === 'number' && Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : player.age,
    });
    setEditing(false);
  };

  const guardianName = parent && parent.nameEn !== '-' && parent.nameAr !== '-' ? `${parent.nameEn} · ${parent.nameAr}` : undefined;
  const guardianPhone = parent?.phone && parent.phone !== '-' ? parent.phone : undefined;
  const guardianEmail = parent?.email && parent.email !== '-' ? parent.email : undefined;

  return (
    <div className="space-y-6" id="player-profile-page">
      <section className="athlete-hero-card p-6 sm:p-8 border-amber-400/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <PlayerPortrait photoUrl={player.photo} name={player.nameEn} alt={`${player.nameEn} · ${player.nameAr}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-amber-300 shadow-xl shadow-amber-400/20 flex-shrink-0" />
          <div className="space-y-2 text-center sm:text-left rtl:sm:text-right flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2"><span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Athlete profile', 'ملف اللاعب')} /></span><span className="px-2.5 py-1 rounded-full text-[10px] border border-white/10 bg-white/5 text-slate-300"><BilingualText value={player.status} /></span></div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{player.nameEn}</h1>
            <p lang="ar" dir="rtl" className="text-base text-amber-400 font-medium sm:text-left rtl:sm:text-right">{player.nameAr}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-300 pt-2">
              <span className="inline-flex items-center gap-1.5"><Award size={14} className="text-amber-400" /><BilingualText value={sport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /></span>
              <span className="inline-flex items-center gap-1.5"><User size={14} className="text-amber-400" /><BilingualText value={group?.name ?? bi('Group not assigned', 'المجموعة غير معينة')} /></span>
              <span className="font-mono text-[10px] text-slate-400"><BilingualText value={bi('Player ID', 'معرف اللاعب')} />: {player.id.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <ProfileScore label={bi('Performance', 'الأداء')} value={overallScore === null ? undefined : `${overallScore}/100`} />
            <ProfileScore label={bi('Attendance', 'الحضور')} value={attendanceStats.rate === null ? undefined : `${attendanceStats.rate}%`} />
          </div>
        </div>
        <div className="athlete-action-row mt-6 pt-5 border-t border-white/10"><button type="button" onClick={() => setEditing(true)} className="athlete-action-secondary"><Edit3 size={14} /><BilingualText value={bi('Edit local preview profile', 'تعديل ملف المعاينة المحلي')} /></button><span className="text-[10px] text-slate-500"><BilingualText value={bi('Edits are saved only in this browser preview.', 'يتم حفظ التعديلات في معاينة هذا المتصفح فقط.')} /></span></div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <section className="xl:col-span-2 athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center gap-2 pb-4 border-b border-white/10"><Activity size={16} className="text-amber-400" /><h2 className="text-sm font-bold text-white"><BilingualText value={bi('Athletic Record', 'السجل الرياضي')} /></h2></header>
          <div className="athlete-field-grid mt-5">
            <Field label={bi('English name', 'الاسم بالإنجليزية')} value={player.nameEn} />
            <Field label={bi('Arabic name', 'الاسم بالعربية')} value={player.nameAr} />
            <Field label={bi('Player ID', 'معرف اللاعب')} value={player.id} mono />
            <Field label={bi('Age', 'العمر')} value={typeof player.age === 'number' ? bi(`${player.age} years`, `${player.age} سنة`) : undefined} />
            <Field label={bi('Sport discipline', 'التخصص الرياضي')} value={sport?.name} />
            <Field label={bi('Training group', 'المجموعة التدريبية')} value={group?.name} />
            <Field label={bi('Current level', 'المستوى الحالي')} value={player.level} />
            <Field label={bi('Supervising coach', 'المدرب المشرف')} value={coach ? bi(coach.nameEn, coach.nameAr) : undefined} />
          </div>
        </section>

        <section className="athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center gap-2 pb-4 border-b border-white/10"><ShieldCheck size={16} className="text-amber-400" /><h2 className="text-sm font-bold text-white"><BilingualText value={bi('Linked Guardian Record', 'سجل ولي الأمر المرتبط')} /></h2></header>
          <div className="mt-5 space-y-3">
            <CompactField label={bi('Guardian', 'ولي الأمر')} value={guardianName} />
            <CompactField label={bi('Phone', 'الهاتف')} value={guardianPhone} mono />
            <CompactField label={bi('Email', 'البريد الإلكتروني')} value={guardianEmail} mono />
          </div>
          <div className="athlete-truth-note mt-4"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Placeholder contact values are treated as unavailable and are not presented as emergency details.', 'يتم التعامل مع قيم التواصل المؤقتة كبيانات غير متاحة ولا يتم عرضها كبيانات طوارئ.')} /></div>
        </section>
      </div>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ProfileLink to="/player/subscription" icon={<CreditCard size={19} />} label={bi('Membership', 'العضوية')} />
        <ProfileLink to="/player/documents" icon={<FileText size={19} />} label={bi('Documents', 'المستندات')} />
        <ProfileLink to="/player/performance" icon={<Activity size={19} />} label={bi('Performance', 'الأداء')} />
        <ProfileLink to="/player/attendance" icon={<Clock size={19} />} label={bi('Attendance', 'الحضور')} />
      </section>

      {editing && (
        <div className="athlete-modal-overlay" onClick={() => setEditing(false)} role="presentation">
          <div className="athlete-modal-content !max-w-lg p-6" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
            <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Local preview', 'معاينة محلية')} /></span><h2 id="edit-profile-title" className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Edit Athlete Profile', 'تعديل ملف اللاعب')} /></h2></div><button type="button" onClick={() => setEditing(false)} className="p-2 text-slate-400 hover:text-white rounded-lg" aria-label="Close profile editor | إغلاق محرر الملف"><X size={18} /></button></header>
            <div className="mt-5 space-y-4">
              <label className="block text-xs text-slate-300"><BilingualText value={bi('English display name', 'الاسم المعروض بالإنجليزية')} /><input value={draft.nameEn} onChange={(event) => setDraft((current) => ({ ...current, nameEn: event.target.value }))} className="mt-2 w-full px-3 bg-white/5 border border-white/10 text-white" /></label>
              <label className="block text-xs text-slate-300"><BilingualText value={bi('Arabic display name', 'الاسم المعروض بالعربية')} /><input dir="rtl" value={draft.nameAr} onChange={(event) => setDraft((current) => ({ ...current, nameAr: event.target.value }))} className="mt-2 w-full px-3 bg-white/5 border border-white/10 text-white" /></label>
              <label className="block text-xs text-slate-300"><BilingualText value={bi('Age', 'العمر')} /><input type="number" min="1" max="100" value={draft.age} onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value }))} className="mt-2 w-full px-3 bg-white/5 border border-white/10 text-white" /></label>
              <div className="athlete-truth-note"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Sport, group, coach and official status are assignment records and cannot be changed from this local profile editor.', 'الرياضة والمجموعة والمدرب والحالة الرسمية سجلات تعيين ولا يمكن تغييرها من محرر الملف المحلي.')} /></div>
            </div>
            <div className="athlete-action-row mt-5 justify-end"><button type="button" onClick={() => setEditing(false)} className="athlete-action-secondary"><BilingualText value={bi('Cancel', 'إلغاء')} /></button><button type="button" onClick={savePreview} className="athlete-action-primary"><Save size={14} /><BilingualText value={bi('Save local preview', 'حفظ المعاينة المحلية')} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileScore({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center min-w-28"><span className="text-[10px] text-slate-400 block"><BilingualText value={label} /></span><strong className={value ? 'text-lg font-bold text-amber-400 font-mono' : 'text-[11px] font-semibold text-slate-500'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function Field({ label, value, mono = false }: { label: { en: string; ar: string }; value?: { en: string; ar: string } | string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{typeof value === 'string' ? value : value ? <BilingualText value={value} /> : <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function CompactField({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0"><span className="text-[11px] text-slate-400"><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} text-[11px] text-right rtl:text-left ${value ? 'text-slate-200' : 'text-slate-500'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function ProfileLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: { en: string; ar: string } }) {
  return <Link to={to} className="athlete-glass-card athlete-glass-card-interactive p-4 min-h-24 flex flex-col justify-between text-slate-200"><span className="text-amber-400">{icon}</span><strong className="text-xs"><BilingualText value={label} /></strong></Link>;
}
