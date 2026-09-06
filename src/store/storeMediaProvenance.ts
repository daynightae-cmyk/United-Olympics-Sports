import imgGoggles from '../assets/images/elite_hydro_pro_goggles_1788696931060.jpg';
import imgFootball from '../assets/images/precision_match_football_1788696947302.jpg';
import imgRacket from '../assets/images/pro_carbon_tennis_racket_1788696962299.jpg';
import type { StoreProduct } from './storeTypes';

/**
 * Verified product-media provenance for the three repository product photos.
 * A photo is only attached to a product when the pictured product class
 * matches the catalog record; unrelated preview fixtures intentionally render
 * with the product-media fallback instead of borrowing a misleading image.
 */
const VERIFIED_MEDIA: Record<string, string> = {
  'elite-hydro-pro-goggles': imgGoggles,
  'official-match-ball-onyx-gold': imgFootball,
  'official-match-ball-royal-ivory': imgFootball,
  'pro-carbon-tennis-racket': imgRacket,
};

const LEGACY_PREVIEW_MEDIA = new Set([imgGoggles, imgFootball, imgRacket]);

export function applyVerifiedProductMedia(product: StoreProduct): StoreProduct {
  const verified = VERIFIED_MEDIA[product.slug];
  if (verified) return { ...product, image: verified, gallery: [verified] };

  const image = product.image && LEGACY_PREVIEW_MEDIA.has(product.image) ? undefined : product.image;
  const gallery = product.gallery?.filter((item) => !LEGACY_PREVIEW_MEDIA.has(item));
  const variantMedia = product.variantMedia?.map((variant) => ({
    ...variant,
    image: LEGACY_PREVIEW_MEDIA.has(variant.image) ? '' : variant.image,
    gallery: variant.gallery?.filter((item) => !LEGACY_PREVIEW_MEDIA.has(item)),
  })).filter((variant) => Boolean(variant.image));

  return {
    ...product,
    image,
    gallery: gallery?.length ? gallery : undefined,
    variantMedia: variantMedia?.length ? variantMedia : undefined,
  };
}
