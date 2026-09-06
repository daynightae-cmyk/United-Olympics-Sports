import {
  createContext,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleDot,
  Compass,
  Eye,
  Focus,
  Languages,
  Mail,
  Menu,
  Route as RouteIcon,
  Send,
  ShieldCheck,
  Target,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  PORTAL_LINKS,
  PUBLIC_BRANCHES,
  PUBLIC_COACHES,
  PUBLIC_PROGRAMS,
  PUBLIC_SOCIAL_LINKS,
  PUBLIC_SPORTS,
  type PublicSport,
} from '../../data/public/publicContent';
import {
  UOS_PUBLIC_MEDIA,
  sourceSet,
  type LocalizedText,
  type PublicLocale,
  type PublicMediaAsset,
} from '../../data/public/publicMedia';
import '../../styles/public-relaunch.css';

const LocaleContext = createContext<{ locale: PublicLocale; setLocale: (locale: PublicLocale) => void } | null>(null);

const t = (value: LocalizedText, locale: PublicLocale) => value[locale];

function usePublicLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('Public locale context is unavailable.');
  return value;
}

function Copy({ children }: { children: LocalizedText }) {
  const { locale } = usePublicLocale();
  return <>{t(children, locale)}</>;
}

function usePageMeta(title: LocalizedText, description: LocalizedText) {
  const { locale } = usePublicLocale();
  useEffect(() => {
    document.title = `${t(title, locale)} | United Olympics Sports`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    meta.content = t(description, locale);
  }, [description, locale, title]);
}

function PublicImage({
  asset,
  className = '',
  eager = false,
  sizes = '(max-width: 768px) 100vw, 50vw',
}: {
  asset: PublicMediaAsset;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const { locale } = usePublicLocale();
  const [failed, setFailed] = useState(false);
  const style = {
    '--media-desktop': asset.objectPosition.desktop,
    '--media-tablet': asset.objectPosition.tablet,
    '--media-mobile': asset.objectPosition.mobile,
    aspectRatio: asset.aspectRatio,
  } as CSSProperties;
  const avif = sourceSet(asset, 'avif');
  const webp = sourceSet(asset, 'webp');

  return (
    <figure className={`uos-media ${className} ${failed ? 'is-failed' : ''}`} style={style}>
      {failed ? (
        <span className="uos-media-fallback" role="img" aria-label={t(asset.alt, locale)}>
          <span>United Olympics Sports</span>
        </span>
      ) : (
        <picture>
          {avif ? <source type="image/avif" srcSet={avif} sizes={sizes} /> : null}
          {webp ? <source type="image/webp" srcSet={webp} sizes={sizes} /> : null}
          <img
            src={asset.src}
            alt={t(asset.alt, locale)}
            width={asset.width}
            height={asset.height}
            loading={eager || asset.priority ? 'eager' : 'lazy'}
            fetchPriority={eager || asset.priority ? 'high' : 'auto'}
            decoding="async"
            onError={() => setFailed(true)}
          />
        </picture>
      )}
    </figure>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={`uos-brand ${compact ? 'is-compact' : ''}`} to="/" aria-label="United Olympics Sports">
      <img src="/brand/united-olympics-sports-logo.png" alt="" width={56} height={56} />
      <span><strong>United Olympics Sports</strong><small>يونايتد أوليمبيكس سبورت</small></span>
    </Link>
  );
}

const PUBLIC_NAV = [
  { path: '/', label: { ar: 'الرئيسية', en: 'Home' } },
  { path: '/about', label: { ar: 'من نحن', en: 'About' } },
  { path: '/sports', label: { ar: 'الرياضات', en: 'Sports' } },
  { path: '/programs', label: { ar: 'البرامج', en: 'Programs' } },
  { path: '/coaches', label: { ar: 'فلسفة التدريب', en: 'Coaching' } },
  { path: '/contact', label: { ar: 'تواصل معنا', en: 'Contact' } },
] as const;

function PortalLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="uos-portal-links">
      {PORTAL_LINKS.map((portal) => (
        <Link key={portal.path} to={portal.path} onClick={onNavigate}>
          <Copy>{portal.label}</Copy><ArrowRight aria-hidden="true" />
        </Link>
      ))}
    </div>
  );
}

