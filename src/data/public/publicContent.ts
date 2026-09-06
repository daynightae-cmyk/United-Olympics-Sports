import type { LocalizedText, PublicSportId } from './publicMedia';

export type PublicSport = Readonly<{
  id: PublicSportId;
  slug: string;
  name: LocalizedText;
  summary: LocalizedText;
  heroSummary: LocalizedText;
  themes: readonly LocalizedText[];
  path: readonly LocalizedText[];
  accent: string;
}>;

const text = (ar: string, en: string): LocalizedText => ({ ar, en });

export const PUBLIC_SPORTS: readonly PublicSport[] = [
  {
    id: 'football', slug: 'football', name: text('كرة القدم', 'Football'),
    summary: text('تطوير المهارة، التحكم، الوعي بالملعب والعمل الجماعي.', 'Skill, control, field awareness and teamwork.'),
    heroSummary: text('مساحة تدريب منظمة تبني الحركة والتحكم والوعي والعمل الجماعي خطوة بعد خطوة.', 'A structured training environment that builds movement, control, awareness and teamwork step by step.'),
    themes: [text('الحركة', 'Movement'), text('التحكم', 'Control'), text('الوعي', 'Awareness'), text('روح الفريق', 'Teamwork')],
    path: [text('أساس الحركة', 'Movement foundation'), text('التحكم بالكرة', 'Ball control'), text('الوعي بالمساحة', 'Spatial awareness'), text('اللعب الجماعي', 'Team play')],
    accent: '#b8944d',
  },
  {
    id: 'swimming', slug: 'swimming', name: text('السباحة', 'Swimming'),
    summary: text('الثقة في الماء، التقنية، التنفس والتحمل.', 'Water confidence, technique, breathing and endurance.'),
    heroSummary: text('تدريب هادئ ومتدرج يربط الثقة في الماء بالتقنية والإيقاع والتحمل.', 'Calm, progressive training connecting water confidence with technique, rhythm and endurance.'),
    themes: [text('الثقة في الماء', 'Water confidence'), text('التقنية', 'Technique'), text('التنفس', 'Breathing'), text('التحمل', 'Endurance')],
    path: [text('وضعية الجسم', 'Body position'), text('التنفس', 'Breathing'), text('الإيقاع', 'Rhythm'), text('التحمل', 'Endurance')],
    accent: '#4f9eaa',
  },
  {
    id: 'basketball', slug: 'basketball', name: text('كرة السلة', 'Basketball'),
    summary: text('السرعة، التحكم، اتخاذ القرار والعمل الجماعي.', 'Speed, control, decision-making and teamwork.'),
    heroSummary: text('تجربة تدريب ديناميكية تطور التحكم وقراءة المساحة والقرار المشترك.', 'A dynamic training experience developing control, space reading and shared decisions.'),
    themes: [text('الحركة', 'Movement'), text('التحكم بالكرة', 'Handling'), text('قراءة الملعب', 'Reading space'), text('اتخاذ القرار', 'Decision-making')],
    path: [text('الحركة', 'Movement'), text('التحكم', 'Handling'), text('التمرير', 'Passing'), text('التعاون', 'Collaboration')],
    accent: '#c47743',
  },
  {
    id: 'tennis', slug: 'tennis', name: text('التنس', 'Tennis'),
    summary: text('التركيز، التوقيت، حركة القدمين والتكرار الذكي.', 'Focus, timing, footwork and intelligent repetition.'),
    heroSummary: text('بيئة تدريب تصقل التركيز والتوقيت وحركة القدمين من خلال التكرار الهادف.', 'A training environment refining focus, timing and footwork through purposeful repetition.'),
    themes: [text('التركيز', 'Focus'), text('التكرار', 'Repetition'), text('التوقيت', 'Timing'), text('حركة القدمين', 'Footwork')],
    path: [text('وضعية الاستعداد', 'Ready position'), text('حركة القدمين', 'Footwork'), text('التوقيت', 'Timing'), text('الثبات', 'Consistency')],
    accent: '#89964c',
  },
  {
    id: 'gymnastics', slug: 'gymnastics', name: text('الجمباز', 'Gymnastics'),
    summary: text('الاتزان، المرونة، التحكم والثقة.', 'Balance, flexibility, control and confidence.'),
    heroSummary: text('تدريب حركي يوازن بين المرونة والتحكم والثقة مع أولوية لسلامة التطور.', 'Movement training balancing flexibility, control and confidence with safe development first.'),
    themes: [text('الاتزان', 'Balance'), text('المرونة', 'Flexibility'), text('التحكم', 'Control'), text('سلامة التدريب', 'Training safety')],
    path: [text('تأسيس الحركة', 'Movement foundation'), text('الاتزان', 'Balance'), text('التحكم', 'Control'), text('الثقة', 'Confidence')],
    accent: '#9b718d',
  },
  {
    id: 'martialArts', slug: 'martial-arts', name: text('الفنون القتالية', 'Martial Arts'),
    summary: text('احترام، تركيز، تحكم ومسؤولية.', 'Respect, focus, control and responsibility.'),
    heroSummary: text('بيئة منضبطة تجعل الاحترام والتحكم والتركيز أساسًا لكل حركة.', 'A disciplined environment where respect, control and focus guide every movement.'),
    themes: [text('الاحترام', 'Respect'), text('التركيز', 'Focus'), text('التحكم', 'Control'), text('المسؤولية', 'Responsibility')],
    path: [text('الاستعداد', 'Readiness'), text('التركيز', 'Focus'), text('التحكم', 'Control'), text('الانضباط', 'Discipline')],
    accent: '#9a6e4e',
  },
] as const;

export const PUBLIC_PROGRAMS: readonly [] = [];
export const PUBLIC_BRANCHES: readonly [] = [];
export const PUBLIC_COACHES: readonly [] = [];

export const PUBLIC_SOCIAL_LINKS = {
  instagram: '', facebook: '', tiktok: '', youtube: '', x: '', whatsapp: '', linkedin: '',
} as const;

export const PORTAL_LINKS = [
  { path: '/player/login', label: text('اللاعب', 'Player') },
  { path: '/parent/login', label: text('ولي الأمر', 'Parent') },
  { path: '/coach/login', label: text('المدرب', 'Coach') },
  { path: '/store/login', label: text('المتجر', 'Store') },
  { path: '/admin/login', label: text('الإدارة', 'Admin') },
] as const;
