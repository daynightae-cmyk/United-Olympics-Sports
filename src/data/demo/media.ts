import type { SportMediaAsset, SportMediaUsage } from '../../domain/contracts';

// Verified image URLs will be added in a later visual mission. Empty by design.
export const demoSportMediaAssets: SportMediaAsset[] = [];

export const swimmingMediaPlan: Array<{ order: number; usage: SportMediaUsage; altEn: string; altAr: string }> = [
  { order: 1, usage: 'coach', altEn: 'Male coach teaching a young child', altAr: 'مدرب يعلم طفلًا صغيرًا' },
  { order: 2, usage: 'women', altEn: 'Female coach training girls', altAr: 'مدربة تدرب البنات' },
  { order: 3, usage: 'children', altEn: 'Young children beginner session', altAr: 'أطفال صغار مبتدئون' },
  { order: 4, usage: 'youth', altEn: 'Youth boys training', altAr: 'تدريب الشباب الأولاد' },
  { order: 5, usage: 'youth', altEn: 'Youth girls training', altAr: 'تدريب البنات' },
  { order: 6, usage: 'technique', altEn: 'Technique close-up', altAr: 'لقطة تعليم التقنية' },
  { order: 7, usage: 'technique', altEn: 'Underwater technique', altAr: 'تقنية تحت الماء' },
  { order: 8, usage: 'group', altEn: 'Group session', altAr: 'تدريب جماعي' },
  { order: 9, usage: 'performance', altEn: 'Advanced swimmers', altAr: 'سباحون متقدمون' },
  { order: 10, usage: 'performance', altEn: 'Coach-led performance session', altAr: 'حصة أداء بقيادة المدرب' },
];