function PublicHeader() {
  const { locale, setLocale } = usePublicLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(drawer.current?.querySelectorAll<HTMLElement>('a, button') ?? []);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const changeLocale = () => setLocale(locale === 'ar' ? 'en' : 'ar');

  return (
    <header className={`uos-site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="uos-header-inner">
        <Brand compact />
        <nav className="uos-desktop-nav" aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Primary navigation'}>
          {PUBLIC_NAV.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}><Copy>{item.label}</Copy></NavLink>
          ))}
          <NavLink to="/store"><Copy>{{ ar: 'المتجر', en: 'Store' }}</Copy></NavLink>
        </nav>
        <div className="uos-header-actions">
          <button className="uos-language" type="button" onClick={changeLocale} aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
            <Languages aria-hidden="true" /><span>{locale === 'ar' ? 'EN' : 'ع'}</span>
          </button>
          <details className="uos-login-menu">
            <summary><Copy>{{ ar: 'تسجيل الدخول', en: 'Log in' }}</Copy><ChevronDown aria-hidden="true" /></summary>
            <PortalLinks />
          </details>
          <button ref={menuButton} className="uos-menu-trigger" type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="uos-mobile-menu" aria-label={locale === 'ar' ? 'فتح القائمة' : 'Open menu'}>
            <Menu aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className={`uos-drawer-backdrop ${open ? 'is-open' : ''}`} onMouseDown={() => setOpen(false)} aria-hidden={!open} />
      <div ref={drawer} id="uos-mobile-menu" className={`uos-mobile-drawer ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label={locale === 'ar' ? 'قائمة الموقع' : 'Site menu'}>
        <div className="uos-drawer-head"><Brand compact /><button type="button" onClick={() => setOpen(false)} aria-label={locale === 'ar' ? 'إغلاق القائمة' : 'Close menu'}><X /></button></div>
        <nav aria-label={locale === 'ar' ? 'التنقل عبر الهاتف' : 'Mobile navigation'}>
          {PUBLIC_NAV.map((item) => <NavLink key={item.path} to={item.path} end={item.path === '/'}><Copy>{item.label}</Copy><ArrowRight /></NavLink>)}
          <NavLink to="/store"><Copy>{{ ar: 'المتجر', en: 'Store' }}</Copy><ArrowRight /></NavLink>
        </nav>
        <div className="uos-drawer-portals"><span><Copy>{{ ar: 'البوابات', en: 'Portals' }}</Copy></span><PortalLinks /></div>
        <button className="uos-drawer-language" type="button" onClick={changeLocale}><Languages /><span>{locale === 'ar' ? 'English' : 'العربية'}</span></button>
      </div>
    </header>
  );
}

function ButtonLink({ to, children, variant = 'primary' }: { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'text' }) {
  return <Link className={`uos-button is-${variant}`} to={to}>{children}<ArrowRight aria-hidden="true" /></Link>;
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: LocalizedText; title: LocalizedText; body?: LocalizedText }) {
  return <header className="uos-section-title uos-reveal"><span>{<Copy>{eyebrow}</Copy>}</span><h2><Copy>{title}</Copy></h2>{body ? <p><Copy>{body}</Copy></p> : null}</header>;
}

function SportCard({ sport, featured = false }: { sport: PublicSport; featured?: boolean }) {
  const asset = UOS_PUBLIC_MEDIA.sports[sport.id].card;
  return (
    <article className={`uos-sport-card uos-reveal ${featured ? 'is-featured' : ''}`} style={{ '--sport-accent': sport.accent } as CSSProperties}>
      <PublicImage asset={asset} sizes={featured ? '(max-width: 760px) 100vw, 52vw' : '(max-width: 760px) 100vw, 30vw'} />
      <div><span className="uos-sport-index">0{PUBLIC_SPORTS.indexOf(sport) + 1}</span><h3><Copy>{sport.name}</Copy></h3><p><Copy>{sport.summary}</Copy></p><Link to={`/sports/${sport.slug}`} aria-label={`${t(sport.name, 'ar')} / ${t(sport.name, 'en')}`}><Copy>{{ ar: 'اكتشف الرياضة', en: 'Explore sport' }}</Copy><ArrowRight /></Link></div>
    </article>
  );
}

