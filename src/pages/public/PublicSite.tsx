import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  Dumbbell,
  Mail,
  Menu,
  MessageCircle,
  PenLine,
  Send,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
  UserRound,
  X,
  Target,
  Zap,
  Heart,
  Star,
  Users,
  CheckCircle,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { Sports3DIcon } from "../../design/sports3d";
import { UosFormSection, UosTextAreaField, UosTextField, uosCommonHelpers } from "../../components/fields/UosFields";
import { SportConceptVisual } from "../../components/owner-demo/OwnerDemoVisuals";
import { getSportPreviewMedia } from "../../data/media";
import {
  CoachPreviewPage,
  ParentPreviewPage,
  PlayerPreviewPage,
} from "../product-preview/ProductPreviewPages";
import { BasketballPage } from "./BasketballPage";
import { CoachesPage } from "./CoachesPage";
import { FootballPage } from "./FootballPage";
import { ProgramPreviewPage } from "./ProgramPreviewPage";
import { ProgramsPage } from "./ProgramsPage";
import { SportConceptPage } from "./SportConceptPage";
import { SwimmingPage } from "./SwimmingPage";
import "../../styles/public-enhancements.css";
import "../../styles/owner-demo.css";

type Bilingual = { en: string; ar: string };
type Sport = Bilingual & { id: string; description: Bilingual; ages: Bilingual; focus: Bilingual };

const brand = "United Olympics Sports";
const brandAr = "يونايتد أوليمبيكس سبورت";
const splashSessionKey = "uos:splash-seen";
const sportDetailRoutes: Record<string, string> = {
  football: "/sports/football",
  swimming: "/sports/swimming",
  basketball: "/sports/basketball",
  tennis: "/sports/tennis",
  gymnastics: "/sports/gymnastics",
  "martial-arts": "/sports/martial-arts",
};

const sports: Sport[] = [
  {
    id: "football",
    en: "Football",
    ar: "كرة القدم",
    description: {
      en: "Structured team training built around technique, awareness and collaboration.",
      ar: "تدريب جماعي منظم يركز على المهارة والوعي والتعاون.",
    },
    ages: { en: "Children & youth pathways", ar: "مسارات الأطفال والناشئين" },
    focus: { en: "Technical foundations", ar: "الأساسيات الفنية" },
  },
  {
    id: "swimming",
    en: "Swimming",
    ar: "السباحة",
    description: {
      en: "Progressive sessions that develop water confidence, technique and endurance.",
      ar: "حصص متدرجة تطور الثقة في الماء والتقنية والتحمل.",
    },
    ages: { en: "Children & youth pathways", ar: "مسارات الأطفال والناشئين" },
    focus: { en: "Technique and endurance", ar: "التقنية والتحمل" },
  },
  {
    id: "basketball",
    en: "Basketball",
    ar: "كرة السلة",
    description: {
      en: "A team environment for movement, decision-making and disciplined play.",
      ar: "بيئة جماعية للحركة واتخاذ القرار واللعب المنضبط.",
    },
    ages: { en: "Youth pathways", ar: "مسارات الناشئين" },
    focus: { en: "Movement and teamwork", ar: "الحركة والعمل الجماعي" },
  },
  {
    id: "tennis",
    en: "Tennis",
    ar: "التنس",
    description: {
      en: "Individual coaching pathways combining repetition, focus and match awareness.",
      ar: "مسارات تدريب فردية تجمع بين التكرار والتركيز ووعي المباراة.",
    },
    ages: { en: "Youth pathways", ar: "مسارات الناشئين" },
    focus: { en: "Control and consistency", ar: "التحكم والثبات" },
  },
  {
    id: "gymnastics",
    en: "Gymnastics",
    ar: "الجمباز",
    description: {
      en: "Foundational movement practice for balance, flexibility and confidence.",
      ar: "تدريب حركي أساسي للتوازن والمرونة والثقة.",
    },
    ages: { en: "Youth pathways", ar: "مسارات الناشئين" },
    focus: { en: "Balance and mobility", ar: "التوازن والحركة" },
  },
  {
    id: "martial-arts",
    en: "Martial Arts",
    ar: "الفنون القتالية",
    description: {
      en: "A respectful training culture centred on control, discipline and progress.",
      ar: "ثقافة تدريبية محترمة تتمحور حول التحكم والانضباط والتقدم.",
    },
    ages: { en: "Youth pathways", ar: "مسارات الناشئين" },
    focus: { en: "Control and discipline", ar: "التحكم والانضباط" },
  },
];

