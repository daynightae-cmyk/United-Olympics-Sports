import { CalendarClock, ChevronLeft, ChevronRight, Clock, MapPin, Users, CheckCircle, AlertCircle, Dumbbell } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoSessions } from '../../../data/demo/sessions';
import { demoTrainingGroups } from '../../../data/demo/trainingGroups';
import { demoSports } from '../../../data/demo/sports';
import { demoCoaches } from '../../../data/demo/coaches';
import { useState } from 'react';

type SessionWithDetails = {
  id: string;
  sportId: string;
  groupId: string;
  startsAt: string;
  status: { en: string; ar: string };
  sportName: { en: string; ar: string };
  groupName: { en: string; ar: string };
  location: { en: string; ar: string };
  playerCount: number;
};

const coach = demoCoaches[0];
const coachGroupIds = coach.groupIds;

const enrichedSessions: SessionWithDetails[] = demoSessions
  .filter(s => coachGroupIds.includes(s.groupId))
  .map((session) => {
    const sport = demoSports.find(s => s.id === session.sportId);
    const group = demoTrainingGroups.find(g => g.id === session.groupId);
    return {
      ...session,
      sportName: sport?.name ?? { en: 'Unknown Sport', ar: 'رياضة غير معروفة' },
      groupName: group?.name ?? { en: 'Unknown Group', ar: 'مجموعة غير معروفة' },
      location: { en: 'Main Training Facility · Preview', ar: 'المنشأة التدريبية الرئيسية · تجريبي' },
      playerCount: group?.playerIds.length ?? 0,
    };
  });

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function CoachPortalSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + (currentWeek * 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const filteredSessions = selectedGroup === 'all'
    ? enrichedSessions
    : enrichedSessions.filter(s => s.groupId === selectedGroup);

  const sessionsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredSessions.filter(s => s.startsAt.startsWith(dateStr));
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeAr = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Coach Portal | Schedule', 'بوابة المدرب | الجدول')}
        title={bi('Schedule', 'الجدول')}
        description={bi('Coach training schedule preview — no live sessions.', 'جدول تدريبي للمدرب تجريبي — لا توجد حصص مباشرة.')}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="admin-secondary-button" onClick={() => setViewMode('week')}>
              <BilingualText value={bi('Week', 'أسبوع')} />
            </button>
            <button className="admin-secondary-button" onClick={() => setViewMode('list')}>
              <BilingualText value={bi('List', 'قائمة')} />
            </button>
            <span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>
          </div>
        }
      />

      <section className="schedule-toolbar" aria-label="Schedule navigation">
        <div className="schedule-nav">
          <button className="nav-btn" onClick={() => setCurrentWeek(w => w - 1)} aria-label={bi('Previous week', 'الأسبوع السابق')}>
            <ChevronLeft size={18} />
          </button>
          <div className="week-range">
            <BilingualText value={{
              en: `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              ar: `${weekDays[0].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}`
            }} />
          </div>
          <button className="nav-btn" onClick={() => setCurrentWeek(w => w + 1)} aria-label={bi('Next week', 'الأسبوع التالي')}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="group-selector">
          <label>
            <BilingualText value={bi('Group', 'المجموعة')} />
            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}>
              <option value="all"><BilingualText value={bi('All Groups', 'جميع المجموعات')} /></option>
              {demoTrainingGroups.filter(g => coachGroupIds.includes(g.id)).map(group => (
                <option key={group.id} value={group.id}>
                  <BilingualText value={group.name} />
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="admin-secondary-button" onClick={() => setCurrentWeek(0)}>
          <BilingualText value={bi('This Week', 'هذا الأسبوع')} />
        </button>
      </section>

      {viewMode === 'week' ? (
        <section className="schedule-week-view" aria-label="Weekly schedule">
          <div className="schedule-week-grid">
            {weekDays.map((day, dayIndex) => {
              const sessions = sessionsForDay(day);
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={dayIndex} className={`schedule-day-column ${isToday ? 'today' : ''}`}>
                  <header>
                    <div>
                      <strong><BilingualText value={{ en: dayLabels[dayIndex], ar: dayLabelsAr[dayIndex] }} /></strong>
                      <span><BilingualText value={{ en: day.toLocaleDateString('en-US', { day: 'numeric' }), ar: day.toLocaleDateString('ar-SA', { day: 'numeric' }) }} /></span>
                    </div>
                    {isToday && <span className="today-badge"><BilingualText value={bi('Today', 'اليوم')} /></span>}
                  </header>
                  <div className="day-sessions">
                    {sessions.length > 0 ? (
                      sessions.map((session) => (
                        <article key={session.id} className="schedule-session-card">
                          <div className="session-header">
                            <span className="session-time">
                              <Clock size={14} />
                              <BilingualText value={{ en: formatTime(session.startsAt), ar: formatTimeAr(session.startsAt) }} />
                            </span>
                            <span className={`session-status ${session.status.en.includes('Scheduled') ? 'scheduled' : 'other'}`}>
                              <BilingualText value={session.status} />
                            </span>
                          </div>
                          <h4><BilingualText value={session.sportName} /></h4>
                          <div className="session-meta">
                            <span><Users size={12} /><BilingualText value={session.groupName} /></span>
                            <span><MapPin size={12} /><BilingualText value={session.location} /></span>
                            <span><Dumbbell size={12} /><BilingualText value={{ en: `${session.playerCount} players`, ar: `${session.playerCount} لاعبين` }} /></span>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="no-sessions">
                        <BilingualText value={bi('No sessions scheduled', 'لا توجد حصص مجدولة')} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="schedule-list-view" aria-label="Schedule list">
          <div className="schedule-list">
            {filteredSessions.map((session) => {
              const date = new Date(session.startsAt);
              return (
                <article key={session.id} className="schedule-session-card list-card">
                  <div className="list-session-date">
                    <CalendarClock size={16} />
                    <BilingualText value={{
                      en: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                      ar: date.toLocaleDateString('ar-SA', { weekday: 'short', month: 'short', day: 'numeric' })
                    }} />
                  </div>
                  <div className="list-session-main">
                    <h4><BilingualText value={session.sportName} /></h4>
                    <div className="list-session-details">
                      <span><Clock size={14} /><BilingualText value={{ en: formatTime(session.startsAt), ar: formatTimeAr(session.startsAt) }} /></span>
                      <span><Users size={14} /><BilingualText value={session.groupName} /></span>
                      <span><MapPin size={14} /><BilingualText value={session.location} /></span>
                      <span><Dumbbell size={14} /><BilingualText value={{ en: `${session.playerCount} players`, ar: `${session.playerCount} لاعبين` }} /></span>
                    </div>
                  </div>
                  <div className="list-session-status">
                    <span className={`status-badge ${session.status.en.includes('Scheduled') ? 'status-scheduled' : 'status-other'}`}>
                      <BilingualText value={session.status} />
                    </span>
                  </div>
                </article>
              );
            })}
            {filteredSessions.length === 0 && (
              <div className="admin-preview-card" style={{ padding: 32, textAlign: 'center' }}>
                <CalendarClock size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
                <h3><BilingualText value={bi('No Sessions', 'لا توجد حصص')} /></h3>
                <p><BilingualText value={bi('Preview schedule is empty for selected group. Real sessions will appear when connected to backend.', 'الجدول التجريبي فارغ للمجموعة المحددة. الحصص الحقيقية ستظهر عند الاتصال بالخادم.')} /></p>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="schedule-note" aria-label="Schedule note">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Schedule is preview-only. Times, locations, and sessions are structural placeholders.', 'الجدول تجريبي فقط. الأوقات والمواقع والحصص هي بيانات هيكلية مؤقتة.')} />
          </p>
        </div>
      </section>
    </div>
  );
}