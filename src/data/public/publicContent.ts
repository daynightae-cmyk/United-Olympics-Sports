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

export type PublicProgramSportId =
  | 'football'
  | 'swimming'
  | 'basketball'
  | 'tennis'
  | 'gymnastics'
  | 'martial-arts';

export type PublicTrainingProgram = Readonly<{
  id: string;
  slug: string;
  sportId: PublicProgramSportId;
  name: LocalizedText;
  sport: LocalizedText;
  ageGroup: LocalizedText;
  level: LocalizedText;
  focus: LocalizedText;
  description: LocalizedText;
  pillars: readonly LocalizedText[];
  coachApproach: LocalizedText;
  sessionExperience: LocalizedText;
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

export const PUBLIC_PROGRAMS: readonly PublicTrainingProgram[] = [
  {
    id: 'football-foundations',
    slug: 'football-foundations',
    sportId: 'football',
    name: text('مسار أساسيات كرة القدم', 'Football Foundations'),
    sport: text('كرة القدم', 'Football'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('التحكم بالكرة، الحركة، التمرير وقراءة اللعب', 'Ball control, movement, passing and game awareness'),
    description: text(
      'مسار تدريبي يربط إتقان الكرة بجودة الحركة والتواصل وفهم المساحات واتخاذ القرار.',
      'A training pathway connecting ball mastery with movement quality, communication, space awareness and decision-making.',
    ),
    pillars: [
      text('التحكم بالكرة', 'Ball mastery'),
      text('الحركة والتناسق', 'Movement & coordination'),
      text('التمرير والاستلام', 'Passing & receiving'),
      text('الوعي بالمباراة', 'Game awareness'),
    ],
    coachApproach: text(
      'شرح واضح، تكرار هادف، ملاحظة مستمرة وتغذية راجعة قابلة للتطبيق.',
      'Clear demonstrations, purposeful repetition, continuous observation and actionable feedback.',
    ),
    sessionExperience: text(
      'تهيئة حركية، كتلة مهارية، مواقف لعب مصغرة ثم مراجعة للتركيز التالي.',
      'Movement preparation, a skill block, small-sided game scenarios and a review of the next focus.',
    ),
  },
  {
    id: 'swimming-progressive',
    slug: 'swimming-progressive',
    sportId: 'swimming',
    name: text('مسار السباحة المتدرج', 'Progressive Swimming'),
    sport: text('السباحة', 'Swimming'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('الثقة في الماء، وضعية الجسم، التنفس والتقنية', 'Water confidence, body position, breathing and technique'),
    description: text(
      'مسار تدريبي يبني الثقة في الماء ويطور الوضعية والتنفس والإيقاع والكفاءة بصورة متدرجة.',
      'A training pathway building water confidence while developing body position, breathing, rhythm and efficiency progressively.',
    ),
    pillars: [
      text('الثقة في الماء', 'Water confidence'),
      text('وضعية الجسم', 'Body position'),
      text('التنفس والإيقاع', 'Breathing & rhythm'),
      text('التحمل الفني', 'Technical endurance'),
    ],
    coachApproach: text(
      'إشارات فنية قصيرة، تكرار مضبوط وتصحيح يتناسب مع مستوى السباح.',
      'Concise technical cues, controlled repetition and corrections matched to the swimmer’s stage.',
    ),
    sessionExperience: text(
      'تهيئة داخل الماء، تدريبات تقنية، عمل بإيقاع منظم ثم مراجعة الأداء.',
      'In-water preparation, technical drills, paced practice and an end-of-session review.',
    ),
  },
  {
    id: 'basketball-team-performance',
    slug: 'basketball-team-performance',
    sportId: 'basketball',
    name: text('مسار مهارات وأداء كرة السلة', 'Basketball Skills & Team Play'),
    sport: text('كرة السلة', 'Basketball'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('المراوغة، التمرير، التصويب، حركة القدمين واتخاذ القرار', 'Dribbling, passing, shooting, footwork and decision-making'),
    description: text(
      'مسار يربط المهارة الفردية بسرعة القراءة والتواصل والمسؤولية داخل اللعب الجماعي.',
      'A pathway connecting individual skill with faster reads, communication and responsibility inside team play.',
    ),
    pillars: [
      text('التحكم بالكرة', 'Ball handling'),
      text('التصويب والتمرير', 'Shooting & passing'),
      text('حركة القدمين', 'Footwork'),
      text('اللعب واتخاذ القرار', 'Team play & decisions'),
    ],
    coachApproach: text(
      'كتل مهارية قصيرة تتبعها مواقف لعب موجهة وتصحيح مباشر.',
      'Short skill blocks followed by guided game situations and direct feedback.',
    ),
    sessionExperience: text(
      'تهيئة، مهارة فردية، مواقف ثنائية وجماعية ثم مراجعة القرارات.',
      'Preparation, individual skill work, paired and team scenarios, then decision review.',
    ),
  },
  {
    id: 'tennis-individual-skills',
    slug: 'tennis-individual-skills',
    sportId: 'tennis',
    name: text('مسار مهارات التنس', 'Tennis Skills Pathway'),
    sport: text('التنس', 'Tennis'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('التحكم، التوقيت، حركة القدمين والثبات', 'Control, timing, footwork and consistency'),
    description: text(
      'مسار يطور وضعية الاستعداد وحركة القدمين وجودة الضربات وبناء النقطة بتدرج واضح.',
      'A pathway developing ready position, footwork, stroke quality and point construction through clear progression.',
    ),
    pillars: [
      text('وضعية الاستعداد', 'Ready position'),
      text('حركة القدمين', 'Footwork'),
      text('التوقيت والتحكم', 'Timing & control'),
      text('الثبات وبناء النقطة', 'Consistency & point building'),
    ],
    coachApproach: text(
      'تكرارات مركزة، إشارات تمركز واضحة وأهداف فنية قابلة للمراجعة.',
      'Focused repetitions, clear positioning cues and technical goals that can be reviewed.',
    ),
    sessionExperience: text(
      'تهيئة، عمل على الضربات، أنماط حركة، مواقف نقاط ثم مراجعة.',
      'Preparation, stroke work, movement patterns, point scenarios and review.',
    ),
  },
  {
    id: 'gymnastics-movement-foundations',
    slug: 'gymnastics-movement-foundations',
    sportId: 'gymnastics',
    name: text('مسار الحركة التأسيسية للجمباز', 'Gymnastics Movement Foundations'),
    sport: text('الجمباز', 'Gymnastics'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('الاتزان، المرونة الحركية، التحكم وقوة الجسم', 'Balance, mobility, control and body strength'),
    description: text(
      'مسار حركة يركز على الأساسيات الآمنة للاتزان والمرونة والتحكم والتنسيق.',
      'A movement pathway focused on safe foundations for balance, mobility, control and coordination.',
    ),
    pillars: [
      text('الاتزان', 'Balance'),
      text('المرونة الحركية', 'Mobility'),
      text('التحكم بالجسم', 'Body control'),
      text('القوة والتنسيق', 'Strength & coordination'),
    ],
    coachApproach: text(
      'تدرج واضح في الحركة مع أولوية للجودة والتحكم قبل زيادة الصعوبة.',
      'Clear movement progression with quality and control prioritised before added difficulty.',
    ),
    sessionExperience: text(
      'تهيئة مرنة، أساسيات حركة، تمارين اتزان وتحكم ثم تهدئة ومراجعة.',
      'Mobility preparation, movement fundamentals, balance and control work, then cool-down and review.',
    ),
  },
  {
    id: 'martial-arts-discipline-technique',
    slug: 'martial-arts-discipline-technique',
    sportId: 'martial-arts',
    name: text('مسار الانضباط والتقنية', 'Martial Arts Discipline & Technique'),
    sport: text('الفنون القتالية', 'Martial Arts'),
    ageGroup: text('أطفال وناشئون', 'Children & youth'),
    level: text('تدرج حسب الجاهزية', 'Readiness-based progression'),
    focus: text('الاحترام، التركيز، التحكم، الوقفة والتقنية', 'Respect, focus, control, stance and technique'),
    description: text(
      'مسار منضبط يربط السلوك الرياضي بالتركيز والتحكم وجودة الحركة والتقنية.',
      'A disciplined pathway connecting sportsmanship with focus, control, movement quality and technique.',
    ),
    pillars: [
      text('الاحترام والانضباط', 'Respect & discipline'),
      text('الوقفة والحركة', 'Stance & movement'),
      text('التحكم والتقنية', 'Control & technique'),
      text('التركيز والمسؤولية', 'Focus & responsibility'),
    ],
    coachApproach: text(
      'تعليم منظم يبدأ بالسلامة والاحترام ثم يبني التقنية والتحكم خطوة بخطوة.',
      'Structured instruction that starts with safety and respect, then develops technique and control step by step.',
    ),
    sessionExperience: text(
      'تهيئة، أساسيات الوقفة والحركة، تطبيق تقني منضبط ثم مراجعة وانضباط ختامي.',
      'Preparation, stance and movement fundamentals, controlled technical practice, then review and close.',
    ),
  },
] as const;

export const getPublicProgram = (slug?: string) =>
  PUBLIC_PROGRAMS.find(program => program.slug === slug);

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
