import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, Check, ChevronDown, Eye, LockKeyhole, Phone, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import '../../../styles/player-portal.css';

type AuthStep = 'choice' | 'phone' | 'verify';
export function PlayerAuthPage({ initialStep = 'choice' }: { initialStep?: AuthStep }) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  const updateDigit = (index: number, event: ChangeEvent<HTMLInputElement>) => { const value = event.target.value.replace(/\D/g, '').slice(-1); setDigits(current => current.map((digit, i) => i === index ? value : digit)); if (value) inputs.current[index + 1]?.focus(); };
  const keyDigit = (index: number, event: KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Backspace' && !digits[index]) inputs.current[index - 1]?.focus(); };
  const pasteCode = (event: React.ClipboardEvent) => { const code = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6); if (code) { event.preventDefault(); setDigits(Array.from({ length: 6 }, (_, i) => code[i] ?? '')); inputs.current[Math.min(code.length, 5)]?.focus(); } };
  return <main className="player-auth">
    <section className="player-auth-brand" aria-label="United Olympics Sports | يونايتد أوليمبيكس سبورت">
      <Link to="/" className="player-auth-logo"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><span><strong>United Olympics Sports</strong><b lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</b></span></Link>
      <div className="player-auth-story"><span className="player-auth-kicker"><ShieldCheck size={15} /><BilingualText value={bi('Private athlete experience', 'تجربة الرياضي الخاصة')} /></span><h1>Your game.<br/>Your progress.<br/><em>Your journey.</em><span lang="ar" dir="rtl">لعبتك. تطورك. رحلتك.</span></h1><p><BilingualText value={bi('Everything that shapes your sporting journey, brought together in one secure place.', 'كل ما يصنع رحلتك الرياضية، في مساحة واحدة آمنة ومتكاملة.')} /></p></div>
      <div className="player-auth-orbit" aria-hidden="true"><i/><i/><i/></div>
    </section>
    <section className="player-auth-panel"><div className="player-auth-card">
      {step !== 'choice' && <button className="player-auth-back" type="button" onClick={() => setStep(step === 'verify' ? 'phone' : 'choice')}><ArrowLeft size={16}/><BilingualText value={bi('Back', 'رجوع')} /></button>}
      <header><span className="player-auth-lock"><LockKeyhole size={18}/></span><h2><BilingualText value={step === 'verify' ? bi('Verify your number', 'تحقق من رقمك') : step === 'phone' ? bi('Continue by phone', 'المتابعة برقم الهاتف') : bi('Welcome, athlete', 'مرحبًا أيها الرياضي')} /></h2><p><BilingualText value={step === 'verify' ? bi(`Enter the six-digit code sent to +971 ${phone}`, `أدخل الرمز المكون من ستة أرقام المرسل إلى ‎+971 ${phone}`) : bi('Player Portal', 'بوابة اللاعب')} /></p></header>
      {step === 'choice' && <div className="player-auth-options">
        <div className="auth-provider-slot" aria-disabled="true"><BilingualText value={bi('Google sign-in becomes available when Google Identity Services is connected.', 'سيصبح تسجيل الدخول عبر Google متاحًا عند ربط خدمات Google Identity.')}/></div>
        <div className="auth-provider-slot auth-provider-dark" aria-disabled="true"><BilingualText value={bi('Sign in with Apple becomes available when Apple authentication is connected.', 'سيصبح تسجيل الدخول عبر Apple متاحًا عند ربط مصادقة Apple.')}/></div>
        <div className="auth-divider"><span/><BilingualText value={bi('or', 'أو')} /><span/></div>
        <button type="button" className="phone-button" onClick={() => setStep('phone')}><Phone size={18}/><BilingualText value={bi('Continue with Phone Number', 'المتابعة برقم الهاتف')} /></button>
        <button type="button" className="preview-entry" onClick={() => { window.sessionStorage.setItem('uos:player-preview-session:v1','player-demo-001'); navigate('/player/home?previewPlayerId=player-demo-001'); }}><Eye size={17}/><BilingualText value={bi('Enter explicit preview mode', 'الدخول إلى وضع المعاينة الصريح')}/></button>
      </div>}
      {step === 'phone' && <form onSubmit={event => { event.preventDefault(); if (phone.length >= 8) setStep('verify'); }} className="phone-form"><label><BilingualText value={bi('Phone number', 'رقم الهاتف')} /><span className="phone-field"><button type="button" aria-label="Country code UAE | رمز دولة الإمارات"><span>🇦🇪</span> +971 <ChevronDown size={14}/></button><input autoFocus inputMode="tel" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="50 000 0000" aria-label="Phone number | رقم الهاتف" /></span></label><small><BilingualText value={bi('Phone authentication is unavailable until the identity service is connected.', 'المصادقة بالهاتف غير متاحة حتى يتم ربط خدمة الهوية.')} /></small><button className="auth-primary" disabled={phone.length < 8}><BilingualText value={bi('Review verification screen', 'مراجعة شاشة التحقق')} /></button></form>}
      {step === 'verify' && <form onSubmit={event => event.preventDefault()} className="otp-form"><div className="otp-inputs" dir="ltr" onPaste={pasteCode}>{digits.map((digit, index) => <input key={index} ref={node => { inputs.current[index] = node; }} value={digit} onChange={event => updateDigit(index, event)} onKeyDown={event => keyDigit(index, event)} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Verification digit ${index + 1} | رقم التحقق ${index + 1}`} />)}</div><button className="auth-primary" disabled><Check size={17}/><BilingualText value={bi('Verification unavailable', 'التحقق غير متاح')} /></button><div className="otp-actions"><button type="button" disabled><BilingualText value={bi('Resend unavailable', 'إعادة الإرسال غير متاحة')} /></button><button type="button" onClick={() => setStep('phone')}><BilingualText value={bi('Edit phone number', 'تعديل رقم الهاتف')} /></button></div><p className="integration-note"><BilingualText value={bi('Authentication services are not connected. No code is sent and access is not granted without an integration.', 'خدمات المصادقة غير متصلة. لن يتم إرسال رمز أو منح الوصول دون تكامل فعلي.')} /></p></form>}
      <footer><LockKeyhole size={13}/><BilingualText value={bi('Privacy · Terms · Help', 'الخصوصية · الشروط · المساعدة')} /></footer>
    </div></section>
  </main>;
}
