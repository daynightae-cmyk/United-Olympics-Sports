import { Calendar, ExternalLink, User, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerSessionSummary } from '../../../portals/player/components/PlayerSessionSummary';
import { PlayerEmptyState } from '../../../portals/player/components/PlayerEmptyState';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { Session } from '../../../domain/contracts';

type ScheduleFilter = 'all' | 'upcoming' | 'completed';

export function PlayerPortalSchedulePage() {
  const { player, sport, group, coach, sessions } = usePlayerSession();
  const [selectedTab, setSelectedTab] = useState<ScheduleFilter>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  if (!player) return null;

  const now = Date.now();
  const counts = useMemo(() => ({
    all: sessions.length,
    upcoming: sessions.filter((item) => new Date(item.startsAt).getTime() >= now).length,
    completed: sessions.filter((item) => new Date(item.startsAt).getTime() < now).length,
  }), [sessions, now]);
  const filteredSessions = useMemo(() => sessions.filter((item) => {
    const time = new Date(item.startsAt).getTime();
    if (selectedTab === 'upcoming') return time >= now;
    if (selectedTab === 'completed') return time < now;
    return true;
  }).sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()), [sessions, selectedTab, now]);

  return (
    <div className="space-y-6" id="player-schedule-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Calendar size={18} /><BilingualText value={bi('Assigned Training Calendar', 'تقويم التدريب المخصص')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Athlete Training Schedule', 'جدول تدريبات اللاعب')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Sessions linked to ${player.nameEn} through the currently assigned training group.`, `الحصص المرتبطة باللاعب ${player.nameAr} من خلال المجموعة التدريبية المعينة حاليًا.`)} /></p></div>
          <div className="flex flex-wrap gap-2 text-xs"><span className="athlete-data-scope"><Users size={13} /><BilingualText value={group?.name ?? bi('Group not assigned', 'المجموعة غير معينة')} /></span><span className="athlete-data-scope"><User size={13} />{coach ? `${coach.nameEn} · ${coach.nameAr}` : <BilingualText value={bi('Coach not assigned', 'المدرب غير معين')} />}</span></div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10" role="tablist" aria-label="Schedule filters | فلاتر الجدول">
          {([
            ['all', bi('All sessions', 'جميع الحصص')],
            ['upcoming', bi('Upcoming', 'القادمة')],
            ['completed', bi('Past', 'السابقة')],
          ] as const).map(([id, label]) => <button key={id} type="button" role="tab" aria-selected={selectedTab === id} onClick={() => setSelectedTab(id)} className={`px-3.5 py-1.5 whitespace-nowrap rounded-xl text-xs font-semibold transition-all ${selectedTab === id ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}><BilingualText value={label} /> ({counts[id]})</button>)}
        </div>
      </section>

      <section className="space-y-3" id="schedule-sessions-list" aria-live="polite">
        {filteredSessions.length ? filteredSessions.map((session) => <PlayerSessionSummary key={session.id} sessionId={session.id} onClick={() => setSelectedSession(session)} />) : <PlayerEmptyState title={selectedTab === 'upcoming' ? bi('No upcoming training sessions', 'لا توجد حصص تدريبية قادمة') : selectedTab === 'completed' ? bi('No past sessions are recorded', 'لا توجد حصص سابقة مسجلة') : bi('No sessions are linked to this player', 'لا توجد حصص مرتبطة بهذا اللاعب')} description={bi('The schedule remains empty until a session record is linked to the assigned training group.', 'يظل الجدول فارغًا حتى يتم ربط سجل حصة بالمجموعة التدريبية المعينة.')} />}
      </section>

      {selectedSession && (
        <div className="athlete-modal-overlay" onClick={() => setSelectedSession(null)} role="presentation">
          <div className="athlete-modal-content !max-w-lg p-6 sm:p-7" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="schedule-session-title" id="session-detail-modal">
            <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Session record', 'سجل الحصة')} /></span><h2 id="schedule-session-title" className="mt-1 text-lg font-black text-white"><BilingualText value={sport?.name ?? bi('Training session', 'حصة تدريبية')} /></h2></div><button type="button" onClick={() => setSelectedSession(null)} className="p-2 text-slate-400 hover:text-white rounded-lg" aria-label="Close session details | إغلاق تفاصيل الحصة"><X size={18} /></button></header>
            <div className="athlete-field-grid mt-5">
              <Field label={bi('Session ID', 'معرف الحصة')} value={selectedSession.id} mono />
              <Field label={bi('Start date & time', 'تاريخ ووقت البداية')} value={formatDateTime(selectedSession.startsAt)} />
              <Field label={bi('Training group', 'المجموعة التدريبية')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} />
              <Field label={bi('Supervising coach', 'المدرب المشرف')} value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined} />
              <Field label={bi('Status', 'الحالة')} value={`${selectedSession.status.en} · ${selectedSession.status.ar}`} />
              <Field label={bi('Facility / location', 'المرفق / الموقع')} value={undefined} />
            </div>
            <div className="athlete-truth-note mt-5"><Calendar size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Location, duration and other operational fields are left unset because they are not present in the session contract.', 'يتم ترك الموقع والمدة والحقول التشغيلية الأخرى غير محددة لأنها غير موجودة في عقد بيانات الحصة.')} /></div>
            <div className="athlete-action-row mt-5 justify-end"><button type="button" onClick={() => setSelectedSession(null)} className="athlete-action-secondary"><BilingualText value={bi('Close', 'إغلاق')} /></button><button type="button" onClick={() => { const id = selectedSession.id; setSelectedSession(null); navigate(`/player/schedule/${id}`); }} className="athlete-action-primary"><ExternalLink size={13} /><BilingualText value={bi('Open full session page', 'فتح صفحة الحصة الكاملة')} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const en = date.toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' });
  const ar = date.toLocaleString('ar', { dateStyle: 'medium', timeStyle: 'short' });
  return `${en} · ${ar}`;
}
