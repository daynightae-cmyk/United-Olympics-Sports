import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  QrCode,
  RotateCw,
  Sparkles,
  ExternalLink,
  MapPin,
  Phone,
  Info,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import SafeBrandLogo from '../../../components/ui/SafeBrandLogo';

export function PlayerPortalSubscriptionPage() {
  const { player, sport, group, parent } = usePlayerSession();
  const [isFlipped, setIsFlipped] = useState(false);

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-subscription-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                <CreditCard size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                <BilingualText value={bi('Athletic Membership & Credential', 'العضوية والبطاقة الرياضية')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Membership & Digital Athlete ID', 'العضوية والبطاقة الرقمية')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Sports development membership with United Olympics Sports.`,
                  `عضوية التطوير الرياضي في يونايتد أوليمبيكس سبورت.`
                )}
              />
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 border border-white/10 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck size={15} />
            <span><BilingualText value={bi('Player Identity Preview', 'معاينة هوية اللاعب')} /></span>
          </span>
        </div>
      </div>

      {/* Digital Athlete Card Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Flippable Digital Card */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            className="w-full max-w-md cursor-pointer perspective-1000 select-none"
            onClick={() => setIsFlipped(!isFlipped)}
            title="Click to flip card | انقر لقلب البطاقة"
          >
            {!isFlipped ? (
              /* Front of Card */
              <div className="digital-id-card min-h-[260px] flex flex-col justify-between transition-all duration-500 hover:scale-[1.01]">
                {/* Brand & Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <SafeBrandLogo className="w-10 h-10 object-contain" />
                    <div>
                      <h3 className="font-['Cinzel',serif] text-xs font-bold tracking-wider text-slate-100">
                        UNITED OLYMPICS SPORTS
                      </h3>
                      <span className="text-[10px] text-amber-400 font-semibold block">
                        يونايتد أوليمبيكس سبورت
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    <BilingualText value={bi('Preview', 'معاينة')} />
                  </span>
                </div>

                {/* Identity & Photo */}
                <div className="flex items-center gap-4 my-4 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-extrabold text-2xl flex items-center justify-center border-2 border-amber-200 shadow-md">
                    {player.nameEn.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">
                      {player.nameEn}
                    </h4>
                    <p className="text-xs text-amber-300 font-medium">
                      {player.nameAr}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      <BilingualText value={sport ? sport.name : bi('Sport', 'الرياضة')} /> · {player.level?.en}
                    </p>
                  </div>
                </div>

                {/* Card Meta & Barcode */}
                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] relative z-10">
                  <div>
                    <span className="text-slate-400 block"><BilingualText value={bi('Player ID', 'رقم اللاعب')} /></span>
                    <strong className="font-mono text-white tracking-wider">
                      {player.id.toUpperCase()}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block"><BilingualText value={bi('Group', 'المجموعة')} /></span>
                    <strong className="text-amber-300">{group?.name?.en || '—'}</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* Back of Card */
              <div className="digital-id-card min-h-[260px] flex flex-col justify-between transition-all duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 relative z-10">
                  <span className="text-xs font-bold text-amber-300">
                    <BilingualText value={bi('Player Identity Details', 'تفاصيل هوية اللاعب')} />
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {player.id}
                  </span>
                </div>

                <div className="space-y-2.5 my-3 text-xs relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400"><BilingualText value={bi('Sport', 'الرياضة')} />:</span>
                    <strong className="text-slate-200">{sport?.name?.en || '—'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400"><BilingualText value={bi('Emergency Guardian', 'ولي الأمر للطوارئ')} />:</span>
                    <strong className="text-slate-200">{parent?.nameEn || '—'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400"><BilingualText value={bi('Emergency Contact', 'هاتف الطوارئ')} />:</span>
                    <strong className="font-mono text-amber-300">{parent?.phone || '—'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between relative z-10 text-[10px] text-slate-400">
                  <span><BilingualText value={bi('Identity Preview', 'معاينة الهوية')} /></span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCw size={13} />
            <span>
              <BilingualText
                value={isFlipped ? bi('Flip to front view', 'عرض واجهة البطاقة') : bi('Flip to view emergency info', 'عرض الوجه الخلفي وبيانات الطوارئ')}
              />
            </span>
          </button>
        </div>

        {/* Right Column: Membership Plan Details */}
        <div className="lg:col-span-6 space-y-4">
          <div className="athlete-glass-card p-6 border-l-2 border-l-slate-500">
            <h3 className="text-lg font-bold text-white mb-1">
              <BilingualText value={bi('Membership Status', 'حالة العضوية')} />
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              <BilingualText value={bi('Membership information is not available yet.', 'معلومات العضوية غير متاحة بعد.')} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
