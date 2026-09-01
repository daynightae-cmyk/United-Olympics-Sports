import React, { useState } from 'react';
import { PlayerRecord, TrainingSession, DrillItem } from '../../types';
import {
  User,
  Shield,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Plus,
  Save,
  Sparkles,
  ChevronRight,
  Award,
} from 'lucide-react';

interface CoachPortalViewProps {
  squad: PlayerRecord[];
  sessions: TrainingSession[];
  drills: DrillItem[];
}

export const CoachPortalView: React.FC<CoachPortalViewProps> = ({
  squad,
  sessions,
  drills,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'tactics' | 'evaluation'>('roster');
  const [formation, setFormation] = useState<string>('4-3-3');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'excused' | 'injured'>>({
    'athlete-101': 'present',
    'athlete-102': 'present',
    'athlete-103': 'present',
    'athlete-104': 'injured',
    'athlete-105': 'present',
  });
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [selectedPlayerForEval, setSelectedPlayerForEval] = useState<PlayerRecord>(squad[0]);
  const [evalNotes, setEvalNotes] = useState<string>('Showed outstanding tactical discipline during 4v2 pressing drill today.');

  const setPlayerAttendance = (id: string, status: 'present' | 'absent' | 'excused' | 'injured') => {
    setAttendanceMap((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Coach Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-black text-amber-200">Coach Tactical Command HQ</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              COACH TAREK EL-KHATIB (UEFA A)
            </span>
          </div>
          <div className="font-arabic text-sm text-amber-400 font-semibold" dir="rtl">
            منظومة المدرب المعتمد • إدارة التشكيل وجلسات التدريب والتقييم الفني
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
          {[
            { id: 'roster', en: 'Squad Roster', ar: 'قائمة الفريق' },
            { id: 'attendance', en: 'Live Attendance', ar: 'تسجيل الحضور' },
            { id: 'tactics', en: 'Tactical Board', ar: 'اللوحة التكتيكية' },
            { id: 'evaluation', en: 'Player Evaluation', ar: 'التقييم الفردي' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.en}</span> / <span className="font-arabic text-[11px]">{tab.ar}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Squad Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">U15 Elite Squad Roster ({squad.length} Athletes)</h3>
              <p className="font-arabic text-xs text-amber-400">قائمة الفريق الأساسي وتحليل الجاهزية</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">4 FIT • 1 REHAB</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {squad.map((athlete) => (
              <div
                key={athlete.id}
                className="p-5 rounded-2xl bg-[#121218] border border-amber-500/25 hover:border-amber-400/50 transition space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={athlete.photo}
                      alt={athlete.name.en}
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-400 shadow"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-bold">
                      #{athlete.jerseyNumber}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{athlete.name.en}</h4>
                    <h5 className="font-arabic text-xs text-amber-400">{athlete.name.ar}</h5>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{athlete.position.en}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-zinc-800 text-xs">
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">OVR</div>
                    <div className="font-black text-amber-300 font-mono">{athlete.stats.overallRating}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Goals</div>
                    <div className="font-black text-zinc-200 font-mono">{athlete.stats.goals}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Attendance</div>
                    <div className="font-black text-emerald-400 font-mono">{athlete.stats.attendanceRate}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      athlete.fitnessStatus === 'fit'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {athlete.fitnessStatus}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedPlayerForEval(athlete);
                      setActiveTab('evaluation');
                    }}
                    className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Evaluate</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Live Attendance Taker */}
      {activeTab === 'attendance' && (
        <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Pitch-Side Attendance Taker</h3>
              <p className="font-arabic text-xs text-amber-400">
                تسجيل حضور تدريب اليوم (الملعب الرئيسي 1)
              </p>
            </div>

            <button
              onClick={handleSaveAttendance}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{savedFeedback ? 'Saved to Cloud! • تم الحفظ' : 'Submit Attendance • حفظ الحضور'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {squad.map((athlete) => {
              const status = attendanceMap[athlete.id] || 'present';
              return (
                <div
                  key={athlete.id}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={athlete.photo}
                      alt={athlete.name.en}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-400/60"
                    />
                    <div>
                      <div className="font-bold text-sm text-zinc-100">{athlete.name.en}</div>
                      <div className="text-xs text-zinc-400">#{athlete.jerseyNumber} • {athlete.position.en}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['present', 'absent', 'excused', 'injured'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlayerAttendance(athlete.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                          status === s
                            ? s === 'present'
                              ? 'bg-emerald-500 text-black font-bold'
                              : s === 'absent'
                              ? 'bg-red-500 text-white font-bold'
                              : s === 'injured'
                              ? 'bg-purple-500 text-white font-bold'
                              : 'bg-amber-500 text-black font-bold'
                            : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Tactical Pitch Board */}
      {activeTab === 'tactics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tactical Pitch Visualizer */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0e1610] border-2 border-emerald-600/40 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-mono">
              <span>FIFA 4G PITCH TACTICAL BOARD</span>
              <div className="flex items-center gap-2">
                <span>FORMATION:</span>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="bg-black/80 border border-emerald-500/40 rounded px-2 py-1 text-emerald-300 text-xs focus:outline-none"
                >
                  <option value="4-3-3">4-3-3 Attack Flow</option>
                  <option value="4-2-3-1">4-2-3-1 Pressing Block</option>
                  <option value="3-5-2">3-5-2 Wing-Back Overload</option>
                </select>
              </div>
            </div>

            {/* Pitch Markings & Players Placement */}
            <div className="relative w-full h-[400px] rounded-xl bg-gradient-to-b from-[#11381c] via-[#0d2e16] to-[#11381c] border border-white/20 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Pitch center circle & line */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/30 pointer-events-none" />

              {/* Attackers */}
              <div className="flex justify-around z-10">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white cursor-grab">
                    #7
                  </div>
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">LW</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white cursor-grab">
                    #9
                  </div>
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">Youssef (ST)</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white cursor-grab">
                    #11
                  </div>
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">RW</span>
                </div>
              </div>

              {/* Midfield */}
              <div className="flex justify-around z-10">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white cursor-grab">
                    #8
                  </div>
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">CM</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-300 text-black font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(212,175,55,0.8)] border-2 border-white cursor-grab animate-pulse">
                    #10
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-black/80 px-2 rounded mt-1">Karim (CAM)</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white cursor-grab">
                    #6
                  </div>
                  <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">CDM</span>
                </div>
              </div>

              {/* Defense & Goalkeeper */}
              <div className="space-y-4 z-10">
                <div className="flex justify-around">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      #3
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-1 rounded mt-1">LB</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      #4
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-1 rounded mt-1">Omar (CB)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      #5
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-1 rounded mt-1">CB</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      #2
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-1 rounded mt-1">RB</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-cyan-400 text-black font-black flex items-center justify-center text-xs shadow-lg border-2 border-white">
                      #1
                    </div>
                    <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 rounded mt-1">GK</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Instructions */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <h4 className="text-base font-bold text-white">Match Tactical Directives</h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300">1. Defensive Transition:</div>
                <p className="text-zinc-400">High press initiated by #9 Youssef and #10 Karim immediately after losing possession.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-bold text-amber-300">2. Attacking Width:</div>
                <p className="text-zinc-400">Wingbacks advance to touchline to stretch opponents' 4-4-2 compact shape.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Player Evaluation Tool */}
      {activeTab === 'evaluation' && (
        <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Individual Development Evaluation</h3>
              <p className="font-arabic text-xs text-amber-400">
                Evaluating: <span className="text-amber-200 font-bold">{selectedPlayerForEval.name.en}</span> (#{selectedPlayerForEval.jerseyNumber})
              </p>
            </div>
            <select
              value={selectedPlayerForEval.id}
              onChange={(e) => {
                const found = squad.find((p) => p.id === e.target.value);
                if (found) setSelectedPlayerForEval(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-amber-200"
            >
              {squad.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.en} (#{p.jerseyNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Coach Development Note / ملاحظات المدرب
              </label>
              <textarea
                rows={4}
                value={evalNotes}
                onChange={(e) => setEvalNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-300">Assign Homework Drill</div>
                <p className="text-xs text-zinc-400">
                  Select a training drill from the master curriculum to sync directly to the player's passport.
                </p>
              </div>

              <button className="w-full mt-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer">
                Sync Evaluation & Homework • إرسال التقييم للاعب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