function ClosingCta({ crop = 'home' }: { crop?: 'home' | 'programs' | 'contact' | 'coaching' }) {
  return (
    <section className={`uos-closing-cta crop-${crop} uos-reveal`}>
      <PublicImage asset={UOS_PUBLIC_MEDIA.home.closing} sizes="100vw" />
      <div><span><Copy>{{ ar: 'خطوتك التالية', en: 'Your next step' }}</Copy></span><h2><Copy>{{ ar: 'ابدأ رحلتك الرياضية بثقة', en: 'Begin your sporting journey with confidence' }}</Copy></h2><p><Copy>{{ ar: 'اكتشف البيئة الرياضية التي تساعدك على التطور بانضباط وروح فريق.', en: 'Discover a sporting environment designed for disciplined progress and teamwork.' }}</Copy></p><ButtonLink to="/contact"><Copy>{{ ar: 'تواصل معنا', en: 'Contact us' }}</Copy></ButtonLink></div>
    </section>
  );
}

function HomePage() {
  usePageMeta({ ar: 'الرئيسية', en: 'Home' }, { ar: 'بيئة رياضية منظمة لتطوير المهارة والانضباط والثقة والعمل الجماعي.', en: 'A structured sporting environment for skill, discipline, confidence and teamwork.' });
  return (
    <>
      <section className="uos-home-hero">
        <PublicImage asset={UOS_PUBLIC_MEDIA.home.hero} eager sizes="100vw" />
        <div className="uos-hero-shade" />
        <div className="uos-home-hero-copy uos-reveal"><span>United Olympics Sports</span><h1><Copy>{{ ar: 'من الطفولة نصنع الأبطال', en: 'From childhood, we build champions' }}</Copy></h1><p><Copy>{{ ar: 'نوفر بيئة رياضية منظمة تساعد الناشئين على بناء المهارة والانضباط والثقة والعمل الجماعي من خلال تطور متدرج وهادف.', en: 'We provide a structured sporting environment where young athletes build skill, discipline, confidence and teamwork through purposeful progression.' }}</Copy></p><div><ButtonLink to="/sports"><Copy>{{ ar: 'استكشف الرياضات', en: 'Explore sports' }}</Copy></ButtonLink><ButtonLink to="/programs" variant="secondary"><Copy>{{ ar: 'اكتشف برامجنا', en: 'Discover programs' }}</Copy></ButtonLink></div></div>
      </section>

      <section className="uos-value-strip" aria-label="United Olympics Sports values">
        {[
          { icon: Target, title: { ar: 'تدريب منظم', en: 'Structured training' }, body: { ar: 'هدف واضح لكل خطوة.', en: 'A clear purpose for every step.' } },
          { icon: TrendingUp, title: { ar: 'نمو تدريجي', en: 'Gradual progress' }, body: { ar: 'تطور هادئ يمكن بناؤه.', en: 'Progress that can be built upon.' } },
          { icon: UsersRound, title: { ar: 'روح فريق', en: 'Team spirit' }, body: { ar: 'ثقة ومسؤولية مشتركة.', en: 'Confidence and shared responsibility.' } },
        ].map(({ icon: Icon, title, body }) => <article key={title.en}><Icon aria-hidden="true" /><div><h2><Copy>{title}</Copy></h2><p><Copy>{body}</Copy></p></div></article>)}
      </section>

      <section className="uos-section uos-sports-section">
        <SectionTitle eyebrow={{ ar: 'اختر رياضتك', en: 'Choose your sport' }} title={{ ar: 'مسارات مختلفة، هدف واحد: التقدم', en: 'Different paths. One purpose: progress.' }} body={{ ar: 'ست رياضات تمنح كل لاعب مساحة لاكتشاف قدراته وبناء عاداته الرياضية.', en: 'Six sports give every athlete room to discover ability and build lasting sporting habits.' }} />
        <div className="uos-sports-grid">{PUBLIC_SPORTS.map((sport, index) => <SportCard key={sport.id} sport={sport} featured={index === 0} />)}</div>
      </section>

      <section className="uos-progress-section">
        <PublicImage asset={UOS_PUBLIC_MEDIA.home.progress} sizes="(max-width: 820px) 100vw, 55vw" />
        <div className="uos-progress-copy uos-reveal"><span><Copy>{{ ar: 'كيف نبني التقدم', en: 'How we build progress' }}</Copy></span><h2><Copy>{{ ar: 'التقدم عادة تُبنى خطوة بخطوة', en: 'Progress is a habit built step by step' }}</Copy></h2><ol>{[
          { title: { ar: 'الأساس', en: 'Foundation' }, body: { ar: 'حركة صحيحة وفهم واضح للمبادئ.', en: 'Sound movement and clear understanding.' } },
          { title: { ar: 'التطوير', en: 'Development' }, body: { ar: 'تكرار هادف وملاحظات تساعد على التحسن.', en: 'Purposeful repetition and useful feedback.' } },
          { title: { ar: 'الأداء', en: 'Performance' }, body: { ar: 'ثقة أكبر في توظيف المهارة داخل التدريب.', en: 'Greater confidence applying skill in training.' } },
        ].map((stage, index) => <li key={stage.title.en}><span>0{index + 1}</span><div><h3><Copy>{stage.title}</Copy></h3><p><Copy>{stage.body}</Copy></p></div></li>)}</ol></div>
      </section>

      <section className="uos-section uos-programs-preview">
        <SectionTitle eyebrow={{ ar: 'البرامج', en: 'Programs' }} title={{ ar: 'الوضوح قبل الاختيار', en: 'Clarity before choosing' }} body={{ ar: 'ننشر تفاصيل البرامج عند اعتمادها فقط، حتى يكون قرارك مبنيًا على معلومات دقيقة.', en: 'Program details are published only when approved, so your decision is based on accurate information.' }} />
        {PUBLIC_PROGRAMS.length === 0 ? <div className="uos-empty-state"><Compass /><h3><Copy>{{ ar: 'تواصل معنا لمعرفة المسارات المتاحة', en: 'Contact us to learn about available paths' }}</Copy></h3><p><Copy>{{ ar: 'لم تُنشر برامج معتمدة على الموقع بعد.', en: 'No approved programs are currently published.' }}</Copy></p><ButtonLink to="/contact" variant="secondary"><Copy>{{ ar: 'إرسال استفسار', en: 'Send an enquiry' }}</Copy></ButtonLink></div> : null}
      </section>

      <section className="uos-section uos-field-moments">
        <SectionTitle eyebrow={{ ar: 'من قلب التدريب', en: 'From the field' }} title={{ ar: 'لحظات تصنع الوعي والثقة', en: 'Moments that build awareness and confidence' }} />
        <div className="uos-field-grid"><PublicImage asset={UOS_PUBLIC_MEDIA.sports.football.technique} /><PublicImage asset={UOS_PUBLIC_MEDIA.sports.swimming.technique} /><PublicImage asset={UOS_PUBLIC_MEDIA.sports.basketball.technique} /></div>
      </section>
      <ClosingCta />
    </>
  );
}

