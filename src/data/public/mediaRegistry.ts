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

export type MediaAsset = Readonly<{
  id: string;
  key: string;
  src: string;
  localBase: string;
  localWidths: readonly number[];
  sourceExtension: 'jpg' | 'png' | 'webp';
  alt: LocalizedText;
  width: number;
  height: number;
  aspectRatio: string;
  objectPosition: ResponsivePositions;
  role: MediaAssetRole;
  category: 'home' | 'about' | 'football' | 'swimming' | 'basketball' | 'tennis' | 'gymnastics' | 'martialArts';
  sportId?: string;
  priority?: boolean;
}>;

const createAsset = (
  id: string,
  key: string,
  number: string,
  category: MediaAsset['category'],
  role: MediaAssetRole,
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
  src: `/media/public/uos-${number}-source.${sourceExtension}`,
  localBase: `/media/public/uos-${number}`,
  localWidths: widths,
  sourceExtension,
  alt: { ar: altAr, en: altEn },
  width,
  height,
  aspectRatio: `${width} / ${height}`,
  objectPosition: { desktop: positions[0], tablet: positions[1], mobile: positions[2] },
  role,
  category,
  priority,
  sportId,
});

/**
 * 20 Approved and Verified Production Visual Assets (UOS_01 through UOS_20)
 * Compliant with United Olympics Sports brand guidelines.
 */
