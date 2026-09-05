import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  Compass,
  CreditCard,
  Flame,
  Heart,
  Mail,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  Users,
  Waves,
  Zap,
} from 'lucide-react';
import { AppLogo } from '../brand/AppLogo';

interface DestinationMeta {
  badge: { en: string; ar: string };
  title: { en: string; ar: string };
  action: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

function getDestinationMeta(pathname: string): DestinationMeta {
  const p = pathname.toLowerCase();

  // Swimming
  if (p.includes('/swimming')) {
    return {
      badge: { en: 'AQUATIC CENTER', ar: 'المركز المائي' },
      title: { en: 'Swimming Performance Arena', ar: 'صالة الألعاب المائية والسباحة' },
      action: {
        en: 'Preparing aquatic lanes and water-performance visuals...',
        ar: 'جاري ضبط مسارات السباحة والجاهزية المائية...',
      },
      icon: Waves,
    };
  }

  // Football
  if (p.includes('/football')) {
    return {
      badge: { en: 'FOOTBALL CENTER', ar: 'مركز كرة القدم' },
      title: { en: 'Football Training Pitch', ar: 'الملعب التدريبي لكرة القدم' },
      action: {
        en: 'Setting up tactical pitch geometry and training drills...',
        ar: 'جاري تهيئة الملعب والتمارين التكتيكية...',
      },
      icon: Trophy,
    };
  }

  // Basketball
  if (p.includes('/basketball')) {
    return {
      badge: { en: 'BASKETBALL ARENA', ar: 'صالة السلة' },
      title: { en: 'Basketball Championship Court', ar: 'صالة كرة السلة التنافسية' },
      action: {
        en: 'Preparing hardwood court and athletic agility systems...',
        ar: 'جاري إعداد أرضية الملعب وأنظمة الرشاقة...',
      },
      icon: Flame,
    };
  }

  // Tennis
  if (p.includes('/tennis')) {
    return {
      badge: { en: 'TENNIS COURTS', ar: 'ملاعب التنس' },
      title: { en: 'Championship Tennis Center', ar: 'ملاعب التنس التنافسية' },
      action: {
        en: 'Aligning baseline geometry and precision match gear...',
        ar: 'جاري معايرة ملاعب التنس ودقة الإرسال...',
      },
      icon: Activity,
    };
  }

  // Martial Arts
  if (p.includes('/martial-arts')) {
    return {
      badge: { en: 'COMBAT DOJO', ar: 'دوجو القتال' },
      title: { en: 'Martial Arts & Combat Arena', ar: 'دوجو الفنون القتالية وبساط التحدي' },
      action: {
        en: 'Preparing defensive tatami mats and athlete discipline...',
        ar: 'جاري تجهيز بساط التدريب والانضباط الدفاعي...',
      },
      icon: Shield,
    };
  }

  // Gymnastics
  if (p.includes('/gymnastics')) {
    return {
      badge: { en: 'MOVEMENT STUDIO', ar: 'استوديو الجمباز' },
      title: { en: 'Gymnastics & Movement Studio', ar: 'استوديو الجمباز والرشاقة الحركية' },
      action: {
        en: 'Calibrating balance apparatus and gymnastics floor...',
        ar: 'جاري تجهيز أجهزة التوازن والرشاقة الحركية...',
      },
      icon: Sparkles,
    };
  }

  // Store Cart & Checkout
  if (p.includes('/store/cart') || p.includes('/store/checkout')) {
    return {
      badge: { en: 'SECURE CHECKOUT', ar: 'الدفع الآمن' },
      title: { en: 'Athlete Cart & Logistics', ar: 'سلة المشتريات ومحرك الدفع الآمن' },
      action: {
        en: 'Securing selected athletic items and dispatch routes...',
        ar: 'جاري تأمين المشتريات وتحديد مسار الشحن السريع...',
      },
      icon: CreditCard,
    };
  }

  // Store Account & Orders
  if (p.includes('/store/account') || p.includes('/store/orders') || p.includes('/store/wishlist') || p.includes('/store/addresses')) {
    return {
      badge: { en: 'ATHLETE HUB', ar: 'منصة الرياضي' },
      title: { en: 'Member Profile & Order Radar', ar: 'حساب العضوية وسجل الطلبات' },
      action: {
        en: 'Retrieving athlete tier, delivery history and saved items...',
        ar: 'جاري استرجاع مستوى العضوية وسجل الطلبات...',
      },
      icon: UserRound,
    };
  }

  // Store Shop / Categories / Products
  if (p.startsWith('/store')) {
    return {
      badge: { en: 'OFFICIAL STORE', ar: 'المتجر الرسمي' },
      title: { en: 'United Olympics Sports Store', ar: 'متجر يونايتد أوليمبيكس الرسمي' },
      action: {
        en: 'Preparing apparel, performance gear and equipment...',
        ar: 'جاري تجهيز كتالوج الأزياء والمعدات الرياضية...',
      },
      icon: ShoppingBag,
    };
  }

  // Admin / Store Admin
  if (p.startsWith('/admin')) {
    return {
      badge: { en: 'OPERATIONS', ar: 'إدارة العمليات' },
      title: { en: 'Operations & Commerce Gateway', ar: 'بوابة الإدارة والعمليات التشغيلية' },
      action: {
        en: 'Synchronizing operational diagnostics and catalog telemetry...',
        ar: 'جاري مزامنة أنظمة الأمان والعمليات التشغيلية...',
      },
      icon: ShieldCheck,
    };
  }

  // Player Portal
  if (p.startsWith('/player')) {
    return {
      badge: { en: 'ATHLETE PORTAL', ar: 'بوابة الرياضي' },
      title: { en: 'Athlete Development Radar', ar: 'بوابة الرياضي ورادار الأداء' },
      action: {
        en: 'Calibrating skill progressions, radar metrics and attendance...',
        ar: 'جاري تحميل القياسات الحيوية وسجل التطور الرياضي...',
      },
      icon: Zap,
    };
  }

  // Parent Portal
  if (p.startsWith('/parent')) {
    return {
      badge: { en: 'FAMILY PORTAL', ar: 'بوابة الأسرة' },
      title: { en: 'Parent & Family Portal', ar: 'بوابة ولي الأمر والأسرة' },
      action: {
        en: 'Syncing family schedule, coaching reports and notifications...',
        ar: 'جاري ربط جدول العائلة ومتابعة تقارير التدريب...',
      },
      icon: Heart,
    };
  }

  // Coach Portal
  if (p.startsWith('/coach')) {
    return {
      badge: { en: 'COMMAND CENTER', ar: 'مركز المدربين' },
      title: { en: 'Coach Command Center', ar: 'مركز قيادة وتوجيه المدربين' },
      action: {
        en: 'Loading tactical rosters, training drills and athlete logs...',
        ar: 'جاري تحميل القوائم التكتيكية وخطط الحصص التدريبية...',
      },
      icon: Compass,
    };
  }

  // Programs
  if (p.includes('/programs')) {
    return {
      badge: { en: 'PATHWAYS', ar: 'المسارات الرياضية' },
      title: { en: 'United Training Pathways', ar: 'المسارات والبرامج التدريبية' },
      action: {
        en: 'Loading age divisions, developmental curricula and enrollments...',
        ar: 'جاري تحميل المسارات العمرية والمناهج التدريبية...',
      },
      icon: Target,
    };
  }

  // Coaches
  if (p.includes('/coaches')) {
    return {
      badge: { en: 'COACHING STAFF', ar: 'الكادر التدريبي' },
      title: { en: 'United Sports Coaches', ar: 'كادر مدربي يونايتد الرياضي' },
      action: {
        en: 'Preparing coach profiles and achievement records...',
        ar: 'جاري تجهيز ملفات المدربين وسجلات الإنجازات...',
      },
      icon: Users,
    };
  }

  // About
  if (p.includes('/about')) {
    return {
      badge: { en: 'HERITAGE', ar: 'الرؤية والتاريخ' },
      title: { en: 'Vision, Values & Heritage', ar: 'الرؤية والقيم والتاريخ الرياضي' },
      action: {
        en: 'Loading organization philosophy, foundational standards and vision...',
        ar: 'جاري تحميل فلسفة المؤسسة ومعاييرها الرياضية...',
      },
      icon: Sparkles,
    };
  }

  // Contact
  if (p.includes('/contact')) {
    return {
      badge: { en: 'COMMUNICATIONS', ar: 'التواصل والدعم' },
      title: { en: 'Athlete Support & Desk', ar: 'دعم واستفسارات الرياضيين' },
      action: {
        en: 'Opening official communication gateway and enquiry channels...',
        ar: 'جاري فتح قنوات التواصل والاستفسارات المعتمدة...',
      },
      icon: Mail,
    };
  }

  // Benchmark
  if (p.includes('/benchmark')) {
    return {
      badge: { en: 'DIAGNOSTICS', ar: 'الفحص التقني' },
      title: { en: 'System Architecture Benchmarks', ar: 'معايير الأداء والأنظمة' },
      action: {
        en: 'Verifying visual gates, telemetry feeds and benchmark suite...',
        ar: 'جاري تشغيل الفحص التقني ومعايير الأنظمة...',
      },
      icon: Activity,
    };
  }

  // Default Home
  return {
    badge: { en: 'UNITED SPORTS CAMPUS', ar: 'منصة يونايتد الرياضية' },
    title: { en: 'United Olympics Sports', ar: 'يونايتد أوليمبيكس سبورت' },
    action: {
      en: 'Opening the United sports experience...',
      ar: 'جاري فتح منصة يونايتد الرياضية والتجربة الرياضية...',
    },
    icon: Trophy,
  };
}

export function OlympicRouteTransition() {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeMeta, setActiveMeta] = useState<DestinationMeta>(() =>
    getDestinationMeta(location.pathname)
  );
  const isFirstMount = useRef(true);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    // Skip on first load so splash screen takes precedence
    if (isFirstMount.current) {
      isFirstMount.current = false;
      prevPath.current = location.pathname;
      return;
    }

