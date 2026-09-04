/**
 * United Assistant — service abstraction (Mission 10X).
 *
 * Layers: navigation/help provider (live, deterministic) -> application
 * context -> future AI / knowledge / authenticated-user providers.
 * No secrets in frontend. No hallucinated business data: until a real
 * provider is connected the assistant only explains the interface, navigates
 * to real routes, and guides users to the correct portal.
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
  en: 'United Assistant',
  ar: 'مساعد يونايتد',
};

export function getAssistantQuickActions(): AssistantQuickAction[] {
  return [
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
      'I can guide you to Sports, Programs, your portal, or sign-in. Personal records, payments and schedules appear only inside the correct portal once real data is connected.',
      'يمكنني إرشادك إلى الرياضات أو البرامج أو بوابتك أو تسجيل الدخول. أما السجلات الشخصية والمدفوعات والجداول فتظهر فقط داخل البوابة الصحيحة بعد ربط البيانات الحقيقية.',
    ),
  };
}

/** Future AI providers plug in here. Null today: local guide mode. */
export function getAssistantProviderStatus(): { mode: 'local-guide'; aiConnected: boolean } {
  return { mode: 'local-guide', aiConnected: false };
}
