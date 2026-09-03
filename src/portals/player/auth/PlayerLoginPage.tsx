import { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, ExternalLink, Lock, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../PlayerSessionContext';
import { previewAuthGateway, productionAuthGateway } from './PlayerAuthGateway';

export function PlayerLoginPage() {
  const { allPlayers, login } = usePlayerSession();
  const navigate = useNavigate();
  const firstPreviewId = useMemo(() => allPlayers.at(0)?.id ?? '', [allPlayers]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(firstPreviewId);
  const [authError, setAuthError] = useState<{ en: string; ar: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const productionConfigured = productionAuthGateway.isProductionConfigured();

  const handleEnterPreviewMode = async () => {
    if (!selectedAthleteId) return;
    setLoading(true);
    setAuthError(null);
    const result = await previewAuthGateway.enterPreviewMode(selectedAthleteId);
    setLoading(false);
    if (!result.success || !result.data?.playerId) {
      setAuthError(bi('Preview athlete session could not be created.', 'تعذر إنشاء جلسة معاينة للاعب.'));
      return;
    }
    login(result.data.playerId);
    navigate('/player/home');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col relative overflow-x-hidden font-['Outfit','Cairo',sans-serif]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-18%] left-[18%] w-[560px] h-[560px] rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute bottom-[-24%] right-[6%] w-[520px] h-[520px] rounded-full bg-blue-600/8 blur-[150px]" />
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 min-w-0 group">
          <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" className="w-10 h-10 object-contain filter drop-shadow-[0_0_16px_rgba(212,175,55,0.35)]" />
          <div className="min-w-0">
            <strong className="block truncate text-xs sm:text-sm tracking-wide text-slate-100">United Olympics Sports</strong>
            <span lang="ar" dir="rtl" className="block text-[10px] sm:text-[11px] font-semibold text-amber-400">يونايتد أوليمبيكس سبورت</span>
          </div>
        </Link>
        <Link to="/" className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/[0.03]">
          <BilingualText value={bi('Main website', 'الموقع الرئيسي')} /><ExternalLink size={12} />
        </Link>
      </header>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 py-4 lg:py-6 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
          <section className="lg:col-span-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-400/10 border border-amber-400/25 text-amber-300">
              <ShieldCheck size={14} /><BilingualText value={bi('Athlete portal access', 'دخول بوابة اللاعب')} />
            </div>
            <h1 className="mt-5 mb-4 text-3xl sm:text-5xl lg:text-[3.45rem] font-extrabold tracking-[-.04em] text-white leading-[1.02]">
              <span className="block"><BilingualText value={bi('Your training workspace,', 'مساحتك التدريبية،')} /></span>
              <span className="block mt-2 text-amber-300"><BilingualText value={bi('without invented access.', 'بدون وصول أو بيانات مختلقة.')} /></span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-7">
              <BilingualText value={bi('Production authentication is shown only when its real provider gateway is configured. Preview Athlete Mode remains clearly isolated for product evaluation.', 'يظهر تسجيل الدخول للإنتاج فقط عند تهيئة بوابة المصادقة الحقيقية. ويظل وضع معاينة اللاعب منفصلًا بوضوح لتقييم المنتج.')} />
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                bi('Assigned schedule', 'الجدول المخصص'),
                bi('Recorded performance', 'الأداء المسجل'),
                bi('Coach-linked feedback', 'ملاحظات المدرب المرتبطة'),
              ].map((label) => <div key={label.en} className="rounded-2xl border border-white/9 bg-white/[.025] px-4 py-3 text-xs text-slate-300"><BilingualText value={label} /></div>)}
            </div>
          </section>

          <section className="lg:col-span-5 athlete-glass-card p-5 sm:p-7 border border-amber-400/25 shadow-2xl" aria-labelledby="player-login-title">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/25 grid place-items-center text-amber-400"><Lock size={18} /></span>
              <div><h2 id="player-login-title" className="text-lg font-bold text-white"><BilingualText value={bi('Athlete Sign In', 'تسجيل دخول اللاعب')} /></h2><p className="text-[11px] text-slate-400 mt-1"><BilingualText value={bi('Production and preview access are kept separate.', 'يتم الفصل بين دخول الإنتاج ودخول المعاينة.')} /></p></div>
            </div>

            {!productionConfigured && (
              <div className="mb-5 p-3.5 rounded-xl bg-cyan-400/[.06] border border-cyan-300/20 text-xs text-slate-300 flex items-start gap-2.5" role="status">
                <AlertCircle size={16} className="text-cyan-300 flex-shrink-0 mt-0.5" />
                <BilingualText value={bi('Production authentication is not configured in this environment. Google, Apple and SMS OTP are unavailable.', 'مصادقة الإنتاج غير مهيأة في هذه البيئة. تسجيل Google وApple ورمز التحقق عبر الرسائل غير متاح.')}/>
              </div>
            )}

            {authError && <div className="mb-4 p-3 rounded-xl bg-red-400/[.07] border border-red-300/20 text-red-200 text-xs" role="alert"><BilingualText value={authError} /></div>}

            <div className="space-y-2.5" aria-label="Production authentication | مصادقة الإنتاج">
              <button type="button" disabled={!productionConfigured || loading} className="w-full min-h-11 px-4 rounded-xl border border-white/10 bg-white/[.035] text-xs font-semibold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                <BilingualText value={productionConfigured ? bi('Continue with Google', 'المتابعة باستخدام Google') : bi('Google · Not configured', 'Google · غير مهيأ')} />
              </button>
              <button type="button" disabled={!productionConfigured || loading} className="w-full min-h-11 px-4 rounded-xl border border-white/10 bg-white/[.035] text-xs font-semibold text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                <BilingualText value={productionConfigured ? bi('Continue with Apple', 'المتابعة باستخدام Apple') : bi('Apple · Not configured', 'Apple · غير مهيأ')} />
              </button>
              {productionConfigured ? (
                <Link to="/player/auth/phone" className="w-full min-h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-amber-400/10 text-amber-300 font-semibold text-xs border border-amber-400/25"><Phone size={14} /><BilingualText value={bi('Sign in with mobile number', 'الدخول برقم الهاتف')} /></Link>
              ) : (
                <button type="button" disabled className="w-full min-h-11 flex items-center justify-center gap-2 px-4 rounded-xl border border-white/10 bg-white/[.025] text-xs font-semibold text-slate-500 cursor-not-allowed"><Phone size={14} /><BilingualText value={bi('SMS OTP · Not configured', 'رمز SMS · غير مهيأ')} /></button>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-center justify-between gap-3 mb-3"><strong className="text-xs text-slate-200 flex items-center gap-1.5"><Sparkles size={14} className="text-amber-400" /><BilingualText value={bi('Preview Athlete Mode', 'وضع معاينة اللاعب')} /></strong><span className="text-[9px] uppercase tracking-widest text-amber-300 px-2 py-1 rounded-full border border-amber-400/20 bg-amber-400/8">Preview</span></div>
              <label className="block text-[11px] text-slate-400" htmlFor="preview-athlete"><BilingualText value={bi('Preview athlete identity', 'هوية اللاعب للمعاينة')} /></label>
              <select id="preview-athlete" value={selectedAthleteId} onChange={(event) => setSelectedAthleteId(event.target.value)} className="mt-2 w-full min-h-11 px-3 rounded-xl bg-[#0d1118] border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400">
                {allPlayers.map((player) => <option key={player.id} value={player.id}>{player.nameEn} · {player.nameAr}</option>)}
              </select>
              <button type="button" onClick={handleEnterPreviewMode} disabled={loading || !selectedAthleteId} className="mt-3 w-full min-h-11 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <BilingualText value={bi('Enter Preview Athlete Mode', 'الدخول إلى وضع معاينة اللاعب')} /><ArrowRight size={14} className="rtl:rotate-180" />
              </button>
              <p className="mt-3 text-[10px] leading-5 text-slate-500"><BilingualText value={bi('Preview sessions are local product-demo access and are not production authentication.', 'جلسات المعاينة هي دخول محلي لتجربة المنتج وليست مصادقة إنتاجية.')} /></p>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-[10px] text-slate-600 border-t border-white/5">© {new Date().getFullYear()} United Olympics Sports · يونايتد أوليمبيكس سبورت</footer>
    </div>
  );
}
