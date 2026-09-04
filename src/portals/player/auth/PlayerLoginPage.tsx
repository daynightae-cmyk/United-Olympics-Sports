import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { usePlayerSession } from '../PlayerSessionContext';
import { productionAuthGateway, previewAuthGateway } from './PlayerAuthGateway';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerLoginPage() {
  const { allPlayers, login } = usePlayerSession();
  const navigate = useNavigate();

  const [selectedAthleteId, setSelectedAthleteId] = useState('player-demo-001');
  const [authError, setAuthError] = useState<{ en: string; ar: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProductionGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await productionAuthGateway.signInWithGoogle();
    setLoading(false);
    if (!res.success && res.error) {
      setAuthError({ en: res.error.messageEn, ar: res.error.messageAr });
    } else if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate('/player/home');
    }
  };

  const handleProductionApple = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await productionAuthGateway.signInWithApple();
    setLoading(false);
    if (!res.success && res.error) {
      setAuthError({ en: res.error.messageEn, ar: res.error.messageAr });
    } else if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate('/player/home');
    }
  };

  const handleEnterPreviewMode = async () => {
    setLoading(true);
    setAuthError(null);
    const res = await previewAuthGateway.enterPreviewMode(selectedAthleteId);
    setLoading(false);
    if (res.success && res.data?.playerId) {
      login(res.data.playerId);
      navigate('/player/home');
    }
  };

  return (
    <div className="bm-login-shell" style={{ fontFamily: "'Outfit','Cairo',sans-serif" }}>
      {/* Left: Athletic Cinematic Branding */}
      <div className="bm-login-visual">
        <div className="bm-login-brand">
          <img
            src="/brand/united-olympics-sports-logo.png"
            alt="United Olympics Sports | يونايتد أوليمبيكس سبورت"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <div>
            <strong>UNITED OLYMPICS SPORTS</strong>
            <span>يونايتد أوليمبيكس سبورت</span>
          </div>
        </div>

        <div className="bm-login-tagline">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#f3c969', marginBottom: '20px' }}>
            <ShieldCheck size={14} style={{ color: '#d8b35a' }} />
            <span><BilingualText value={bi('Athlete Portal Access', 'بوابة الرياضيين')} /></span>
          </div>

          <h2>
            <BilingualText value={bi('Step Into Your Private', 'ادخل إلى مساحتك الرياضية')} />
            <span style={{ display: 'block', background: 'linear-gradient(90deg, #f3c969, #f0c75e, #d8b35a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Cinzel',serif" }}>
              <BilingualText value={bi('Athlete Arena', 'الخاصة والمميزة')} />
            </span>
          </h2>

          <p>
            <BilingualText value={bi(
              'Access your training calendar, skill development radar, coach feedback logs, and digital athlete records at United Olympics Sports.',
              'تابع جدول تدريباتك المعتمد، ورادار تطوير المهارات، وملاحظات المدربين، وسجلاتك الرياضية في يونايتد أوليمبيكس سبورت.'
            )} />
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginTop: '28px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <Flame size={18} style={{ color: '#d8b35a', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#e8e4dd', margin: 0 }}>
                <BilingualText value={bi('Real Progress', 'تقدم حقيقي')} />
              </h3>
              <p style={{ fontSize: '11px', color: '#8a8780', marginTop: '4px', margin: 0 }}>
                <BilingualText value={bi('Skill benchmarks & attendance rhythm', 'مؤشرات المهارة وإيقاع الحضور')} />
              </p>
            </div>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <Award size={18} style={{ color: '#f0c75e', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#e8e4dd', margin: 0 }}>
                <BilingualText value={bi('Coach Direct', 'تواصل المدرب')} />
              </h3>
              <p style={{ fontSize: '11px', color: '#8a8780', marginTop: '4px', margin: 0 }}>
                <BilingualText value={bi('Technical feedback & assigned sessions', 'الملاحظات الفنية والحصص المخصصة')} />
              </p>
            </div>
            <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
              <ShieldCheck size={18} style={{ color: '#5ec39b', marginBottom: '8px' }} />
              <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#e8e4dd', margin: 0 }}>
                <BilingualText value={bi('Digital Vault', 'الخزنة الرقمية')} />
              </h3>
              <p style={{ fontSize: '11px', color: '#8a8780', marginTop: '4px', margin: 0 }}>
                <BilingualText value={bi('Athlete records & training documents', 'سجلات الرياضي ووثائق التدريب')} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Premium Auth Card */}
      <div className="bm-login-form-side">
        <div className="bm-login-card">
          <div className="bm-login-card-head">
            <span style={{ width: '48px', height: '48px', display: 'grid', placeItems: 'center', borderRadius: '16px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d8b35a', margin: '0 auto 14px' }}>
              <Lock size={22} />
            </span>
            <h3>
              <BilingualText value={bi('Athlete Sign In', 'تسجيل دخول اللاعب')} />
            </h3>
            <p>
              <BilingualText value={bi('Secure authentication for registered athletes', 'تسجيل دخول آمن للرياضيين المسجلين')} />
            </p>
          </div>

          {authError && (
            <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#f3c969', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ color: '#d8b35a', flexShrink: 0, marginTop: '2px' }} />
              <div><BilingualText value={authError} /></div>
            </div>
          )}

          <div className="bm-login-fields">
            <button
              type="button"
              onClick={handleProductionGoogle}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px', background: '#fff', color: '#1a1a1a',
                fontWeight: 600, fontSize: '13px', border: '0', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 160ms ease, transform 160ms ease',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#fff'; }}
            >
              <img src="/brand/google-logo.svg" alt="Google" style={{ width: '16px', height: '16px' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              <span><BilingualText value={bi('Continue with Google', 'المتابعة باستخدام Google')} /></span>
            </button>

            <button
              type="button"
              onClick={handleProductionApple}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px', background: '#000', color: '#fff',
                fontWeight: 600, fontSize: '13px', border: '1px solid rgba(255,255,255,0.15)',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 160ms ease',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1a1a1a'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#000'; }}
            >
              <img src="/brand/apple-logo.svg" alt="Apple" style={{ width: '16px', height: '16px' }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
              <span><BilingualText value={bi('Continue with Apple', 'المتابعة باستخدام Apple')} /></span>
            </button>

            <div className="bm-login-divider">
              <BilingualText value={bi('Or mobile phone', 'أو عبر الهاتف')} />
            </div>

            <Link
              to="/player/auth/phone"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px 16px', borderRadius: '12px',
                background: 'rgba(212,175,55,0.1)', color: '#f3c969',
                fontWeight: 600, fontSize: '13px', border: '1px solid rgba(212,175,55,0.3)',
                textDecoration: 'none', transition: 'background 160ms ease',
              }}
            >
              <Phone size={15} />
              <span><BilingualText value={bi('Sign in with Mobile Number (OTP)', 'الدخول برقم الهاتف (رمز التحقق)')} /></span>
            </Link>
          </div>

          {/* Preview Athlete Mode */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#e8e4dd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#d8b35a' }} />
                <BilingualText value={bi('Enter Preview Athlete Mode', 'الدخول إلى وضع المعاينة')} />
              </span>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d8b35a' }}>
                Preview
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', color: '#8a8780', display: 'block' }}>
                <BilingualText value={bi('Select demo athlete identity:', 'اختر هوية الرياضي التجريبية:')} />
              </label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e8e4dd', fontSize: '12px', outline: 'none',
                }}
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#11161d', color: '#e8e4dd' }}>
                    {p.nameEn} ({p.sportId.toUpperCase()}) — {p.nameAr}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleEnterPreviewMode}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'linear-gradient(90deg, #d8b35a, #f0c75e)', color: '#0a0e14',
                  fontWeight: 700, fontSize: '12px', border: '0',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'transform 160ms ease, box-shadow 200ms ease',
                  boxShadow: '0 8px 28px rgba(212,175,55,0.12)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <span><BilingualText value={bi('Enter Preview Athlete Mode', 'الدخول إلى وضع المعاينة')} /></span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bm-login-footer">
            <Link to="/" style={{ fontSize: '11px', color: '#8a8780', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ExternalLink size={12} />
              <BilingualText value={bi('Main Website', 'الموقع الرئيسي')} />
            </Link>
            <span style={{ marginTop: '8px', display: 'block' }}>
              © {new Date().getFullYear()} United Olympics Sports · يونايتد أوليمبيكس سبورت
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
