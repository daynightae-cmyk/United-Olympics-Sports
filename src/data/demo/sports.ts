import type { Sport } from '../../domain/contracts';

export const demoSports: Sport[] = [
  {
    id: 'football',
    name: { en: 'Football', ar: 'كرة القدم' },
    description: { en: 'Preview structure for team technique, awareness and movement.', ar: 'هيكل تجريبي لتقنية الفريق والوعي والحركة.' },
    ageGroups: [{ en: 'Under 12', ar: 'تحت 12 سنة' }, { en: 'Under 15', ar: 'تحت 15 سنة' }],
    programIds: ['program-demo-football-foundation'], icon: 'football', status: 'active',
  },
  {
    id: 'swimming',
    name: { en: 'Swimming', ar: 'السباحة' },
    description: { en: 'Preview structure for progressive technique and water confidence.', ar: 'هيكل تجريبي للتقنية المتدرجة والثقة في الماء.' },
    ageGroups: [{ en: 'Beginners', ar: 'مبتدئون' }, { en: 'Youth', ar: 'ناشئون' }],
    programIds: ['program-demo-swimming-progressive'], icon: 'swimming', status: 'active',
  },
  {
    id: 'basketball',
    name: { en: 'Basketball', ar: 'كرة السلة' },
    description: { en: 'Preview structure for movement, decisions and team play.', ar: 'هيكل تجريبي للحركة والقرارات واللعب الجماعي.' },
    ageGroups: [{ en: 'Under 14', ar: 'تحت 14 سنة' }],
    programIds: ['program-demo-basketball-team'], icon: 'basketball', status: 'active',
  },
  {
    id: 'tennis',
    name: { en: 'Tennis', ar: 'التنس' },
    description: { en: 'Preview structure for control, consistency and match awareness.', ar: 'هيكل تجريبي للتحكم والثبات ووعي المباراة.' },
    ageGroups: [{ en: 'Youth', ar: 'ناشئون' }],
    programIds: ['program-demo-tennis-skills'], icon: 'tennis', status: 'active',
  },
  {
    id: 'gymnastics',
    name: { en: 'Gymnastics', ar: 'الجمباز' },
    description: { en: 'Preview structure for balance, flexibility and execution.', ar: 'هيكل تجريبي للتوازن والمرونة والتنفيذ.' },
    ageGroups: [{ en: 'Foundation', ar: 'تأسيسي' }],
    programIds: ['program-demo-gymnastics-foundation'], icon: 'gymnastics', status: 'active',
  },
  {
    id: 'martial-arts',
    name: { en: 'Martial Arts', ar: 'الفنون القتالية' },
    description: { en: 'Preview structure for control, discipline and technique.', ar: 'هيكل تجريبي للتحكم والانضباط والتقنية.' },
    ageGroups: [{ en: 'Youth', ar: 'ناشئون' }],
    programIds: ['program-demo-martial-arts-discipline'], icon: 'martial-arts', status: 'active',
  },
];
