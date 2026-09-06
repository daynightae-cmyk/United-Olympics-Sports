import { bi } from '../components/bilingual/BilingualText';
import type { StoreProduct } from './storeTypes';

/**
 * Development-only fixtures. The StoreProvider never exposes these in a
 * production build. They exist solely to qualify layout and interactions.
 */
import imgGoggles from '../assets/images/elite_hydro_pro_goggles_1788696931060.jpg';
import imgFootball from '../assets/images/precision_match_football_1788696947302.jpg';
import imgRacket from '../assets/images/pro_carbon_tennis_racket_1788696962299.jpg';

export { storeCategories as previewCategories } from './storeCategories';

const colors = [bi('Black / Gold', 'أسود / ذهبي'), bi('Ivory / Gold', 'عاجي / ذهبي')];

/**
 * Official Brand Products using the verified, approved asset URLs without any third-party logos.
 * Strict adherence to brand-only content policy.
 */
export const BRAND_PRODUCTS: StoreProduct[] = [
  {
    id: 'uos-prod-goggles',
    slug: 'elite-hydro-pro-goggles',
    name: bi('Elite Hydro Pro Goggles', 'نظارات السباحة المائية الاحترافية'),
    description: bi(
      'Hydrodynamic anti-fog competition goggles with golden mirror tint.',
      'نظارات سباحة تنافسية مضادة للضباب مع عدسات عاكسة مذهبة.'
    ),
    category: 'swimming',
    type: bi('Aquatic Goggles', 'نظارات سباحة'),
    price: 165,
    currency: 'AED',
    sku: 'UOS-SW-001',
    badge: 'featured',
    colors,
    image: imgGoggles,
    gallery: [
      imgGoggles,
      imgGoggles,
    ],
    availability: 'available',
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'uos-prod-swim-cap',
    slug: 'championship-silicone-swim-cap',
    name: bi('Championship Silicone Swim Cap', 'قبعة السباحة السيليكونية للبطولات'),
    description: bi(
      'Seamless Olympic-grade silicone cap reducing drag in competitive swimming.',
      'قبعة سيليكون بمواصفات أولمبية لتقليل مقاومة الماء أثناء المنافسات.'
    ),
    category: 'swimming',
    type: bi('Silicone Cap', 'قبعة سيليكون'),
    price: 65,
    currency: 'AED',
    sku: 'UOS-SW-002',
    badge: 'new',
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.8,
    reviewCount: 29,
  },
  {
    id: 'uos-prod-kickboard',
    slug: 'hydrodynamic-training-kickboard',
    name: bi('Hydrodynamic Training Kickboard', 'لوح السباحة التدريبي الهيدروديناميكي'),
    description: bi(
      'High-density foam kickboard designed for kicking stamina and stroke power.',
      'لوح تدريب عالي الكثافة مصمم لتقوية ركلات الساقين وتطوير الأداء.'
    ),
    category: 'swimming',
    type: bi('Aquatic Gear', 'عتاد مائي'),
    price: 95,
    currency: 'AED',
    sku: 'UOS-SW-003',
    badge: 'featured',
    colors,
    image: imgFootball,
    gallery: [imgFootball],
    availability: 'available',
    rating: 4.9,
    reviewCount: 22,
  },
  {
    id: 'uos-prod-swim-fins',
    slug: 'pro-propulsion-training-fins',
    name: bi('Pro Propulsion Training Fins', 'زعانف التدريب المائي الاحترافية'),
    description: bi(
      'Short blade silicone fins for stroke cadence, kick tempo, and core speed.',
      'زعانف قصيرة من السيليكون لرفع إيقاع الركل وتحسين السرعة القصوى.'
    ),
    category: 'swimming',
    type: bi('Fins & Propulsion', 'زعانف ودفع مائي'),
    price: 185,
    currency: 'AED',
    sku: 'UOS-SW-004',
    badge: 'new',
    sizes: ['38-39', '40-41', '42-43', '44-45'],
    colors,
    image: imgFootball,
    gallery: [imgFootball],
    availability: 'available',
    rating: 5.0,
    reviewCount: 17,
  },
  {
    id: 'uos-prod-ball-black',
    slug: 'official-match-ball-onyx-gold',
    name: bi('Official Match Ball · Onyx Gold', 'كرة المباريات الرسمية · أسود وذهبي'),
    description: bi(
      'FIFA-standard thermal-bonded competition ball engineered for aerodynamic balance.',
      'كرة المباريات المعتمدة بتقنية اللحام الحراري لتحقيق التوازن الهوائي.'
    ),
    category: 'football',
    type: bi('Match Ball', 'كرة مباريات'),
    price: 145,
    currency: 'AED',
    sku: 'UOS-FB-001',
    badge: 'featured',
    colors,
    image: imgRacket,
    gallery: [
      imgRacket,
      imgRacket,
    ],
    availability: 'available',
    rating: 4.9,
    reviewCount: 44,
  },
  {
    id: 'uos-prod-ball-ivory',
    slug: 'official-match-ball-royal-ivory',
    name: bi('Official Match Ball · Royal Ivory', 'كرة المباريات الرسمية · عاجي ملكي'),
    description: bi(
      'Championship edition textured match ball with gilded Olympic emblems.',
      'إصدار البطولات بسطح ملمس محكم وشعارات أولمبية مذهبة.'
    ),
    category: 'football',
    type: bi('Match Ball', 'كرة مباريات'),
    price: 145,
    currency: 'AED',
    sku: 'UOS-FB-002',
    badge: 'new',
    colors,
    image: imgRacket,
    gallery: [imgRacket],
    availability: 'available',
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: 'uos-prod-shin-guards',
    slug: 'armor-fit-pro-shin-guards',
    name: bi('Armor-Fit Pro Shin Guards', 'واقيات الساق المدرعة الاحترافية'),
    description: bi(
      'Impact-dissipating carbon-composite shin guards with ergonomic sleeves.',
      'واقيات ساق من ألياف الكربون لامتصاص الصدمات مع أكمام تثبيت مريحة.'
    ),
    category: 'football',
    type: bi('Protection Gear', 'عتاد الحماية'),
    price: 85,
    currency: 'AED',
    sku: 'UOS-FB-003',
    badge: 'featured',
    sizes: ['S', 'M', 'L'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.9,
    reviewCount: 19,
  },
  {
    id: 'uos-prod-pitch-jersey',
    slug: 'pitch-dominance-training-jersey',
    name: bi('Pitch Dominance Training Jersey', 'قميص التدريب لهيمنة الملاعب'),
    description: bi(
      'Breathable moisture-wicking jersey crafted for high-tempo squad sessions.',
      'قميص خفيف طارد للرطوبة مصمم للحصص التدريبية المكثفة للمباريات.'
    ),
    category: 'apparel',
    type: bi('Apparel', 'ملابس تدريب'),
    price: 175,
    currency: 'AED',
    sku: 'UOS-AP-001',
    badge: 'featured',
    sizes: ['S', 'M', 'L', 'XL'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.9,
    reviewCount: 52,
  },
  {
    id: 'uos-prod-track-jacket',
    slug: 'podium-presentation-track-jacket',
    name: bi('Podium Presentation Track Jacket', 'سترة منصات التتويج الأولمبية'),
    description: bi(
      'Water-resistant thermal-lined jacket with a gilded United Olympics Sports crest.',
      'سترة مقاومة للماء مع بطانة حرارية وشعار يونايتد أوليمبيكس سبورت المذهب.'
    ),
    category: 'apparel',
    type: bi('Tracksuit & Outerwear', 'سترات وملابس خارجية'),
    price: 295,
    currency: 'AED',
    sku: 'UOS-AP-002',
    badge: 'new',
    sizes: ['S', 'M', 'L', 'XL'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 5.0,
    reviewCount: 26,
  },
  {
    id: 'uos-prod-compression-shorts',
    slug: 'athletic-compression-performance-shorts',
    name: bi('Athletic Compression Performance Shorts', 'شورت الضغط الرياضي عالي الأداء'),
    description: bi(
      'Graduated muscular compression providing quadriceps stability and reduced fatigue.',
      'شورت ضغط عضلي لتثبيت العضلات وتقليل الإجهاد في التمارين القصوى.'
    ),
    category: 'apparel',
    type: bi('Compression Wear', 'ملابس ضغط رياضية'),
    price: 125,
    currency: 'AED',
    sku: 'UOS-AP-003',
    badge: 'featured',
    sizes: ['S', 'M', 'L', 'XL'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.8,
    reviewCount: 35,
  },
  {
    id: 'uos-prod-gold-shorts',
    slug: 'olympic-gold-trim-training-shorts',
    name: bi('Olympic Gold Trim Training Shorts', 'شورت التدريب بالتطريز الذهبي'),
    description: bi(
      'Lightweight stretch-woven shorts featuring gold-piped Olympic championship accents.',
      'شورت مرن فائق الخفة بتطعيمات ذهبية مستوحاة من الألعاب الأولمبية.'
    ),
    category: 'apparel',
    type: bi('Training Shorts', 'شورت تدريب'),
    price: 110,
    currency: 'AED',
    sku: 'UOS-AP-004',
    badge: 'new',
    sizes: ['S', 'M', 'L', 'XL'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: 'uos-prod-match-kit',
    slug: 'united-official-championship-match-kit',
    name: bi('United Official Championship Match Kit', 'طقم المباريات الرسمي للبطولات'),
    description: bi(
      'Official matchday uniform comprising technical top and competition shorts.',
      'الزي الرسمي لمباريات البطولات يشمل القميص الفني والشورت التنافسي.'
    ),
    category: 'apparel',
    type: bi('Championship Kit', 'طقم رسمي'),
    price: 340,
    currency: 'AED',
    sku: 'UOS-AP-005',
    badge: 'featured',
    sizes: ['S', 'M', 'L', 'XL'],
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 5.0,
    reviewCount: 61,
  },
  {
    id: 'uos-prod-travel-duffle',
    slug: 'executive-athlete-travel-duffle',
    name: bi('Executive Athlete Travel Duffle', 'حقيبة السفر الرياضية التنفيذية'),
    description: bi(
      'Heavy-duty ballistic nylon duffle bag with ventilated footwear compartment.',
      'حقيبة دفل من النايلون المقاوم مع حجرة خاصة مهواة للأحذية الرياضية.'
    ),
    category: 'accessories',
    type: bi('Bags & Luggage', 'حقائب وأمتعة'),
    price: 280,
    currency: 'AED',
    sku: 'UOS-AC-001',
    badge: 'featured',
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.9,
    reviewCount: 40,
  },
  {
    id: 'uos-prod-hydro-bottle-black',
    slug: 'insulated-hydro-flask-matte-obsidian',
    name: bi('Insulated Hydro Flask · Matte Obsidian', 'قارورة المياه المعزولة · أسود غير لامع'),
    description: bi(
      'Double-wall vacuum-insulated flask keeping drinks ice-cold for 24 hours.',
      'قارورة معزولة بتفريغ الهواء المزدوج تحفظ البرودة لمدة 24 ساعة.'
    ),
    category: 'accessories',
    type: bi('Hydration', 'مستلزمات الترطيب'),
    price: 85,
    currency: 'AED',
    sku: 'UOS-AC-002',
    badge: 'featured',
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.8,
    reviewCount: 33,
  },
  {
    id: 'uos-prod-hydro-bottle-gold',
    slug: 'insulated-hydro-flask-champagne-gold',
    name: bi('Insulated Hydro Flask · Champagne Gold', 'قارورة المياه المعزولة · ذهبي ملكي'),
    description: bi(
      'Laser-engraved thermal bottle with leakproof athletic sport cap.',
      'قارورة مياه محفورة بالليزر ومزودة بغطاء رياضي مانع للتسرب.'
    ),
    category: 'accessories',
    type: bi('Hydration', 'مستلزمات الترطيب'),
    price: 85,
    currency: 'AED',
    sku: 'UOS-AC-003',
    badge: 'new',
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 4.9,
    reviewCount: 25,
  },
  {
    id: 'uos-prod-sports-backpack',
    slug: 'pro-squad-multi-compartment-backpack',
    name: bi('Pro Squad Multi-Compartment Backpack', 'حقيبة الظهر الرياضية متعددة الحجرات'),
    description: bi(
      'Ergonomic backpack with padded laptop and training gear organizers.',
      'حقيبة ظهر مريحة مع تقسيمات مبطنة لحفظ المعدات والأجهزة أثناء السفر.'
    ),
    category: 'accessories',
    type: bi('Backpacks', 'حقائب ظهر'),
    price: 220,
    currency: 'AED',
    sku: 'UOS-AC-004',
    badge: 'featured',
    colors,
    image: imgGoggles,
    gallery: [imgGoggles],
    availability: 'available',
    rating: 5.0,
    reviewCount: 18,
  },
];

export const previewProducts: StoreProduct[] = BRAND_PRODUCTS.map((product) => ({
  ...product,
  colorSwatches: { 'Black / Gold': '#171717', 'Ivory / Gold': '#f4eee0' },
  variantMedia: product.gallery?.length
    ? [
        { color: 'Black / Gold', image: product.gallery[0] },
        { color: 'Ivory / Gold', image: product.gallery[1] || product.gallery[0] },
      ]
    : undefined,
}));