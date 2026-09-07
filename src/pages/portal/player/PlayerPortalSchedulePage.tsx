import { CalendarClock, ChevronLeft, ChevronRight, Clock, ExternalLink, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function PlayerPortalSchedulePage() {
  const { player, sessions, sport, group } = usePlayerSession();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  if (!player) return null;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay() + (currentWeek * 7));

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });

  const orderedSessions = [...sessions].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const sessionsForDay = (date: Date) => {
    const target = localDateKey(date);
    return orderedSessions.filter((session) => localDateKey(new Date(session.startsAt)) === target);
  };

  return (
    <div className="admin-page" id="player-schedule-page">
      <PageHeader
        eyebrow={bi('Player Portal | Schedule', 'بوابة اللاعب | الجدول')}
        title={bi('Assigned Schedule', 'الجدول المخصص')}
        description={bi(
          `Sessions linked to ${player.nameEn} through the assigned training group. Facility, duration and check-in details are not invented when absent from the shared session contract.`,
          `الحصص المرتبطة باللاعب ${player.nameAr} من خلال المجموعة التدريبية المخصصة. ولا يتم اختلاق المرفق أو المدة أو تفاصيل تسجيل الوصول عند غيابها من عقد الحصة المشترك.`,
        )}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="admin-secondary-button" onClick={() => setViewMode('week')} aria-pressed={viewMode === 'week'}><BilingualText value={bi('Week', 'أسبوع')} /></button>
            <button className="admin-secondary-button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><BilingualText value={bi('List', 'قائمة')} /></button>
            <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Provider sessions', 'حصص مزود البيانات')} /></span>
          </div>
        }
      />

      <section className="schedule-toolbar" aria-label="Schedule navigation">
        <div className="schedule-nav">
          <button className="nav-btn" onClick={() => setCurrentWeek((week) => week - 1)} aria-label={bi('Previous week', 'الأسبوع السابق').en}><ChevronLeft size={18} /></button>
          <div className="week-range">
            <BilingualText value={{
              en: `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              ar: `${weekDays[0].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            }} />
          </div>
          <button className="nav-btn" onClick={() => setCurrentWeek((week) => week + 1)} aria-label={bi('Next week', 'الأسبوع التالي').en}><ChevronRight size={18} /></button>
        </div>
        <button className="admin-secondary-button" onClick={() => setCurrentWeek(0)}><BilingualText value={bi('This Week', 'هذا الأسبوع')} /></button>
      </section>

      {viewMode === 'week' ? (
        <section className="schedule-week-view" aria-label="Weekly schedule">
          <div className="schedule-week-grid">
            {weekDays.map((day, dayIndex) => {
              const daySessions = sessionsForDay(day);
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={localDateKey(day)} className={`schedule-day-column ${isToday ? 'today' : ''}`}>
                  <header>
                    <div><strong><BilingualText value={{ en: dayLabels[dayIndex], ar: dayLabelsAr[dayIndex] }} /></strong><span>{day.getDate()}</span></div>
                    {isToday && <span className="today-badge"><BilingualText value={bi('Today', 'اليوم')} /></span>}
                  </header>
                  <div className="day-sessions">
                    {daySessions.length ? daySessions.map((session) => (
                      <Link key={session.id} to={`/player/schedule/${encodeURIComponent(session.id)}`} className="schedule-session-card no-underline">
                        <div className="session-header">
                          <span className="session-time"><Clock size={14} /><BilingualText value={formatTime(session.startsAt)} /></span>
                          <span className="session-status other"><BilingualText value={session.status} /></span>
                        </div>
                        <h4><BilingualText value={sport?.name ?? bi('Sport not recorded', 'الرياضة غير مسجلة')} /></h4>
                        <div className="session-meta"><span><Users size={12} /><BilingualText value={group?.name ?? bi('Group not recorded', 'المجموعة غير مسجلة')} /></span></div>
                      </Link>
                    )) : <div className="no-sessions"><BilingualText value={bi('No linked sessions', 'لا توجد حصص مرتبطة')} /></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="schedule-list-view" aria-label="Schedule list">
          <div className="schedule-list">
            {orderedSessions.map((session) => {
              const date = new Date(session.startsAt);
              return (
                <article key={session.id} className="schedule-session-card list-card">
                  <div className="list-session-date"><CalendarClock size={16} /><BilingualText value={formatDate(session.startsAt)} /></div>
                  <div className="list-session-main">
                    <h4><BilingualText value={sport?.name ?? bi('Sport not recorded', 'الرياضة غير مسجلة')} /></h4>
                    <div className="list-session-details">
                      <span><Clock size={14} /><BilingualText value={formatTime(session.startsAt)} /></span>
                      <span><Users size={14} /><BilingualText value={group?.name ?? bi('Group not recorded', 'المجموعة غير مسجلة')} /></span>
                    </div>
                  </div>
                  <div className="list-session-status">
                    <span className="status-badge status-other"><BilingualText value={session.status} /></span>
                    <Link to={`/player/schedule/${encodeURIComponent(session.id)}`} className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-300"><BilingualText value={bi('Details', 'التفاصيل')} /><ExternalLink size={11} /></Link>
                  </div>
                </article>
              );
            })}
            {!orderedSessions.length && (
              <div className="athlete-empty-system">
                <div><CalendarClock size={42} className="mx-auto text-slate-500" /><h3 className="mt-4"><BilingualText value={bi('No linked sessions', 'لا توجد حصص مرتبطة')} /></h3><p className="mt-2 text-xs text-slate-400"><BilingualText value={bi('The shared provider currently has no sessions assigned to this athlete group.', 'لا يحتوي مزود البيانات المشترك حاليًا على حصص مخصصة لمجموعة هذا اللاعب.')} /></p></div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="schedule-note" aria-label="Schedule data boundary">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}><BilingualText value={bi('Only session ID, sport/group relationship, start time and recorded status are treated as authoritative here. Location, duration and attendance-event details require separate provider fields.', 'يتم اعتماد معرف الحصة وعلاقة الرياضة/المجموعة ووقت البدء والحالة المسجلة فقط هنا. ويتطلب الموقع والمدة وتفاصيل حدث الحضور حقولًا منفصلة من مزود البيانات.')} /></p>
        </div>
      </section>
    </div>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return {
    en: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    ar: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return {
    en: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    ar: date.toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' }),
  };
}
