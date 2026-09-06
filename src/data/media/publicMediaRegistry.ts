export type PublicLocale = 'ar' | 'en';

export type LocalizedText = Readonly<{
  ar: string;
  en: string;
}>;

export type ResponsivePositions = Readonly<{
  desktop: string;
  tablet: string;
  mobile: string;
}>;

export type MediaAssetRole = 'hero' | 'card' | 'story' | 'technique' | 'cta' | 'reflection';

export type ApprovedMediaKey =
  | 'UOS_01_HOME_HERO'
  | 'UOS_02_FOOTBALL_CARD'
  | 'UOS_03_SWIMMING_CARD'
  | 'UOS_04_BASKETBALL_CARD'
  | 'UOS_05_TENNIS_CARD'
  | 'UOS_06_GYMNASTICS_CARD'
  | 'UOS_07_MARTIAL_ARTS_CARD'
  | 'UOS_08_PROGRESS_STORY'
  | 'UOS_09_ABOUT_HERO'
  | 'UOS_10_ABOUT_REFLECTION'
  | 'UOS_11_FOOTBALL_HERO'
  | 'UOS_12_FOOTBALL_TECHNIQUE'
  | 'UOS_13_SWIMMING_HERO'
  | 'UOS_14_SWIMMING_TECHNIQUE'
  | 'UOS_15_BASKETBALL_HERO'
  | 'UOS_16_BASKETBALL_DECISION'
  | 'UOS_17_TENNIS_HERO'
  | 'UOS_18_GYMNASTICS_HERO'
  | 'UOS_19_MARTIAL_ARTS_HERO'
  | 'UOS_20_CLOSING_CTA';

export type MediaAsset = Readonly<{
  id: string;
  key: string;
  number: string;
  role: MediaAssetRole;
  roleDescription: LocalizedText;
  sourceUrl: string;
  src: string;
  localBase: string;
  localWidths: readonly number[];
  sourceExtension: 'jpg' | 'png' | 'webp';
  alt: LocalizedText;
  width: number;
  height: number;
  aspectRatio: string;
  objectPosition: ResponsivePositions;
  category: 'home' | 'about' | 'football' | 'swimming' | 'basketball' | 'tennis' | 'gymnastics' | 'martialArts';
  sportId?: string;
  priority?: boolean;
}>;

const createAsset = (
  id: string,
  key: string,
  number: string,
  role: MediaAssetRole,
  roleDescAr: string,
  roleDescEn: string,
  sourceUrl: string,
  category: MediaAsset['category'],
  altAr: string,
  altEn: string,
  width: number,
  height: number,
  positions: [string, string, string],
  widths: readonly number[],
  sourceExtension: 'jpg' | 'png' | 'webp' = 'jpg',
  priority = false,
  sportId?: string,
): MediaAsset => ({
  id,
  key,
  number,
  role,
  roleDescription: { ar: roleDescAr, en: roleDescEn },
  sourceUrl,
  src: `/media/public/uos-${number}-source.${sourceExtension}`,
  localBase: `/media/public/uos-${number}`,
  localWidths: widths,
  sourceExtension,
  alt: { ar: altAr, en: altEn },
  width,
  height,
  aspectRatio: `${width} / ${height}`,
  objectPosition: { desktop: positions[0], tablet: positions[1], mobile: positions[2] },
  category,
  priority,
  sportId,
});

// 01: Home Hero
const uos01 = createAsset(
  'UOS_01',
  'UOS_01_HOME_HERO',
  '01',
  'hero',
  'بطل الصفحة الرئيسية',
  'Homepage Hero',
  'https://i.postimg.cc/fbNpLdWQ/file-00000000bacc81f4b9a9c073233596cb.png',
  'home',
  'لاعب ناشئ من يونايتد أوليمبيكس سبورت يتدرب على كرة القدم',
  'Young athlete training in football at United Olympics Sports',
  1279,
  720,
  ['70% 50%', '68% 50%', '66% 50%'],
  [640, 960, 1279],
  'png',
  true,
);

