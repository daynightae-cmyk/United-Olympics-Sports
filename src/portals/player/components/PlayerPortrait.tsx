import React, { useEffect, useMemo, useState } from 'react';

interface PlayerPortraitProps {
  photoUrl?: string;
  name: string;
  className?: string;
  eager?: boolean;
}

export function PlayerPortrait({ photoUrl, name, className = '', eager = false }: PlayerPortraitProps) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [photoUrl]);
  const initials = useMemo(() => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase() || 'UO', [name]);

  if (photoUrl && !imageError) {
    return (
      <img
        src={photoUrl}
        alt={`Player portrait: ${name} · صورة اللاعب: ${name}`}
        onError={() => setImageError(true)}
        className={`object-cover ${className}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }

  return <div role="img" aria-label={`Player initials: ${name} · الأحرف الأولى لاسم اللاعب: ${name}`} className={`flex items-center justify-center font-extrabold bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-700 text-black shadow-lg shadow-amber-400/20 border border-amber-200/50 ${className}`}>{initials}</div>;
}
