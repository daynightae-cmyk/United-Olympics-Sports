import { CalendarClock, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dayLabelsAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function ParentPortalSchedulePage() {
  const { parent, children, familySessions, sports, groups, loading, error } = useParentPortalGatewayData();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedChild, setSelectedChild] = useState('all');

  if (loading && !parent) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family schedule…','جارٍ تحميل جدول الأسرة…')}/></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Schedule provider unavailable','موفر بيانات الجدول غير متاح')}/></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable','ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.','سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + currentWeek * 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });

  const selectedGroupId = selectedChild === 'all' ? null : children.find((child) => child.id === selectedChild)?.groupId ?? null;
  const filteredSessions = selectedGroupId ? familySessions.filter((session) => session.groupId === selectedGroupId) : familySessions;
  const sessionsForDay = (date: Date) => {
    const key = date.toISOString().slice(0, 10);
    return filteredSessions.filter((session) => session.startsAt.slice(0, 10) === key);
  };
  const childForGroup = (groupId: string) => children.find((child) => child.groupId === groupId);
  const sportFor = (sportId: string) => sports.find((sport) => sport.id === sportId);
  const groupFor = (groupId: string) => groups.find((group) => group.id === groupId);

  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Parent Portal · Schedule','بوابة ولي الأمر · الجدول')}
      title={bi('Family Schedule','جدول الأسرة')}
      description={bi('Training sessions synchronized from the same provider used by Admin. No facility location is invented when it is not part of the contract.','حصص التدريب متزامنة من نفس موفر البيانات المستخدم في الإدارة. لا يتم اختلاق موقع منشأة عندما لا يكون جزءًا من العقد.')}
      actions={<div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><PreviewNotice/><button className="admin-secondary-button" onClick={()=>setViewMode('week')}><BilingualText value={bi('Week','أسبوع')}/></button><button className="admin-secondary-button" onClick={()=>setViewMode('list')}><BilingualText value={bi('List','قائمة')}/></button></div>}
    />

    <section className="schedule-toolbar" aria-label="Schedule navigation">
      <div className="schedule-nav">
        <button className="nav-btn" onClick={()=>setCurrentWeek((week)=>week-1)} aria-label="Previous week"><ChevronLeft size={18}/></button>
        <div className="week-range"><BilingualText value={{en:`${weekDays[0].toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${weekDays[6].toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`,ar:`${weekDays[0].toLocaleDateString('ar-SA',{month:'short',day:'numeric'})} – ${weekDays[6].toLocaleDateString('ar-SA',{month:'short',day:'numeric',year:'numeric'})}`}}/></div>
        <button className="nav-btn" onClick={()=>setCurrentWeek((week)=>week+1)} aria-label="Next week"><ChevronRight size={18}/></button>
      </div>
      <div className="child-selector"><label><BilingualText value={bi('Child','الطفل')}/><select value={selectedChild} onChange={(event)=>setSelectedChild(event.target.value)}><option value="all">All Children | جميع الأطفال</option>{children.map((child)=><option key={child.id} value={child.id}>{child.nameEn} | {child.nameAr}</option>)}</select></label></div>
      <button className="admin-secondary-button" onClick={()=>setCurrentWeek(0)}><BilingualText value={bi('This Week','هذا الأسبوع')}/></button>
    </section>

    {viewMode === 'week' ? <section className="schedule-week-view" aria-label="Weekly schedule"><div className="schedule-week-grid">{weekDays.map((day,index)=>{
      const sessions = sessionsForDay(day);
      const isToday = day.toDateString() === today.toDateString();
      return <div key={day.toISOString()} className={`schedule-day-column ${isToday?'today':''}`}>
        <header><div><strong><BilingualText value={{en:dayLabels[index],ar:dayLabelsAr[index]}}/></strong><span>{day.getDate()}</span></div>{isToday&&<span className="today-badge"><BilingualText value={bi('Today','اليوم')}/></span>}</header>
        <div className="day-sessions">{sessions.length ? sessions.map((session)=>{
          const child = childForGroup(session.groupId);
          const sport = sportFor(session.sportId);
          const group = groupFor(session.groupId);
          return <article key={session.id} className="schedule-session-card"><div className="session-header"><span className="session-time"><Clock size={14}/>{new Date(session.startsAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span><span className="session-status scheduled"><BilingualText value={session.status}/></span></div><h4><BilingualText value={sport?.name??bi(session.sportId,session.sportId)}/></h4><div className="session-meta"><span><Users size={12}/>{child ? <BilingualText value={{en:child.nameEn,ar:child.nameAr}}/> : <BilingualText value={bi('Linked group','مجموعة مرتبطة')}/>}</span><span><BilingualText value={group?.name??bi(session.groupId,session.groupId)}/></span></div></article>;
        }) : <div className="no-sessions"><BilingualText value={bi('No sessions scheduled','لا توجد حصص مجدولة')}/></div>}</div>
      </div>;
    })}</div></section> : <section className="schedule-list-view" aria-label="Schedule list"><div className="schedule-list">{filteredSessions.length ? filteredSessions.map((session)=>{
      const child = childForGroup(session.groupId);
      const sport = sportFor(session.sportId);
      const group = groupFor(session.groupId);
      const date = new Date(session.startsAt);
      return <article key={session.id} className="schedule-session-card list-card"><div className="list-session-date"><CalendarClock size={16}/><BilingualText value={{en:date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}),ar:date.toLocaleDateString('ar-SA',{weekday:'short',month:'short',day:'numeric'})}}/></div><div className="list-session-main"><h4><BilingualText value={sport?.name??bi(session.sportId,session.sportId)}/></h4><div className="list-session-details"><span><Clock size={14}/>{date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span><span><Users size={14}/>{child?<BilingualText value={{en:child.nameEn,ar:child.nameAr}}/>:<BilingualText value={bi('Linked group','مجموعة مرتبطة')}/>}</span><span><BilingualText value={group?.name??bi(session.groupId,session.groupId)}/></span></div></div><div className="list-session-status"><span className="status-badge status-scheduled"><BilingualText value={session.status}/></span></div></article>;
    }) : <EnterpriseEmpty title={bi('No sessions','لا توجد حصص')} description={bi('No provider session matches the selected child or current data set.','لا توجد جلسة لدى موفر البيانات تطابق الطفل المحدد أو مجموعة البيانات الحالية.')} />}</div></section>}

    <section className="schedule-note" aria-label="Schedule note"><div className="admin-preview-card" style={{padding:18}}><p style={{margin:0,fontSize:13,color:'var(--color-text-muted)',lineHeight:1.6}}><BilingualText value={bi('Session dates, times, sports, groups and statuses are provider-backed. Facility locations are intentionally omitted because the current session contract does not expose them.','تواريخ الجلسات وأوقاتها ورياضاتها ومجموعاتها وحالاتها مدفوعة بموفر البيانات. يتم حذف مواقع المنشآت عمدًا لأن عقد الجلسة الحالي لا يعرضها.')}/></p></div></section>
  </div>;
}
