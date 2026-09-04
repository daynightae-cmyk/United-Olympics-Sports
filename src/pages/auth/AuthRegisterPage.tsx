import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import Sports3DStage from '../../design/sports3d/Sports3DStage';
import Sports3DIcon from '../../design/sports3d/Sports3DIcon';

export function AuthRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="auth-surface" dir="ltr">
      <Sports3DStage>
        <div className="auth-card">
          <div className="auth-brand">
            <Sports3DIcon sport="trophy" className="auth-brand-icon" />
            <h1><BilingualText value={bi('United Olympics Sports', 'يونايتد أوليمبيكس سبورت')} /></h1>
            <p><BilingualText value={bi('Create Athlete Account', 'إنشاء حساب لاعب')} /></p>
          </div>
          <form className="auth-form" onSubmit={e => e.preventDefault()} aria-label="Register form">
            <label htmlFor="reg-name"><User size={16} /> <BilingualText value={bi('Full Name', 'الاسم الكامل')} /></label>
            <input id="reg-name" value={name} onChange={e => setName(e.target.value)} />
            <label htmlFor="reg-email"><Mail size={16} /> <BilingualText value={bi('Email', 'البريد الإلكتروني')} /></label>
            <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <label htmlFor="reg-password"><Lock size={16} /> <BilingualText value={bi('Password', 'كلمة المرور')} /></label>
            <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="auth-button"><UserPlus size={16} /> <BilingualText value={bi('Register', 'تسجيل')} /></button>
            <div className="auth-links"><Link to="/auth/login"><BilingualText value={bi('Already have an account?', 'لديك حساب؟')} /></Link></div>
          </form>
        </div>
      </Sports3DStage>
    </div>
  );
}
