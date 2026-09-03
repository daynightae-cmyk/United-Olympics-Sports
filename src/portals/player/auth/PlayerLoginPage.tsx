<<<<<<< HEAD
import React, { useState } from "react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Phone,
  Lock,
  ExternalLink,
  Award,
  Flame,
  AlertCircle,
} from "lucide-react";
import { usePlayerSession } from "../PlayerSessionContext";
import { productionAuthGateway, previewAuthGateway } from "./PlayerAuthGateway";
import { BilingualText, bi } from "../../../components/bilingual/BilingualText";
import SafeBrandLogo from '../../../components/ui/SafeBrandLogo';

export function PlayerLoginPage() {
  const { allPlayers, login } = usePlayerSession();
  const navigate = useNavigate();

  const [selectedAthleteId, setSelectedAthleteId] = useState("player-demo-001");
  const [authError, setAuthError] = useState<{ en: string; ar: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProductionGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await productionAuthGateway.signInWithGoogle();
    setLoading(false);
    if (!res.success && res.error) {
      setAuthError({
        en: res.error.messageEn,
        ar: res.error.messageAr,
      });
    } else if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate("/player/home");
    }
  };

  const handleProductionApple = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await productionAuthGateway.signInWithApple();
    setLoading(false);
    if (!res.success && res.error) {
      setAuthError({
        en: res.error.messageEn,
        ar: res.error.messageAr,
      });
    } else if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate("/player/home");
    }
  };

  const handleEnterPreviewMode = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await previewAuthGateway.enterPreviewMode(selectedAthleteId);
    setLoading(false);
    if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate("/player/home");
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-['Outfit','Cairo',sans-serif]">
      {/* Stadium Atmospheric Lighting Effects */}
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[35%] w-[350px] h-[350px] rounded-full bg-amber-400/5 blur-[100px] pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <SafeBrandLogo className="w-11 h-11 object-contain filter drop-shadow-[0_0_16px_rgba(212,175,55,0.4)]" />
          <div>
            <h1 className="font-['Cinzel',serif] text-sm font-bold tracking-wider text-slate-100">
              UNITED OLYMPICS SPORTS
            </h1>
            <span className="text-[11px] font-semibold text-amber-400 block -mt-0.5">
              يونايتد أوليمبيكس سبورت
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:border-amber-400/30 bg-white/5"
        >
          <span>
            <BilingualText value={bi("Main Website", "الموقع الرئيسي")} />
          </span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Athletic Cinematic Branding */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/10 border border-amber-400/30 text-amber-300">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>
                <BilingualText value={bi("Athlete Portal Access", "بوابة الرياضيين")} />
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              <span className="block text-slate-100">
                <BilingualText value={bi("Step Into Your Private", "ادخل إلى مساحتك الرياضية")} />
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-['Cinzel',serif]">
                <BilingualText value={bi("Athlete Arena", "الخاصة والمميزة")} />
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              <BilingualText
                value={bi(
                  "Access your training calendar, skill development radar, coach feedback logs, and digital athlete records at United Olympics Sports.",
                  "تابع جدول تدريباتك المعتمد، ورادار تطوير المهارات، وملاحظات المدربين، وسجلاتك الرياضية في يونايتد أوليمبيكس سبورت."
                )}
              />
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <Flame size={18} className="text-amber-400 mb-2" />
                <h3 className="text-xs font-bold text-slate-200">
                  <BilingualText value={bi("Real Progress", "تقدم حقيقي")} />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  <BilingualText
                    value={bi(
                      "Skill benchmarks & attendance rhythm",
                      "مؤشرات المهارة وإيقاع الحضور"
                    )}
                  />
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <Award size={18} className="text-yellow-400 mb-2" />
                <h3 className="text-xs font-bold text-slate-200">
                  <BilingualText value={bi("Coach Direct", "تواصل المدرب")} />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  <BilingualText
                    value={bi(
                      "Technical feedback & assigned sessions",
                      "الملاحظات الفنية والحصص المخصصة"
                    )}
                  />
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                <ShieldCheck size={18} className="text-emerald-400 mb-2" />
                <h3 className="text-xs font-bold text-slate-200">
                  <BilingualText value={bi("Digital Vault", "الخزنة الرقمية")} />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  <BilingualText
                    value={bi(
                      "Athlete records & training documents",
                      "سجلات الرياضي ووثائق التدريب"
                    )}
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-5">
            <div className="athlete-glass-card p-6 sm:p-8 border border-amber-400/30 shadow-2xl relative">
              <div className="text-center mb-6">
                <span className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
                  <Lock size={22} />
                </span>
                <h3 className="text-xl font-bold text-white">
                  <BilingualText value={bi("Athlete Sign In", "تسجيل دخول اللاعب")} />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  <BilingualText
                    value={bi(
                      "Secure authentication for registered athletes",
                      "تسجيل دخول آمن للرياضيين المسجلين"
                    )}
                  />
                </p>
              </div>

              {/* Informational Error/Status Alert */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <BilingualText value={authError} />
                  </div>
                </div>
              )}

              {/* Production Social Login Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleProductionGoogle}
                  disabled={loading || !productionAuthGateway.isProductionConfigured()}
                  aria-disabled={!productionAuthGateway.isProductionConfigured()}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all shadow-md active:scale-[0.99]"
                >
                  {productionAuthGateway.isProductionConfigured() ? (
                    <img src="/brand/google-logo.svg" alt="Google" className="w-4 h-4" />
                  ) : (
                    <span className="w-4 h-4 text-[11px] text-slate-500">G</span>
                  )}
                  <span>
                    <BilingualText
                      value={
                        productionAuthGateway.isProductionConfigured()
                          ? bi("Continue with Google", "المتابعة باستخدام Google")
                          : bi("Google sign-in unavailable", "تسجيل دخول Google غير متاح")
                      }
                    />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleProductionApple}
                  disabled={loading || !productionAuthGateway.isProductionConfigured()}
                  aria-disabled={!productionAuthGateway.isProductionConfigured()}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-black text-white font-semibold text-xs hover:bg-slate-900 border border-white/20 transition-all shadow-md active:scale-[0.99]"
                >
                  {productionAuthGateway.isProductionConfigured() ? (
                    <img src="/brand/apple-logo.svg" alt="Apple" className="w-4 h-4 text-white" />
                  ) : (
                    <span className="w-4 h-4 text-[11px] text-slate-500"></span>
                  )}
                  <span>
                    <BilingualText
                      value={
                        productionAuthGateway.isProductionConfigured()
                          ? bi("Continue with Apple", "المتابعة باستخدام Apple")
                          : bi("Apple sign-in unavailable", "تسجيل دخول Apple غير متاح")
                      }
                    />
                  </span>
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                    <BilingualText value={bi("Or mobile phone", "أو عبر الهاتف")} />
                  </span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Phone Auth Option */}
                <Link
                  to="/player/auth/phone"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold text-xs border border-amber-400/30 transition-all active:scale-[0.99]"
                >
                  <Phone size={15} />
                  <span>
                    <BilingualText
                      value={bi(
                        "Sign in with Mobile Number (OTP)",
                        "الدخول برقم الهاتف (رمز التحقق)"
                      )}
                    />
                  </span>
                </Link>
              </div>

              {/* Explicit Preview Athlete Mode */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    <BilingualText value={bi("Enter Preview Athlete Mode", "الدخول إلى وضع المعاينة")} />
                  </span>
                  <span className="text-[10px] text-amber-400 uppercase font-semibold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                    Preview
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] text-slate-400">
                    <BilingualText value={bi("Select demo athlete identity:", "اختر هوية الرياضي التجريبية:")} />
                  </label>
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {allPlayers.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                        {p.nameEn} ({p.sportId.toUpperCase()}) — {p.nameAr}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleEnterPreviewMode}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-1"
                  >
                    <span>
                      <BilingualText value={bi("Enter Preview Athlete Mode", "الدخول إلى وضع المعاينة")} />
                    </span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        <p>
          © {new Date().getFullYear()} United Olympics Sports · يونايتد أوليمبيكس سبورت. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
          reserved.
