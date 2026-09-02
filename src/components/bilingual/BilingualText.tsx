import type { ReactNode } from 'react';
import type { BilingualText as BilingualTextValue } from '../../domain/contracts';

type Props = {
  value: BilingualTextValue;
  as?: 'span' | 'div';
  className?: string;
  icon?: ReactNode;
};

export function BilingualText({ value, as: Tag = 'span', className = '', icon }: Props) {
  return (
    <Tag className={`bi ${className}`.trim()}>
      {icon}
      <span className="bi-en" lang="en">{value.en}</span>
      <span className="bi-ar" lang="ar" dir="rtl">{value.ar}</span>
    </Tag>
  );
}

export function bi(en: string, ar: string): BilingualTextValue {
  return { en, ar };
}
