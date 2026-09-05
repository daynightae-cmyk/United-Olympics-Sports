import React, { useState } from 'react';
import {
  Trophy,
  Award,
  ShieldCheck,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { usePlayerSession, PlayerAchievementItem } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalAchievementsPage() {
  const { player, achievements } = usePlayerSession();
  const [selectedBadge, setSelectedBadge] = useState<PlayerAchievementItem | null>(null);

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-achievements-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <Trophy size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Honors & Accolades', 'الأوسمة والإنجازات')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Achievements & Milestones', 'سجل الإنجازات والأوسمة')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Performance achievements and milestones on record for ${player.nameEn}`,
                  `أوسمة وإنجازات الأداء المسجلة للاعب ${player.nameAr}`
                )}
              />
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Award size={15} className="text-amber-400" />
              <span>{achievements.length} <BilingualText value={bi('Earned Accolades', 'أوسمة مكتسبة')} /></span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Badges / Truthful Empty State */}
      {achievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="achievements-cards-grid">
          {achievements.map((badge) => (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="athlete-glass-card athlete-glass-card-interactive p-5 flex flex-col justify-between gap-4 cursor-pointer border-amber-400/20"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-md shadow-amber-400/20 flex-shrink-0">
                    <Award size={24} />
                  </div>

                  {badge.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase border bg-amber-400/10 text-amber-300 border-amber-400/30">
                      <BilingualText value={badge.category} />
                    </span>
                  )}
                </div>

                <strong className="text-sm font-bold text-white block mb-1">
                  <BilingualText value={badge.title} />
                </strong>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  <BilingualText value={badge.description} />
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {badge.awardedAt ? (
                    <span className="font-mono">{badge.awardedAt}</span>
                  ) : (
                    <span><BilingualText value={bi('On Athlete Record', 'مسجل في الملف')} /></span>
                  )}
                </span>
                <span className="text-amber-400 text-xs hover:underline">
                  <BilingualText value={bi('Details →', 'التفاصيل ←')} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-3 max-w-md mx-auto border-dashed border-white/15">
          <Trophy size={32} className="mx-auto text-slate-500" />
          <h3 className="text-sm font-bold text-slate-200">
            <BilingualText value={bi('No achievements recorded yet.', 'لم يتم تسجيل أي إنجازات حتى الآن.')} />
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            <BilingualText
              value={bi(
                'Athletic recognitions and awards will appear here once granted by coaching staff.',
                'ستظهر الأوسمة والإنجازات الرياضية هنا فور تسجيلها من الكادر التدريبي.'
              )}
            />
          </p>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="athlete-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div
            className="athlete-modal-content !max-w-md p-6 text-center"
            onClick={(e) => e.stopPropagation()}
            id="achievement-detail-modal"
          >
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-20 h-20 rounded-3xl bg-amber-400/15 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-xl shadow-amber-400/10">
              <Award size={40} />
            </div>

            {selectedBadge.category && (
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 mb-2">
                <BilingualText value={selectedBadge.category} />
              </span>
            )}

            <h3 className="text-lg font-bold text-white">
              <BilingualText value={selectedBadge.title} />
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed px-4">
              <BilingualText value={selectedBadge.description} />
            </p>

            {selectedBadge.awardedAt && (
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
                <Calendar size={13} className="text-amber-400" />
                <span>{selectedBadge.awardedAt}</span>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span><BilingualText value={bi('Recorded for', 'مسجل للاعب')} />:</span>
              <strong className="text-slate-200">{player.nameEn} · {player.nameAr}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
