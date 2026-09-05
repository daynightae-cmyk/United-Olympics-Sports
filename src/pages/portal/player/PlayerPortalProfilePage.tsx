import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail, HeartPulse, ShieldCheck, Award, User, Activity, CreditCard, FileText } from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PlayerPortrait } from '../../../portals/player/components/PlayerPortrait';

export function PlayerPortalProfilePage() {
  const { player, sport, group, coach, parent, overallScore, attendanceStats } = usePlayerSession();

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-profile-page">
      {/* Athlete Identity Hero Card */}
      <div className="athlete-hero-card p-6 sm:p-8 border-amber-400/30">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <PlayerPortrait photoUrl={player.photo} name={player.nameEn} className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-amber-300 shadow-xl shadow-amber-400/20 flex-shrink-0" />

          <div className="space-y-2 text-center sm:text-left rtl:sm:text-right flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={13} />
                <BilingualText value={player.status} />
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {player.nameEn}
            </h1>
            <p className="text-base text-amber-400 font-medium">
              {player.nameAr}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-300 pt-2">
              <span className="flex items-center gap-1.5">
                <Award size={14} className="text-amber-400" />
                <BilingualText value={sport ? sport.name : bi('Sport Track', 'المسار الرياضي')} />
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-amber-400" />
                <BilingualText value={group ? group.name : bi('Assigned Group', 'المجموعة')} />
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300">
                ID: {player.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Quick Stats Pill Block */}
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block"><BilingualText value={bi('Skill Score', 'التقييم الفني')} /></span>
              <strong className="text-lg font-bold text-amber-400 font-mono">
                {overallScore !== null ? `${overallScore}/100` : <BilingualText value={bi('—', '—')} />}
              </strong>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 block"><BilingualText value={bi('Attendance', 'نسبة الحضور')} /></span>
              <strong className="text-lg font-bold text-emerald-400 font-mono">{attendanceStats.rate}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Athletic Data */}
        <div className="athlete-glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Activity size={16} className="text-amber-400" />
            <BilingualText value={bi('Athletic Details & Development Track', 'بيانات المسار والنشاط الرياضي')} />
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Sport Discipline', 'التخصص الرياضي')} /></span>
              <strong className="text-white">
                <BilingualText value={sport ? sport.name : bi('Athletics', 'رياضي')} />
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Assigned Training Squad', 'المجموعة التدريبية')} /></span>
              <strong className="text-white">
                <BilingualText value={group ? group.name : bi('Squad', 'الفريق')} />
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Current Skill Level', 'المستوى المعتمد')} /></span>
              <strong className="text-amber-400">
                {player.level ? <BilingualText value={player.level} /> : '—'}
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Supervising Coach', 'المدرب المشرف')} /></span>
              <strong className="text-white">
                {coach?.nameEn || <BilingualText value={bi('Not assigned', 'غير معين')} />}
              </strong>
            </div>
          </div>
        </div>

        {/* Guardian & Emergency Info */}
        <div className="athlete-glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Phone size={16} className="text-amber-400" />
            <BilingualText value={bi('Guardian & Emergency Contact', 'بيانات ولي الأمر والطوارئ')} />
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Primary Guardian', 'ولي الأمر المسجل')} /></span>
              <strong className="text-white">
                {parent?.nameEn || <BilingualText value={bi('—', '—')} />}
              </strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400"><BilingualText value={bi('Contact Phone', 'هاتف التواصل')} /></span>
              <strong className="text-amber-300 font-mono">
                {(parent?.phone && parent.phone !== '-') || false ? (
                  parent?.phone
                ) : (
                  <BilingualText value={bi('Not recorded', 'غير مسجل')} />
                )}
              </strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400"><BilingualText value={bi('Registered Email', 'البريد الإلكتروني')} /></span>
              <strong className="text-slate-200 font-mono">
                {(parent?.email && parent.email !== '-') || false ? (
                  parent?.email
                ) : (
                  <BilingualText value={bi('Not recorded', 'غير مسجل')} />
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/player/subscription"
          className="athlete-glass-card athlete-glass-card-interactive p-4 text-center space-y-2"
        >
          <CreditCard size={20} className="mx-auto text-amber-400" />
          <span className="text-xs font-bold text-white block">
            <BilingualText value={bi('Digital ID Card', 'البطاقة الرقمية')} />
          </span>
        </Link>
        <Link
          to="/player/documents"
          className="athlete-glass-card athlete-glass-card-interactive p-4 text-center space-y-2"
        >
          <FileText size={20} className="mx-auto text-sky-400" />
          <span className="text-xs font-bold text-white block">
            <BilingualText value={bi('Document Vault', 'خزنة الوثائق')} />
          </span>
        </Link>
        <Link
          to="/player/performance"
          className="athlete-glass-card athlete-glass-card-interactive p-4 text-center space-y-2"
        >
          <Activity size={20} className="mx-auto text-emerald-400" />
          <span className="text-xs font-bold text-white block">
            <BilingualText value={bi('Performance Lab', 'مختبر الأداء')} />
          </span>
        </Link>
        <Link
          to="/player/attendance"
          className="athlete-glass-card athlete-glass-card-interactive p-4 text-center space-y-2"
        >
          <Clock size={20} className="mx-auto text-amber-300" />
          <span className="text-xs font-bold text-white block">
            <BilingualText value={bi('Attendance Journey', 'سجل الحضور')} />
          </span>
        </Link>
      </div>
    </div>
  );
}
