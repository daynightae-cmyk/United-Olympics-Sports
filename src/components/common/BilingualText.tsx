import React from 'react';
import { BilingualString } from '../../types';

interface BilingualTextProps {
  text: BilingualString | { en: string; ar: string };
  separator?: 'slash' | 'bullet' | 'break' | 'badge' | 'stacked';
  className?: string;
  enClassName?: string;
  arClassName?: string;
  primaryLang?: 'en' | 'ar';
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  text,
  separator = 'stacked',
  className = '',
  enClassName = '',
  arClassName = '',
}) => {
  if (!text) return null;

  if (separator === 'slash') {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        <span className={enClassName}>{text.en}</span>
        <span className="text-amber-500/60 font-light">/</span>
        <span className={`font-arabic ${arClassName}`} dir="rtl">
          {text.ar}
        </span>
      </span>
    );
  }

  if (separator === 'bullet') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className={enClassName}>{text.en}</span>
        <span className="text-amber-500/60 text-xs">•</span>
        <span className={`font-arabic ${arClassName}`} dir="rtl">
          {text.ar}
        </span>
      </span>
    );
  }

  if (separator === 'badge') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className={enClassName}>{text.en}</span>
        <span className={`px-2 py-0.5 rounded text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 font-arabic ${arClassName}`} dir="rtl">
          {text.ar}
        </span>
      </span>
    );
  }

  // Default 'stacked'
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-medium ${enClassName}`}>{text.en}</span>
      <span className={`font-arabic text-sm text-zinc-400 font-normal ${arClassName}`} dir="rtl">
        {text.ar}
      </span>
    </div>
  );
};