function AboutPage() {
  usePageMeta({ ar: 'من نحن', en: 'About us' }, { ar: 'منهج هادف للنمو الرياضي المتدرج وبناء الثقة والانضباط.', en: 'A purposeful approach to gradual sporting growth, confidence and discipline.' });
  return <>
    <PageHero asset={UOS_PUBLIC_MEDIA.about.hero} eyebrow={{ ar: 'من نحن', en: 'About us' }} title={{ ar: 'منهج هادف للنمو الرياضي', en: 'A purposeful approach to sporting growth' }} body={{ ar: 'نؤمن بأن التطور الرياضي يبدأ ببيئة واضحة، تدريب متدرج، وعلاقة إنسانية تجعل اللاعب أكثر ثقة ومسؤولية.', en: 'We believe sporting development begins with a clear environment, gradual training and a human connection that builds confidence and responsibility.' }} />
    <section className="uos-section uos-about-story"><div className="uos-story-copy uos-reveal"><span><Copy>{{ ar: 'قصتنا', en: 'Our story' }}</Copy></span><h2><Copy>{{ ar: 'النمو ليس لحظة واحدة', en: 'Growth is never one moment' }}</Copy></h2><p><Copy>{{ ar: 'هو حضور مستمر، ممارسة واعية، وملاحظات تساعد اللاعب على فهم نفسه وحركته ودوره داخل الفريق. لذلك نعطي لكل خطوة معناها، ولكل رياضة شخصيتها، ولكل لاعب مساحة للتطور.', en: 'It is consistent presence, thoughtful practice and feedback that helps an athlete understand movement, self and role within a team. Every step has meaning, every sport has character and every athlete has room to grow.' }}</Copy></p></div><PublicImage asset={UOS_PUBLIC_MEDIA.about.reflection} /></section>
    <section className="uos-section uos-principles"><SectionTitle eyebrow={{ ar: 'ما يوجّهنا', en: 'What guides us' }} title={{ ar: 'رؤية واضحة. رسالة إنسانية. قيم عملية.', en: 'Clear vision. Human purpose. Practical values.' }} /><div className="uos-principle-grid">{[
      { icon: Eye, title: { ar: 'الرؤية', en: 'Vision' }, body: { ar: 'بيئة رياضية تساعد الناشئين على اكتشاف قدراتهم وبناء ثقتهم.', en: 'A sporting environment helping young athletes discover ability and build confidence.' } },
      { icon: Target, title: { ar: 'الرسالة', en: 'Mission' }, body: { ar: 'تقديم تجربة منظمة تجمع المهارة والانضباط وروح الفريق.', en: 'To offer an organised experience combining skill, discipline and team spirit.' } },
      { icon: ShieldCheck, title: { ar: 'القيم', en: 'Values' }, body: { ar: 'الاحترام، المسؤولية، الاتساق، والتقدم الهادف.', en: 'Respect, responsibility, consistency and purposeful progress.' } },
    ].map(({ icon: Icon, title, body }) => <article className="uos-reveal" key={title.en}><Icon /><h3><Copy>{title}</Copy></h3><p><Copy>{body}</Copy></p></article>)}</div></section>
    <DevelopmentPath />
    <ClosingCta />
  </>;
}

