import React, { useState } from 'react';
import { Program, BranchLocation, MatchFixture } from '../../types';
import { BilingualText } from '../common/BilingualText';
import {
  Trophy,
  Shield,
  Star,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Flame,
  Clock,
  Award,
  Check,
  Zap,
} from 'lucide-react';

interface PublicShowcaseViewProps {
  programs: Program[];
  branches: BranchLocation[];
  matches: MatchFixture[];
  onOpenEnrollment: (program?: Program) => void;
}

export const PublicShowcaseView: React.FC<PublicShowcaseViewProps> = ({
  programs,
  branches,
  matches,
  onOpenEnrollment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0]?.id || '');
  const [registrationModalOpen, setRegistrationModalOpen] = useState<boolean>(false);
  const [selectedProgForModal, setSelectedProgForModal] = useState<Program | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

  // Registration Form State
  const [formData, setFormData] = useState({
    athleteName: '',
    dob: '',
    parentName: '',
    phone: '',
    branch: branches[0]?.name.en || '',
    sport: 'Football',
    notes: '',
  });

  const filteredPrograms =
    selectedCategory === 'all'
      ? programs
      : programs.filter((p) => p.sport === selectedCategory);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const handleEnrollClick = (prog?: Program) => {
    if (prog) setSelectedProgForModal(prog);
    setRegistrationModalOpen(true);
    setRegistrationSuccess(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationSuccess(true);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section with Cinematic Golden Crest Atmosphere */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#14141d] via-[#0d0d12] to-[#08080a] border border-amber-500/30 p-8 md:p-14 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Olympic Golden Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>OFFICIAL OLYMPIC ACCREDITED SPORTS ECOSYSTEM</span>
            <span className="text-zinc-500">•</span>
            <span className="font-arabic">منظومة رياضية معتمدة لإعداد الأبطال</span>
          </div>

          {/* Master Headings */}
          <h1 className="text-4xl md:text-6xl font-black font-brand tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 uppercase drop-shadow-md">
            UNITED OLYMPICS SPORTS
          </h1>
          <h2 className="text-2xl md:text-4xl font-extrabold font-arabic text-amber-300 tracking-wide" dir="rtl">
            يونايتد أوليمبيكس سبورت • مصنع الأبطال الأولمبيين
          </h2>

          <p className="text-zinc-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            State-of-the-art sports facilities across premier Olympic campuses in UAE and Egypt. Delivering European coaching standards, GPS sports science, and pathways to national teams and international showcases.
          </p>

          <p className="font-arabic text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed" dir="rtl">
            منظومة رياضية متكاملة عبر مجمعات أولمبية رائدة في دولة الإمارات ومصر. تدريب علمي احترافي بأحدث التقنيات وقياسات الأداء مع مسارات معتمدة للانضمام للمنتخبات الوطنية والمعايشات الدولية.
          </p>

          {/* CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              id="hero-enroll-now-btn"
              onClick={() => handleEnrollClick()}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-extrabold text-sm md:text-base tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.7)] hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              <Trophy className="w-5 h-5 fill-black" />
              <span>BOOK FREE ASSESSMENT • حجز اختبار أداء مجاني</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/971503281920?text=Hello%20United%20Olympics%20Sports%20Hotline"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-xl bg-zinc-900/90 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 font-semibold text-sm transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Hotline • واتساب الإدارة</span>
            </a>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-amber-500/20 text-left">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">850+</div>
              <div className="text-xs font-semibold text-zinc-200">Active Athletes</div>
              <div className="text-[11px] font-arabic text-zinc-400">لاعب وبطل نشط</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">4</div>
              <div className="text-xs font-semibold text-zinc-200">Olympic Campuses</div>
              <div className="text-[11px] font-arabic text-zinc-400">فروع ومجمعات أولمبية</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">48</div>
              <div className="text-xs font-semibold text-zinc-200">Certified UEFA Coaches</div>
              <div className="text-[11px] font-arabic text-zinc-400">مدرب معتمد دولياً</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-2xl md:text-3xl font-black text-amber-300 font-mono">18</div>
              <div className="text-xs font-semibold text-zinc-200">European Pro Trials</div>
              <div className="text-[11px] font-arabic text-zinc-400">معايشات احترافية بأوروبا</div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Showcase */}
      <section id="programs-section" className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4" />
              <span>OLYMPIC SPORT DISCIPLINES • الرياضات والبرامج</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Elite Athletic Development Pathways</h3>
            <p className="font-arabic text-amber-300/80 text-sm mt-0.5">مسارات التدريب التخصصي وإعداد الناشئين</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
            {[
              { id: 'all', en: 'All Sports', ar: 'الكل' },
              { id: 'football', en: 'Football', ar: 'كرة القدم' },
              { id: 'swimming', en: 'Swimming', ar: 'السباحة' },
              { id: 'martial_arts', en: 'Taekwondo', ar: 'التايكوندو' },
              { id: 'basketball', en: 'Basketball', ar: 'السلة' },
              { id: 'gymnastics', en: 'Gymnastics', ar: 'الجمباز' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <span>{cat.en}</span> / <span className="font-arabic text-[11px]">{cat.ar}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Program Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => (
            <div
              key={prog.id}
              className="group rounded-2xl bg-[#121218] border border-amber-500/20 hover:border-amber-400/60 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
            >
              <div>
                {/* Program Header Image & Badge */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={prog.image}
                    alt={prog.title.en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-transparent to-black/40" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-semibold">
                    {prog.ageGroup}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-black text-xs font-bold">
                    ★ {prog.rating.toFixed(1)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-amber-100 group-hover:text-amber-300 transition">
                      {prog.title.en}
                    </h4>
                    <h5 className="font-arabic text-sm text-amber-400 font-semibold" dir="rtl">
                      {prog.title.ar}
                    </h5>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{prog.description.en}</p>
                  <p className="font-arabic text-[11px] text-zinc-500 line-clamp-2" dir="rtl">
                    {prog.description.ar}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    {prog.features.slice(0, 2).map((f, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="leading-tight">
                          <span>{f.en}</span> • <span className="font-arabic text-zinc-400">{f.ar}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 pt-0 border-t border-zinc-800/80 mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-zinc-400 font-mono">Monthly Tuition / الرسوم</div>
                  <div className="text-lg font-black text-amber-300 font-mono">
                    {prog.pricePerMonth} <span className="text-xs font-normal text-zinc-400">{prog.currency.en}</span>
                  </div>
                </div>

                <button
                  id={`enroll-btn-${prog.id}`}
                  onClick={() => handleEnrollClick(prog)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
                >
                  Enroll • انضمام
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campuses & World-Class Facilities */}
      <section className="rounded-3xl bg-[#101016] border border-amber-500/20 p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4" />
              <span>REGIONAL HUBS • المجمعات الأولمبية</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white">Premier Campuses in UAE & Egypt</h3>
            <p className="font-arabic text-amber-300/80 text-sm">مرافق ومجمعات عالمية تلبي متطلبات الاتحادات الدولية</p>
          </div>

          {/* Campus Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBranchId(b.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeBranch.id === b.id
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {b.name.en.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Campus Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/80 border border-amber-500/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="text-xl font-bold text-amber-200">{activeBranch.name.en}</h4>
                <h5 className="font-arabic text-base text-amber-400">{activeBranch.name.ar}</h5>
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                Capacity: <span className="text-amber-300 font-bold">{activeBranch.activeAthletes}</span> / {activeBranch.capacity} Athletes
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                World-Class Pitch & Facility Equipment:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeBranch.facilities.map((fac, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1">
                    <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>{fac.en}</span>
                    </div>
                    <div className="font-arabic text-[11px] text-amber-300/80" dir="rtl">
                      {fac.ar}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeBranch.address.en}</span>
              </div>
              <span className="font-mono text-amber-300">{activeBranch.contact}</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-amber-100">Schedule a Campus Tour</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Parents and athletes are invited to visit our training pitches, recovery suites, and meet head coaches for direct consultations.
              </p>
              <p className="font-arabic text-xs text-amber-300/90" dir="rtl">
                ندعو أولياء الأمور واللاعبين لزيارة ملاعبنا ومقابلة المدربين وإجراء التقييم المبدئي.
              </p>
            </div>

            <button
              onClick={() => handleEnrollClick()}
              className="w-full mt-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition cursor-pointer"
            >
              Book Campus Visit • حجز جولة ميدانية
            </button>
          </div>
        </div>
      </section>

      {/* Live Match Day & Tournament Schedule */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>COMPETITION SCHEDULE • جدول المباريات والبطولات</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white">Live Match Days & Official League Fixtures</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl bg-[#121218] border border-amber-500/25 hover:border-amber-400/50 transition space-y-4"
            >
              <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
                <span className="font-bold text-amber-300 truncate max-w-[220px]">{m.tournament.en}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    m.status === 'upcoming'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {m.status}
                </span>
              </div>

              <div className="grid grid-cols-3 items-center text-center py-2">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-zinc-100">{m.homeTeam.en}</div>
                  <div className="font-arabic text-[11px] text-zinc-400">{m.homeTeam.ar}</div>
                </div>

                <div className="flex flex-col items-center">
                  {m.score ? (
                    <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                      {m.score.home} - {m.score.away}
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-amber-300 text-xs font-mono font-bold">
                      VS
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-500 mt-1">{m.time}</span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-zinc-100">{m.awayTeam.en}</div>
                  <div className="font-arabic text-[11px] text-zinc-400">{m.awayTeam.ar}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{m.venue.en}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{m.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration & Assessment Modal */}
      {registrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-[#121218] border border-amber-500/40 p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setRegistrationModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            {!registrationSuccess ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Official Athlete Registration • استمارة التسجيل الرسمية
                  </div>
                  <h3 className="text-xl font-bold text-white">Book Free Evaluation Trial Session</h3>
                  <p className="text-xs text-zinc-400">
                    {selectedProgForModal
                      ? `Selected Discipline: ${selectedProgForModal.title.en}`
                      : 'Comprehensive multi-sport biomechanics assessment'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Athlete Full Name / اسم اللاعب</label>
                    <input
                      type="text"
                      required
                      value={formData.athleteName}
                      onChange={(e) => setFormData({ ...formData, athleteName: e.target.value })}
                      placeholder="e.g. Omar Hassan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Date of Birth / تاريخ الميلاد</label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Parent Name / اسم ولي الأمر</label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="e.g. Dr. Mona Hassan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">WhatsApp Phone / رقم الهاتف</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 100 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Preferred Campus / الفرع</label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.name.en}>
                          {b.name.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Sport / الرياضة</label>
                    <select
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                    >
                      <option value="Football">Football • كرة القدم</option>
                      <option value="Swimming">Olympic Swimming • السباحة الأولمبية</option>
                      <option value="Taekwondo">Taekwondo • التايكوندو</option>
                      <option value="Basketball">Basketball • كرة السلة</option>
                      <option value="Gymnastics">Gymnastics • الجمباز</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm tracking-wide shadow-lg cursor-pointer transition"
                >
                  CONFIRM BOOKING & GENERATE TRIAL PASS • تأكيد الحجز وإصدار بطاقة الاختبار
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Trial Assessment Confirmed!</h3>
                <h4 className="font-arabic text-lg text-amber-300">تم تسجيل حجز الاختبار الميداني بنجاح</h4>
                <p className="text-xs text-zinc-300 max-w-md mx-auto">
                  An academy coordinator has scheduled your evaluation session at <span className="text-amber-300 font-bold">{formData.branch}</span>. Check your WhatsApp for full trial instructions and access pass.
                </p>
                <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 text-xs font-mono text-amber-200">
                  ASSESSMENT-PASS-ID: UOS-TRIAL-2026-{(Math.random() * 9000 + 1000).toFixed(0)}
                </div>
                <button
                  onClick={() => setRegistrationModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs cursor-pointer"
                >
                  Done • إتمام
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
