import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { UosSteps } from '../../../components/fields/UosFields';
import { productionAuthGateway } from './PlayerAuthGateway';

const COUNTRY_CODES = [
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
];

export function PlayerPhoneAuthPage() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState('+971');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<{ en: string; ar: string } | null>(null);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      setAuthError({
        en: 'Please enter a valid mobile number.',
        ar: 'يرجى إدخال رقم هاتف متحرك صحيح.',
      });
      return;
    }

    setLoading(true);
    setAuthError(null);

    const fullPhone = `${selectedCountry}${phoneNumber.replace(/\s+/g, '')}`;
    const res = await productionAuthGateway.requestPhoneOtp(fullPhone);
    setLoading(false);

    if (!res.success && res.error) {
      // Truthfully inform user that phone verification requires external service integration
      setAuthError({
        en: res.error.messageEn,
        ar: res.error.messageAr,
      });
    } else if (res.success) {
      navigate(`/player/auth/verify?phone=${encodeURIComponent(fullPhone)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-['Outfit','Cairo',sans-serif]">
      {/* Ambient Lighting */}
      <div className="absolute top-[-10%] right-[30%] w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/player/login" className="flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400 transition-colors">
          <ArrowLeft size={16} className="rtl:rotate-180" />
          <span><BilingualText value={bi('Back to Login Options', 'العودة لخيارات الدخول')} /></span>
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
          <UosSteps steps={[bi('Mobile number', 'رقم الهاتف'), bi('Verification code', 'رمز التحقق')]} current={0} />
          <div className="text-center mb-6">
            <span className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <Phone size={22} />
            </span>
            <h2 className="text-2xl font-bold text-white">
              <BilingualText value={bi('Mobile Verification', 'التحقق عبر الهاتف')} />
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              <BilingualText
                value={bi(
                  'Enter your registered athlete mobile number to receive authentication code.',
                  'أدخل رقم هاتفك المسجل لتلقي رمز المصادقة.'
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
                  <BilingualText value={bi('Need to test right now?', 'هل تريد اختبار البوابة الآن؟')} />
                </span>
                <Link
                  to="/player/login"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                >
                  <Sparkles size={12} />
                  <span><BilingualText value={bi('Use Preview Mode', 'استخدم وضع المعاينة')} /></span>
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                <BilingualText value={bi('Mobile Number', 'رقم الهاتف المتحرك')} />
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="50 123 4567"
                  className="flex-1 py-2.5 px-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
            >
              <BilingualText value={bi('Send Verification Code', 'إرسال رمز التحقق')} />
            </button>
          </form>
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
