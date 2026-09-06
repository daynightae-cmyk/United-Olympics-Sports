export type PublicLocale = 'ar' | 'en';

export type LocalizedText = Readonly<{ ar: string; en: string }>;

export type PublicMediaAsset = Readonly<{
  key: string;
  src: string;
  alt: LocalizedText;
  width: number;
  height: number;
  aspectRatio: string;
  objectPosition: Readonly<{ desktop: string; tablet: string; mobile: string }>;
  role: 'hero' | 'card' | 'story' | 'technique' | 'cta';
  priority?: boolean;
  localBase?: string;
  localWidths?: readonly number[];
}>;

const remote = (
  key: string,
  src: string,
  altAr: string,
  altEn: string,
  width: number,
  height: number,
  role: PublicMediaAsset['role'],
  positions: [string, string, string],
  priority = false,
): PublicMediaAsset => ({
  key,
  src,
  alt: { ar: altAr, en: altEn },
  width,
  height,
  aspectRatio: `${width} / ${height}`,
  objectPosition: { desktop: positions[0], tablet: positions[1], mobile: positions[2] },
  role,
  priority,
});

const local = (
  key: string,
  number: string,
  altAr: string,
  altEn: string,
  width: number,
  height: number,
  role: PublicMediaAsset['role'],
  positions: [string, string, string],
  widths: readonly number[],
  sourceExtension: 'jpg' | 'png' = 'jpg',
): PublicMediaAsset => ({
  key,
  src: `/media/public/uos-${number}-source.${sourceExtension}`,
  localBase: `/media/public/uos-${number}`,
  localWidths: widths,
  alt: { ar: altAr, en: altEn },
  width,
  height,
  aspectRatio: `${width} / ${height}`,
  objectPosition: { desktop: positions[0], tablet: positions[1], mobile: positions[2] },
  role,
});