function Bilingual({ value, className = "" }: { value: Bilingual; className?: string }) {
  return (
    <span className={className}>
      <span className="en" lang="en">
        {value.en}
      </span>
      <span className="ar" lang="ar" dir="rtl">
        {value.ar}
      </span>
    </span>
  );
}

function OfficialLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={compact ? "official-logo compact" : "official-logo"}
      src="/brand/united-olympics-sports-logo.png"
      alt={`${brand} | ${brandAr}`}
    />
  );
}

function Splash({ onComplete }: { onComplete: () => void }) {
  const [reducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  useEffect(() => {
    const timer = window.setTimeout(onComplete, reducedMotion ? 420 : 3000);
    return () => window.clearTimeout(timer);
  }, [onComplete, reducedMotion]);
  return (
    <motion.div
      className={`splash splash-refined ${reducedMotion ? "splash-reduced" : ""}`}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      initial={reducedMotion ? false : { opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.06 : 0.55 }}
    >
      {!reducedMotion && (
        <>
          <div className="splash-particles" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} />
            ))}
          </div>
          <div className="splash-shield-outline" aria-hidden="true" />
          <div className="splash-energy-ring" aria-hidden="true" />
          <div className="gold-orbit" aria-hidden="true" />
        </>
      )}
        <div className="splash-golden-sand" aria-hidden="true">
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
            <span className="sand-particle" />
          </div>
        <div className="splash-logo-wrap">
        <OfficialLogo />
      </div>
      <div className="splash-copy">
        <Bilingual value={{ en: brand, ar: brandAr }} />
        <Bilingual
          value={{ en: "From Childhood, We Build Champions", ar: "من الطفولة نصنع الأبطال" }}
        />
      </div>
      <button className="splash-skip" type="button" onClick={onComplete}>
        <Bilingual value={{ en: "Skip Intro", ar: "تخطي المقدمة" }} />
        <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}