function DevelopmentPath() {
  return <section className="uos-section uos-development-path"><SectionTitle eyebrow={{ ar: 'مسار التطور', en: 'Development path' }} title={{ ar: 'من تأسيس الحركة إلى الثقة في الأداء', en: 'From movement foundations to confident performance' }} /><div>{[
    { ar: 'تأسيس الحركة', en: 'Movement foundation' }, { ar: 'تطوير المهارة', en: 'Skill development' }, { ar: 'الثقة في الأداء', en: 'Performance confidence' },
  ].map((item, index) => <article key={item.en}><span>0{index + 1}</span><CircleDot /><h3><Copy>{item}</Copy></h3></article>)}</div></section>;
}

function PageHero({ asset, eyebrow, title, body, actions }: { asset: PublicMediaAsset; eyebrow: LocalizedText; title: LocalizedText; body: LocalizedText; actions?: ReactNode }) {
  return <section className="uos-page-hero"><PublicImage asset={asset} eager sizes="100vw" /><div className="uos-hero-shade" /><div className="uos-page-hero-copy uos-reveal"><span><Copy>{eyebrow}</Copy></span><h1><Copy>{title}</Copy></h1><p><Copy>{body}</Copy></p>{actions}</div></section>;
}

function SportsPage() {
  usePageMeta({ ar: 'الرياضات', en: 'Sports' }, { ar: 'اكتشف ست رياضات تساعد الناشئين على بناء المهارة والثقة والانضباط.', en: 'Explore six sports that help young athletes build skill, confidence and discipline.' });
  return <section className="uos-page-shell uos-sports-index"><header className="uos-editorial-head uos-reveal"><span><Copy>{{ ar: 'الرياضات', en: 'Sports' }}</Copy></span><h1><Copy>{{ ar: 'اكتشف الرياضة التي تحرك شغفك', en: 'Discover the sport that moves you' }}</Copy></h1><p><Copy>{{ ar: 'لكل رياضة إيقاعها، ولكل لاعب طريقته في التعلم والتطور.', en: 'Every sport has its rhythm, and every athlete has a personal way to learn and grow.' }}</Copy></p></header><div className="uos-sports-grid">{PUBLIC_SPORTS.map((sport) => <SportCard key={sport.id} sport={sport} />)}</div></section>;
}

