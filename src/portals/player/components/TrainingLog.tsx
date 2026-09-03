import React, { useEffect, useState } from 'react';
import { Activity, Clock3, Plus, Target, Trash2 } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { TrainingEntry, TrainingIntensity, WeeklyGoal } from '../hooks/useTrainingLog';

interface TrainingLogProps {
  entries: TrainingEntry[];
  weeklyGoal: WeeklyGoal | null;
  currentWeekMinutes: number;
  onAddEntry: (duration: number, intensity: TrainingIntensity) => { ok: boolean };
  onDeleteEntry: (entryId: string) => void;
  onUpdateGoal: (minutes: number) => { ok: boolean };
}

export function TrainingLog({ entries, weeklyGoal, currentWeekMinutes, onAddEntry, onDeleteEntry, onUpdateGoal }: TrainingLogProps) {
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<TrainingIntensity>('medium');
  const [goalInput, setGoalInput] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [error, setError] = useState<{ en: string; ar: string } | null>(null);

  useEffect(() => {
    setGoalInput(weeklyGoal ? String(weeklyGoal.targetMinutes) : '');
  }, [weeklyGoal]);

  const progress = weeklyGoal && weeklyGoal.targetMinutes > 0
    ? Math.min(100, Math.round((currentWeekMinutes / weeklyGoal.targetMinutes) * 100))
    : null;

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onAddEntry(Number(duration), intensity);
    if (!result.ok) {
      setError(bi('Enter a duration between 1 and 360 minutes.', 'أدخل مدة بين دقيقة واحدة و360 دقيقة.'));
      return;
    }
    setError(null);
    setDuration('30');
  };

  const saveGoal = (event: React.FormEvent) => {
    event.preventDefault();
    const result = onUpdateGoal(Number(goalInput));
    if (!result.ok) {
      setError(bi('Enter a weekly goal between 1 and 2400 minutes.', 'أدخل هدفاً أسبوعياً بين دقيقة واحدة و2400 دقيقة.'));
      return;
    }
    setError(null);
    setEditingGoal(false);
  };

  return (
    <section className="athlete-glass-card p-5 sm:p-6 space-y-6" aria-labelledby="personal-training-title">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300"><Target size={16} /><span className="text-[11px] font-extrabold uppercase tracking-[.14em]"><BilingualText value={bi('Private personal log', 'سجل شخصي خاص')} /></span></div>
          <h2 id="personal-training-title" className="mt-2 text-lg font-black text-white"><BilingualText value={bi('Personal Training Log', 'سجل التدريب الشخصي')} /></h2>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400"><BilingualText value={bi('Stored on this device only. It is not an attendance or coach record.', 'محفوظ على هذا الجهاز فقط، وليس سجلاً للحضور أو سجلاً للمدرب.')} /></p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
        {!weeklyGoal ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-sm text-white"><BilingualText value={bi('No personal weekly goal set', 'لم يتم تحديد هدف أسبوعي شخصي')} /></strong>
              <p className="mt-1 text-[11px] text-slate-400"><BilingualText value={bi('Choose a target that belongs to you — the portal will not invent one.', 'حدد هدفك بنفسك — لن تفترض البوابة هدفاً من تلقاء نفسها.')} /></p>
            </div>
            <button type="button" onClick={() => setEditingGoal(true)} className="px-4 py-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 text-xs font-bold"><BilingualText value={bi('Set goal', 'حدد الهدف')} /></button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-400"><BilingualText value={bi('This week', 'هذا الأسبوع')} /></span><strong className="text-white">{currentWeekMinutes} / {weeklyGoal.targetMinutes} <BilingualText value={bi('min', 'دقيقة')} /></strong></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300" style={{ width: `${progress ?? 0}%` }} /></div>
            <div className="flex justify-between items-center"><span className="text-[10px] text-slate-500">{progress ?? 0}%</span><button type="button" onClick={() => setEditingGoal(true)} className="text-[11px] font-bold text-amber-300"><BilingualText value={bi('Edit goal', 'تعديل الهدف')} /></button></div>
          </div>
        )}
      </div>

      {editingGoal && (
        <form onSubmit={saveGoal} className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/[.04] p-3">
          <label className="flex-1"><span className="sr-only"><BilingualText value={bi('Weekly goal in minutes', 'الهدف الأسبوعي بالدقائق')} /></span><input type="number" min={1} max={2400} value={goalInput} onChange={(e) => setGoalInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" placeholder="120" /></label>
          <button type="submit" className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-black"><BilingualText value={bi('Save goal', 'حفظ الهدف')} /></button>
          <button type="button" onClick={() => setEditingGoal(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300"><BilingualText value={bi('Cancel', 'إلغاء')} /></button>
        </form>
      )}

      <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="space-y-1"><span className="flex items-center gap-1.5 text-[11px] text-slate-400"><Clock3 size={12} /><BilingualText value={bi('Duration (minutes)', 'المدة (بالدقائق)')} /></span><input type="number" min={1} max={360} value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-amber-400" /></label>
        <label className="space-y-1"><span className="flex items-center gap-1.5 text-[11px] text-slate-400"><Activity size={12} /><BilingualText value={bi('Intensity', 'الشدة')} /></span><select value={intensity} onChange={(e) => setIntensity(e.target.value as TrainingIntensity)} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"><option value="low">Low / منخفض</option><option value="medium">Medium / متوسط</option><option value="high">High / مرتفع</option></select></label>
        <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-2 text-xs font-black text-amber-300"><Plus size={14} /><BilingualText value={bi('Add', 'إضافة')} /></button>
      </form>

      {error && <p className="text-xs text-rose-300" role="alert"><BilingualText value={error} /></p>}

      <div className="space-y-2">
        {entries.slice(0, 6).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.025] px-3 py-2.5">
            <div className="min-w-0"><strong className="text-xs text-white">{entry.durationMinutes} <BilingualText value={bi('minutes', 'دقيقة')} /></strong><p className="text-[10px] text-slate-500">{new Date(entry.date).toLocaleString()}</p></div>
            <div className="flex items-center gap-2"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-slate-300">{entry.intensity}</span><button type="button" onClick={() => onDeleteEntry(entry.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-rose-400/30 hover:text-rose-300" aria-label="Delete personal training entry · حذف سجل التدريب الشخصي"><Trash2 size={13} /></button></div>
          </div>
        ))}
        {!entries.length && <p className="py-3 text-center text-[11px] text-slate-500"><BilingualText value={bi('No personal entries yet.', 'لا توجد سجلات شخصية حتى الآن.')} /></p>}
      </div>
    </section>
  );
}