function PublicHeader() {
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", value: { en: "Home", ar: "الرئيسية" } },
    { to: "/store", value: { en: "Store", ar: "المتجر" } },
    { to: "/about", value: { en: "About", ar: "من نحن" } },
    { to: "/sports", value: { en: "Sports", ar: "الرياضات" } },
    { to: "/programs", value: { en: "Programs", ar: "البرامج" } },
    { to: "/coaches", value: { en: "Coaches", ar: "المدربون" } },
    { to: "/store", value: { en: "Store", ar: "المتجر" } },
    { to: "/contact", value: { en: "Contact", ar: "تواصل معنا" } },
  ];
  return (
    <header className="site-header">
      <Link to="/" className="brand-lockup">
        <OfficialLogo compact />
        <span>
          <strong>{brand}</strong>
          <small>{brandAr}</small>
        </span>
      </Link>
      <div className="site-header-actions">
        <ThemeToggle compact />
        <button
          className="menu-button"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Open navigation | فتح القائمة"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <nav className={open ? "public-nav open" : "public-nav"}>
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setOpen(false)}>
            <Bilingual value={item.value} />
          </NavLink>
        ))}
        <div className="portal-access">
          <span className="portal-label">
            <Bilingual value={{ en: "Portals", ar: "البوابات" }} />
          </span>
          <div className="portal-links">
            {[
              ["/player/login", "Player", "اللاعب"],
              ["/parent/login", "Parent", "ولي الأمر"],
              ["/coach/login", "Coach", "المدرب"],
              ["/store/login", "Store", "المتجر"],
              ["/admin/login", "Admin", "الإدارة"],
            ].map(([to, en, ar]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}>
                <Bilingual value={{ en, ar }} />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

const developerWhatsApp =
  "https://wa.me/971503281920?text=Hello%20Eng.%20Sadek%20Elgazar%2C%20I%20would%20like%20to%20start%20a%20new%20project%20with%20KNOuX.%20%7C%20%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D9%85.%20%D8%B5%D8%A7%D8%AF%D9%82%20%D8%A7%D9%84%D8%AC%D8%B2%D8%A7%D8%B1%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A8%D8%AF%D8%A1%20%D9%81%D9%8A%20%D9%85%D8%B4%D8%B1%D9%88%D8%B9%20%D8%AC%D8%AF%D9%8A%D8%AF%20%D9%85%D8%B9%20KNOuX.";
function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link to="/" className="brand-lockup">
          <OfficialLogo compact />
          <span>
            <strong>{brand}</strong>
            <small>{brandAr}</small>
          </span>
        </Link>
        <p>
          <Bilingual
            value={{
              en: "A thoughtful foundation for athletic development.",
              ar: "أساس متكامل لتطوير الرياضيين.",
            }}
          />
        </p>
      </div>
      <div className="footer-links">
        <Bilingual value={{ en: "Explore", ar: "استكشف" }} />
        <Link to="/sports">
          <Bilingual value={{ en: "Sports", ar: "الرياضات" }} />
        </Link>
        <Link to="/programs">
          <Bilingual value={{ en: "Programs", ar: "البرامج" }} />
        </Link>
        <Link to="/contact">
          <Bilingual value={{ en: "Contact", ar: "تواصل معنا" }} />
        </Link>
      </div>
      <div className="knoux">
        <a
          className="knoux-signature"
          href={developerWhatsApp}
          target="_blank"
          rel="noreferrer"
          aria-label="Made by KNOuX — Eng. Sadek Elgazar | صنع بواسطة KNOuX — م. صادق الجزار"
        >
          <Bilingual value={{ en: "Made by KNOuX", ar: "صنع بواسطة KNOuX" }} />
          <strong>
            <Bilingual value={{ en: "Eng. Sadek Elgazar", ar: "م. صادق الجزار" }} />
          </strong>
          <small>
            <Bilingual value={{ en: "Start a New Project", ar: "ابدأ مشروعًا جديدًا" }} />
          </small>
        </a>
      </div>
    </footer>
  );
}

