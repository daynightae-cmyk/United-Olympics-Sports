/**
 * United Olympics Sports — Portal Account Recovery & Activation Shell (Mission 00.11).
 *
 * Supports:
 * - Password Reset Request (Email/Phone)
 * - Password Reset Verification (Code / Token + New Password + Confirm Password)
 * - Account Activation & Onboarding for invited coaches/parents/athletes.
 */
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  LockKeyhole,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue, ProductPortal } from '../../domain/contracts';
import { UosTextField, UosPasswordField, UosSteps } from '../fields/UosFields';
import { UiButton } from '../ui/UiPrimitives';
import { SafeBrandLogo } from '../ui/SafeBrandLogo';

export type RecoveryMode = 'forgot-password' | 'activate-account';

export function PortalAccountRecoveryShell({
  portal = 'player',
  mode = 'forgot-password',
  loginRoute = '/player/login',
  onComplete,
}: {
  portal?: ProductPortal;
  mode?: RecoveryMode;
  loginRoute?: string;
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<BilingualValue | null>(null);

  const steps = [
    { title: bi('Verify Account', 'التحقق من الحساب') },
    { title: bi('Enter Security Code', 'رمز الأمان') },
    { title: bi('Set New Password', 'تعيين كلمة المرور') },
    { title: bi('Complete', 'اكتمال') },
  ];

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError(bi('Please enter your registered email or phone', 'يرجى إدخال البريد الإلكتروني أو الهاتف المسجل'));
      return;
    }
    setError(null);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(1);
    }, 600);
  };

  const handleStep2 = (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 4) {
      setError(bi('Please enter a valid 4-6 digit verification code', 'يرجى إدخال رمز تحقق صالح من 4-6 أرقام'));
      return;
    }
    setError(null);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(2);
    }, 600);
  };

  const handleStep3 = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError(bi('Password must be at least 8 characters long', 'يجب ألا تقل كلمة المرور عن 8 أحرف'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(bi('Passwords do not match', 'كلمات المرور غير متطابقة'));
      return;
    }
    setError(null);
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(3);
    }, 600);
  };

  return (
    <div className="uos-recovery-shell uos-safe-x uos-safe-top uos-safe-bottom">
      <header className="uos-recovery-head">
        <Link to="/" className="uos-recovery-logo">
          <SafeBrandLogo size="md" />
        </Link>
      </header>

      <main className="uos-recovery-card uos-glass-4">
        <div className="uos-recovery-card-head">
          <span className="uos-recovery-icon" aria-hidden="true">
            {mode === 'activate-account' ? <Sparkles size={22} /> : <KeyRound size={22} />}
          </span>
          <h1 className="uos-recovery-title">
            <BilingualText
              value={
                mode === 'activate-account'
                  ? bi('Activate Your Account', 'تفعيل حسابك الرياضي')
                  : bi('Reset Password', 'استعادة كلمة المرور')
              }
            />
          </h1>
          <p className="uos-recovery-subtitle">
            <BilingualText
              value={
                mode === 'activate-account'
                  ? bi(
                      'Welcome to United Olympics Sports. Complete your profile verification to access your portal.',
                      'أهلاً بك في يونايتد أوليمبيكس سبورت. أكمل التحقق من ملفك للوصول إلى بوابتك.',
                    )
                  : bi(
                      'Enter your verified email or phone to receive secure password recovery instructions.',
                      'أدخل بريدك الإلكتروني أو رقم هاتفك الموثق لتلقي تعليمات استعادة كلمة المرور الآمنة.',
                    )
              }
            />
          </p>
        </div>

        <div className="uos-recovery-stepper">
          <UosSteps steps={steps} current={step} />
        </div>

        {step === 0 && (
          <form onSubmit={handleStep1} className="uos-recovery-form">
            <UosTextField
              label={bi('Email or Phone Number', 'البريد الإلكتروني أو رقم الهاتف')}
              icon={<Mail size={16} />}
              value={identifier}
              onChange={setIdentifier}
              placeholder="e.g. athlete@unitedolympics.com or +97150..."
              error={error}
              required
            />
            <div className="uos-recovery-actions">
              <UiButton variant="primary" type="submit" loading={busy} className="w-full">
                <BilingualText value={bi('Send Verification Code', 'إرسال رمز التحقق')} />
              </UiButton>
              <Link to={loginRoute} className="uos-recovery-back-link">
                <ArrowLeft size={15} />
                <BilingualText value={bi('Back to Sign In', 'العودة لتسجيل الدخول')} />
              </Link>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleStep2} className="uos-recovery-form">
            <div className="uos-recovery-notice">
              <ShieldCheck size={18} />
              <p>
                <BilingualText
                  value={bi(
                    `We sent a verification code to ${identifier}. Enter it below.`,
                    `أرسلنا رمز تحقق إلى ${identifier}. أدخله أدناه.`,
                  )}
                />
              </p>
            </div>
            <UosTextField
              label={bi('Verification Code', 'رمز التحقق')}
              icon={<KeyRound size={16} />}
              value={code}
              onChange={setCode}
              placeholder="123456"
              maxLength={6}
              error={error}
              required
            />
            <div className="uos-recovery-actions">
              <UiButton variant="primary" type="submit" loading={busy} className="w-full">
                <BilingualText value={bi('Verify Code', 'تأكيد الرمز')} />
              </UiButton>
              <button
                type="button"
                className="uos-recovery-resend"
                onClick={() => setStep(0)}
              >
                <BilingualText value={bi('Change email / phone', 'تغيير البريد / الهاتف')} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep3} className="uos-recovery-form">
            <UosPasswordField
              label={bi('New Password', 'كلمة المرور الجديدة')}
              icon={<LockKeyhole size={16} />}
              value={newPassword}
              onChange={setNewPassword}
              required
            />
            <UosPasswordField
              label={bi('Confirm New Password', 'تأكيد كلمة المرور')}
              icon={<LockKeyhole size={16} />}
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={error}
              required
            />
            <div className="uos-recovery-actions">
              <UiButton variant="primary" type="submit" loading={busy} className="w-full">
                <BilingualText value={bi('Update Password & Continue', 'تحديث كلمة المرور والمتابعة')} />
              </UiButton>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="uos-recovery-success">
            <CheckCircle2 size={48} className="uos-success-icon" />
            <h2>
              <BilingualText
                value={
                  mode === 'activate-account'
                    ? bi('Account Activated Successfully!', 'تم تفعيل الحساب بنجاح!')
                    : bi('Password Reset Complete!', 'تم تعيين كلمة المرور بنجاح!')
                }
              />
            </h2>
            <p>
              <BilingualText
                value={bi(
                  'Your security credentials have been updated. You can now sign in to your portal.',
                  'تم تحديث بيانات الأمان الخاصة بك. يمكنك الآن تسجيل الدخول إلى بوابتك.',
                )}
              />
            </p>
            <div className="uos-recovery-actions mt-4">
              <Link to={loginRoute} className="ui-button ui-button-primary w-full">
                <BilingualText value={bi('Sign In Now', 'تسجيل الدخول الآن')} />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
