import { bi } from '../components/bilingual/BilingualText';
import type { StoreCategory } from './storeTypes';

export const storeCategories: StoreCategory[] = [
  { slug: 'swimming', name: bi('Swimming', 'السباحة'), description: bi('Technique-led equipment and training essentials.', 'معدات ومستلزمات تدريب تركز على تطوير التقنية.'), accent: '#58b9c5', hero: '/media/sports/swimming/swimming-06-hero.webp' },
  { slug: 'football', name: bi('Football', 'كرة القدم'), description: bi('Team training essentials for disciplined performance.', 'مستلزمات تدريب جماعي لأداء منضبط.'), accent: '#3f9b66', hero: '/media/sports/football/football-01-hero.webp' },
  { slug: 'basketball', name: bi('Basketball', 'كرة السلة'), description: bi('Court equipment and athlete essentials.', 'معدات الملعب ومستلزمات الرياضيين.'), accent: '#c77a3b', hero: '/media/sports/basketball/basketball-01-shooting-technique.webp' },
  { slug: 'tennis', name: bi('Tennis', 'التنس'), description: bi('Rackets, grips and training accessories.', 'مضارب وقبضات وإكسسوارات التدريب.'), accent: '#9cbf45' },
  { slug: 'gymnastics', name: bi('Gymnastics', 'الجمباز'), description: bi('Apparel and foundational training accessories.', 'ملابس وإكسسوارات التدريب الأساسي.'), accent: '#8a66b6' },
  { slug: 'martial-arts', name: bi('Martial Arts', 'الفنون القتالية'), description: bi('Uniforms, protection and controlled practice gear.', 'زي ومعدات حماية للتدريب المنضبط.'), accent: '#a95151' },
  { slug: 'apparel', name: bi('Apparel', 'الملابس'), description: bi('Performance layers designed for movement.', 'ملابس أداء مصممة للحركة.'), accent: '#9a6c15' },
  { slug: 'equipment', name: bi('Equipment', 'المعدات'), description: bi('Training equipment across every discipline.', 'معدات تدريب لمختلف الرياضات.'), accent: '#9a6c15' },
  { slug: 'accessories', name: bi('Accessories', 'الإكسسوارات'), description: bi('Bags, bottles and daily training essentials.', 'حقائب وزجاجات ومستلزمات التدريب اليومية.'), accent: '#9a6c15' },
];