    // Only transition if path actually changed.
    // Reduced-motion users should not receive a blocking route overlay.
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      prevPath.current = location.pathname;
      return;
    }

    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname;
      const meta = getDestinationMeta(location.pathname);
      setActiveMeta(meta);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 260); // Short visual transition; never block navigation for long

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const IconComponent = activeMeta.icon;

  return (
    <AnimatePresence mode="wait">
      {isTransitioning && (
        <motion.aside
          key={`route-loader-${location.pathname}`}
          className="olympic-route-loader-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          role="status"
          aria-live="polite"
          aria-label={`Loading ${activeMeta.title.en} | ${activeMeta.title.ar}`}
        >
          <div className="olympic-route-loader-card">
            {/* Central Medallion Stage */}
            <div className="route-loader-medallion-stage">
              <div className="route-loader-spinner-ring" aria-hidden="true" />
              <div className="route-loader-counter-ring" aria-hidden="true" />
              <AppLogo size={88} withGoldBorder withGlow />
              <div className="route-loader-dynamic-icon">
                <IconComponent size={18} />
              </div>
            </div>

            {/* Destination Header */}
            <div className="route-loader-badge">
              <span>{activeMeta.badge.en}</span>
              <small>· {activeMeta.badge.ar}</small>
            </div>

            <h3 className="route-loader-title">{activeMeta.title.en}</h3>
            <h4 className="route-loader-title-ar">{activeMeta.title.ar}</h4>

            <p className="route-loader-action-note">
              <span>{activeMeta.action.en}</span>
              <br />
              <span style={{ color: '#d1d5db', direction: 'rtl', display: 'inline-block' }}>
                {activeMeta.action.ar}
              </span>
            </p>

            {/* Golden Progress Bar */}
            <div className="route-loader-progress-track">
              <div className="route-loader-progress-fill" />
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
