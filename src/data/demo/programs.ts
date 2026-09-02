import type { BilingualText } from '../../domain/contracts';

export type DemoProgram = {
  id: string;
  slug: string;
  sportId: 'football' | 'swimming' | 'basketball' | 'tennis';
  name: BilingualText;
  sport: BilingualText;
  ageGroup: BilingualText;
  level: BilingualText;
  focus: BilingualText;
  description: BilingualText;
  pillars: BilingualText[];
  coachApproach: BilingualText;
  sessionExperience: BilingualText;
};

export const demoPrograms: DemoProgram[] = [
  {
    id: 'program-demo-football-foundation', slug: 'football-foundations', sportId: 'football',
    name: { en: 'Foundations Programme', ar: 'برنامج الأساسيات' }, sport: { en: 'Football', ar: 'كرة القدم' },
    ageGroup: { en: 'Children & youth', ar: 'الأطفال والناشئون' }, level: { en: 'Foundation', ar: 'تأسيسي' },
    focus: { en: 'Movement, coordination and confidence', ar: 'الحركة والتناسق والثقة' },
    description: { en: 'A visual programme concept centred on ball confidence, movement quality and team awareness.', ar: 'تصور بصري لبرنامج يركز على الثقة بالكرة وجودة الحركة والوعي الجماعي.' },
    pillars: [{ en: 'Ball control', ar: 'التحكم بالكرة' }, { en: 'Movement', ar: 'الحركة' }, { en: 'Team awareness', ar: 'الوعي الجماعي' }],
    coachApproach: { en: 'Clear demonstrations, repeatable drills and constructive feedback.', ar: 'شرح واضح وتدريبات قابلة للتكرار وملاحظات بناءة.' },
    sessionExperience: { en: 'Warm-up, technical focus, game-based practice and reflection.', ar: 'إحماء ثم تركيز فني وتدريب قائم على اللعب ومراجعة ختامية.' },
  },
  {
    id: 'program-demo-swimming-progressive', slug: 'swimming-progressive', sportId: 'swimming',
    name: { en: 'Progressive Swim Track', ar: 'المسار المتدرج للسباحة' }, sport: { en: 'Swimming', ar: 'السباحة' },
    ageGroup: { en: 'Children & youth', ar: 'الأطفال والناشئون' }, level: { en: 'Development', ar: 'تطويري' },
    focus: { en: 'Technique, breathing and endurance', ar: 'التقنية والتنفس والتحمل' },
    description: { en: 'A visual programme concept for confidence in the water, efficient technique and progressive endurance.', ar: 'تصور بصري لبرنامج يركز على الثقة في الماء وكفاءة التقنية وتطوير التحمل تدريجيًا.' },
    pillars: [{ en: 'Water confidence', ar: 'الثقة في الماء' }, { en: 'Technique', ar: 'التقنية' }, { en: 'Endurance', ar: 'التحمل' }],
    coachApproach: { en: 'Technique cues, controlled repetition and athlete-specific correction.', ar: 'إشارات فنية وتكرار منضبط وتصحيح يناسب كل رياضي.' },
    sessionExperience: { en: 'Preparation, technique blocks, paced practice and review.', ar: 'تهيئة ثم كتل فنية وتدريب بإيقاع منظم ومراجعة.' },
  },
  {
    id: 'program-demo-basketball-team', slug: 'basketball-team-performance', sportId: 'basketball',
    name: { en: 'Team Performance Lab', ar: 'مختبر أداء الفرق' }, sport: { en: 'Basketball', ar: 'كرة السلة' },
    ageGroup: { en: 'Youth', ar: 'الناشئون' }, level: { en: 'Development', ar: 'تطويري' },
    focus: { en: 'Decision-making and teamwork', ar: 'اتخاذ القرار والعمل الجماعي' },
    description: { en: 'A visual programme concept that connects individual skill with movement, communication and team decisions.', ar: 'تصور بصري لبرنامج يربط المهارة الفردية بالحركة والتواصل واتخاذ القرار الجماعي.' },
    pillars: [{ en: 'Ball handling', ar: 'التحكم بالكرة' }, { en: 'Decision making', ar: 'اتخاذ القرار' }, { en: 'Team play', ar: 'اللعب الجماعي' }],
    coachApproach: { en: 'Short skill blocks followed by guided team scenarios and feedback.', ar: 'كتل مهارية قصيرة تتبعها مواقف جماعية موجهة وملاحظات.' },
    sessionExperience: { en: 'Movement prep, skill work, team situations and review.', ar: 'تهيئة حركية ثم عمل مهاري ومواقف جماعية ومراجعة.' },
  },
  {
    id: 'program-demo-tennis-skills', slug: 'tennis-individual-skills', sportId: 'tennis',
    name: { en: 'Individual Skills Studio', ar: 'استوديو المهارات الفردية' }, sport: { en: 'Tennis', ar: 'التنس' },
    ageGroup: { en: 'Youth', ar: 'الناشئون' }, level: { en: 'All levels', ar: 'جميع المستويات' },
    focus: { en: 'Control, repetition and focus', ar: 'التحكم والتكرار والتركيز' },
    description: { en: 'A code-driven visual programme concept for control, footwork, repetition and match awareness.', ar: 'تصور بصري برمجي لبرنامج يركز على التحكم وحركة القدمين والتكرار ووعي المباراة.' },
    pillars: [{ en: 'Control', ar: 'التحكم' }, { en: 'Footwork', ar: 'حركة القدمين' }, { en: 'Consistency', ar: 'الثبات' }],
    coachApproach: { en: 'Focused repetitions, positional cues and clear progression goals.', ar: 'تكرارات مركزة وإشارات تمركز وأهداف تقدم واضحة.' },
    sessionExperience: { en: 'Movement preparation, stroke focus, point scenarios and review.', ar: 'تهيئة حركية ثم تركيز على الضربات ومواقف نقاط ومراجعة.' },
  },
];

export const getDemoProgram = (slug?: string) => demoPrograms.find(program => program.slug === slug);
