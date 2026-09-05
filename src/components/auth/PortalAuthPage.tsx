import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  BarChart3,
  CalendarDays,
  Eye,
  EyeOff,
  Fingerprint,
  HeartHandshake,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { LanguageOrderToggle } from '../ui/LanguageOrderToggle';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PortalEmblem } from '../brand/PortalEmblem';

export type PortalAuthKind = 'admin' | 'store' | 'player' | 'parent' | 'coach';
export type PortalAuthProvider = 'phone' | 'google' | 'apple' | 'biometric';

export type PortalAuthNotice = {
  tone: 'info' | 'error';
  message: { en: string; ar: string };
};

type PortalFeature = {
  icon: LucideIcon;
  label: { en: string; ar: string };
};

type PortalAuthConfig = {
  title: { en: string; ar: string };
  eyebrow: { en: string; ar: string };
  supporting: { en: string; ar: string };
  visualTitle: { en: string; ar: string };
  visualCopy: { en: string; ar: string };
  image: string;
  destination: string;
  features: PortalFeature[];
};

const portalConfig: Record<PortalAuthKind, PortalAuthConfig> = {
  admin: {
    title: bi('Admin Portal', 'بوابة الإدارة'),
    eyebrow: bi('Secure management access', 'دخول إداري آمن'),
    supporting: bi('Secure management access.', 'دخول آمن لإدارة النظام.'),
    visualTitle: bi('Lead with clarity', 'قد بوضوح'),
    visualCopy: bi('One disciplined command surface for people, programs and operations.', 'واجهة إدارية منضبطة للأفراد والبرامج والعمليات.'),
    image: '/media/sports/football/football-05-teamwork.webp',
    destination: '/admin',
    features: [
      { icon: UsersRound, label: bi('People', 'الأفراد') },
      { icon: CalendarDays, label: bi('Operations', 'العمليات') },
      { icon: BarChart3, label: bi('Insight', 'الرؤية') },
    ],
  },
  store: {
    title: bi('Store Portal', 'بوابة المتجر'),
    eyebrow: bi('Premium sports retail', 'تسوق رياضي متميز'),
    supporting: bi('Secure access to United Olympics Sports shopping.', 'دخول آمن إلى متجر يونايتد أوليمبيكس سبورت.'),
    visualTitle: bi('Built for every athlete', 'مصمم لكل رياضي'),
    visualCopy: bi('A focused account gateway for shopping, saved items and orders.', 'بوابة حساب واضحة للتسوق والعناصر المحفوظة والطلبات.'),
    image: '/media/sports/football/football-03-brand.webp',
    destination: '/store/account',
    features: [
      { icon: ShoppingBag, label: bi('Shop', 'التسوق') },
      { icon: PackageCheck, label: bi('Orders', 'الطلبات') },
      { icon: ShieldCheck, label: bi('Account', 'الحساب') },
    ],
  },
  player: {
    title: bi('Player Portal', 'بوابة اللاعب'),
    eyebrow: bi('Athlete access', 'دخول الرياضي'),
    supporting: bi('Your journey. Your progress. Our support.', 'رحلتك. تقدمك. دعمنا.'),
    visualTitle: bi('A stronger you', 'نسخة أقوى منك'),
    visualCopy: bi('Training, feedback and achievements in one personal athlete space.', 'التدريب والملاحظات والإنجازات في مساحة رياضية شخصية واحدة.'),
    image: '/media/sports/football/football-02-training.webp',
    destination: '/player/home',
    features: [
      { icon: Target, label: bi('Training', 'التدريب') },
      { icon: BarChart3, label: bi('Progress', 'التقدم') },
      { icon: Trophy, label: bi('Achievements', 'الإنجازات') },
    ],
  },
  parent: {
    title: bi('Parent Portal', 'بوابة ولي الأمر'),
    eyebrow: bi('Trusted family access', 'دخول عائلي موثوق'),
    supporting: bi("Your family's access to your child's sports journey.", 'وصول عائلتك إلى رحلة طفلك الرياضية.'),
    visualTitle: bi('Their journey. Our support.', 'رحلتهم. دعمنا.'),
    visualCopy: bi('A reassuring place to follow schedules, progress and communication.', 'مساحة مطمئنة لمتابعة الجداول والتقدم والتواصل.'),
    image: '/media/sports/football/football-06-coach-child.webp',
    destination: '/parent',
    features: [
      { icon: HeartHandshake, label: bi('Support', 'الدعم') },
      { icon: CalendarDays, label: bi('Schedules', 'الجداول') },
      { icon: ShieldCheck, label: bi('Trust', 'الثقة') },
    ],
  },
  coach: {
    title: bi('Coach Portal', 'بوابة المدرب'),
    eyebrow: bi('Professional coaching access', 'دخول المدربين'),
    supporting: bi('Secure coaching access. Complete training control.', 'دخول آمن للمدربين. تحكم متكامل في التدريب.'),
    visualTitle: bi('Prepare. Lead. Develop.', 'خطط. قد. طوّر.'),
    visualCopy: bi('A tactical workspace for sessions, teams and athlete development.', 'مساحة تكتيكية للحصص والفرق وتطوير الرياضيين.'),
    image: '/media/sports/football/football-10-coaching.webp',
    destination: '/coach',
    features: [
      { icon: Target, label: bi('Plans', 'الخطط') },
      { icon: UsersRound, label: bi('Teams', 'الفرق') },
      { icon: Sparkles, label: bi('Development', 'التطوير') },
    ],
  },
};

