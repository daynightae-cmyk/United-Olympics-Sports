import React from 'react';

export const LOGO_SRC = "/brand/united-olympics-sports-logo.png";

if (typeof window !== 'undefined') {
  const img = new Image();
  img.src = LOGO_SRC;
}

export interface AppLogoProps {
  className?: string;
  compact?: boolean;
  size?: number | string;
  withGlow?: boolean;
  withGoldBorder?: boolean;
  alt?: string;
}

export function AppLogo({
  className = "",
  compact = false,
  size,
  withGlow = false,
  withGoldBorder = true,
  alt = "United Olympics Sports | يونايتد أوليمبيكس سبورت",
}: AppLogoProps) {
  const baseClass = compact ? "official-logo compact" : "official-logo";
  const glowClass = withGlow ? "logo-with-glow" : "";
  const borderClass = withGoldBorder ? "logo-circular-gold" : "";

  const style: React.CSSProperties = {
    borderRadius: '50%',
    aspectRatio: '1 / 1',
    objectFit: 'contain',
    display: 'block',
    ...(size ? { width: size, height: size } : {}),
  };

  return (
    <img
      className={`${baseClass} app-circular-logo ${borderClass} ${glowClass} ${className}`.trim()}
      src={LOGO_SRC}
      alt={alt}
      style={style}
      loading="eager"
      decoding="async"
    />
  );
}