export const UOS_PUBLIC_MEDIA = {
  home: {
    hero: { ...local('UOS_01_HOME_HERO', '01', 'لاعب ناشئ من يونايتد أوليمبيكس سبورت يتدرب على كرة القدم', 'Young athlete training in football at United Olympics Sports', 1279, 720, 'hero', ['70% 50%', '68% 50%', '66% 50%'], [640, 960, 1279], 'png'), priority: true },
    progress: local('UOS_08_PROGRESS_STORY', '08', 'مجموعة من الرياضيين الناشئين أثناء تدريب منظم بإشراف مدرب', 'Young athletes in an organised training session with a coach', 1536, 1024, 'story', ['50% 50%', '52% 50%', '58% 50%'], [640, 960, 1280, 1536]),
    closing: local('UOS_20_CLOSING_CTA', '20', 'رياضيون ناشئون داخل بيئة يونايتد أوليمبيكس سبورت التدريبية', 'Young athletes in the United Olympics Sports training environment', 1536, 658, 'cta', ['50% 45%', '52% 45%', '62% 50%'], [640, 960, 1280, 1536]),
  },
  about: {
    hero: local('UOS_09_ABOUT_HERO', '09', 'رياضيون ناشئون يتدربون داخل منشأة يونايتد أوليمبيكس سبورت', 'Young athletes training inside a United Olympics Sports facility', 1279, 548, 'hero', ['60% 50%', '60% 50%', '64% 50%'], [640, 960, 1279], 'png'),
    reflection: local('UOS_10_ABOUT_REFLECTION', '10', 'لاعب ناشئ يستعد للتدريب وينظر نحو الملعب', 'Young athlete preparing for training and looking towards the field', 1536, 1024, 'story', ['50% 50%', '52% 50%', '58% 50%'], [640, 960, 1280, 1536]),
  },
  sports: {
    football: {
      card: local('UOS_02_FOOTBALL_CARD', '02', 'لاعب ناشئ يتدرب على المراوغة والتحكم بالكرة', 'Young football player training in dribbling and ball control', 640, 800, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640], 'png'),
      hero: local('UOS_11_FOOTBALL_HERO', '11', 'لاعب ناشئ يتقدم بالكرة أثناء تدريب كرة القدم', 'Young athlete carrying the ball during football training', 1279, 720, 'hero', ['68% 50%', '65% 50%', '62% 50%'], [640, 960, 1279], 'png'),
      technique: local('UOS_12_FOOTBALL_TECHNIQUE', '12', 'تفاصيل تدريب لاعب ناشئ على التحكم الدقيق بالكرة', 'Close view of a young athlete practising precise ball control', 1536, 1024, 'technique', ['50% 50%', '52% 50%', '58% 50%'], [640, 960, 1280, 1536]),
    },
    swimming: {
      card: local('UOS_03_SWIMMING_CARD', '03', 'سباح ناشئ يتدرب على السباحة الحرة', 'Young swimmer training in freestyle', 640, 800, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640], 'png'),
      hero: local('UOS_13_SWIMMING_HERO', '13', 'سباح ناشئ يتدرب داخل مسبح يونايتد أوليمبيكس سبورت', 'Young swimmer training inside a United Olympics Sports pool', 1536, 864, 'hero', ['62% 50%', '60% 50%', '58% 50%'], [640, 960, 1280, 1536]),
      technique: local('UOS_14_SWIMMING_TECHNIQUE', '14', 'سباح ناشئ يؤدي تمرين سباحة حرة بتقنية منظمة', 'Young swimmer performing a structured freestyle drill', 1536, 1024, 'technique', ['50% 50%', '52% 50%', '58% 50%'], [640, 960, 1280, 1536]),
    },
    basketball: {
      card: local('UOS_04_BASKETBALL_CARD', '04', 'لاعب كرة سلة ناشئ يؤدي تمرين مراوغة', 'Young basketball athlete performing a dribbling drill', 640, 800, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640], 'png'),
      hero: local('UOS_15_BASKETBALL_HERO', '15', 'لاعب كرة سلة ناشئ يتقدم بالكرة داخل الصالة', 'Young basketball athlete advancing with the ball indoors', 1279, 720, 'hero', ['64% 50%', '62% 50%', '58% 50%'], [640, 960, 1279], 'png'),
      technique: local('UOS_16_BASKETBALL_DECISION', '16', 'مجموعة ناشئين تتدرب على التمرير والعمل الجماعي في كرة السلة', 'Young basketball athletes training in passing and teamwork', 1280, 853, 'technique', ['50% 50%', '52% 50%', '56% 50%'], [640, 960, 1280], 'png'),
    },
    tennis: {
      card: local('UOS_05_TENNIS_CARD', '05', 'لاعب تنس ناشئ ينفذ ضربة أمامية أثناء التدريب', 'Young tennis athlete playing a forehand during training', 640, 800, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640], 'png'),
      hero: local('UOS_17_TENNIS_HERO', '17', 'لاعب تنس ناشئ يتدرب داخل ملعب يونايتد أوليمبيكس سبورت', 'Young tennis athlete training on a United Olympics Sports court', 1536, 864, 'hero', ['63% 50%', '60% 50%', '56% 50%'], [640, 960, 1280, 1536]),
    },
    gymnastics: {
      card: local('UOS_06_GYMNASTICS_CARD', '06', 'لاعبة جمباز ناشئة تؤدي تمرين توازن', 'Young gymnast performing a balance exercise', 1229, 1536, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640, 960]),
      hero: local('UOS_18_GYMNASTICS_HERO', '18', 'لاعبة جمباز ناشئة تؤدي تمرين توازن داخل المنشأة الرياضية', 'Young gymnast performing a balance drill inside the sports facility', 1279, 720, 'hero', ['58% 50%', '56% 50%', '54% 50%'], [640, 960, 1279], 'png'),
    },
    martialArts: {
      card: local('UOS_07_MARTIAL_ARTS_CARD', '07', 'رياضيان ناشئان يتدربان على الفنون القتالية بانضباط', 'Young athletes practising martial arts with discipline', 1229, 1536, 'card', ['50% 50%', '50% 50%', '50% 50%'], [640, 960]),
      hero: local('UOS_19_MARTIAL_ARTS_HERO', '19', 'رياضيان ناشئان يظهران الاحترام والانضباط في تدريب الفنون القتالية', 'Young athletes showing respect and discipline in martial arts training', 1536, 864, 'hero', ['56% 50%', '55% 50%', '54% 50%'], [640, 960, 1280, 1536]),
    },
  },
} as const;

export type PublicSportId = keyof typeof UOS_PUBLIC_MEDIA.sports;

export const PUBLIC_SPORT_SLUGS: Record<string, PublicSportId> = {
  football: 'football',
  swimming: 'swimming',
  basketball: 'basketball',
  tennis: 'tennis',
  gymnastics: 'gymnastics',
  'martial-arts': 'martialArts',
};

export const sourceSet = (asset: PublicMediaAsset, extension: 'avif' | 'webp') =>
  asset.localBase && asset.localWidths
    ? asset.localWidths.map((width) => `${asset.localBase}-${width}.${extension} ${width}w`).join(', ')
    : undefined;
