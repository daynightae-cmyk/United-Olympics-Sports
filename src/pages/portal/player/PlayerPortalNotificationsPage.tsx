import { Award, Bell, Calendar, CheckCheck, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerSession, type PlayerNotificationItem } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

const filters = [
  { id: 'all', label: bi('All updates', 'جميع التحديثات') },
  { id: 'unread', label: bi('Unread', 'غير مقروء') },
  { id: 'schedule', label: bi('Schedule', 'الجدول') },
  { id: 'feedback', label: bi('Feedback', 'الملاحظات') },
  { id: 'attendance', label: bi('Attendance', 'الحضور') },
  { id: 'achievement', label: bi('Achievements', 'الإنجازات') },
  { id: 'membership', label: bi('Membership', 'العضوية') },
] as const;

type NotificationFilter = typeof filters[number]['id'];

export function PlayerPortalNotificationsPage() {
  const { player, notifications, markNotificationRead, markAllNotificationsRead } = usePlayerSession();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  if (!player) return null;

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !item.isRead;
    return item.category === filter;
  });

  return (
    <div className="space-y-6" id="player-notifications-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Bell size={18} /><BilingualText value={bi('Player Record Signals', 'إشارات سجل اللاعب')} /></div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Notifications Center', 'مركز الإشعارات')} /></h1>
            <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Notifications shown here are derived from currently available schedule and feedback records for ${player.nameEn}.`, `الإشعارات المعروضة هنا مشتقة من سجلات الجدول والملاحظات المتاحة حاليًا للاعب ${player.nameAr}.`)} /></p>
          </div>
          {unreadCount > 0 ? <button type="button" onClick={markAllNotificationsRead} className="athlete-action-primary self-start"><CheckCheck size={14} /><BilingualText value={bi('Mark all read', 'تحديد الكل كمقروء')} /></button> : <span className="athlete-data-scope"><CheckCircle2 size={13} /><BilingualText value={bi('No unread items', 'لا توجد عناصر غير مقروءة')} /></span>}
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10" role="tablist" aria-label="Notification filters | فلاتر الإشعارات">
          {filters.map((item) => <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === item.id ? 'bg-amber-400 text-black shadow-md' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}><BilingualText value={item.label} />{item.id === 'unread' ? ` (${unreadCount})` : ''}</button>)}
        </div>
      </section>

      <section className="space-y-3" id="notifications-list" aria-live="polite">
        {filteredNotifications.length ? filteredNotifications.map((notification) => (
          <article key={notification.id} className={`athlete-glass-card p-4 sm:p-5 flex items-start justify-between gap-4 ${notification.isRead ? 'border-white/5' : 'border-amber-400/35 bg-amber-400/[.035]'}`}>
            <div className="flex items-start gap-3.5 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center flex-shrink-0 mt-0.5">{categoryIcon(notification.category)}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><h2 className="text-xs sm:text-sm font-bold text-white"><BilingualText value={notification.title} /></h2>{!notification.isRead && <span className="w-2 h-2 rounded-full bg-amber-400" aria-label="Unread | غير مقروء" />}</div>
                <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={notification.description} /></p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-500"><span className="font-mono">{formatTimestamp(notification.timestamp)}</span><span><BilingualText value={categoryLabel(notification.category)} /></span></div>
                {notification.actionUrl && <Link to={notification.actionUrl} className="mt-3 inline-flex items-center text-[11px] font-bold text-amber-300 hover:text-amber-200"><BilingualText value={bi('Open related record', 'فتح السجل المرتبط')} /></Link>}
              </div>
            </div>
            {!notification.isRead ? <button type="button" onClick={() => markNotificationRead(notification.id)} className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-emerald-300" aria-label="Mark notification read | تحديد الإشعار كمقروء" title="Mark read | تحديد كمقروء"><CheckCircle2 size={17} /></button> : <span className="p-2 text-emerald-400" title="Read | مقروء"><CheckCircle2 size={17} /></span>}
          </article>
        )) : (
          <div className="athlete-empty-system"><div><Bell size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={filter === 'all' ? bi('No current notifications', 'لا توجد إشعارات حالية') : bi('No notifications match this filter', 'لا توجد إشعارات تطابق هذا الفلتر')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('This does not imply that every announcement has been read. It means no notification can currently be derived from the connected player records for this view.', 'هذا لا يعني أن جميع الإعلانات قد تمت قراءتها، بل يعني أنه لا يمكن حاليًا اشتقاق إشعار من سجلات اللاعب المتصلة لهذا العرض.')} /></p></div></div>
        )}
      </section>
    </div>
  );
}

function categoryIcon(category: PlayerNotificationItem['category']) {
  if (category === 'schedule') return <Calendar size={16} className="text-amber-400" />;
  if (category === 'feedback') return <MessageSquare size={16} className="text-emerald-400" />;
  if (category === 'achievement') return <Award size={16} className="text-amber-400" />;
  if (category === 'attendance') return <CheckCircle2 size={16} className="text-blue-400" />;
  return <Sparkles size={16} className="text-sky-400" />;
}

function categoryLabel(category: PlayerNotificationItem['category']) {
  if (category === 'schedule') return bi('Schedule', 'الجدول');
  if (category === 'feedback') return bi('Feedback', 'الملاحظات');
  if (category === 'attendance') return bi('Attendance', 'الحضور');
  if (category === 'achievement') return bi('Achievement', 'إنجاز');
  return bi('Membership', 'العضوية');
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