function SportPage({ sport }: { sport: PublicSport }) {
  const media = UOS_PUBLIC_MEDIA.sports[sport.id];
  usePageMeta(sport.name, sport.heroSummary);
  const technique = 'technique' in media ? media.technique : undefined;
  return <>
    <PageHero asset={media.hero} eyebrow={sport.name} title={sport.heroSummary} body={sport.summary} actions={<div className="uos-hero-actions"><ButtonLink to="/programs"><Copy>{{ ar: 'استكشف البرامج', en: 'Explore programs' }}</Copy></ButtonLink><ButtonLink to="/sports" variant="secondary"><Copy>{{ ar: 'العودة إلى الرياضات', en: 'Back to sports' }}</Copy></ButtonLink></div>} />
    <section className="uos-section uos-sport-develops" style={{ '--sport-accent': sport.accent } as CSSProperties}><SectionTitle eyebrow={{ ar: 'ما الذي تطوره هذه الرياضة؟', en: 'What does this sport develop?' }} title={{ ar: 'مهارات تتحرك مع اللاعب', en: 'Skills that move with the athlete' }} /><div>{sport.themes.map((theme, index) => <article className="uos-reveal" key={theme.en}><span>0{index + 1}</span><Focus /><h3><Copy>{theme}</Copy></h3></article>)}</div></section>
    <section className={`uos-section uos-sport-path ${technique ? 'has-image' : ''}`}><div className="uos-sport-path-copy"><SectionTitle eyebrow={{ ar: 'التطور', en: 'Development' }} title={{ ar: 'بناء المهارة بترتيب واضح', en: 'Building skill in a clear sequence' }} /><ol>{sport.path.map((stage, index) => <li key={stage.en}><span>0{index + 1}</span><h3><Copy>{stage}</Copy></h3></li>)}</ol></div>{technique ? <PublicImage asset={technique} /> : null}</section>
    <section className="uos-section uos-related-programs"><SectionTitle eyebrow={{ ar: 'البرامج المرتبطة', en: 'Related programs' }} title={{ ar: 'المعلومات الدقيقة أولًا', en: 'Accurate information comes first' }} /><div className="uos-empty-state"><RouteIcon /><h3><Copy>{{ ar: 'لم تُنشر برامج معتمدة لهذه الرياضة بعد', en: 'No approved programs are published for this sport yet' }}</Copy></h3><ButtonLink to="/contact" variant="secondary"><Copy>{{ ar: 'استفسر عن المسارات', en: 'Ask about pathways' }}</Copy></ButtonLink></div></section>
    <ClosingCta />
  </>;
}

function ProgramsPage() {
  usePageMeta({ ar: 'البرامج', en: 'Programs' }, { ar: 'مسارات تدريب تُنشر بتفاصيل دقيقة بعد اعتمادها.', en: 'Training pathways published with accurate details after approval.' });
  return <><PageHero asset={UOS_PUBLIC_MEDIA.home.closing} eyebrow={{ ar: 'البرامج', en: 'Programs' }} title={{ ar: 'برامج مصممة للتطور', en: 'Programs designed for progress' }} body={{ ar: 'نشارك اسم البرنامج ومحوره ومستواه ومواعيده فقط بعد اعتمادها رسميًا.', en: 'Program names, focus, level and schedules are shared only after official approval.' }} /><section className="uos-section"><div className="uos-empty-state is-large"><Compass /><h2><Copy>{{ ar: 'تواصل معنا لمعرفة المسارات المتاحة', en: 'Contact us to learn about available pathways' }}</Copy></h2><p><Copy>{{ ar: 'لا توجد برامج معتمدة منشورة حاليًا، ولن نعرض أعمارًا أو أسعارًا أو مواعيد غير مؤكدة.', en: 'No approved programs are currently published. Unconfirmed ages, prices or schedules will not be shown.' }}</Copy></p><ButtonLink to="/contact"><Copy>{{ ar: 'تواصل معنا', en: 'Contact us' }}</Copy></ButtonLink></div></section><ClosingCta crop="programs" /></>;
}

