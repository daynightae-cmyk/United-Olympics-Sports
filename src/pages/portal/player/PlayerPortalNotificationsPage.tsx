import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Award,
  MessageSquare,
  Sparkles,
  CheckCheck,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { usePlayerSession, PlayerNotificationItem } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalNotificationsPage() {
  const { player, notifications, markNotificationRead, markAllNotificationsRead } = usePlayerSession();
  const [filter, setFilter] = useState<'all' | 'unread' | 'schedule' | 'feedback' | 'attendance' | 'achievement' | 'membership'>('all');

  if (!player) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'all') return true;
    return n.category === filter;
  });

  const markAllAsRead = () => {
    markAllNotificationsRead();
  };

  const toggleRead = (id: string) => {
    markNotificationRead(id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schedule':
        return <Calendar size={16} className="text-amber-400" />;
      case 'feedback':
        return <Award size={16} className="text-emerald-400" />;
      case 'attendance':
        return <Calendar size={16} className="text-blue-400" />;
      case 'achievement':
        return <Award size={16} className="text-amber-400" />;
      case 'membership':
      default:
        return <Sparkles size={16} className="text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6" id="player-notifications-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <Bell size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Activity Updates & Alerts', 'التحديثات والإشعارات الرسمية')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Notifications Center', 'مركز الإشعارات والتنبيهات')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Updates derived from your current player records for ${player.nameEn}`,
                  `تحديثات مشتقة من سجلات اللاعب الحالية للاعب ${player.nameAr}`
                )}
              />
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-400/20 hover:bg-amber-300 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span><BilingualText value={bi('Mark All Read', 'تحديد الكل كمقروء')} /></span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
          {[
            { id: 'all', label: { en: 'All Updates', ar: 'جميع التحديثات' } },
            { id: 'unread', label: { en: `Unread (${unreadCount})`, ar: `غير مقروء (${unreadCount})` } },
            { id: 'schedule', label: { en: 'Schedule', ar: 'الجدول' } },
            { id: 'feedback', label: { en: 'Feedback', ar: 'الملاحظات' } },
            { id: 'attendance', label: { en: 'Attendance', ar: 'الحضور' } },
            { id: 'achievement', label: { en: 'Achievements', ar: 'الإنجازات' } },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === cat.id
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <BilingualText value={cat.label} />
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3" id="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => toggleRead(notif.id)}
              className={`athlete-glass-card athlete-glass-card-interactive p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer ${
                !notif.isRead ? 'border-amber-400/40 bg-amber-400/[0.04]' : 'border-white/5'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm font-bold text-white">
                      <BilingualText value={notif.title} />
                    </strong>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <BilingualText value={notif.description} />
                  </p>

                  <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                    {notif.timestamp}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRead(notif.id);
                }}
                className="text-xs text-slate-400 hover:text-white p-1 rounded"
                title={notif.isRead ? 'Mark unread' : 'Mark read'}
              >
                <CheckCircle2
                  size={16}
                  className={notif.isRead ? 'text-emerald-400' : 'text-slate-400'}
                />
              </button>
            </div>
          ))
        ) : (
          <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-3">
            <Bell size={32} className="mx-auto text-slate-500" />
            <h3 className="text-sm font-bold text-slate-300">
              <BilingualText value={bi('No notifications found', 'لا توجد إشعارات')} />
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              <BilingualText
                value={bi(
                  'You are completely caught up with all United Olympics Sports announcements and schedules.',
                  'لقد اطلعت على جميع إعلانات وجداول يونايتد أوليمبيكس سبورت الرسمية.'
                )}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