export const UOS_APPROVED_MEDIA = {
  // 01: Home Hero
  UOS_01: createAsset(
    'UOS_01',
    'UOS_01_HOME_HERO',
    '01',
    'home',
    'hero',
    'لاعب ناشئ من يونايتد أوليمبيكس سبورت يتدرب على كرة القدم',
    'Young athlete training in football at United Olympics Sports',
    1279,
    720,
    ['70% 50%', '68% 50%', '66% 50%'],
    [640, 960, 1279],
    'png',
    true,
  ),

  // 02: Football Card
  UOS_02: createAsset(
    'UOS_02',
    'UOS_02_FOOTBALL_CARD',
    '02',
    'football',
    'card',
    'لاعب ناشئ يتدرب على المراوغة والتحكم بالكرة',
    'Young football player training in dribbling and ball control',
    640,
    800,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640],
    'png',
    false,
    'football',
  ),

  // 03: Swimming Card
  UOS_03: createAsset(
    'UOS_03',
    'UOS_03_SWIMMING_CARD',
    '03',
    'swimming',
    'card',
    'سباح ناشئ يتدرب على السباحة الحرة',
    'Young swimmer training in freestyle',
    640,
    800,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640],
    'png',
    false,
    'swimming',
  ),

  // 04: Basketball Card
  UOS_04: createAsset(
    'UOS_04',
    'UOS_04_BASKETBALL_CARD',
    '04',
    'basketball',
    'card',
    'لاعب كرة سلة ناشئ يؤدي تمرين مراوغة',
    'Young basketball athlete performing a dribbling drill',
    640,
    800,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640],
    'png',
    false,
    'basketball',
  ),

  // 05: Tennis Card
  UOS_05: createAsset(
    'UOS_05',
    'UOS_05_TENNIS_CARD',
    '05',
    'tennis',
    'card',
    'لاعب تنس ناشئ ينفذ ضربة أمامية أثناء التدريب',
    'Young tennis athlete playing a forehand during training',
    640,
    800,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640],
    'png',
    false,
    'tennis',
  ),

  // 06: Gymnastics Card
  UOS_06: createAsset(
    'UOS_06',
    'UOS_06_GYMNASTICS_CARD',
    '06',
    'gymnastics',
    'card',
    'لاعبة جمباز ناشئة تؤدي تمرين توازن',
    'Young gymnast performing a balance exercise',
    1229,
    1536,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640, 960],
    'jpg',
    false,
    'gymnastics',
  ),

  // 07: Martial Arts Card
  UOS_07: createAsset(
    'UOS_07',
    'UOS_07_MARTIAL_ARTS_CARD',
    '07',
    'martialArts',
    'card',
    'رياضيان ناشئان يتدربان على الفنون القتالية بانضباط',
    'Young athletes practising martial arts with discipline',
    1229,
    1536,
    ['50% 50%', '50% 50%', '50% 50%'],
    [640, 960],
    'jpg',
    false,
    'martial-arts',
  ),

  // 08: Home Progress Story
  UOS_08: createAsset(
    'UOS_08',
    'UOS_08_PROGRESS_STORY',
    '08',
    'home',
    'story',
    'مجموعة من الرياضيين الناشئين أثناء تدريب منظم بإشراف مدرب',
    'Young athletes in an organised training session with a coach',
    1536,
    1024,
    ['50% 50%', '52% 50%', '58% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
  ),

  // 09: About Hero
  UOS_09: createAsset(
    'UOS_09',
    'UOS_09_ABOUT_HERO',
    '09',
    'about',
    'hero',
    'رياضيون ناشئون يتدربون داخل منشأة يونايتد أوليمبيكس سبورت',
    'Young athletes training inside a United Olympics Sports facility',
    1279,
    548,
    ['60% 50%', '60% 50%', '64% 50%'],
    [640, 960, 1279],
    'png',
    true,
  ),

  // 10: About Reflection Story
  UOS_10: createAsset(
    'UOS_10',
    'UOS_10_ABOUT_REFLECTION',
    '10',
    'about',
    'reflection',
    'لاعب ناشئ يستعد للتدريب وينظر نحو الملعب',
    'Young athlete preparing for training and looking towards the field',
    1536,
    1024,
    ['50% 50%', '52% 50%', '58% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
  ),

  // 11: Football Hero
  UOS_11: createAsset(
    'UOS_11',
    'UOS_11_FOOTBALL_HERO',
    '11',
    'football',
    'hero',
    'لاعب ناشئ يتقدم بالكرة أثناء تدريب كرة القدم',
    'Young athlete carrying the ball during football training',
    1279,
    720,
    ['68% 50%', '65% 50%', '62% 50%'],
    [640, 960, 1279],
    'png',
    true,
    'football',
  ),

  // 12: Football Technique
  UOS_12: createAsset(
    'UOS_12',
    'UOS_12_FOOTBALL_TECHNIQUE',
    '12',
    'football',
    'technique',
    'تفاصيل تدريب لاعب ناشئ على التحكم الدقيق بالكرة',
    'Close view of a young athlete practising precise ball control',
    1536,
    1024,
    ['50% 50%', '52% 50%', '58% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
    false,
    'football',
  ),

  // 13: Swimming Hero
  UOS_13: createAsset(
    'UOS_13',
    'UOS_13_SWIMMING_HERO',
    '13',
    'swimming',
    'hero',
    'سباح ناشئ يتدرب داخل مسبح يونايتد أوليمبيكس سبورت',
    'Young swimmer training inside a United Olympics Sports pool',
    1536,
    864,
    ['62% 50%', '60% 50%', '58% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
    true,
    'swimming',
  ),

  // 14: Swimming Technique
  UOS_14: createAsset(
    'UOS_14',
    'UOS_14_SWIMMING_TECHNIQUE',
    '14',
    'swimming',
    'technique',
    'سباح ناشئ يؤدي تمرين سباحة حرة بتقنية منظمة',
    'Young swimmer performing a structured freestyle drill',
    1536,
    1024,
    ['50% 50%', '52% 50%', '58% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
    false,
    'swimming',
  ),

  // 15: Basketball Hero
  UOS_15: createAsset(
    'UOS_15',
    'UOS_15_BASKETBALL_HERO',
    '15',
    'basketball',
    'hero',
    'لاعب كرة سلة ناشئ يتقدم بالكرة داخل الصالة',
    'Young basketball athlete advancing with the ball indoors',
    1279,
    720,
    ['64% 50%', '62% 50%', '58% 50%'],
    [640, 960, 1279],
    'png',
    true,
    'basketball',
  ),

  // 16: Basketball Technique / Decision
  UOS_16: createAsset(
    'UOS_16',
    'UOS_16_BASKETBALL_DECISION',
    '16',
    'basketball',
    'technique',
    'مجموعة ناشئين تتدرب على التمرير والعمل الجماعي في كرة السلة',
    'Young basketball athletes training in passing and teamwork',
    1280,
    853,
    ['50% 50%', '52% 50%', '56% 50%'],
    [640, 960, 1280],
    'png',
    false,
    'basketball',
  ),

  // 17: Tennis Hero
  UOS_17: createAsset(
    'UOS_17',
    'UOS_17_TENNIS_HERO',
    '17',
    'tennis',
    'hero',
    'لاعب تنس ناشئ يتدرب داخل ملعب يونايتد أوليمبيكس سبورت',
    'Young tennis athlete training on a United Olympics Sports court',
    1536,
    864,
    ['63% 50%', '60% 50%', '56% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
    true,
    'tennis',
  ),

  // 18: Gymnastics Hero
  UOS_18: createAsset(
    'UOS_18',
    'UOS_18_GYMNASTICS_HERO',
    '18',
    'gymnastics',
    'hero',
    'لاعبة جمباز ناشئة تؤدي تمرين توازن داخل المنشأة الرياضية',
    'Young gymnast performing a balance drill inside the sports facility',
    1279,
    720,
    ['58% 50%', '56% 50%', '54% 50%'],
    [640, 960, 1279],
    'png',
    true,
    'gymnastics',
  ),

  // 19: Martial Arts Hero
  UOS_19: createAsset(
    'UOS_19',
    'UOS_19_MARTIAL_ARTS_HERO',
    '19',
    'martialArts',
    'hero',
    'رياضيان ناشئان يظهران الاحترام والانضباط في تدريب الفنون القتالية',
    'Young athletes showing respect and discipline in martial arts training',
    1536,
    864,
    ['56% 50%', '55% 50%', '54% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
    true,
    'martial-arts',
  ),

  // 20: Closing CTA
  UOS_20: createAsset(
    'UOS_20',
    'UOS_20_CLOSING_CTA',
    '20',
    'home',
    'cta',
    'رياضيون ناشئون داخل بيئة يونايتد أوليمبيكس سبورت التدريبية',
    'Young athletes in the United Olympics Sports training environment',
    1536,
    658,
    ['50% 45%', '52% 45%', '62% 50%'],
    [640, 960, 1280, 1536],
    'jpg',
  ),
} as const;

export type ApprovedMediaKey = keyof typeof UOS_APPROVED_MEDIA;

export const ALL_APPROVED_MEDIA: readonly MediaAsset[] = Object.values(UOS_APPROVED_MEDIA);

/**
 * Structured public media map by section/discipline
 */
export const MediaRegistry = {
  assets: UOS_APPROVED_MEDIA,
  all: ALL_APPROVED_MEDIA,

  home: {
    hero: UOS_APPROVED_MEDIA.UOS_01,
    progress: UOS_APPROVED_MEDIA.UOS_08,
    closing: UOS_APPROVED_MEDIA.UOS_20,
  },

  about: {
    hero: UOS_APPROVED_MEDIA.UOS_09,
    reflection: UOS_APPROVED_MEDIA.UOS_10,
  },

  sports: {
    football: {
      card: UOS_APPROVED_MEDIA.UOS_02,
      hero: UOS_APPROVED_MEDIA.UOS_11,
      technique: UOS_APPROVED_MEDIA.UOS_12,
    },
    swimming: {
      card: UOS_APPROVED_MEDIA.UOS_03,
      hero: UOS_APPROVED_MEDIA.UOS_13,
      technique: UOS_APPROVED_MEDIA.UOS_14,
    },
    basketball: {
      card: UOS_APPROVED_MEDIA.UOS_04,
      hero: UOS_APPROVED_MEDIA.UOS_15,
      technique: UOS_APPROVED_MEDIA.UOS_16,
    },
    tennis: {
      card: UOS_APPROVED_MEDIA.UOS_05,
      hero: UOS_APPROVED_MEDIA.UOS_17,
    },
    gymnastics: {
      card: UOS_APPROVED_MEDIA.UOS_06,
      hero: UOS_APPROVED_MEDIA.UOS_18,
    },
    martialArts: {
      card: UOS_APPROVED_MEDIA.UOS_07,
      hero: UOS_APPROVED_MEDIA.UOS_19,
    },
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
