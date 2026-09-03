import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquareText,
  CheckCircle2,
  Target,
  Sparkles,
  User,
  ArrowUpRight,
  MessageCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalFeedbackPage() {
  const { player, sport, coach, feedback } = usePlayerSession();

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-feedback-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <MessageSquareText size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Technical Coaching Directives', 'التوجيهات والتقييمات الفنية')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Coach Feedback & Evaluations', 'ملاحظات وتقييمات المدرب')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Direct technical reviews and training focus targets from your coaching staff.`,
                  `مراجعات فنية مباشرة ومحاور تركيز تدريبية من كادر التدريب.`
                )}
              />
            </p>
          </div>

          <Link
            to="/player/messages"
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-400/20 hover:bg-amber-300 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <MessageCircle size={15} />
            <span><BilingualText value={bi('Chat with Coach', 'مراسلة المدرب')} /></span>
          </Link>
        </div>

        {/* Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Total Evaluations', 'إجمالي التقييمات')} /></span>
            <strong className="text-white text-xl font-bold">{feedback.length}</strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Primary Coach', 'المدرب المشرف')} /></span>
            <strong className="text-amber-400 text-sm sm:text-base font-bold truncate">
              {coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Highlighted Strengths', 'نقاط القوة المسجلة')} /></span>
            <strong className="text-emerald-400 text-xl font-bold">
              {feedback.reduce((acc, f) => acc + f.strengths.length, 0)}
            </strong>
          </div>
          <div className="athlete-stat-pill">
            <span><BilingualText value={bi('Active Focus Targets', 'أهداف التطوير الحالية')} /></span>
            <strong className="text-amber-400 text-xl font-bold">
              {feedback.reduce((acc, f) => acc + f.focusAreas.length, 0)}
            </strong>
          </div>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-4" id="coach-feedback-feed">
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <div
              key={item.id}
              className="athlete-glass-card p-6 border-amber-400/20 space-y-4"
            >
              {/* Card Header: Coach info & Timestamp */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold text-sm">
                    {coach?.nameEn?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-white block">
                      <BilingualText value={bi('Coach', 'المدرب')} /> {coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}
                    </strong>
                    <span className="text-xs text-amber-400 font-medium">
                      <BilingualText value={sport ? sport.name : bi('Sport', 'الرياضة')} /> · <BilingualText value={bi('Training Review', 'تقييم تدريبي')} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={13} className="text-slate-400" />
                  <span className="font-mono">{item.createdAt}</span>
                </div>
              </div>

              {/* Coach Summary Text */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-slate-200 text-xs sm:text-sm leading-relaxed">
                <BilingualText value={item.summary} />
              </div>

              {/* Strengths and Focus Areas Dual Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Strengths */}
                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <BilingualText value={bi('Demonstrated Strengths', 'نقاط القوة المتميزة')} />
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.strengths.map((str, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                      >
                        <ArrowUpRight size={12} />
                        <BilingualText value={str} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Focus Targets */}
                <div className="p-3.5 rounded-xl bg-amber-400/5 border border-amber-400/15 space-y-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Target size={14} />
                    <BilingualText value={bi('Target Focus in Next Sessions', 'أهداف التطوير للحصص القادمة')} />
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.focusAreas.map((fa, fIdx) => (
                      <span
                        key={fIdx}
                        className="text-xs px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 flex items-center gap-1"
                      >
                        <Sparkles size={12} />
                        <BilingualText value={fa} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Discuss with Coach action */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>
                  <BilingualText value={bi('Record provided by United Olympics Sports training staff', 'سجل مقدم من فريق التدريب في يونايتد أوليمبيكس سبورت')} />
                </span>
                <Link
                  to="/player/messages"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <MessageCircle size={13} />
                  <span><BilingualText value={bi('Reply / Ask Coach', 'الرد / سؤال المدرب')} /></span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-3">
            <MessageSquareText size={32} className="mx-auto text-slate-500" />
            <h3 className="text-sm font-bold text-slate-300">
              <BilingualText value={bi('No feedback notes yet', 'لا توجد ملاحظات تدريبية بعد')} />
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              <BilingualText
                value={bi(
                  'Your coach will file detailed performance observations after your upcoming training match.',
                  'سيقوم مدربك بتسجيل الملاحظات الفنية المفصلة بعد الحصة أو المباراة القادمة.'
                )}
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
