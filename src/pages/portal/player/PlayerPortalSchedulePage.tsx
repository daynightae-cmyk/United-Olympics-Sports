import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerSessionSummary } from "../../../portals/player/components/PlayerSessionSummary";
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { Session } from '../../../domain/contracts';

export function PlayerPortalSchedulePage() {
  const { player, sport, group, coach, sessions } = usePlayerSession();
  const [selectedTab, setSelectedTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  if (!player) return null;

  // Filter sessions based on tab using live date
  const filteredSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => {
      const sDate = new Date(s.startsAt);
      if (selectedTab === 'upcoming') {
        return sDate >= now;
      }
      if (selectedTab === 'completed') {
        return sDate < now;
      }
      return true;
    });
  }, [sessions, selectedTab]);

  return (
    <div className="space-y-6" id="player-schedule-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <Calendar size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Training Calendar', 'التقويم التدريبي')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Athlete Training Schedule', 'جدول تدريبات الرياضي')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Assigned sessions for ${player.nameEn} · ${group?.name.en || '—'}`,
                  `الحصص المعتمدة للاعب ${player.nameAr} · ${group?.name.ar || '—'}`
                )}
              />
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <Users size={14} className="text-amber-400" />
              <span><BilingualText value={group ? group.name : bi('Group', 'المجموعة')} /></span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5">
              <User size={14} className="text-amber-400" />
              <span>
                <BilingualText value={bi('Coach:', 'المدرب:')} /> {coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTab === 'all'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BilingualText value={bi('All Sessions', 'جميع الحصص')} /> ({sessions.length})
          </button>
          <button
            onClick={() => setSelectedTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTab === 'upcoming'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BilingualText value={bi('Upcoming', 'القادمة')} />
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTab === 'completed'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BilingualText value={bi('Past', 'السابقة')} />
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3" id="schedule-sessions-list">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => (
            <PlayerSessionSummary
              key={session.id}
              sessionId={session.id}
              onClick={() => setSelectedSession(session)}
            />
          ))
        ) : (
          <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-3">
            <Calendar size={32} className="mx-auto text-slate-500" />
            <h3 className="text-sm font-bold text-slate-300">
              <BilingualText value={bi('No sessions found in this view', 'لا توجد حصص في هذا العرض')} />
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              <BilingualText
                value={bi(
                  'Your training group calendar updates in accordance with organization schedule.',
                  'يتم تحديث جدول مجموعتك التدريبية بالتوافق مع جدول الإدارة.'
                )}
              />
            </p>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="athlete-modal-overlay" onClick={() => setSelectedSession(null)}>
          <div
            className="athlete-modal-content !max-w-lg p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
            id="session-detail-modal"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase">
                  <BilingualText value={bi('Session Details', 'تفاصيل الحصة التدريبية')} />
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  <BilingualText value={sport ? sport.name : bi('Training Session', 'حصة تدريبية')} />
                </h3>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Start Time', 'وقت البدء')} /></span>
                  <strong className="text-white font-mono">
                    {new Date(selectedSession.startsAt).toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Group', 'المجموعة')} /></span>
                  <strong className="text-white">
                    <BilingualText value={group ? group.name : bi('Assigned Group', 'المجموعة')} />
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Supervising Coach', 'المدرب المشرف')} /></span>
                  <strong className="text-white">{coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Status', 'الحالة')} /></span>
                  <strong className="text-emerald-400"><BilingualText value={selectedSession.status} /></strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const id = selectedSession.id;
                  setSelectedSession(null);
                  navigate(`/player/schedule/${id}`);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black transition-colors flex items-center gap-1.5"
              >
                <span><BilingualText value={bi('Open Dedicated Page', 'فتح الصفحة المخصصة')} /></span>
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                <BilingualText value={bi('Close', 'إغلاق')} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
