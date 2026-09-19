import type { StoreProduct } from './storeTypes';

export type ApprovedProductMedia = {
  primary: string;
  gallery: string[];
  sourceIds: string[];
};

const media = (file: string) => `/media/products/approved/${file}`;

/**
 * Owner-approved Store media mapped only to catalog slugs whose pictured
 * product class was visually verified. This registry does not create SKUs,
 * variants, inventory, prices, ratings, or any other commerce claim.
 */
export const APPROVED_PRODUCT_MEDIA: Readonly<Record<string, ApprovedProductMedia>> = {
  'elite-hydro-pro-goggles': {
    primary: media('08-goggles-black-studio.webp'),
    gallery: [
      media('09-goggles-white-studio.webp'),
      media('14-goggles-black-poster.webp'),
      media('15-goggles-white-poster.webp'),
    ],
    sourceIds: ['08', '09', '14', '15'],
  },
  'championship-silicone-swim-cap': {
    primary: media('06-swim-cap-black-studio.webp'),
    gallery: [
      media('07-swim-cap-white-studio.webp'),
      media('17-swim-cap-white-poster.webp'),
      media('23-swim-cap-black-poster.webp'),
    ],
    sourceIds: ['06', '07', '17', '23'],
  },
  'official-match-ball-onyx-gold': {
    primary: media('22-match-ball-black-poster.webp'),
    gallery: [],
    sourceIds: ['22'],
  },
  'official-match-ball-royal-ivory': {
    primary: media('16-match-ball-white-poster.webp'),
    gallery: [],
    sourceIds: ['16'],
  },
  'pitch-dominance-training-jersey': {
    primary: media('10-jersey-black-studio.webp'),
    gallery: [
      media('11-jersey-white-studio.webp'),
      media('18-jersey-white-poster.webp'),
      media('20-jersey-black-poster.webp'),
    ],
    sourceIds: ['10', '11', '18', '20'],
  },
  'olympic-gold-trim-training-shorts': {
    primary: media('12-shorts-black-studio.webp'),
    gallery: [
      media('13-shorts-white-studio.webp'),
      media('19-shorts-white-poster.webp'),
      media('21-shorts-black-poster.webp'),
    ],
    sourceIds: ['12', '13', '19', '21'],
  },
};

const LEGACY_PREVIEW_MEDIA_MARKERS = [
  'elite_hydro_pro_goggles_1788696931060',
  'precision_match_football_1788696947302',
  'pro_carbon_tennis_racket_1788696962299',
];

function isLegacyPreviewMedia(source: string | undefined): boolean {
  return Boolean(source && LEGACY_PREVIEW_MEDIA_MARKERS.some((marker) => source.includes(marker)));
}

function uniqueMedia(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

/**
 * Removes known misleading preview fixture images before adding approved
 * owner media. Existing provider media is preserved as additional gallery
 * evidence, while the stable project-owned asset becomes the card/detail
 * primary for a confidently matched slug.
 */
export function applyVerifiedProductMedia(product: StoreProduct): StoreProduct {
  const existingImage = product.image && !isLegacyPreviewMedia(product.image)
    ? product.image
    : undefined;
  const existingGallery = product.gallery?.filter((item) => !isLegacyPreviewMedia(item)) ?? [];
  const variantMedia = product.variantMedia
    ?.map((variant) => ({
      ...variant,
      image: isLegacyPreviewMedia(variant.image) ? '' : variant.image,
      gallery: variant.gallery?.filter((item) => !isLegacyPreviewMedia(item)),
    }))
    .filter((variant) => Boolean(variant.image));

  const approved = APPROVED_PRODUCT_MEDIA[product.slug];
  if (!approved) {
    return {
      ...product,
      image: existingImage,
      gallery: existingGallery.length ? existingGallery : undefined,
      variantMedia: variantMedia?.length ? variantMedia : undefined,
    };
  }

  const gallery = uniqueMedia([
    ...approved.gallery,
    existingImage,
    ...existingGallery,
  ]).filter((item) => item !== approved.primary);

  return {
    ...product,
    image: approved.primary,
    gallery: gallery.length ? gallery : undefined,
    variantMedia: variantMedia?.length ? variantMedia : undefined,
  };
}
