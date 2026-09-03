import React from 'react';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Inbox,
  AlertCircle,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalMessagesPage() {
  const { player, coach, sport } = usePlayerSession();

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-messages-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <MessageSquare size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <BilingualText value={bi('Coaching Communications', 'التواصل مع الكادر التدريبي')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Athlete Messaging Hub', 'مركز مراسلة الرياضي')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Communications channel for athlete ${player.nameEn} with assigned coaching staff.`,
                  `قناة التواصل للاعب ${player.nameAr} مع الكادر التدريبي المعتمد.`
                )}
              />
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 self-start sm:self-auto flex items-center gap-1.5">
            <User size={14} className="text-amber-400" />
            <span>
              <BilingualText value={bi(coach?.nameEn || 'Not assigned', coach?.nameAr || 'غير معين')} />
            </span>
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="athlete-glass-card p-0 overflow-hidden border-amber-400/20 flex flex-col h-[520px]">
        {/* Chat Thread Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 font-bold text-sm flex items-center justify-center">
              {coach?.nameEn?.charAt(0) || 'C'}
            </div>
            <div>
              <strong className="text-sm font-bold text-white block">
                {coach?.nameEn || 'Not assigned'} · {coach?.nameAr || 'غير معين'}
              </strong>
              <span className="text-[11px] text-slate-400">
                <BilingualText value={sport ? sport.name : bi('Coaching Department', 'القسم التدريبي')} />
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-slate-500" />
            <BilingualText value={bi('Messaging Service Offline', 'خدمة المراسلة غير متصلة')} />
          </span>
        </div>

        {/* Chat Messages Body / Truthful Integration State */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/80">
              <Inbox size={26} />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              <BilingualText value={bi('Secure messaging is not connected yet.', 'خدمة الرسائل الآمنة غير متصلة بعد.')} />
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              <BilingualText
                value={bi(
                  'Direct messaging with coaching staff will become available once the secure communications backend is connected.',
                  'ستكون المراسلة المباشرة مع الكادر التدريبي متاحة فور تفعيل البنية الخلفية للاتصالات الآمنة.'
                )}
              />
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-[11px] text-amber-400">
              <AlertCircle size={13} />
              <BilingualText
                value={bi(
                  'Composer is disabled pending backend integration',
                  'صندوق الرسائل معطل بانتظار ربط الخدمة الخلفية'
                )}
              />
            </div>
          </div>
        </div>

        {/* Chat Input Bar - Disabled in accordance with unintegrated status */}
        <div className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            disabled
            value=""
            readOnly
            placeholder="Secure messaging is not connected yet... / خدمة الرسائل الآمنة غير متصلة بعد..."
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 placeholder-slate-500 cursor-not-allowed opacity-60"
          />
          <button
            type="button"
            disabled
            className="p-2.5 rounded-xl bg-white/10 text-slate-500 cursor-not-allowed font-bold"
            aria-label="Messaging service is not connected"
          >
            <Send size={16} className="rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
