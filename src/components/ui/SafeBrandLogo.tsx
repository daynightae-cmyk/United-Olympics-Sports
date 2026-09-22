import React from "react";

type Props = {
  compact?: boolean;
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | string;
  style?: React.CSSProperties;
};

export function SafeBrandLogo({ compact = false, className = "", alt, size, style }: Props) {
  const sizeClass = size ? `size--${size}` : '';
  const imgClass = compact ? `official-logo compact ${sizeClass} ${className}` : `official-logo ${sizeClass} ${className}`;
  const isSidebarLogo = className.includes('athlete-sidebar-logo') || className.includes('portal-brand-logo');

  return (
    <img
      className={imgClass}
      src="/brand/united-olympics-sports-logo.png"
      alt={alt ?? "United Olympics Sports | يونايتد أوليمبيكس سبورت"}
      loading="eager"
      decoding="sync"
      style={isSidebarLogo ? { objectFit: 'cover', ...style } : style}
    />
  );
}

export default SafeBrandLogo;
