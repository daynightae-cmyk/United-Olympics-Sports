import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Apple,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Eye,
  EyeOff,
  Fingerprint,
  HeartHandshake,
  KeyRound,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  UserRoundCog,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { LanguageOrderToggle } from '../ui/LanguageOrderToggle';
import { ThemeToggle } from '../ui/ThemeToggle';

export type PortalAuthKind = 'admin' | 'store' | 'player' | 'parent' | 'coach';
export type PortalAuthProvider = 'phone' | 'google' | 'apple' | 'passkey' | 'biometric';

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
  icon: LucideIcon;
};

const portalConfig: Record<PortalAuthKind, PortalAuthConfig> = {
  admin: {
    title: bi('Admin Portal', 'بوابة الإدارة'),
    eyebrow: bi('Secure management access', 'دخول إداري آمن'),
    supporting: bi('Secure access to manage teams, programs, facilities and operations.', 'وصول آمن لإدارة الفرق والبرامج والمرافق والعمليات.'),
    visualTitle: bi('Lead. Organize. Develop.', 'قيادة. تنظيم. تطوير.'),
    visualCopy: bi('A disciplined sports command surface built for confident daily operations.', 'مساحة قيادة رياضية منضبطة لإدارة العمل اليومي بثقة.'),
    image: '/media/sports/football/football-05-teamwork.webp',
    destination: '/admin',
    icon: UserRoundCog,
    features: [
      { icon: UsersRound, label: bi('People', 'الأفراد') },
      { icon: CalendarDays, label: bi('Operations', 'العمليات') },
      { icon: BarChart3, label: bi('Insight', 'الرؤية') },
    ],
  },
  store: {
    title: bi('Store Portal', 'بوابة المتجر'),
    eyebrow: bi('Premium sports retail', 'تسوق رياضي فاخر'),
    supporting: bi('Secure shopping access to your sports products, orders and account.', 'تسوق آمن لمنتجاتك الرياضية وطلباتك وحسابك.'),
    visualTitle: bi('Gear your passion', 'جهّز شغفك'),
    visualCopy: bi('A premium retail experience for United Olympics Sports members and supporters.', 'تجربة تسوق فاخرة لأعضاء ومتابعي يونايتد أوليمبيكس سبورت.'),
    image: '/media/sports/football/football-03-brand.webp',
    destination: '/store/account',
    icon: ShoppingBag,
    features: [
      { icon: ShoppingBag, label: bi('Shop', 'التسوق') },
      { icon: PackageCheck, label: bi('Orders', 'الطلبات') },
      { icon: ShieldCheck, label: bi('Account', 'الحساب') },
    ],
  },
  player: {
    title: bi('Player Portal', 'بوابة اللاعب'),
    eyebrow: bi('Athlete access', 'دخول الرياضي'),
    supporting: bi('Secure access to your training, attendance, progress and achievements.', 'وصول آمن إلى تدريباتك وحضورك وتقدمك وإنجازاتك.'),
    visualTitle: bi('Play. Train. Improve.', 'العب. تدرّب. تطوّر.'),
    visualCopy: bi('Your training journey, feedback and achievements in one focused athlete space.', 'رحلتك التدريبية وملاحظاتك وإنجازاتك في مساحة رياضية واحدة.'),
    image: '/media/sports/football/football-02-training.webp',
    destination: '/player/home',
    icon: Trophy,
    features: [
      { icon: Target, label: bi('Training', 'التدريب') },
      { icon: BarChart3, label: bi('Progress', 'التقدم') },
      { icon: Trophy, label: bi('Achievements', 'الإنجازات') },
    ],
  },
  parent: {
    title: bi('Parent Portal', 'بوابة ولي الأمر'),
    eyebrow: bi('Trusted family access', 'دخول عائلي موثوق'),
    supporting: bi("Your family's secure access to your child's progress, activities and important updates.", 'وصول عائلتك الآمن لمتابعة تقدم طفلك وأنشطته والتنبيهات المهمة.'),
    visualTitle: bi('Their journey. Our support.', 'رحلتهم. دعمنا.'),
    visualCopy: bi('A reassuring place to follow schedules, progress, attendance and communication.', 'مساحة مطمئنة لمتابعة الجداول والتقدم والحضور والتواصل.'),
    image: '/media/sports/football/football-06-coach-child.webp',
    destination: '/parent',
    icon: HeartHandshake,
    features: [
      { icon: HeartHandshake, label: bi('Support', 'الدعم') },
      { icon: CalendarDays, label: bi('Schedules', 'الجداول') },
      { icon: ShieldCheck, label: bi('Trust', 'الثقة') },
    ],
  },
  coach: {
    title: bi('Coach Portal', 'بوابة المدرب'),
    eyebrow: bi('Professional coaching access', 'دخول المدربين'),
    supporting: bi('Secure coaching access to sessions, players, schedules and training control.', 'وصول آمن للمدربين إلى الحصص واللاعبين والجداول والتحكم في التدريب.'),
    visualTitle: bi('Prepare. Lead. Develop.', 'خطط. قد. طوّر.'),
    visualCopy: bi('A tactical workspace for sessions, teams and athlete development.', 'مساحة تكتيكية للحصص والفرق وتطوير الرياضيين.'),
    image: '/media/sports/football/football-10-coaching.webp',
    destination: '/coach',
    icon: Target,
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

const providerLabels: Record<PortalAuthProvider, { en: string; ar: string }> = {
  phone: bi('Phone Number', 'رقم الهاتف'),
  google: bi('Google', 'جوجل'),
  apple: bi('Apple / iPhone', 'Apple / آيفون'),
  passkey: bi('Passkey', 'مفتاح مرور'),
  biometric: bi('Fingerprint', 'بصمة الإصبع'),
};

const providerIcons: Partial<Record<PortalAuthProvider, LucideIcon>> = {
  phone: Smartphone,
  apple: Apple,
  passkey: KeyRound,
  biometric: Fingerprint,
};

const unavailableNotice = bi(
  'This authentication method is not configured in the current environment.',
  'طريقة تسجيل الدخول هذه غير مهيأة في البيئة الحالية.',
);

type PortalAuthPageProps = {
  portal: PortalAuthKind;
  busy?: boolean;
  extraContent?: ReactNode;
  providers?: PortalAuthProvider[];
  onProvider?: (provider: PortalAuthProvider) => Promise<PortalAuthNotice | null>;
  onCredentials?: (credentials: { email: string; password: string; remember: boolean }) => Promise<PortalAuthNotice | null>;
};

function ProviderGlyph({ provider }: { provider: PortalAuthProvider }) {
  if (provider === 'google') {
    return <span className="portal-auth-google" aria-hidden="true">G</span>;
  }
  const Icon = providerIcons[provider] ?? ShieldCheck;
  return <Icon aria-hidden="true" />;
}

export function PortalAuthPage({
  portal,
  busy = false,
  extraContent,
  providers = [],
  onProvider,
  onCredentials,
}: PortalAuthPageProps) {
  const config = portalConfig[portal];
  const PortalIcon = config.icon;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState<PortalAuthNotice | null>(null);
  const [pending, setPending] = useState(false);
  const isBusy = busy || pending;
  const hasCredentials = typeof onCredentials === 'function';
  const hasProviders = providers.length > 0;
  const heroStyle = { '--portal-auth-image': 'url("' + config.image + '")' } as CSSProperties;

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

  const providerActions: Record<PortalAuthProvider, () => void> = {
    phone: () => handleProvider('phone'),
    google: () => handleProvider('google'),
    apple: () => handleProvider('apple'),
    passkey: () => handleProvider('passkey'),
    biometric: () => handleProvider('biometric'),
  };

  return (
    <main className="portal-auth" data-portal={portal}>
      <div className="portal-auth-atmosphere" aria-hidden="true" />

      <header className="portal-auth-toolbar">
        <div className="portal-auth-tools">
          <ThemeToggle compact />
          <LanguageOrderToggle compact />
        </div>
        <Link className="portal-auth-back" to="/">
          <BilingualText value={bi('Back to website', 'العودة للموقع')} />
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <div className="portal-auth-layout">
        <section className="portal-auth-panel" aria-labelledby={'portal-' + portal + '-title'}>
          <div className="portal-auth-card">
            <div className="portal-auth-identity">
              <div className="portal-auth-role-mark" aria-hidden="true"><PortalIcon /></div>
              <span className="portal-auth-eyebrow"><BilingualText value={config.eyebrow} /></span>
              <h1 id={'portal-' + portal + '-title'}><BilingualText value={config.title} /></h1>
              <p className="portal-auth-supporting"><BilingualText value={config.supporting} /></p>
            </div>

            {notice ? (
              <div className={'portal-auth-notice is-' + notice.tone} id="portal-auth-status" role="status" aria-live="polite">
                <ShieldCheck aria-hidden="true" />
                <BilingualText value={notice.message} />
              </div>
            ) : hasProviders ? (
              <p className="portal-auth-provider-state" id="portal-auth-status">
                <BilingualText value={providers.length === 1
                  ? bi('Use the secure sign-in method available for this portal.', 'استخدم طريقة الدخول الآمنة المتاحة لهذه البوابة.')
                  : bi('Choose one of the secure sign-in methods available for this portal.', 'اختر إحدى طرق الدخول الآمنة المتاحة لهذه البوابة.')} />
              </p>
            ) : null}

            {hasCredentials && (
              <form className="portal-auth-form" onSubmit={handleSubmit} aria-label={config.title.en + ' sign in | تسجيل دخول ' + config.title.ar}>
                <label htmlFor={portal + '-email'}><BilingualText value={bi('Email Address', 'البريد الإلكتروني')} /></label>
                <div className="portal-auth-field">
                  <Mail aria-hidden="true" />
                  <input id={portal + '-email'} name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email Address | البريد الإلكتروني" required />
                </div>

                <label htmlFor={portal + '-password'}><BilingualText value={bi('Password', 'كلمة المرور')} /></label>
                <div className="portal-auth-field">
                  <LockKeyhole aria-hidden="true" />
                  <input id={portal + '-password'} name="password" type={passwordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password | كلمة المرور" required />
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
            )}

            {hasCredentials && hasProviders && (
              <div className="portal-auth-divider"><span><BilingualText value={bi('Or sign in with', 'أو سجل الدخول عبر')} /></span></div>
            )}

            {hasProviders && (
              <div className="portal-auth-providers" aria-describedby="portal-auth-status" data-provider-count={providers.length}>
                {providers.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={providerActions[provider]}
                    disabled={isBusy}
                    aria-label={providerLabels[provider].en + ' | ' + providerLabels[provider].ar}
                  >
                    <ProviderGlyph provider={provider} />
                    <BilingualText value={providerLabels[provider]} />
                  </button>
                ))}
              </div>
            )}

            {extraContent}

            {(providers.includes('passkey') || providers.includes('biometric')) && (
              <div className="portal-auth-entry-note">
                <KeyRound aria-hidden="true" />
                <div>
                  <BilingualText value={bi('Passkey & biometric security', 'أمان مفتاح المرور والبصمة')} />
                  <Link to={'/auth/passkeys?returnTo=' + encodeURIComponent(config.destination)}><BilingualText value={bi('Set up or manage this device', 'إعداد أو إدارة هذا الجهاز')} /></Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="portal-auth-visual" style={heroStyle} aria-labelledby={'portal-' + portal + '-visual-title'}>
          <div className="portal-auth-visual-overlay" aria-hidden="true" />
          <div className="portal-auth-brand-lockup">
            <img src="/brand/united-olympics-sports-logo.png" alt="" aria-hidden="true" />
            <div>
              <strong>United Olympics Sports</strong>
              <span lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</span>
            </div>
          </div>

          <div className="portal-auth-visual-copy">
            <span className="portal-auth-visual-kicker"><BilingualText value={config.title} /></span>
            <h2 id={'portal-' + portal + '-visual-title'}><BilingualText value={config.visualTitle} /></h2>
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
      </div>

      {portal !== 'store' && (
        <nav className="portal-auth-switcher" aria-label="Portal login destinations | وجهات تسجيل الدخول">
          {portalLinks.map((item) => (
            <Link key={item.kind} className={item.kind === portal ? 'is-active' : ''} aria-current={item.kind === portal ? 'page' : undefined} to={item.to}>
              <BilingualText value={item.label} />
            </Link>
          ))}
        </nav>
      )}
    </main>
  );
}
