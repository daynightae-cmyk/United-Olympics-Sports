import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, Check, ChevronDown, LockKeyhole, Phone, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import '../../../styles/player-portal.css';

type AuthStep = 'choice' | 'phone' | 'verify';
const GoogleMark = () => <svg viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.2h4.8a4.1 4.1 0 0 1-1.8 2.7v2.1h2.8c1.7-1.5 2.8-3.8 2.8-6.3Z"/><path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.3 0-4.3-1.6-5-3.7H1v2.3A9 9 0 0 0 9 18Z"/><path fill="#FBBC05" d="M4 10.8A5.4 5.4 0 0 1 4 7.2V5H1a9 9 0 0 0 0 8.1l3-2.3Z"/><path fill="#EA4335" d="M9 3.6c1.4 0 2.6.5 3.5 1.4l2.6-2.5A8.7 8.7 0 0 0 1 5l3 2.2c.7-2.1 2.7-3.6 5-3.6Z"/></svg>;

export function PlayerAuthPage({ initialStep = 'choice' }: { initialStep?: AuthStep }) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const navigate = useNavigate();
  useEffect(() => { if (step !== 'verify' || seconds <= 0) return; const timer = window.setTimeout(() => setSeconds(value => value - 1), 1000); return () => window.clearTimeout(timer); }, [step, seconds]);
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
        <button type="button" className="social-button google-button" aria-label="Continue with Google | المتابعة باستخدام Google"><GoogleMark/><BilingualText value={bi('Continue with Google', 'المتابعة باستخدام Google')} /></button>
        <button type="button" className="social-button apple-button" aria-label="Continue with Apple | المتابعة باستخدام Apple"><span className="apple-mark" aria-hidden="true">●</span><BilingualText value={bi('Continue with Apple', 'المتابعة باستخدام Apple')} /></button>
        <div className="auth-divider"><span/><BilingualText value={bi('or', 'أو')} /><span/></div>
        <button type="button" className="phone-button" onClick={() => setStep('phone')}><Phone size={18}/><BilingualText value={bi('Continue with Phone Number', 'المتابعة برقم الهاتف')} /></button>
      </div>}
      {step === 'phone' && <form onSubmit={event => { event.preventDefault(); if (phone.length >= 8) { setStep('verify'); setSeconds(30); } }} className="phone-form"><label><BilingualText value={bi('Phone number', 'رقم الهاتف')} /><span className="phone-field"><button type="button" aria-label="Country code UAE | رمز دولة الإمارات"><span>🇦🇪</span> +971 <ChevronDown size={14}/></button><input autoFocus inputMode="tel" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="50 000 0000" aria-label="Phone number | رقم الهاتف" /></span></label><small><BilingualText value={bi('We will send a one-time verification code. Standard message rates may apply.', 'سنرسل رمز تحقق لمرة واحدة. قد تطبق رسوم الرسائل المعتادة.')} /></small><button className="auth-primary" disabled={phone.length < 8}><BilingualText value={bi('Send verification code', 'إرسال رمز التحقق')} /></button></form>}
      {step === 'verify' && <form onSubmit={event => { event.preventDefault(); if (digits.every(Boolean)) navigate('/player/home'); }} className="otp-form"><div className="otp-inputs" dir="ltr" onPaste={pasteCode}>{digits.map((digit, index) => <input key={index} ref={node => { inputs.current[index] = node; }} value={digit} onChange={event => updateDigit(index, event)} onKeyDown={event => keyDigit(index, event)} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Verification digit ${index + 1} | رقم التحقق ${index + 1}`} />)}</div><button className="auth-primary" disabled={!digits.every(Boolean)}><Check size={17}/><BilingualText value={bi('Verify and continue', 'تحقق وتابع')} /></button><div className="otp-actions"><button type="button" onClick={() => { setSeconds(30); setDigits(['','','','','','']); }} disabled={seconds > 0}><BilingualText value={seconds > 0 ? bi(`Resend in ${seconds}s`, `إعادة الإرسال خلال ${seconds} ث`) : bi('Resend code', 'إعادة إرسال الرمز')} /></button><button type="button" onClick={() => setStep('phone')}><BilingualText value={bi('Edit phone number', 'تعديل رقم الهاتف')} /></button></div><p className="integration-note"><BilingualText value={bi('Authentication services are not connected in this preview. No code is sent and access is not granted without an integration.', 'خدمات المصادقة غير متصلة في هذه المعاينة. لن يتم إرسال رمز أو منح الوصول دون تكامل فعلي.')} /></p></form>}
      <footer><LockKeyhole size={13}/><BilingualText value={bi('Your information is handled with care and privacy.', 'نتعامل مع معلوماتك بعناية وخصوصية.')} /></footer>
    </div></section>
  </main>;
}
