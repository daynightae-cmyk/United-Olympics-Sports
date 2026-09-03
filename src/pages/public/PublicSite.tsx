import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowRight,
  Dumbbell,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { Sports3DStage } from "../../design/sports3d";
import SafeBrandLogo from "../../components/ui/SafeBrandLogo";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
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
    <SafeBrandLogo
      compact={compact}
      className={compact ? "official-logo compact" : "official-logo"}
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
    { to: "/about", value: { en: "About", ar: "من نحن" } },
    { to: "/sports", value: { en: "Sports", ar: "الرياضات" } },
    { to: "/programs", value: { en: "Programs", ar: "البرامج" } },
    { to: "/coaches", value: { en: "Coaches", ar: "المدربون" } },
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
              ["/player", "Player", "اللاعب"],
              ["/parent", "Parent", "ولي الأمر"],
              ["/coach", "Coach", "المدرب"],
              ["/admin", "Admin", "الإدارة"],
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

const developerContact = "/contact";
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
          href={developerContact}
          aria-label="Made by KNOuX — signature removed for privacy"
        >
          <Bilingual value={{ en: "Made by KNOuX", ar: "صنع بواسطة KNOuX" }} />
          <strong>
            <Bilingual value={{ en: "KNOuX", ar: "KNOuX" }} />
          </strong>
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
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            <Trophy size={15} />
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
            <Link className="button primary" to="/sports">
              <Bilingual value={{ en: "Explore Sports", ar: "استكشف الرياضات" }} />
              <ArrowRight />
            </Link>
            <Link className="button secondary" to="/programs">
              <Bilingual value={{ en: "View Programs", ar: "عرض البرامج" }} />
              <ArrowRight />
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-ring ring-one" />
          <div className="hero-ring ring-two" />
          <OfficialLogo />
          <span className="hero-tag">
            <Bilingual value={{ en: "Train · Grow · Perform", ar: "تدرب · تطور · أبدع" }} />
          </span>
        </div>
      </section>
      <section className="section">
        <SectionHeading
          title={{ en: "A clear path for every athlete", ar: "مسار واضح لكل رياضي" }}
          text={{
            en: "United Olympics Sports connects purposeful coaching with a culture of progress.",
            ar: "يربط يونايتد أوليمبيكس سبورت بين التدريب الهادف وثقافة التقدم.",
          }}
        />
        <div className="feature-grid">
          {[
            {
              icon: <Dumbbell />,
              title: { en: "Training", ar: "التدريب" },
              text: {
                en: "Build strong foundations through consistent practice.",
                ar: "ابنِ أساسًا قويًا من خلال الممارسة المستمرة.",
              },
            },
            {
              icon: <ShieldCheck />,
              title: { en: "Discipline", ar: "الانضباط" },
              text: {
                en: "Create habits that support long-term development.",
                ar: "كوّن عادات تدعم التطور على المدى الطويل.",
              },
            },
            {
              icon: <Trophy />,
              title: { en: "Performance", ar: "الأداء" },
              text: {
                en: "Turn preparation into confident performance.",
                ar: "حوّل الاستعداد إلى أداء واثق.",
              },
            },
          ].map((item) => (
            <article className="feature-card" key={item.title.en}>
              {item.icon}
              <h3>
                <Bilingual value={item.title} />
              </h3>
              <p>
                <Bilingual value={item.text} />
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="section tinted">
        <SectionHeading
          title={{ en: "Explore our sports", ar: "استكشف رياضاتنا" }}
          text={{
            en: "Categories designed to support different interests, strengths and stages of development.",
            ar: "فئات مصممة لدعم الاهتمامات والقدرات ومراحل التطور المختلفة.",
          }}
        />
        <div className="card-grid">
          {sports.slice(0, 3).map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
        </div>
        <Link className="text-link" to="/sports">
          <Bilingual value={{ en: "See all sports", ar: "عرض جميع الرياضات" }} />
          <ArrowRight size={17} />
        </Link>
      </section>
      <section className="cta-band">
        <div>
          <span className="eyebrow">
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
        <Link className="button primary" to="/contact">
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
      <section className="section about-grid">
        <div className="statement">
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
        <div className="values-list">
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
          ].map(([en, ar, te, ta]) => (
            <div className="value-row" key={en}>
              <h3>
                <Bilingual value={{ en, ar }} />
              </h3>
              <p>
                <Bilingual value={{ en: te, ar: ta }} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SportCard({ sport }: { sport: Sport }) {
  const preview = getSportPreviewMedia(sport.id);
  const href = sportDetailRoutes[sport.id];
  return (
    <article className="sport-card od-sport-card">
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
          <Sports3DStage
            sportKey={sport.id}
            size={84}
            opacity={0.16}
            className="sport-3d-medallion"
          />
          <div className="sport-icon-fallback" aria-hidden>
            {sport.id === "swimming" ? (
              <Sparkles />
            ) : sport.id === "basketball" ? (
              <Trophy />
            ) : (
              <Dumbbell />
            )}
          </div>
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
      <section className="section">
        <div className="card-grid sports-grid">
          {sports.map((sport) => (
            <SportCard key={sport.id} sport={sport} />
          ))}
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
        title={{ en: "Let’s start with a thoughtful conversation.", ar: "لنبدأ بحوار هادف." }}
        text={{
          en: "Use the form below to prepare an enquiry. This interface does not submit to a backend yet.",
          ar: "استخدم النموذج أدناه لإعداد استفسارك. هذه الواجهة لا ترسل البيانات إلى خادم بعد.",
        }}
      />
      <section className="section contact-layout">
        <form
          className="contact-form"
          onSubmit={(event) => {
            event.preventDefault();
            setPreviewed(true);
          }}
        >
          <label>
            <Bilingual value={{ en: "Name", ar: "الاسم" }} />
            <input required placeholder="Your name | اسمك" />
          </label>
          <label>
            <Bilingual value={{ en: "Email", ar: "البريد الإلكتروني" }} />
            <input required type="email" placeholder="you@example.com | بريدك الإلكتروني" />
          </label>
          <label>
            <Bilingual value={{ en: "Subject", ar: "الموضوع" }} />
            <input required placeholder="How can we help? | كيف يمكننا مساعدتك؟" />
          </label>
          <label>
            <Bilingual value={{ en: "Message", ar: "الرسالة" }} />
            <textarea required rows={5} placeholder="Write your message | اكتب رسالتك" />
          </label>
          <button className="button primary" type="submit">
            <Bilingual value={{ en: "Preview Message", ar: "معاينة الرسالة" }} />
            <Send size={17} />
          </button>
          {previewed && (
            <p className="form-note">
              <Bilingual
                value={{
                  en: "Preview only — no message was sent or saved.",
                  ar: "معاينة فقط — لم يتم إرسال أو حفظ أي رسالة.",
                }}
              />
            </p>
          )}
        </form>
        <aside className="contact-note">
          <MessageCircle />
          <h3>
            <Bilingual value={{ en: "Verified details first", ar: "التفاصيل الموثقة أولًا" }} />
          </h3>
          <p>
            <Bilingual
              value={{
                en: "Public contact details will be added only after verification.",
                ar: "ستتم إضافة بيانات التواصل العامة فقط بعد التحقق منها.",
              }}
            />
          </p>
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