function CoachingPage() {
  usePageMeta({ ar: 'فلسفة التدريب', en: 'Coaching philosophy' }, { ar: 'الملاحظة والتقييم والتوجيه في دورة تدريبية واضحة.', en: 'Observation, evaluation and guidance in a clear training loop.' });
  return <><PageHero asset={UOS_PUBLIC_MEDIA.home.progress} eyebrow={{ ar: 'فلسفة التدريب', en: 'Coaching philosophy' }} title={{ ar: 'نلاحظ. نوجّه. ثم نبني الخطوة التالية.', en: 'Observe. Guide. Build the next step.' }} body={{ ar: 'التدريب الجيد لا يملأ الوقت؛ بل يقرأ الحركة ويقدم ملاحظة واضحة تساعد اللاعب على التطور.', en: 'Good coaching does not fill time. It reads movement and offers clear feedback that helps an athlete progress.' }} /><section className="uos-section uos-coaching-loop"><SectionTitle eyebrow={{ ar: 'دورة التدريب', en: 'Training loop' }} title={{ ar: 'توجيه متصل بسياق اللاعب', en: 'Guidance connected to the athlete' }} /><div>{[
    { icon: Eye, title: { ar: 'الملاحظة', en: 'Observation' }, body: { ar: 'فهم الحركة والاستجابة داخل التدريب.', en: 'Understand movement and response in training.' } },
    { icon: Target, title: { ar: 'التقييم المنظم', en: 'Structured evaluation' }, body: { ar: 'تحديد ما يحتاج إلى تركيز أكبر.', en: 'Identify what needs greater focus.' } },
    { icon: Check, title: { ar: 'الملاحظات', en: 'Feedback' }, body: { ar: 'توجيه واضح يمكن تطبيقه.', en: 'Clear guidance that can be applied.' } },
    { icon: Compass, title: { ar: 'الخطوة التالية', en: 'Next step' }, body: { ar: 'هدف قريب يحافظ على التقدم.', en: 'A near-term focus that sustains progress.' } },
  ].map(({ icon: Icon, title, body }, index) => <article className="uos-reveal" key={title.en}><span>0{index + 1}</span><Icon /><h3><Copy>{title}</Copy></h3><p><Copy>{body}</Copy></p></article>)}</div></section><section className="uos-section uos-coaching-reflection"><PublicImage asset={UOS_PUBLIC_MEDIA.about.reflection} /><div className="uos-reveal"><span><Copy>{{ ar: 'التأمل', en: 'Reflection' }}</Copy></span><h2><Copy>{{ ar: 'التطور يحتاج إلى اتساق، لا استعجال', en: 'Development needs consistency, not haste' }}</Copy></h2><p><Copy>{{ ar: 'الممارسة اليومية والملاحظة الصادقة والثقة المتدرجة تصنع أساسًا أقوى من الوعود السريعة.', en: 'Daily practice, honest observation and gradual confidence create a stronger foundation than quick promises.' }}</Copy></p></div></section>{PUBLIC_COACHES.length === 0 ? null : null}<ClosingCta crop="coaching" /></>;
}

function ContactPage() {
  usePageMeta({ ar: 'تواصل معنا', en: 'Contact us' }, { ar: 'أرسل استفسارك عن الرياضات والمسارات المتاحة.', en: 'Send an enquiry about sports and available pathways.' });
  const { locale } = usePublicLocale();
  const [notice, setNotice] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setNotice(true); };
  return <><PageHero asset={UOS_PUBLIC_MEDIA.home.closing} eyebrow={{ ar: 'تواصل معنا', en: 'Contact us' }} title={{ ar: 'لنبدأ بسؤالك', en: 'Let us begin with your question' }} body={{ ar: 'أخبرنا بالرياضة التي تهمك، وسنجهز وسيلة التواصل الإلكتروني فور اعتمادها.', en: 'Tell us which sport interests you. The electronic enquiry channel will appear once approved.' }} /><section className="uos-section uos-contact-layout"><div className="uos-contact-intro"><span><Copy>{{ ar: 'الاستفسارات', en: 'Enquiries' }}</Copy></span><h2><Copy>{{ ar: 'اكتب رسالتك بوضوح', en: 'Write your message clearly' }}</Copy></h2><p><Copy>{{ ar: 'لن نعرض رقم هاتف أو عنوانًا أو ساعات عمل قبل اعتمادها من إدارة يونايتد أوليمبيكس سبورت.', en: 'No phone number, address or opening hours will be shown before approval by United Olympics Sports.' }}</Copy></p><Mail aria-hidden="true" /></div><form className="uos-contact-form" onSubmit={submit}><label><Copy>{{ ar: 'الاسم', en: 'Name' }}</Copy><input name="name" autoComplete="name" required /></label><label><Copy>{{ ar: 'البريد الإلكتروني', en: 'Email' }}</Copy><input name="email" type="email" autoComplete="email" required /></label><label><Copy>{{ ar: 'الرياضة', en: 'Sport' }}</Copy><select name="sport" defaultValue=""><option value=""><Copy>{{ ar: 'اختر الرياضة', en: 'Choose a sport' }}</Copy></option>{PUBLIC_SPORTS.map((sport) => <option key={sport.id} value={sport.slug}>{t(sport.name, locale)}</option>)}</select></label><label><Copy>{{ ar: 'الرسالة', en: 'Message' }}</Copy><textarea name="message" rows={5} required /></label><button className="uos-button is-primary" type="submit"><Copy>{{ ar: 'تحقق من الإرسال', en: 'Check submission' }}</Copy><Send /></button>{notice ? <p className="uos-form-notice" role="status"><ShieldCheck /><Copy>{{ ar: 'الإرسال الإلكتروني غير متصل حاليًا؛ لم يتم إرسال أو حفظ بياناتك.', en: 'Electronic submission is not connected yet; your data was not sent or saved.' }}</Copy></p> : null}</form></section>{PUBLIC_BRANCHES.length === 0 ? null : null}<ClosingCta crop="contact" /></>;
}