// 02: Football Card
const uos02 = createAsset(
  'UOS_02',
  'UOS_02_FOOTBALL_CARD',
  '02',
  'card',
  'بطاقة رياضة كرة القدم',
  'Football Card',
  'https://i.postimg.cc/8CS95vp3/file-0000000099fc820a8369a3d67fb2cba3.png',
  'football',
  'لاعب ناشئ يتدرب على المراوغة والتحكم بالكرة',
  'Young football player training in dribbling and ball control',
  640,
  800,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640],
  'png',
  false,
  'football',
);

// 03: Swimming Card
const uos03 = createAsset(
  'UOS_03',
  'UOS_03_SWIMMING_CARD',
  '03',
  'card',
  'بطاقة رياضة السباحة',
  'Swimming Card',
  'https://i.postimg.cc/CxD9S7g9/file-00000000d6208243b9d0a256670fb462.png',
  'swimming',
  'سباح ناشئ يتدرب على السباحة الحرة',
  'Young swimmer training in freestyle',
  640,
  800,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640],
  'png',
  false,
  'swimming',
);

// 04: Basketball Card
const uos04 = createAsset(
  'UOS_04',
  'UOS_04_BASKETBALL_CARD',
  '04',
  'card',
  'بطاقة رياضة كرة السلة',
  'Basketball Card',
  'https://i.postimg.cc/9fhKM9Xh/file-00000000c460820aa62b5b16432fa7f6.png',
  'basketball',
  'لاعب كرة سلة ناشئ يؤدي تمرين مراوغة',
  'Young basketball athlete performing a dribbling drill',
  640,
  800,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640],
  'png',
  false,
  'basketball',
);

// 05: Tennis Card
const uos05 = createAsset(
  'UOS_05',
  'UOS_05_TENNIS_CARD',
  '05',
  'card',
  'بطاقة رياضة التنس',
  'Tennis Card',
  'https://i.postimg.cc/cJS2H3xD/file-00000000bd0c81f480fcd06b3ccc1b9a.png',
  'tennis',
  'لاعب تنس ناشئ ينفذ ضربة أمامية أثناء التدريب',
  'Young tennis athlete playing a forehand during training',
  640,
  800,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640],
  'png',
  false,
  'tennis',
);

// 06: Gymnastics Card
const uos06 = createAsset(
  'UOS_06',
  'UOS_06_GYMNASTICS_CARD',
  '06',
  'card',
  'بطاقة رياضة الجمباز',
  'Gymnastics Card',
  'https://i.postimg.cc/zfr6BhDB/file-000000000a7c81f4baf99cd770452645.png',
  'gymnastics',
  'لاعبة جمباز ناشئة تؤدي تمرين توازن',
  'Young gymnast performing a balance exercise',
  1229,
  1536,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640, 960],
  'jpg',
  false,
  'gymnastics',
);

// 07: Martial Arts Card
const uos07 = createAsset(
  'UOS_07',
  'UOS_07_MARTIAL_ARTS_CARD',
  '07',
  'card',
  'بطاقة الفنون القتالية',
  'Martial Arts Card',
  'https://i.postimg.cc/SKh3s9Qk/file-000000000788820a8941d4a5b6c5c450.png',
  'martialArts',
  'رياضيان ناشئان يتدربان على الفنون القتالية بانضباط',
  'Young athletes practising martial arts with discipline',
  1229,
  1536,
  ['50% 50%', '50% 50%', '50% 50%'],
  [640, 960],
  'jpg',
  false,
  'martial-arts',
);

