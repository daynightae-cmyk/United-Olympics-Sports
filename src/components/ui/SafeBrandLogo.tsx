import React from "react";

type Props = {
  compact?: boolean;
  className?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | string;
};

export function SafeBrandLogo({ compact = false, className = "", alt, size }: Props) {
  const sizeClass = size ? `size--${size}` : '';
  const imgClass = compact ? `official-logo compact ${sizeClass} ${className}` : `official-logo ${sizeClass} ${className}`;

  return (
    <img
      className={imgClass}
      src="/brand/united-olympics-sports-logo.png"
      alt={alt ?? "United Olympics Sports | يونايتد أوليمبيكس سبورت"}
      loading="eager"
      decoding="sync"
    />
  );
}

export default SafeBrandLogo;
