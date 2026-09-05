import { useEffect } from 'react';
import { portalEmblems, type PortalKind } from '../../brand/portalEmblems';
import { useUiSettings } from '../../ui/theme/useUiSettings';
import '../../styles/portal-emblems.css';

export type PortalEmblemSize = 'compact' | 'header' | 'auth' | 'hero';
export type PortalEmblemRole = 'primary' | 'selector' | 'decorative';

type PortalEmblemProps = {
  portal: PortalKind;
  size?: PortalEmblemSize;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  preloadAlternate?: boolean;
  role?: PortalEmblemRole;
};

export function PortalEmblem({
  portal,
  size = 'header',
  className = '',
  decorative = false,
  priority = false,
  preloadAlternate = true,
  role,
}: PortalEmblemProps) {
  const { resolvedTheme } = useUiSettings();
  const definition = portalEmblems[portal];
  const src = definition[resolvedTheme];
  const alternate = definition[resolvedTheme === 'dark' ? 'light' : 'dark'];
  const resolvedRole: PortalEmblemRole = role ?? (decorative ? 'decorative' : 'primary');

  useEffect(() => {
    if (!preloadAlternate || typeof window === 'undefined') return;
    const image = new Image();
    image.decoding = 'async';
    image.src = alternate;
  }, [alternate, preloadAlternate]);

  const alt = decorative ? '' : `${definition.altEn} emblem | ${definition.altAr}`;

  return (
    <span
      className={`portal-emblem portal-emblem-${size} ${className}`.trim()}
      data-portal-emblem={portal}
      data-portal-theme={resolvedTheme}
      data-portal-emblem-role={resolvedRole}
    >
      <img
        src={src}
        alt={alt}
        aria-hidden={decorative ? true : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        width={512}
        height={512}
      />
    </span>
  );
}
