import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import Sports3DStage from '../../design/sports3d/Sports3DStage';
import Sports3DIcon from '../../design/sports3d/Sports3DIcon';

export function AuthLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="auth-surface" dir="ltr">
      <Sports3DStage>
        <div className="auth-card">
          <div className="auth-brand">
            <Sports3DIcon sport="trophy" className="auth-brand-icon" />
            <h1><BilingualText value={bi('United Olympics Sports', 'يونايتد أوليمبيكس سبورت')} /></h1>
            <p><BilingualText value={bi('Athlete Portal Access', 'الدخول إلى بوابة اللاعب')} /></p>
          </div>
          <form className="auth-form" onSubmit={e => e.preventDefault()} aria-label="Login form">
            <label htmlFor="email"><Mail size={16} /> <BilingualText value={bi('Email', 'البريد الإلكتروني')} /></label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="player@unitedolympicssports.org" />
            <label htmlFor="password"><Lock size={16} /> <BilingualText value={bi('Password', 'كلمة المرور')} /></label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="auth-button"><LogIn size={16} /> <BilingualText value={bi('Sign In', 'تسجيل الدخول')} /></button>
            <div className="auth-links">
              <Link to="/auth/reset"><BilingualText value={bi('Forgot password?', 'نسيت كلمة المرور؟')} /></Link>
              <Link to="/auth/register"><BilingualText value={bi('Create account', 'إنشاء حساب')} /></Link>
            </div>
          </form>
        </div>
      </Sports3DStage>
    </div>
  );
}