function NotFoundPage() {
  usePageMeta({ ar: 'الصفحة غير موجودة', en: 'Page not found' }, { ar: 'تعذر العثور على الصفحة المطلوبة.', en: 'The requested page could not be found.' });
  return <section className="uos-not-found"><span>404</span><h1><Copy>{{ ar: 'هذه الصفحة غير موجودة', en: 'This page does not exist' }}</Copy></h1><ButtonLink to="/"><Copy>{{ ar: 'العودة للرئيسية', en: 'Back home' }}</Copy></ButtonLink></section>;
}

function PublicFooter() {
  const { locale } = usePublicLocale();
  const activeSocials = Object.entries(PUBLIC_SOCIAL_LINKS).filter(([, url]) => Boolean(url));
  return <footer className="uos-site-footer"><div className="uos-footer-main"><div><Brand /><p><Copy>{{ ar: 'بيئة رياضية منظمة للنمو والثقة وروح الفريق.', en: 'A structured sporting environment for growth, confidence and teamwork.' }}</Copy></p></div><div><h2><Copy>{{ ar: 'استكشف', en: 'Explore' }}</Copy></h2>{PUBLIC_NAV.slice(1).map((item) => <Link key={item.path} to={item.path}><Copy>{item.label}</Copy></Link>)}</div><div><h2><Copy>{{ ar: 'الرياضات', en: 'Sports' }}</Copy></h2>{PUBLIC_SPORTS.map((sport) => <Link key={sport.id} to={`/sports/${sport.slug}`}><Copy>{sport.name}</Copy></Link>)}</div><div><h2><Copy>{{ ar: 'الدخول', en: 'Access' }}</Copy></h2><Link to="/store"><Copy>{{ ar: 'المتجر', en: 'Store' }}</Copy></Link><Link to="/player/login"><Copy>{{ ar: 'البوابات', en: 'Portals' }}</Copy></Link>{activeSocials.length ? <div aria-label={locale === 'ar' ? 'روابط التواصل الاجتماعي' : 'Social links'}>{activeSocials.map(([network, url]) => <a key={network} href={url}>{network}</a>)}</div> : null}</div></div><div className="uos-footer-bottom"><span>© {new Date().getFullYear()} United Olympics Sports</span><span>DISCIPLINE · PROGRESS · CONFIDENCE</span></div></footer>;
}

function PublicRoutes() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/about" element={<AboutPage />} /><Route path="/sports" element={<SportsPage />} />{PUBLIC_SPORTS.map((sport) => <Route key={sport.id} path={`/sports/${sport.slug}`} element={<SportPage sport={sport} />} />)}<Route path="/programs" element={<ProgramsPage />} /><Route path="/coaches" element={<CoachingPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="*" element={<NotFoundPage />} /></Routes>;
}

export function PublicExperience() {
  const [locale, setLocaleState] = useState<PublicLocale>(() => localStorage.getItem('uos-public-locale') === 'en' ? 'en' : 'ar');
  const location = useLocation();
  const setLocale = (next: PublicLocale) => { localStorage.setItem('uos-public-locale', next); setLocaleState(next); };

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const frame = requestAnimationFrame(() => {
      const targets = document.querySelectorAll<HTMLElement>('.uos-reveal');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach((target) => target.classList.add('is-visible'));
        return;
      }
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.12 });
      targets.forEach((target) => observer.observe(target));
      window.setTimeout(() => observer.disconnect(), 10000);
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname]);

  return <LocaleContext.Provider value={{ locale, setLocale }}><div className="uos-public" dir={locale === 'ar' ? 'rtl' : 'ltr'}><a className="uos-skip-link" href="#uos-public-main"><Copy>{{ ar: 'انتقل إلى المحتوى', en: 'Skip to content' }}</Copy></a><PublicHeader /><main id="uos-public-main"><PublicRoutes /></main><PublicFooter /></div></LocaleContext.Provider>;
}
