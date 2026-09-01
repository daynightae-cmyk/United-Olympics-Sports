import React from 'react';
import { BilingualString } from '../../types';

export interface BilingualHeadingProps {
  en: string;
  ar: string;
  level?: 1 | 2 | 3 | 4;
  className?: string;
  enClassName?: string;
  arClassName?: string;
  badge?: { en: string; ar: string };
}

export const BilingualHeading: React.FC<BilingualHeadingProps> = ({
  en,
  ar,
  level = 2,
  className = '',
  enClassName = '',
  arClassName = '',
  badge,
}) => {
  const sizeClasses = {
    1: { en: 'text-3xl sm:text-4xl md:text-5xl font-black font-brand tracking-wide text-zinc-100', ar: 'text-2xl sm:text-3xl font-extrabold text-amber-300' },
    2: { en: 'text-2xl sm:text-3xl font-extrabold text-zinc-100', ar: 'text-xl sm:text-2xl font-bold text-amber-300' },
    3: { en: 'text-xl sm:text-2xl font-bold text-zinc-100', ar: 'text-lg sm:text-xl font-bold text-amber-300' },
    4: { en: 'text-lg font-bold text-zinc-100', ar: 'text-base font-bold text-amber-300' },
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className={`${sizeClasses[level].en} ${enClassName}`}>{en}</h2>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {badge.en} • {badge.ar}
          </span>
        )}
      </div>
      <h3 className={`font-arabic ${sizeClasses[level].ar} ${arClassName}`} dir="rtl">
        {ar}
      </h3>
    </div>
  );
};

export interface BilingualButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  en: string;
  ar: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const BilingualButton: React.FC<BilingualButtonProps> = ({
  en,
  ar,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-black hover:from-amber-400 hover:to-amber-500 shadow-[0_0_20px_rgba(212,175,55,0.3)]',
    secondary: 'bg-zinc-900 border border-amber-500/40 text-amber-300 hover:bg-zinc-800 hover:border-amber-400',
    outline: 'border border-zinc-700 hover:border-amber-400/60 text-zinc-200 hover:text-amber-200 bg-transparent',
    danger: 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30',
    ghost: 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900/50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-sm sm:text-base rounded-2xl gap-3',
  };

  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-98 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon}
      <span>{en}</span>
      <span className="opacity-40">|</span>
      <span className="font-arabic font-bold text-[0.9em]">{ar}</span>
    </button>
  );
};

export interface BilingualBadgeProps {
  en: string;
  ar: string;
  status?: 'active' | 'inactive' | 'pending' | 'success' | 'warning' | 'danger' | 'elite';
  className?: string;
}

export const BilingualBadge: React.FC<BilingualBadgeProps> = ({
  en,
  ar,
  status = 'active',
  className = '',
}) => {
  const statusStyles = {
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    inactive: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    warning: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
    elite: 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-amber-200 border-amber-400/50 shadow-[0_0_10px_rgba(212,175,55,0.2)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusStyles[status]} ${className}`}
    >
      <span>{en}</span>
      <span className="opacity-40 text-[9px]">•</span>
      <span className="font-arabic font-bold">{ar}</span>
    </span>
  );
};

export interface BilingualFieldLabelProps {
  en: string;
  ar: string;
  required?: boolean;
  className?: string;
}

export const BilingualFieldLabel: React.FC<BilingualFieldLabelProps> = ({
  en,
  ar,
  required = false,
  className = '',
}) => (
  <div className={`flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5 ${className}`}>
    <span className="tracking-wide uppercase text-zinc-400 font-mono">
      {en} {required && <span className="text-amber-400">*</span>}
    </span>
    <span className="font-arabic text-amber-300 font-bold" dir="rtl">
      {ar}
    </span>
  </div>
);