const portalLinks: Array<{ kind: PortalAuthKind; to: string; label: { en: string; ar: string } }> = [
  { kind: 'player', to: '/player/login', label: bi('Player', 'اللاعب') },
  { kind: 'parent', to: '/parent/login', label: bi('Parent', 'ولي الأمر') },
  { kind: 'coach', to: '/coach/login', label: bi('Coach', 'المدرب') },
  { kind: 'store', to: '/store/login', label: bi('Store', 'المتجر') },
  { kind: 'admin', to: '/admin/login', label: bi('Admin', 'الإدارة') },
];

const unavailableNotice = bi(
  'This authentication method is not configured in the current environment.',
  'طريقة تسجيل الدخول هذه غير مهيأة في البيئة الحالية.',
);

type PortalAuthPageProps = {
  portal: PortalAuthKind;
  busy?: boolean;
  extraContent?: ReactNode;
  onProvider?: (provider: PortalAuthProvider) => Promise<PortalAuthNotice | null>;
  onCredentials?: (credentials: { email: string; password: string; remember: boolean }) => Promise<PortalAuthNotice | null>;
};

export function PortalAuthPage({ portal, busy = false, extraContent, onProvider, onCredentials }: PortalAuthPageProps) {
  const config = portalConfig[portal];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState<PortalAuthNotice | null>(null);
  const [pending, setPending] = useState(false);
  const isBusy = busy || pending;

  const runAction = async (action: () => Promise<PortalAuthNotice | null>) => {
    setPending(true);
    setNotice(null);
    try {
      const nextNotice = await action();
      if (nextNotice) setNotice(nextNotice);
    } catch {
      setNotice({
        tone: 'error',
        message: bi('Sign in is temporarily unavailable. Please try again.', 'تسجيل الدخول غير متاح مؤقتًا. يرجى المحاولة مرة أخرى.'),
      });
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction(() => onCredentials
      ? onCredentials({ email, password, remember })
      : Promise.resolve({ tone: 'info', message: unavailableNotice }));
  };

  const handleProvider = (provider: PortalAuthProvider) => {
    void runAction(() => onProvider
      ? onProvider(provider)
      : Promise.resolve({ tone: 'info', message: unavailableNotice }));
  };

  const authStyle = { '--portal-auth-image': `url("${config.image}")` } as CSSProperties;

  return (
    <main className="portal-auth" data-portal={portal} style={authStyle}>
      <div className="portal-auth-atmosphere" aria-hidden="true" />

      <header className="portal-auth-toolbar">
        <Link className="portal-auth-home" to="/" aria-label="United Olympics Sports home | الرئيسية">
          <img src="/brand/united-olympics-sports-logo.png" alt="" aria-hidden="true" />
          <span>
            <strong>United Olympics Sports</strong>
            <small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small>
          </span>
        </Link>
        <div className="portal-auth-tools">
          <LanguageOrderToggle compact />
          <ThemeToggle compact />
        </div>
      </header>

      <div className="portal-auth-layout">
        <section className="portal-auth-visual" aria-labelledby={`portal-${portal}-visual-title`}>
          <PortalEmblem portal={portal} size="hero" decorative priority />
          <div className="portal-auth-visual-copy">
            <span className="portal-auth-eyebrow"><BilingualText value={config.eyebrow} /></span>
            <h1 id={`portal-${portal}-visual-title`}><BilingualText value={config.visualTitle} /></h1>
            <p><BilingualText value={config.visualCopy} /></p>
          </div>
          <div className="portal-auth-feature-grid">
            {config.features.map(({ icon: Icon, label }) => (
              <div className="portal-auth-feature" key={label.en}>
                <Icon aria-hidden="true" />
                <BilingualText value={label} />
              </div>
            ))}
          </div>
        </section>

        <section className="portal-auth-panel" aria-labelledby={`portal-${portal}-title`}>
          <div className="portal-auth-card">
            <div className="portal-auth-identity">
              <PortalEmblem portal={portal} size="auth" priority />
              <h2 id={`portal-${portal}-title`}><BilingualText value={config.title} /></h2>
              <p className="portal-auth-supporting"><BilingualText value={config.supporting} /></p>
            </div>

            {notice ? (
              <div className={`portal-auth-notice is-${notice.tone}`} id="portal-auth-status" role="status" aria-live="polite">
                <ShieldCheck aria-hidden="true" />
                <BilingualText value={notice.message} />
              </div>
            ) : (
              <p className="portal-auth-provider-state" id="portal-auth-status">
                <BilingualText value={bi('Production providers appear only when configured.', 'تعمل موفّرات الإنتاج فقط عند تهيئتها.')} />
              </p>
            )}

            <form className="portal-auth-form" onSubmit={handleSubmit} aria-label={`${config.title.en} sign in | تسجيل دخول ${config.title.ar}`}>
              <label htmlFor={`${portal}-email`}><BilingualText value={bi('Email Address', 'البريد الإلكتروني')} /></label>
              <div className="portal-auth-field">
                <Mail aria-hidden="true" />
                <input id={`${portal}-email`} name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email Address | البريد الإلكتروني" required />
              </div>

              <label htmlFor={`${portal}-password`}><BilingualText value={bi('Password', 'كلمة المرور')} /></label>
              <div className="portal-auth-field">
                <LockKeyhole aria-hidden="true" />
                <input id={`${portal}-password`} name="password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password | كلمة المرور" required />
                <button className="portal-auth-password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password | إخفاء كلمة المرور' : 'Show password | إظهار كلمة المرور'} aria-pressed={passwordVisible}>
                  {passwordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </div>

              <div className="portal-auth-form-meta">
                <label className="portal-auth-remember">
                  <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                  <BilingualText value={bi('Remember me', 'تذكرني')} />
                </label>
                <button type="button" className="portal-auth-text-button" onClick={() => setNotice({ tone: 'info', message: bi('Password recovery is not configured in this environment.', 'استعادة كلمة المرور غير مهيأة في هذه البيئة.') })}>
                  <BilingualText value={bi('Forgot password?', 'نسيت كلمة المرور؟')} />
                </button>
              </div>

              <button className="portal-auth-submit" type="submit" disabled={isBusy}>
                <span>{isBusy ? <BilingualText value={bi('Checking…', 'جارٍ التحقق…')} /> : <BilingualText value={bi('Sign In', 'تسجيل الدخول')} />}</span>
                <LockKeyhole aria-hidden="true" />
              </button>
            </form>

            <div className="portal-auth-divider"><span><BilingualText value={bi('Or continue with', 'أو تابع باستخدام')} /></span></div>

            <div className="portal-auth-providers" aria-describedby="portal-auth-status">
              <button type="button" onClick={() => handleProvider('phone')} disabled={isBusy} aria-label="Sign in with phone number | تسجيل الدخول برقم الهاتف"><Smartphone aria-hidden="true" /><BilingualText value={bi('Phone', 'الهاتف')} /></button>
              <button type="button" onClick={() => handleProvider('google')} disabled={isBusy} aria-label="Sign in with Google | تسجيل الدخول عبر Google"><span className="portal-auth-google" aria-hidden="true">G</span><BilingualText value={bi('Google', 'Google')} /></button>
              <button type="button" onClick={() => handleProvider('apple')} disabled={isBusy} aria-label="Sign in with Apple | تسجيل الدخول عبر Apple"><Apple aria-hidden="true" /><BilingualText value={bi('Apple', 'Apple')} /></button>
              <button type="button" onClick={() => handleProvider('biometric')} disabled={isBusy} aria-label="Biometric sign in | تسجيل الدخول بالبصمة"><Fingerprint aria-hidden="true" /><BilingualText value={bi('Biometric', 'البصمة')} /></button>
            </div>

            {extraContent}

            <div className="portal-auth-entry-note">
              <ShieldCheck aria-hidden="true" />
              <div>
                <BilingualText value={bi('Portal destination', 'وجهة البوابة')} />
                <Link to={config.destination}><BilingualText value={bi('Open current portal preview', 'فتح معاينة البوابة الحالية')} /></Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav className="portal-auth-switcher" aria-label="Portal login destinations | وجهات تسجيل الدخول">
        {portalLinks.map((item) => (
          <Link key={item.kind} className={item.kind === portal ? 'is-active' : ''} aria-current={item.kind === portal ? 'page' : undefined} to={item.to}>
            <PortalEmblem portal={item.kind} size="compact" decorative preloadAlternate={false} role="selector" />
            <BilingualText value={item.label} />
          </Link>
        ))}
      </nav>
    </main>
  );
}
