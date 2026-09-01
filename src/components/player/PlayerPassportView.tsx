import React, { useState } from 'react';
import { PlayerRecord, DrillItem, TrainingSession } from '../../types';
import {
  Award,
  Zap,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Flame,
  QrCode,
  Shield,
  Star,
  Activity,
  ChevronRight,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface PlayerPassportViewProps {
  player: PlayerRecord;
  drills: DrillItem[];
  upcomingSessions: TrainingSession[];
  onCompleteDrill?: (drillId: string) => void;
}

export const PlayerPassportView: React.FC<PlayerPassportViewProps> = ({
  player,
  drills,
  upcomingSessions,
}) => {
  const [completedDrills, setCompletedDrills] = useState<string[]>(['drill-1']);
  const [activeTab, setActiveTab] = useState<'passport' | 'stats' | 'drills' | 'nutrition'>('passport');
  const [nutritionChecked, setNutritionChecked] = useState<Record<string, boolean>>({
    breakfast: true,
    hydration: true,
    protein: false,
    sleep: true,
  });

  const toggleDrill = (id: string) => {
    if (completedDrills.includes(id)) {
      setCompletedDrills(completedDrills.filter((d) => d !== id));
    } else {
      setCompletedDrills([...completedDrills, id]);
    }
  };

  const toggleNutrition = (key: string) => {
    setNutritionChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stats = player.stats;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Sub-Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-amber-500/30">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={player.photo}
              alt={player.name.en}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
              #{player.jerseyNumber}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-amber-200">{player.name.en}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                RANK #{player.rank}
              </span>
            </div>
            <div className="font-arabic text-sm text-amber-400 font-semibold">{player.name.ar}</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {player.squad} • <span className="text-zinc-300">{player.branch.en}</span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
          {[
            { id: 'passport', en: 'Digital Passport', ar: 'جواز اللاعب' },
            { id: 'stats', en: 'Radar & Analytics', ar: 'مصفوفة المهارات' },
            { id: 'drills', en: 'Training Drills', ar: 'تمارين الفيديو' },
            { id: 'nutrition', en: 'Diet & Recovery', ar: 'التغذية والاستشفاء' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'passport' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Holographic Digital Passport Card */}
          <div className="lg:col-span-1">
            <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#1c1c28] via-[#121218] to-[#0a0a0f] border-2 border-amber-400/70 shadow-[0_0_35px_rgba(212,175,55,0.35)] overflow-hidden space-y-6">
              {/* Shimmer accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 blur-2xl rounded-full" />

              {/* Passport Header */}
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                <div className="space-y-0.5">
                  <div className="text-[10px] uppercase tracking-widest text-amber-300 font-mono">
                    OFFICIAL ATHLETE PASSPORT
                  </div>
                  <div className="font-arabic text-[11px] text-amber-400">بطاقة الهوية الرياضية الرسمية</div>
                </div>
                <Shield className="w-6 h-6 text-amber-400" />
              </div>

              {/* Center Athlete Photo & Overall Rating Circle */}
              <div className="flex items-center justify-between gap-4">
                <img
                  src={player.photo}
                  alt={player.name.en}
                  className="w-24 h-28 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
                />

                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 w-28 text-center">
                  <div className="text-[10px] uppercase font-mono text-zinc-400">OVR RATING</div>
                  <div className="text-3xl font-black font-mono text-amber-300 drop-shadow">
                    {stats.overallRating}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400">ELITE CLASS</div>
                </div>
              </div>

              {/* Passport Field Data */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Position / المركز:</span>
                  <span className="font-semibold text-amber-200">{player.position.en}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Jersey Number / الرقم:</span>
                  <span className="font-mono font-bold text-amber-300">#{player.jerseyNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Fitness Status / الحالة:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    MATCH FIT • جاهز
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800">
                  <span className="text-zinc-400">Head Coach / المدرب:</span>
                  <span className="text-zinc-200">{player.coach.en}</span>
                </div>
              </div>

              {/* QR Verification Code */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-mono text-amber-300">QR PITCH ACCESS PASS</div>
                  <div className="font-mono text-xs text-zinc-300">{player.qrCode}</div>
                  <div className="text-[10px] font-arabic text-zinc-500">مسح الباركود عند بوابة الدخول</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                  <QrCode className="w-full h-full text-black" />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Overview & Upcoming Match Days */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#121218] border border-amber-500/20">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Season Goals</div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">{stats.goals}</div>
                <div className="text-[10px] font-arabic text-zinc-500">أهداف الموسم</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#121218] border border-amber-500/20">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Key Assists</div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">{stats.assists}</div>
                <div className="text-[10px] font-arabic text-zinc-500">تمريرات حاسمة</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#121218] border border-amber-500/20">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">MVP Matches</div>
                <div className="text-2xl font-black font-mono text-amber-300 mt-1">{stats.mvpCount}</div>
                <div className="text-[10px] font-arabic text-zinc-500">رجل المباراة</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#121218] border border-amber-500/20">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Attendance</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{stats.attendanceRate}%</div>
                <div className="text-[10px] font-arabic text-zinc-500">نسبة الحضور</div>
              </div>
            </div>

            {/* Upcoming Training Sessions Card */}
            <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Upcoming Training Schedule • جدول الحصص التدريبية</h3>
                </div>
                <span className="text-xs text-amber-400 font-mono">U15 SQUAD</span>
              </div>

              <div className="space-y-3">
                {upcomingSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-amber-200">{s.title.en}</div>
                      <div className="font-arabic text-xs text-amber-400/90">{s.title.ar}</div>
                      <div className="text-xs text-zinc-400">
                        Pitch: {s.pitch.en} • Focus: <span className="text-zinc-300">{s.focus.en}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-bold text-zinc-200">{s.date}</div>
                        <div className="text-xs text-amber-300 font-mono">{s.time}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {s.intensity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats & Skills Matrix View */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detailed Skill Sliders */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Biomechanical & Tactical Attributes</h3>
              <p className="font-arabic text-xs text-amber-400">التقييم الفني والبدني المعتمد من الجهاز التدريبي</p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Passing & Playmaking (التمرير وصناعة اللعب)', value: stats.passing },
                { label: 'Shooting & Finishing (التسديد وإنهاء الهجمات)', value: stats.shooting },
                { label: 'Tactical Vision & Awareness (الرؤية التكتيكية)', value: stats.tactical },
                { label: 'Pace & Acceleration (السرعة والانطلاق)', value: stats.pace },
                { label: 'Dribbling & Ball Mastery (المراوغة والتحكم)', value: stats.dribbling },
                { label: 'Physical Endurance & Stamina (التحمل واللياقة)', value: stats.physical },
                { label: 'Defensive Pressing (الضغط الدفاعي)', value: stats.defending },
              ].map((skill, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-300">{skill.label}</span>
                    <span className="font-mono font-bold text-amber-300">{skill.value}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-500"
                      style={{ width: `${skill.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coach Tactical Notes & Development Plan */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Head Coach Development Notes</h3>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">Coach Tarek El-Khatib (UEFA A)</span>
                <span className="text-zinc-500 text-[10px]">Evaluation Date: 2026-08-25</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                "Karim shows world-class spatial awareness in the final third. His decision making under pressure has improved by 14% this month. Recommendation: Focus on weak-foot volley drills and defensive tracking."
              </p>
              <p className="font-arabic text-xs text-amber-300/80 leading-relaxed" dir="rtl">
                "كريم يتميز برؤية استثنائية للملعب وصناعة الفرص التهديفية. تطور كبير في دقة التمرير الحاسم. يوصى بالتركيز على سرعة الارتداد الدفاعي والتسديد بالقدم الضعيفة."
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 text-xs space-y-2">
              <div className="font-bold text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Next Milestone Target: European Scout Showcase</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Target: Maintain 90+ overall rating to qualify for the December Girona FC & Sporting CP scouting tour in Cairo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Video Drills Library Tab */}
      {activeTab === 'drills' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Elite Video Training Drills</h3>
              <p className="font-arabic text-xs text-amber-400">مكتبة التدريبات الفردية الموجهة للاعب</p>
            </div>
            <div className="text-xs text-zinc-400 font-mono">
              Completed: <span className="text-amber-300 font-bold">{completedDrills.length}</span> / {drills.length} Drills
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drills.map((drill) => {
              const isDone = completedDrills.includes(drill.id);
              return (
                <div
                  key={drill.id}
                  className={`p-5 rounded-2xl bg-[#121218] border transition ${
                    isDone ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/25'
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono font-bold">
                      {drill.difficulty}
                    </span>
                    <span className="text-zinc-400">{drill.duration}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-zinc-100">{drill.title.en}</h4>
                    <h5 className="font-arabic text-xs text-amber-400">{drill.title.ar}</h5>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{drill.description.en}</p>

                  <div className="space-y-1 pt-2 border-t border-zinc-800">
                    <div className="text-[11px] font-bold text-zinc-300">Key Objectives:</div>
                    {drill.objectives.map((obj, i) => (
                      <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{obj.en}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleDrill(drill.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500 text-black hover:bg-amber-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isDone ? 'Completed • تم الإنجاز' : 'Mark as Completed • تم التدريب'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nutrition & Recovery Tab */}
      {activeTab === 'nutrition' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Daily Olympic Nutrition & Hydration Checklist</h3>
              <p className="font-arabic text-xs text-amber-400">الجدول الغذائي اليومي للحفاظ على اللياقة الأولمبية</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'breakfast', labelEn: 'Pre-Training Complex Carbs & Electrolytes', labelAr: 'وجبة كربوهيدرات معقدة وأملاح معدنية قبل التمرين' },
                { id: 'hydration', labelEn: '3.5L Pure Water Hydration Goal', labelAr: 'شرب 3.5 لتر ماء نقي على مدار اليوم' },
                { id: 'protein', labelEn: 'Post-Training Lean Protein (30g) within 45 mins', labelAr: 'بروتين خالي من الدهون بعد الحصة خلال 45 دقيقة' },
                { id: 'sleep', labelEn: '8.5 Hours Deep Muscle Recovery Sleep', labelAr: 'نوم عميق 8.5 ساعات للاستشفاء العضلي' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleNutrition(item.id)}
                  className={`w-full p-3.5 rounded-xl text-left border flex items-center justify-between transition cursor-pointer ${
                    nutritionChecked[item.id]
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold">{item.labelEn}</div>
                    <div className="font-arabic text-[11px] text-zinc-400">{item.labelAr}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    nutritionChecked[item.id] ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-zinc-700'
                  }`}>
                    {nutritionChecked[item.id] && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <h3 className="text-lg font-bold text-white">Recovery Lab & Cryo Suite Booking</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Athletes can book complementary weekly recovery sessions including cold plunge, pneumatic compression boots, and physiotherapy evaluations.
            </p>
            <p className="font-arabic text-xs text-amber-300/80 leading-relaxed" dir="rtl">
              يمكن للاعبي النخبة حجز جلسات الاستشفاء الأسبوعية وغرف الكرايوثيرابي وجلسات العلاج الطبيعي الوقائي.
            </p>

            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition cursor-pointer">
              Request Physiotherapy Session • طلب جلسة استشفاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
