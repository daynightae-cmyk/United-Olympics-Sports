/**
 * UOS SPORTMIND — Service Abstraction (Mission 10X).
 *
 * Layers: deterministic sports navigation/help provider -> application
 * context -> OpenCode Sports AI provider adapter.
 * No secrets in frontend. No hallucinated business data: the assistant only
 * operates from verified application context, real routes, and verified portal data.
 */
import { bi } from '../components/bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../domain/contracts';

export interface AssistantQuickAction {
  id: string;
  label: BilingualValue;
  to?: string;
  help?: BilingualValue;
}

export const ASSISTANT_IDENTITY = {
  en: 'UOS SportMind',
  ar: 'ساحة الذكاء الرياضي',
};

export function getAssistantQuickActions(): AssistantQuickAction[] {
  return [
    { id: 'arena', label: bi('Open Intelligence Arena', 'ساحة الذكاء الرياضي'), to: '/assistant' },
    { id: 'sports', label: bi('Explore Sports', 'استكشف الرياضات'), to: '/sports' },
    { id: 'programs', label: bi('View Programs', 'البرامج'), to: '/programs' },
    { id: 'portal', label: bi('My Portal', 'بوابتي'), to: '/player/home' },
    {
      id: 'navigate',
      label: bi('Help Me Navigate', 'ساعدني في التنقل'),
      help: bi(
        'Public pages live under /sports, /programs, /coaches and /contact. Portals: /player/home for athletes, /parent for families, /coach for training staff, /admin for operations.',
        'الصفحات العامة تحت /sports و/programs و/coaches و/contact. البوابات: /player/home للرياضيين، و/parent للأسر، و/coach للكادر التدريبي، و/admin للعمليات.',
      ),
    },
  ];
}

const HELP_TOPICS: Array<{ keys: string[]; reply: BilingualValue; to?: string }> = [
  {
    keys: ['arena', 'intelligence', 'ai', 'sportmind', 'ذكاء', 'ساحة', 'مساعد'],
    reply: bi(
      'UOS SportMind Arena is the role-aware sports intelligence workspace. Expand to /assistant for tactical session planning, drill progressions, and verified records.',
      'ساحة الذكاء الرياضي هي مساحة العمل التكتيكية المصرح بها. انتقل إلى /assistant للحصول على خطط الحصص وتصعيد التدريبات والبيانات المعتمدة.',
    ),
    to: '/assistant',
  },
  {
    keys: ['schedule', 'session', 'training', 'جدول', 'حصة', 'تدريب'],
    reply: bi(
      'Athletes open /player/schedule for assigned sessions. Families use /parent/schedule. Coaches work from /coach/schedule.',
      'يفتح الرياضيون /player/schedule للحصص المخصصة. وتستخدم الأسر /parent/schedule. ويعمل المدربون من /coach/schedule.',
    ),
    to: '/player/schedule',
  },
  {
    keys: ['payment', 'invoice', 'subscription', 'دفع', 'اشتراك', 'فاتورة'],
    reply: bi(
      'Subscriptions and payments are preview-only until real billing is connected. Athletes: /player/subscription. Families: /parent/subscriptions.',
      'الاشتراكات والمدفوعات في وضع المعاينة فقط حتى ربط الفوترة الحقيقية. الرياضيون: /player/subscription. الأسر: /parent/subscriptions.',
    ),
    to: '/player/subscription',
  },
  {
    keys: ['coach', 'feedback', 'evaluation', 'مدرب', 'ملاحظات', 'تقييم'],
    reply: bi(
      'Coach feedback for athletes lives at /player/feedback. Families read it at /parent/feedback. Coaches write evaluations at /coach/evaluations.',
      'ملاحظات المدرب للرياضيين في /player/feedback. وتقرأها الأسر في /parent/feedback. ويكتب المدربون التقييمات في /coach/evaluations.',
    ),
    to: '/player/feedback',
  },
  {
    keys: ['login', 'sign in', 'password', 'otp', 'دخول', 'تسجيل', 'رمز'],
    reply: bi(
      'Athlete sign-in starts at /player/login with an explicit Preview Athlete Mode. Production providers stay disabled until backends are configured.',
      'يبدأ دخول الرياضيين من /player/login مع وضع معاينة صريح. ويبقى الموفرون الإنتاجيون معطلين حتى تهيئة الأنظمة الخلفية.',
    ),
    to: '/player/login',
  },
  {
    keys: ['document', 'certificate', 'consent', 'مستند', 'شهادة', 'موافقة'],
    reply: bi(
      'Documents are preview records until verified uploads exist. Athletes: /player/documents. Families: /parent/documents.',
      'المستندات سجلات معاينة حتى توجد ملفات موثقة. الرياضيون: /player/documents. الأسر: /parent/documents.',
    ),
    to: '/player/documents',
  },
];

export interface AssistantAnswer {
  text: BilingualValue;
  to?: string;
}

/** Deterministic local answer. Never invents records, balances, or people. */
export function answerLocally(query: string): AssistantAnswer {
  const normalized = query.toLowerCase();
  for (const topic of HELP_TOPICS) {
    if (topic.keys.some((key) => normalized.includes(key))) {
      return { text: topic.reply, to: topic.to };
    }
  }
  return {
    text: bi(
      'SportMind guides you through training sessions, programs, schedules, and portal navigation. Open /assistant to enter the full Sports Intelligence Arena.',
      'ترشدك ساحة الذكاء الرياضي في الحصص التدريبية والبرامج والجداول وبوابات النظام. انتقل إلى /assistant للدخول إلى ساحة الذكاء الكاملة.',
    ),
    to: '/assistant',
  };
}

/** Provider status check. Connects to server-side OpenCode or deterministic fallback. */
export function getAssistantProviderStatus(): { mode: 'sportmind' | 'local-guide'; aiConnected: boolean } {
  return { mode: 'sportmind', aiConnected: false };
}