function PublicLayout() {
  return (
    <>
      <PublicHeader />
      <main className="public-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sports/football" element={<FootballPage />} />
          <Route path="/sports/swimming" element={<SwimmingPage />} />
          <Route path="/sports/basketball" element={<BasketballPage />} />
          <Route path="/sports/tennis" element={<SportConceptPage sportId="tennis" />} />
          <Route path="/sports/gymnastics" element={<SportConceptPage sportId="gymnastics" />} />
          <Route
            path="/sports/martial-arts"
            element={<SportConceptPage sportId="martial-arts" />}
          />
          <Route path="/sports" element={<Sports />} />
          <Route path="/programs/:programSlug" element={<ProgramPreviewPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/coaches" element={<CoachesPage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function PageIntro({
  eyebrow,
  title,
  text,
}: {
  eyebrow: Bilingual;
  title: Bilingual;
  text: Bilingual;
}) {
  return (
    <section className="page-intro">
      <span className="eyebrow">
        <Sparkles size={15} />
        <Bilingual value={eyebrow} />
      </span>
      <h1>
        <Bilingual value={title} />
      </h1>
      <p>
        <Bilingual value={text} />
      </p>
    </section>
  );
}
function SectionHeading({ title, text }: { title: Bilingual; text?: Bilingual }) {
  return (
    <div className="section-heading">
      <h2>
        <Bilingual value={title} />
      </h2>
      {text && (
        <p>
          <Bilingual value={text} />
        </p>
      )}
    </div>
  );
}

function Home() {
  return (
    <div className="page home">
      <section className="hero hero-premium">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-gradient-ring ring-one" />
          <div className="hero-gradient-ring ring-two" />
          <div className="hero-gradient-ring ring-three" />
        </div>
        <div className="hero-content">
          <span className="eyebrow eyebrow-premium">
            <Sparkles size={15} />
            <Bilingual
              value={{
                en: "Athletic development, thoughtfully built",
                ar: "تطوير رياضي بمنهج متكامل",
              }}
            />
          </span>
          <h1>
            <Bilingual
              value={{ en: "From Childhood, We Build Champions", ar: "من الطفولة نصنع الأبطال" }}
            />
          </h1>
          <p>
            <Bilingual
              value={{
                en: "A premium, structured environment where young athletes develop skills, discipline and confidence through purposeful sport.",
                ar: "بيئة احترافية ومنظمة يطور فيها الرياضيون الصغار المهارات والانضباط والثقة من خلال ممارسة هادفة.",
              }}
            />
          </p>
          <div className="hero-actions">
            <Link className="button primary button-premium" to="/sports">
              <Bilingual value={{ en: "Explore Sports", ar: "استكشف الرياضات" }} />
              <ArrowRight />
            </Link>
            <Link className="button secondary button-premium" to="/programs">
              <Bilingual value={{ en: "View Programs", ar: "عرض البرامج" }} />
              <ArrowRight />
            </Link>
          </div>
          <div className="hero-trust" aria-label="Trust indicators">
            <article className="trust-item">
              <CheckCircle size={18} />
              <span><Bilingual value={{ en: "Verified sport media", ar: "وسائط رياضية معتمدة" }} /></span>
            </article>
            <article className="trust-item">
              <CheckCircle size={18} />
              <span><Bilingual value={{ en: "No fabricated operational claims", ar: "لا توجد ادعاءات تشغيلية مختلقة" }} /></span>
            </article>
            <article className="trust-item">
              <CheckCircle size={18} />
              <span><Bilingual value={{ en: "Bilingual by design", ar: "ثنائية اللغة بالتصميم" }} /></span>
            </article>
          </div>
        </div>
        <div className="hero-art hero-art-premium">
          <div className="hero-ring ring-one" />
          <div className="hero-ring ring-two" />
          <OfficialLogo />
          <span className="hero-tag">
            <Bilingual value={{ en: "Train · Grow · Perform", ar: "تدرب · تطور · أبدع" }} />
          </span>
        </div>
      </section>
      <section className="section section-premium">
        <SectionHeading
          title={{ en: "A clear path for every athlete", ar: "مسار واضح لكل رياضي" }}
          text={{
            en: "United Olympics Sports connects purposeful coaching with a culture of progress.",
            ar: "يربط يونايتد أوليمبيكس سبورت بين التدريب الهادف وثقافة التقدم.",
          }}
        />
        <div className="feature-grid feature-grid-premium">
          {[
            {
              icon: <Dumbbell />,
              title: { en: "Training", ar: "التدريب" },
              text: {
                en: "Build strong foundations through consistent practice.",
                ar: "ابنِ أساسًا قويًا من خلال الممارسة المستمرة.",
              },
              accent: "training",
            },
            {
              icon: <ShieldCheck />,
              title: { en: "Discipline", ar: "الانضباط" },
              text: {
                en: "Create habits that support long-term development.",
                ar: "كوّن عادات تدعم التطور على المدى الطويل.",
              },
              accent: "discipline",
            },
            {
              icon: <Trophy />,
              title: { en: "Performance", ar: "الأداء" },
              text: {
                en: "Turn preparation into confident performance.",
                ar: "حوّل الاستعداد إلى أداء واثق.",
              },
              accent: "performance",
            },
            {
              icon: <Users />,
              title: { en: "Teamwork", ar: "العمل الجماعي" },
              text: {
                en: "Learn communication, support and shared responsibility.",
                ar: "تعلم التواصل والدعم والمسؤولية المشتركة.",
              },
              accent: "teamwork",
            },
            {
              icon: <Target />,
              title: { en: "Focus", ar: "التركيز" },
              text: {
                en: "Develop decision-making and match awareness.",
                ar: "طور اتخاذ القرار ووعي المباراة.",
              },
              accent: "focus",
            },
            {
              icon: <Heart />,
              title: { en: "Progress", ar: "التقدم" },
              text: {
                en: "Measure growth through structured evaluation.",
                ar: "قس النمو من خلال التقييم المنظم.",
              },
              accent: "progress",
            },
          ].map((item) => (
            <article key={item.title.en} className={`feature-card accent-${item.accent}`}>
              <div className="feature-icon">
                {item.icon}
              </div>
              <h3>
                <Bilingual value={item.title} />
              </h3>
              <p>
                <Bilingual value={item.text} />
              </p>
              <div className="feature-underline" />
            </article>
          ))}
        </div>
      </section>
      <section className="section tinted section-sports-preview">
        <SectionHeading
          title={{ en: "Explore our sports", ar: "استكشف رياضاتنا" }}
          text={{
            en: "Categories designed to support different interests, strengths and stages of development.",
            ar: "فئات مصممة لدعم الاهتمامات والقدرات ومراحل التطور المختلفة.",
          }}
        />
        <div className="card-grid sports-grid-premium">
          {sports.slice(0, 3).map((sport) => (
            <SportCard key={sport.id} sport={sport} premium />
          ))}
        </div>
        <Link className="text-link text-link-premium" to="/sports">
          <Bilingual value={{ en: "See all sports", ar: "عرض جميع الرياضات" }} />
          <ArrowRight size={17} />
        </Link>
      </section>
      <section className="section pulse-section" aria-label="Development pulse">
        <div className="pulse-grid">
          <article className="pulse-card">
            <div className="pulse-icon"><Target /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Development Path", ar: "مسار التطور" }} />
              <div className="pulse-bar"><span style={{ width: '90%' }} /></div>
              <small><Bilingual value={{ en: "Foundation → Development → Performance model ready", ar: "نموذج الأساس → التطوير → الأداء جاهز" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><Zap /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Sport Identity", ar: "هوية الرياضة" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "All 6 sports with verified media & 3D icons", ar: "جميع 6 رياضات مع وسائط معتمدة وأيقونات 3D" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><ShieldCheck /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Data Integrity", ar: "سلامة البيانات" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "Zero fabricated operational claims", ar: "صفر ادعاءات تشغيلية مختلقة" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><Compass /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Portal Access", ar: "دخول البوابات" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "Player / Parent / Coach / Store / Admin separated", ar: "اللاعب / ولي الأمر / المدرب / المتجر / الإدارة منفصلين" }} /></small>
            </div>
          </article>
        </div>
      </section>
      <section className="cta-band cta-band-premium">
        <div>
          <span className="eyebrow eyebrow-premium">
            <MessageCircle size={15} />
            <Bilingual value={{ en: "Start a conversation", ar: "ابدأ حوارًا" }} />
          </span>
          <h2>
            <Bilingual
              value={{
                en: "Build the next chapter with purpose.",
                ar: "ابنِ الفصل القادم بهدف واضح.",
              }}
            />
          </h2>
        </div>
        <Link className="button primary button-premium" to="/contact">
          <Bilingual value={{ en: "Contact Us", ar: "تواصل معنا" }} />
          <ArrowRight />
        </Link>
      </section>
    </div>
  );
}

function About() {
  return (
    <div className="page">
      <PageIntro
        eyebrow={{ en: "Who we are", ar: "من نحن" }}
        title={{ en: "A purposeful approach to athletic growth.", ar: "منهج هادف للنمو الرياضي." }}
        text={{
          en: "United Olympics Sports is a sports development brand focused on creating a disciplined, supportive and progressive environment for young athletes.",
          ar: "يونايتد أوليمبيكس سبورت علامة متخصصة في التطوير الرياضي، وتركز على بناء بيئة منضبطة وداعمة ومتقدمة للرياضيين الصغار.",
        }}
      />
      <section className="section section-premium about-grid-premium">
        <div className="about-statement">
          <span className="big-number">01</span>
          <h2>
            <Bilingual value={{ en: "Development over shortcuts", ar: "التطور قبل الاختصارات" }} />
          </h2>
          <p>
            <Bilingual
              value={{
                en: "We value consistency, thoughtful coaching and measurable progress. Every training experience should help an athlete understand where they are and what to practise next.",
                ar: "نقدر الاستمرارية والتدريب الواعي والتقدم القابل للملاحظة. يجب أن تساعد كل تجربة تدريبية الرياضي على فهم مستواه وما ينبغي أن يتدرب عليه لاحقًا.",
              }}
            />
          </p>
        </div>
        <div className="about-values">
          {[
            [
              "Vision",
              "رؤيتنا",
              "Create a lasting culture of confident participation and performance.",
              "بناء ثقافة مستدامة للمشاركة والأداء بثقة.",
            ],
            [
              "Mission",
              "رسالتنا",
              "Guide athletes through structured training and human support.",
              "توجيه الرياضيين عبر تدريب منظم ودعم إنساني.",
            ],
            [
              "Values",
              "قيمنا",
              "Respect, discipline, teamwork and progress in every step.",
              "الاحترام والانضباط والعمل الجماعي والتقدم في كل خطوة.",
            ],
            [
              "Approach",
              "نهجنا",
              "Readiness-based pathways, not invented age cut-offs.",
              "مسارات مبنية على الجاهزية، لا حدود عمرية مختلقة.",
            ],
            [
              "Integrity",
              "نزاهتنا",
              "Zero fabricated operational claims in any public surface.",
              "صفر ادعاءات تشغيلية مختلقة في أي واجهة عامة.",
            ],
            [
              "Access",
              "وصولنا",
              "Player, Parent, Coach and Admin portals — fully separated.",
              "بوابات اللاعب، ولي الأمر، المدرب والإدارة — منفصلة بالكامل.",
            ],
          ].map(([en, ar, te, ta]) => (
            <div className="value-row value-row-premium" key={en}>
              <div className="value-icon">
                <Star size={22} />
              </div>
              <div className="value-content">
                <h3>
                  <Bilingual value={{ en, ar }} />
                </h3>
                <p>
                  <Bilingual value={{ en: te, ar: ta }} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section tinted about-pulse" aria-label="Brand integrity indicators">
        <div className="pulse-grid pulse-grid-about">
          <article className="pulse-card">
            <div className="pulse-icon"><ShieldCheck /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Brand Integrity", ar: "سلامة العلامة التجارية" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "Only 'United Olympics Sports | يونايتد أوليمبيكس سبورت'", ar: "فقط 'يونايتد أوليمبيكس سبورت'" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><CheckCircle /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Bilingual Compliance", ar: "الامتثال للثنائية اللغوية" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "Every visible string has Arabic", ar: "كل نص مرئي له مقابل عربي" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><Target /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Data Truth", ar: "حقيقة البيانات" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "No fake countries, branches, coaches, prices", ar: "لا دول/فروع/مدربين/أسعار مزيفة" }} /></small>
            </div>
          </article>
          <article className="pulse-card">
            <div className="pulse-icon"><Compass /></div>
            <div className="pulse-content">
              <Bilingual value={{ en: "Portal Architecture", ar: "هندسة البوابات" }} />
              <div className="pulse-bar"><span style={{ width: '100%' }} /></div>
              <small><Bilingual value={{ en: "5 surfaces: Public, Admin, Player, Parent, Coach", ar: "5 أسطح: عام، إدارة، لاعب، ولي أمر، مدرب" }} /></small>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function SportCard({ sport, premium }: { sport: Sport; premium?: boolean }) {
  const preview = getSportPreviewMedia(sport.id);
  const href = sportDetailRoutes[sport.id];
  return (
    <article className={`sport-card od-sport-card ${premium ? 'sport-card-premium' : ''}`}>
      {preview ? (
        <img
          className="sport-card-media"
          src={preview.url}
          alt={`${preview.altEn} | ${preview.altAr}`}
          width={1648}
          height={928}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <SportConceptVisual sportId={sport.id} compact />
      )}
      <div className="sport-card-body">
        <div className="sport-icon">
          <Sports3DIcon sport={sport.id as 'football' | 'basketball' | 'swimming' | 'tennis' | 'gymnastics' | 'martial-arts'} size="md" decorative />
        </div>
        <h3>
          <Bilingual value={{ en: sport.en, ar: sport.ar }} />
        </h3>
        <p>
          <Bilingual value={sport.description} />
        </p>
        <div className="card-meta">
          <span>
            <Bilingual value={{ en: "Development path", ar: "مسار التطور" }} />
          </span>
          <strong>
            <Bilingual value={sport.ages} />
          </strong>
        </div>
        <Link className="text-link" to={href}>
          <Bilingual value={{ en: "Explore Sport", ar: "استكشف الرياضة" }} />
          <ArrowRight size={16} />
        </Link>
        {premium && (
          <div className="sport-card-pulse" aria-hidden="true">
            <span className="pulse-ring" />
            <span className="pulse-ring" />
            <span className="pulse-ring" />
          </div>
        )}
      </div>
    </article>
  );
}
function Sports() {
  return (
    <div className="page od-sports-owner-page">
      <PageIntro
        eyebrow={{ en: "Sports", ar: "الرياضات" }}
        title={{ en: "Find the discipline that moves you.", ar: "اكتشف الرياضة التي تحرك شغفك." }}
        text={{
          en: "Verified sport media and premium code-driven concepts give every discipline a clear visual identity.",
          ar: "الوسائط الرياضية الموثقة والتصورات البرمجية الاحترافية تمنح كل رياضة هوية بصرية واضحة.",
        }}
      />
      <section className="section section-premium sports-grid-section">
        <div className="card-grid sports-grid-premium">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} premium />
          ))}
        </div>
      </section>
      <section className="section tinted sports-integrity" aria-label="Sports data integrity">
        <div className="integrity-grid">
          <article className="integrity-card">
            <div className="integrity-icon"><CheckCircle size={24} /></div>
            <div>
              <h3><Bilingual value={{ en: "Verified Media Only", ar: "وسائط معتمدة فقط" }} /></h3>
              <p><Bilingual value={{ en: "10 verified images per sport — no collage, no stock replacement", ar: "10 صور معتمدة لكل رياضة — لا كولاج ولا صور مخزنة" }} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><ShieldCheck size={24} /></div>
            <div>
              <h3><Bilingual value={{ en: "3D Identity System", ar: "نظام الهوية ثلاثي الأبعاد" }} /></h3>
              <p><Bilingual value={{ en: "Code-driven sport icons with team-colored palettes", ar: "أيقونات رياضية برمجية بألوان الفرق" }} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><Target size={24} /></div>
            <div>
              <h3><Bilingual value={{ en: "No Fabricated Claims", ar: "لا ادعاءات مختلقة" }} /></h3>
              <p><Bilingual value={{ en: "Structural preview entities only — zero fake operational data", ar: "كيانات معاينة هيكلية فقط — صفر بيانات تشغيلية مزيفة" }} /></p>
            </div>
          </article>
          <article className="integrity-card">
            <div className="integrity-icon"><Compass size={24} /></div>
            <div>
              <h3><Bilingual value={{ en: "Portal Separation", ar: "فصل البوابات" }} /></h3>
              <p><Bilingual value={{ en: "Sports page is public — Admin/Player/Parent/Coach are separate", ar: "صفحة الرياضات عامة — الإدارة/اللاعب/ولي الأمر/المدرب منفصلة" }} /></p>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function Contact() {
  const [previewed, setPreviewed] = useState(false);
  return (
    <div className="page">
      <PageIntro
        eyebrow={{ en: "Contact", ar: "تواصل معنا" }}
        title={{ en: "Let's start with a thoughtful conversation.", ar: "لنبدأ بحوار هادف." }}
        text={{
          en: "Use the form below to prepare an enquiry. This interface does not submit to a backend yet.",
          ar: "استخدم النموذج أدناه لإعداد استفسارك. هذه الواجهة لا ترسل البيانات إلى خادم بعد.",
        }}
      />
      <section className="section section-premium contact-layout-premium">
        <form
          className="contact-form contact-form-premium"
          onSubmit={(event) => {
            event.preventDefault();
            setPreviewed(true);
          }}
        >
          <UosFormSection
            title={{ en: "Your enquiry", ar: "استفسارك" }}
            icon={<MessageCircle size={17} />}
            description={{ en: "Prepare your message below. Nothing is sent yet.", ar: "جهّز رسالتك أدناه. لن يتم إرسال أي شيء بعد." }}
          >
            <UosTextField label={{ en: "Name", ar: "الاسم" }} icon={<UserRound size={16} />} name="name" required autoComplete="name" placeholder="Your name | اسمك" />
            <UosTextField label={{ en: "Email", ar: "البريد الإلكتروني" }} icon={<Mail size={16} />} name="email" type="email" required autoComplete="email" placeholder="you@example.com | بريدك الإلكتروني" helper={uosCommonHelpers.email} />
            <UosTextField label={{ en: "Subject", ar: "الموضوع" }} icon={<Tag size={16} />} name="subject" required placeholder="How can we help? | كيف يمكننا مساعدتك؟" />
            <UosTextAreaField label={{ en: "Message", ar: "الرسالة" }} icon={<PenLine size={16} />} name="message" required rows={5} placeholder="Write your message | اكتب رسالتك" />
          </UosFormSection>
          <button className="button primary button-premium" type="submit">
            <Bilingual value={{ en: "Preview Message", ar: "معاينة الرسالة" }} />
            <Send size={17} />
          </button>
          {previewed && (
            <p className="form-note form-note-premium">
              <CheckCircle size={15} />
              <Bilingual
                value={{
                  en: "Preview only — no message was sent or saved.",
                  ar: "معاينة فقط — لم يتم إرسال أو حفظ أي رسالة.",
                }}
              />
            </p>
          )}
        </form>
        <aside className="contact-note contact-note-premium">
          <div className="contact-note-icon">
            <MessageCircle size={32} />
          </div>
          <h3>
            <Bilingual value={{ en: "Verified details first", ar: "التفاصيل الموثقة أولًا" }} />
          </h3>
          <p>
            <Bilingual
              value={{
                en: "Public contact details will be added only after verification. No fake addresses, phones, or WhatsApp numbers are displayed in this preview.",
                ar: "ستتم إضافة بيانات التواصل العامة فقط بعد التحقق منها. لا يتم عرض عناوين أو هواتف أو أرقام واتساب وهمية في هذه المعاينة.",
              }}
            />
          </p>
          <div className="contact-integrity">
            <article className="integrity-item">
              <CheckCircle size={16} />
              <span><Bilingual value={{ en: "No fabricated UAE/KSA addresses", ar: "لا عناوين إمارات/سعودية مختلقة" }} /></span>
            </article>
            <article className="integrity-item">
              <CheckCircle size={16} />
              <span><Bilingual value={{ en: "No fake phone/WhatsApp numbers", ar: "لا أرقام هاتف/واتساب وهمية" }} /></span>
            </article>
            <article className="integrity-item">
              <CheckCircle size={16} />
              <span><Bilingual value={{ en: "Developer contact clearly labeled", ar: "بيانات المطور موضحة بوضوح" }} /></span>
            </article>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function PublicSite() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return window.sessionStorage.getItem(splashSessionKey) !== "1";
    } catch {
      return true;
    }
  });
  const completeSplash = () => {
    try {
      window.sessionStorage.setItem(splashSessionKey, "1");
    } catch {
      /* storage may be unavailable */
    }
    setShowSplash(false);
  };
  return (
    <>
      <AnimatePresence>{showSplash && <Splash onComplete={completeSplash} />}</AnimatePresence>
      <Routes>
        <Route path="/player" element={<PlayerPreviewPage />} />
        <Route path="/parent" element={<ParentPreviewPage />} />
        <Route path="/coach" element={<CoachPreviewPage />} />
        <Route path="*" element={<PublicLayout />} />
      </Routes>
    </>
  );
}

export default PublicSite;
