import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { usePlayerSession } from '../PlayerSessionContext';
import { productionAuthGateway } from './PlayerAuthGateway';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { UosSteps } from '../../../components/fields/UosFields';

export function PlayerVerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const { login } = usePlayerSession();
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<{ en: string; ar: string } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, 6).split('');
      const nextOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < 6) nextOtp[index + i] = char;
      });
      setOtp(nextOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = value.replace(/\D/g, '');
    setOtp(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setAuthError({
        en: 'Please enter all 6 digits of your verification code.',
        ar: 'يرجى إدخال جميع أرقام رمز التحقق الستة.',
      });
      return;
    }

    setLoading(true);
    setAuthError(null);

    // Verify through PlayerAuthGateway - does NOT accept fake digits
    const res = await productionAuthGateway.verifyPhoneOtp(phone, code);
    setLoading(false);

    if (!res.success && res.error) {
      setAuthError({
        en: res.error.messageEn,
        ar: res.error.messageAr,
      });
    } else if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate('/player/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-['Outfit','Cairo',sans-serif]">
      {/* Ambient Lighting */}
      <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/player/auth/phone" className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors">
          <ArrowLeft size={16} className="rtl:rotate-180" />
          <span><BilingualText value={bi('Back to Phone Entry', 'العودة لإدخال الهاتف')} /></span>
        </Link>
        <div className="flex items-center gap-2">
          <img
            src="/brand/united-olympics-sports-logo.png"
            alt="United Olympics Sports"
            className="w-8 h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="font-['Cinzel',serif] text-xs font-bold text-slate-200">
            UNITED OLYMPICS SPORTS
          </span>
        </div>
      </header>

      {/* Main Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-12 flex-1 flex items-center justify-center">
        <div className="athlete-glass-card w-full p-8 border border-amber-400/30 shadow-2xl">
          <UosSteps steps={[bi('Mobile number', 'رقم الهاتف'), bi('Verification code', 'رمز التحقق')]} current={1} />
          <div className="text-center mb-6">
            <span className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <KeyRound size={22} />
            </span>
            <h2 className="text-2xl font-bold text-white">
              <BilingualText value={bi('Enter Verification Code', 'إدخال رمز التحقق')} />
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              <BilingualText
                value={bi(
                  phone ? `Authentication verification for ${phone}` : 'Verification code entry for registered mobile number.',
                  phone ? `التحقق من المصادقة للهاتف ${phone}` : 'إدخال رمز التحقق لرقم الهاتف المسجل.'
                )}
              />
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="font-medium">
                  <BilingualText value={authError} />
                </div>
              </div>
              <div className="pt-2 border-t border-amber-400/20 flex items-center justify-between">
                <span className="text-[11px] text-slate-300">
                  <BilingualText value={bi('Test via Preview Athlete Mode:', 'للتجربة عبر وضع المعاينة:')} />
                </span>
                <Link
                  to="/player/login"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                >
                  <Sparkles size={12} />
                  <span><BilingualText value={bi('Choose Athlete', 'اختر رياضياً')} /></span>
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2" dir="ltr">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-13 text-center text-lg font-bold font-mono rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400 focus:bg-white/10 transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
            >
              <BilingualText value={bi('Verify & Sign In', 'التحقق والمتابعة')} />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              to="/player/login"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
            >
              <BilingualText value={bi('Cancel and return to sign in', 'إلغاء والعودة لتسجيل الدخول')} />
            </Link>
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