// 08: Home Progress Story
const uos08 = createAsset(
  'UOS_08',
  'UOS_08_PROGRESS_STORY',
  '08',
  'story',
  'قصة التطور ومنهج التدريب',
  'Progress Story',
  'https://i.postimg.cc/DwsRn6Tx/file-000000008ba081f4b76b09569a6f5ca2.png',
  'home',
  'مجموعة من الرياضيين الناشئين أثناء تدريب منظم بإشراف مدرب',
  'Young athletes in an organised training session with a coach',
  1536,
  1024,
  ['50% 50%', '52% 50%', '58% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  false,
);

// 09: About Hero
const uos09 = createAsset(
  'UOS_09',
  'UOS_09_ABOUT_HERO',
  '09',
  'hero',
  'بطل صفحة "من نحن"',
  'About Us Hero',
  'https://i.postimg.cc/Bv0k6FSN/file-00000000fe0882109a9f43751a363a25.png',
  'about',
  'رياضيون ناشئون يتدربون داخل منشأة يونايتد أوليمبيكس سبورت',
  'Young athletes training inside a United Olympics Sports facility',
  1279,
  548,
  ['60% 50%', '60% 50%', '64% 50%'],
  [640, 960, 1279],
  'png',
  true,
);

// 10: About Reflection Story
const uos10 = createAsset(
  'UOS_10',
  'UOS_10_ABOUT_REFLECTION',
  '10',
  'reflection',
  'قصة الرياضي اليومية',
  'About Reflection',
  'https://i.postimg.cc/JhLvnXrF/file-000000002fa882108347c5632700765e.png',
  'about',
  'لاعب ناشئ يستعد للتدريب وينظر نحو الملعب',
  'Young athlete preparing for training and looking towards the field',
  1536,
  1024,
  ['50% 50%', '52% 50%', '58% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  false,
);

// 11: Football Hero
const uos11 = createAsset(
  'UOS_11',
  'UOS_11_FOOTBALL_HERO',
  '11',
  'hero',
  'بطل مسار كرة القدم',
  'Football Hero',
  'https://i.postimg.cc/SKh3s9Sw/file-00000000d57881f489f67cf43f7b7f1a.png',
  'football',
  'لاعب ناشئ يتقدم بالكرة أثناء تدريب كرة القدم',
  'Young athlete carrying the ball during football training',
  1279,
  720,
  ['68% 50%', '65% 50%', '62% 50%'],
  [640, 960, 1279],
  'png',
  true,
  'football',
);

// 12: Football Technique
const uos12 = createAsset(
  'UOS_12',
  'UOS_12_FOOTBALL_TECHNIQUE',
  '12',
  'technique',
  'قسم التكنيك الكروي',
  'Football Technique',
  'https://i.postimg.cc/3xpzY1TP/file-00000000540481f495db5292007fc40d.png',
  'football',
  'تفاصيل تدريب لاعب ناشئ على التحكم الدقيق بالكرة',
  'Close view of a young athlete practising precise ball control',
  1536,
  1024,
  ['50% 50%', '52% 50%', '58% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  false,
  'football',
);

// 13: Swimming Hero
const uos13 = createAsset(
  'UOS_13',
  'UOS_13_SWIMMING_HERO',
  '13',
  'hero',
  'بطل مسار السباحة',
  'Swimming Hero',
  'https://i.postimg.cc/DzTHZGvB/file-000000006da48210ab6b71dcdba377ba.png',
  'swimming',
  'سباح ناشئ يتدرب داخل مسبح يونايتد أوليمبيكس سبورت',
  'Young swimmer training inside a United Olympics Sports pool',
  1536,
  864,
  ['62% 50%', '60% 50%', '58% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  true,
  'swimming',
);

// 14: Swimming Technique
const uos14 = createAsset(
  'UOS_14',
  'UOS_14_SWIMMING_TECHNIQUE',
  '14',
  'technique',
  'قسم التكنيك المائي',
  'Swimming Technique',
  'https://i.postimg.cc/SKh3s9Sv/file-000000002c34820a9ccfcf8346a878eb.png',
  'swimming',
  'سباح ناشئ يؤدي تمرين سباحة حرة بتقنية منظمة',
  'Young swimmer performing a structured freestyle drill',
  1536,
  1024,
  ['50% 50%', '52% 50%', '58% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  false,
  'swimming',
);

// 15: Basketball Hero
const uos15 = createAsset(
  'UOS_15',
  'UOS_15_BASKETBALL_HERO',
  '15',
  'hero',
  'بطل مسار كرة السلة',
  'Basketball Hero',
  'https://i.postimg.cc/cJBj8J6C/file-00000000f6888246b945f6923429bc83.png',
  'basketball',
  'لاعب كرة سلة ناشئ يتقدم بالكرة داخل الصالة',
  'Young basketball athlete advancing with the ball indoors',
  1279,
  720,
  ['64% 50%', '62% 50%', '58% 50%'],
  [640, 960, 1279],
  'png',
  true,
  'basketball',
);

// 16: Basketball Tactics
const uos16 = createAsset(
  'UOS_16',
  'UOS_16_BASKETBALL_DECISION',
  '16',
  'technique',
  'قسم تكتيك كرة السلة',
  'Basketball Tactics',
  'https://i.postimg.cc/VNWTbN5m/file-000000009ef082109a1608154539584c.png',
  'basketball',
  'مجموعة ناشئين تتدرب على التمرير والعمل الجماعي في كرة السلة',
  'Young basketball athletes training in passing and teamwork',
  1280,
  853,
  ['50% 50%', '52% 50%', '56% 50%'],
  [640, 960, 1280],
  'png',
  false,
  'basketball',
);

// 17: Tennis Hero
const uos17 = createAsset(
  'UOS_17',
  'UOS_17_TENNIS_HERO',
  '17',
  'hero',
  'بطل مسار التنس',
  'Tennis Hero',
  'https://i.postimg.cc/9fhKM9Xm/file-000000005dd481f4b42998c8f9ed3cd6.png',
  'tennis',
  'لاعب تنس ناشئ يتدرب داخل ملعب يونايتد أوليمبيكس سبورت',
  'Young tennis athlete training on a United Olympics Sports court',
  1536,
  864,
  ['63% 50%', '60% 50%', '56% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  true,
  'tennis',
);

// 18: Gymnastics Hero
const uos18 = createAsset(
  'UOS_18',
  'UOS_18_GYMNASTICS_HERO',
  '18',
  'hero',
  'بطل مسار الجمباز',
  'Gymnastics Hero',
  'https://i.postimg.cc/VNWTbN5s/file-00000000edb88210b32581b03ddcbf05.png',
  'gymnastics',
  'لاعبة جمباز ناشئة تؤدي تمرين توازن داخل المنشأة الرياضية',
  'Young gymnast performing a balance drill inside the sports facility',
  1279,
  720,
  ['58% 50%', '56% 50%', '54% 50%'],
  [640, 960, 1279],
  'png',
  true,
  'gymnastics',
);

// 19: Martial Arts Hero
const uos19 = createAsset(
  'UOS_19',
  'UOS_19_MARTIAL_ARTS_HERO',
  '19',
  'hero',
  'بطل الفنون القتالية',
  'Martial Arts Hero',
  'https://i.postimg.cc/QM3wt7Ns/file-000000004ee48210aa2827f372a4d166.png',
  'martialArts',
  'رياضيان ناشئان يظهران الاحترام والانضباط في تدريب الفنون القتالية',
  'Young athletes showing respect and discipline in martial arts training',
  1536,
  864,
  ['56% 50%', '55% 50%', '54% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  true,
  'martial-arts',
);

// 20: Closing CTA
const uos20 = createAsset(
  'UOS_20',
  'UOS_20_CLOSING_CTA',
  '20',
  'cta',
  'البانر الختامي والبرامج',
  'Closing CTA',
  'https://i.postimg.cc/W4vC3ZpP/file-000000004ea48243acf35ee8f1ddd0a0.png',
  'home',
  'رياضيون ناشئون داخل بيئة يونايتد أوليمبيكس سبورت التدريبية',
  'Young athletes in the United Olympics Sports training environment',
  1536,
  658,
  ['50% 45%', '52% 45%', '62% 50%'],
  [640, 960, 1280, 1536],
  'jpg',
  false,
);

/**
 * 20 Approved Production Visual Assets (UOS_01 through UOS_20)
 * Available with canonical keys (e.g. UOS_01_HOME_HERO) and short keys (e.g. UOS_01).
 */
export const UOS_APPROVED_MEDIA = {
  UOS_01_HOME_HERO: uos01,
  UOS_01: uos01,
  UOS_02_FOOTBALL_CARD: uos02,
  UOS_02: uos02,
  UOS_03_SWIMMING_CARD: uos03,
  UOS_03: uos03,
  UOS_04_BASKETBALL_CARD: uos04,
  UOS_04: uos04,
  UOS_05_TENNIS_CARD: uos05,
  UOS_05: uos05,
  UOS_06_GYMNASTICS_CARD: uos06,
  UOS_06: uos06,
  UOS_07_MARTIAL_ARTS_CARD: uos07,
  UOS_07: uos07,
  UOS_08_PROGRESS_STORY: uos08,
  UOS_08: uos08,
  UOS_09_ABOUT_HERO: uos09,
  UOS_09: uos09,
  UOS_10_ABOUT_REFLECTION: uos10,
  UOS_10: uos10,
  UOS_11_FOOTBALL_HERO: uos11,
  UOS_11: uos11,
  UOS_12_FOOTBALL_TECHNIQUE: uos12,
  UOS_12: uos12,
  UOS_13_SWIMMING_HERO: uos13,
  UOS_13: uos13,
  UOS_14_SWIMMING_TECHNIQUE: uos14,
  UOS_14: uos14,
  UOS_15_BASKETBALL_HERO: uos15,
  UOS_15: uos15,
  UOS_16_BASKETBALL_DECISION: uos16,
  UOS_16: uos16,
  UOS_17_TENNIS_HERO: uos17,
  UOS_17: uos17,
  UOS_18_GYMNASTICS_HERO: uos18,
  UOS_18: uos18,
  UOS_19_MARTIAL_ARTS_HERO: uos19,
  UOS_19: uos19,
  UOS_20_CLOSING_CTA: uos20,
  UOS_20: uos20,
} as const;

export const ALL_APPROVED_MEDIA: readonly MediaAsset[] = [
  uos01, uos02, uos03, uos04, uos05, uos06, uos07, uos08, uos09, uos10,
  uos11, uos12, uos13, uos14, uos15, uos16, uos17, uos18, uos19, uos20,
];

/**
 * Public Media Registry - Structured access with helpers
 */
export const MediaRegistry = {
  assets: UOS_APPROVED_MEDIA,
  all: ALL_APPROVED_MEDIA,

  home: {
    hero: uos01,
    progress: uos08,
    closing: uos20,
  },

  about: {
    hero: uos09,
    reflection: uos10,
  },

  sports: {
    football: {
      card: uos02,
      hero: uos11,
      technique: uos12,
    },
    swimming: {
      card: uos03,
      hero: uos13,
      technique: uos14,
    },
    basketball: {
      card: uos04,
      hero: uos15,
      technique: uos16,
    },
    tennis: {
      card: uos05,
      hero: uos17,
    },
    gymnastics: {
      card: uos06,
      hero: uos18,
    },
    martialArts: {
      card: uos07,
      hero: uos19,
    },
  },

  /**
   * Helper to retrieve media asset by key or ID
   */
  getMediaByKey(key: ApprovedMediaKey | string): MediaAsset | undefined {
    if (key in UOS_APPROVED_MEDIA) {
      return (UOS_APPROVED_MEDIA as Record<string, MediaAsset>)[key];
    }
    return ALL_APPROVED_MEDIA.find(item => item.id === key || item.key === key);
  },

  /**
   * Helper to fetch media asset by sport ID and role
   */
  getSportAsset(sportId: string, role: 'card' | 'hero' | 'technique' = 'card'): MediaAsset | undefined {
    const normalized = sportId.toLowerCase().replace(/[^a-z]/g, '');
    const sportKey =
      normalized === 'football' ? 'football' :
      normalized === 'swimming' ? 'swimming' :
      normalized === 'basketball' ? 'basketball' :
      normalized === 'tennis' ? 'tennis' :
      normalized === 'gymnastics' ? 'gymnastics' :
      normalized === 'martialarts' ? 'martialArts' :
      undefined;

    if (!sportKey) return undefined;
    const sportGroup = this.sports[sportKey] as Record<string, MediaAsset>;
    return sportGroup[role] ?? sportGroup.card ?? sportGroup.hero;
  },

  /**
   * Helper to generate responsive sourceSet string
   */
  getSourceSet(asset: MediaAsset, extension: 'avif' | 'webp'): string | undefined {
    if (!asset.localBase || !asset.localWidths || asset.localWidths.length === 0) {
      return undefined;
    }
    return asset.localWidths
      .map((width) => `${asset.localBase}-${width}.${extension} ${width}w`)
      .join(', ');
  },
} as const;

export default MediaRegistry;
