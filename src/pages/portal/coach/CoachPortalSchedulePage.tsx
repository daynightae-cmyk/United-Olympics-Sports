import { CalendarClock, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function CoachPortalSchedulePage() {
  const { sessions, groups, players, sports, loading, error } = useCoachPortalGatewayData();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedGroup, setSelectedGroup] = useState('all');

  if (loading) return <div className="admin-page"><div className="ui-skeleton" role="status"><span><BilingualText value={bi('Loading schedule…', 'جارٍ تحميل الجدول…')} /></span><i /><i /><i /></div></div>;
  if (error) return <div className="admin-page"><div className="enterprise-empty"><CalendarClock size={24} /><h3><BilingualText value={bi('Schedule unavailable', 'الجدول غير متاح')} /></h3><p><BilingualText value={bi('The current data provider could not supply coach sessions.', 'تعذر على مصدر البيانات الحالي توفير حصص المدرب.')} /></p></div></div>;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - today.getDay() + currentWeek * 7);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const filteredSessions = selectedGroup === 'all' ? sessions : sessions.filter((session) => session.groupId === selectedGroup);
  const sessionsForDay = (date: Date) => filteredSessions.filter((session) => {
    const value = new Date(session.startsAt);
    return value.getFullYear() === date.getFullYear() && value.getMonth() === date.getMonth() && value.getDate() === date.getDate();
  });
  const getGroup = (id: string) => groups.find((group) => group.id === id);
  const getSport = (id: string) => sports.find((sport) => sport.id === id);
  const playerCount = (groupId: string) => players.filter((player) => player.groupId === groupId).length;

  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Coach Portal | Schedule', 'بوابة المدرب | الجدول')}
      title={bi('Schedule', 'الجدول')}
      description={bi('Sessions are limited to the active coach assignment and assigned groups.', 'تقتصر الحصص على تكليف المدرب النشط ومجموعاته المكلف بها.')}
      actions={<div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><button className="admin-secondary-button" onClick={() => setViewMode('week')}><BilingualText value={bi('Week', 'أسبوع')} /></button><button className="admin-secondary-button" onClick={() => setViewMode('list')}><BilingualText value={bi('List', 'قائمة')} /></button><PreviewNotice /></div>}
    />

    <section className="schedule-toolbar" aria-label="Schedule navigation">
      <div className="schedule-nav">
        <button className="nav-btn" onClick={() => setCurrentWeek((week) => week - 1)} aria-label="Previous week"><ChevronLeft size={18} /></button>
        <div className="week-range"><BilingualText value={{ en: `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, ar: `${weekDays[0].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', year: 'numeric' })}` }} /></div>
        <button className="nav-btn" onClick={() => setCurrentWeek((week) => week + 1)} aria-label="Next week"><ChevronRight size={18} /></button>
      </div>
      <div className="group-selector"><label><BilingualText value={bi('Group', 'المجموعة')} /><select value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}><option value="all">All Groups | جميع المجموعات</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.name.en} | {group.name.ar}</option>)}</select></label></div>
      <button className="admin-secondary-button" onClick={() => setCurrentWeek(0)}><BilingualText value={bi('This Week', 'هذا الأسبوع')} /></button>
    </section>

    {viewMode === 'week' ? <section className="schedule-week-view" aria-label="Weekly schedule"><div className="schedule-week-grid">
      {weekDays.map((day, dayIndex) => {
        const daySessions = sessionsForDay(day);
        const isToday = day.toDateString() === today.toDateString();
        return <div key={day.toISOString()} className={`schedule-day-column ${isToday ? 'today' : ''}`}>
          <header><div><strong><BilingualText value={{ en: dayLabels[dayIndex], ar: dayLabelsAr[dayIndex] }} /></strong><span>{day.getDate()}</span></div>{isToday && <span className="today-badge"><BilingualText value={bi('Today', 'اليوم')} /></span>}</header>
          <div className="day-sessions">{daySessions.length ? daySessions.map((session) => {
            const group = getGroup(session.groupId);
            const sport = getSport(session.sportId);
            return <article key={session.id} className="schedule-session-card"><div className="session-header"><span className="session-time"><Clock size={14} />{new Date(session.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="session-status"><BilingualText value={session.status} /></span></div><h4><BilingualText value={sport?.name ?? bi('Sport not available', 'الرياضة غير متاحة')} /></h4><div className="session-meta"><span><Users size={12} /><BilingualText value={group?.name ?? bi('Group not available', 'المجموعة غير متاحة')} /></span><span><Users size={12} />{playerCount(session.groupId)} <BilingualText value={bi('athletes', 'رياضيين')} /></span></div></article>;
          }) : <div className="no-sessions"><BilingualText value={bi('No sessions scheduled', 'لا توجد حصص مجدولة')} /></div>}</div>
        </div>;
      })}
    </div></section> : <section className="schedule-list-view" aria-label="Schedule list"><div className="schedule-list">
      {filteredSessions.map((session) => {
        const group = getGroup(session.groupId);
        const sport = getSport(session.sportId);
        const date = new Date(session.startsAt);
        return <article key={session.id} className="schedule-session-card list-card"><div className="list-session-date"><CalendarClock size={16} />{date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div><div className="list-session-main"><h4><BilingualText value={sport?.name ?? bi('Sport not available', 'الرياضة غير متاحة')} /></h4><div className="list-session-details"><span><Clock size={14} />{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span><Users size={14} /><BilingualText value={group?.name ?? bi('Group not available', 'المجموعة غير متاحة')} /></span><span><Users size={14} />{playerCount(session.groupId)} <BilingualText value={bi('athletes', 'رياضيين')} /></span></div></div><div className="list-session-status"><span className="status-badge"><BilingualText value={session.status} /></span></div></article>;
      })}
      {!filteredSessions.length && <div className="enterprise-empty"><CalendarClock size={32} /><h3><BilingualText value={bi('No sessions', 'لا توجد حصص')} /></h3><p><BilingualText value={bi('No provider-backed sessions are assigned to the selected coach scope.', 'لا توجد حصص من مصدر البيانات مخصصة لنطاق المدرب المحدد.')} /></p></div>}
    </div></section>}
  </div>;
}
