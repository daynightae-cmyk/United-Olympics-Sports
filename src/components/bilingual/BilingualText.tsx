import type { ReactNode } from 'react';
import type { BilingualText as BilingualTextValue } from '../../domain/contracts';
import { useUiSettings } from '../../ui/theme/useUiSettings';

type Props = {
  value: BilingualTextValue;
  as?: 'span' | 'div';
  className?: string;
  icon?: ReactNode;
};

export function BilingualText({ value, as: Tag = 'span', className = '', icon }: Props) {
  const { bilingualOrder } = useUiSettings();
  const en = <span key="en" className="bi-en" lang="en" dir="ltr">{value.en}</span>;
  const ar = <span key="ar" className="bi-ar" lang="ar" dir="rtl">{value.ar}</span>;
  return <Tag className={`bi ${className}`.trim()}>{icon}{bilingualOrder === 'ar-first' ? [ar, en] : [en, ar]}</Tag>;
}

export function bi(en: string, ar: string): BilingualTextValue {
  return { en, ar };
}
