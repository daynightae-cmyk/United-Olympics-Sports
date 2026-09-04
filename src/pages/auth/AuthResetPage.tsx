import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import Sports3DStage from '../../design/sports3d/Sports3DStage';
import Sports3DIcon from '../../design/sports3d/Sports3DIcon';

export function AuthResetPage() {
  const [email, setEmail] = useState('');
  return (
    <div className="auth-surface" dir="ltr">
      <Sports3DStage>
        <div className="auth-card">
          <div className="auth-brand">
            <Sports3DIcon sport="trophy" className="auth-brand-icon" />
            <h1><BilingualText value={bi('United Olympics Sports', 'يونايتد أوليمبيكس سبورت')} /></h1>
            <p><BilingualText value={bi('Reset Password', 'إعادة تعيين كلمة المرور')} /></p>
          </div>
          <form className="auth-form" onSubmit={e => e.preventDefault()} aria-label="Reset password form">
            <label htmlFor="reset-email"><Mail size={16} /> <BilingualText value={bi('Email', 'البريد الإلكتروني')} /></label>
            <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" className="auth-button"><KeyRound size={16} /> <BilingualText value={bi('Send Reset Link', 'إرسال رابط إعادة التعيين')} /></button>
            <div className="auth-links"><Link to="/auth/login"><BilingualText value={bi('Back to login', 'العودة لتسجيل الدخول')} /></Link></div>
          </form>
        </div>
      </Sports3DStage>
    </div>
  );
}
