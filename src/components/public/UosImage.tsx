import React, { useState } from 'react';
import {
  MediaRegistry,
  type ApprovedMediaKey,
  type MediaAsset,
} from '../../data/media/publicMediaRegistry';

export interface UosImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  mediaKey?: ApprovedMediaKey | string;
  asset?: MediaAsset;
  src?: string;
  alt?: string | { en: string; ar: string };
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  priority?: boolean;
  gradientOverlay?: boolean;
  showShimmer?: boolean;
  containerClassName?: string;
  onLoadSuccess?: () => void;
  onLoadError?: () => void;
}

/**
 * UosImage: Production-grade smart responsive image component for United Olympics Sports.
 * - Resolves MediaRegistry assets by key or direct asset
 * - Renders modern responsive picture formats (AVIF, WebP, Source)
 * - Calibrated with athletic focal points (objectPosition)
 * - Robust dual fallback (Local -> Remote CDN -> Graceful Placeholder)
 */
export const UosImage: React.FC<UosImageProps> = ({
  mediaKey,
  asset: directAsset,
  src: directSrc,
  alt: customAlt,
  aspectRatio,
  objectFit = 'cover',
  objectPosition: customPosition,
  priority = false,
  gradientOverlay = false,
  showShimmer = true,
  className = '',
  containerClassName = '',
  style,
  onLoadSuccess,
  onLoadError,
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [usingRemoteFallback, setUsingRemoteFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Resolve asset from registry or props
  const resolvedAsset: MediaAsset | undefined =
    directAsset ?? (mediaKey ? MediaRegistry.getMediaByKey(mediaKey) : undefined);

  // 2. Derive dimensions and aspect ratio
  const computedAspectRatio =
    aspectRatio ?? (resolvedAsset ? resolvedAsset.aspectRatio : undefined);
  const resolvedWidth = rest.width ?? (resolvedAsset ? resolvedAsset.width : undefined);
  const resolvedHeight = rest.height ?? (resolvedAsset ? resolvedAsset.height : undefined);

  // 3. Focal point / object-position resolution
  const resolvedPosition =
    customPosition ??
    (resolvedAsset?.objectPosition ? resolvedAsset.objectPosition.desktop : 'center center');

  // 4. Alt text resolution
  const resolvedAltText = (() => {
    if (typeof customAlt === 'string') return customAlt;
    if (customAlt && typeof customAlt === 'object') {
      return `${customAlt.en} | ${customAlt.ar}`;
    }
    if (resolvedAsset?.alt) {
      return `${resolvedAsset.alt.en} | ${resolvedAsset.alt.ar}`;
    }
    return 'United Olympics Sports media asset';
  })();

  // 5. Source set generation for picture element
  const avifSet = !usingRemoteFallback && resolvedAsset
    ? MediaRegistry.getSourceSet(resolvedAsset, 'avif')
    : undefined;
  const webpSet = !usingRemoteFallback && resolvedAsset
    ? MediaRegistry.getSourceSet(resolvedAsset, 'webp')
    : undefined;

  // 6. Source URL resolution with dual-layer fallback
  const finalSrc = (() => {
    if (directSrc) return directSrc;
    if (!resolvedAsset) return '';
    if (usingRemoteFallback) return resolvedAsset.sourceUrl;
    return resolvedAsset.src;
  })();

  const isEager = priority || resolvedAsset?.priority;

  const handleImageError = () => {
    // If local image fails, attempt fallback to original verified postimg CDN
    if (!usingRemoteFallback && resolvedAsset?.sourceUrl && resolvedAsset.sourceUrl !== finalSrc) {
      setUsingRemoteFallback(true);
      return;
    }
    setHasError(true);
    if (onLoadError) onLoadError();
  };

  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoadSuccess) onLoadSuccess();
  };

  return (
    <div
      className={`uos-image-container relative overflow-hidden ${containerClassName}`.trim()}
      style={{
        aspectRatio: computedAspectRatio,
        ...(!computedAspectRatio && !rest.height ? { minHeight: '100%' } : {}),
      }}
    >
      {/* Loading Shimmer */}
      {showShimmer && !isLoaded && !hasError && (
        <div
          className="absolute inset-0 bg-neutral-900/40 animate-pulse transition-opacity duration-300 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Primary Image or Fallback */}
      {!hasError && finalSrc ? (
        <picture className="w-full h-full block">
          {avifSet && (
            <source
              type="image/avif"
              srcSet={avifSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1280px"
            />
          )}
          {webpSet && (
            <source
              type="image/webp"
              srcSet={webpSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 1280px"
            />
          )}
          <img
            src={finalSrc}
            alt={resolvedAltText}
            width={resolvedWidth}
            height={resolvedHeight}
            loading={isEager ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={isEager ? 'high' : 'auto'}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{
              objectFit,
              objectPosition: resolvedPosition,
              transition: 'opacity 0.35s ease-in-out',
              opacity: isLoaded || isEager ? 1 : 0,
              ...style,
            }}
            className={`w-full h-full block ${className}`.trim()}
            {...rest}
          />
        </picture>
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-neutral-900/80 border border-amber-500/20 text-neutral-400 p-4 text-center select-none"
          role="img"
          aria-label={resolvedAltText}
        >
          <div className="w-8 h-8 rounded-full border border-amber-500/30 flex items-center justify-center mb-2 text-amber-400 text-xs font-semibold">
            UOS
          </div>
          <span className="text-xs text-neutral-400 max-w-[200px] line-clamp-2">
            {resolvedAsset?.roleDescription?.en ?? resolvedAltText}
          </span>
        </div>
      )}

      {/* Atmospheric Contrast Overlay */}
      {gradientOverlay && (
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default UosImage;
