import type { BilingualText as BilingualValue } from '../domain/contracts';
import { useStore } from './StoreContext';

export function StoreCopy({ value, className = '', inline = false }: { value: BilingualValue; className?: string; inline?: boolean }) {
  const { locale } = useStore();
  const primary = locale === 'ar' ? value.ar : value.en;
  const secondary = locale === 'ar' ? value.en : value.ar;
  return <span className={`store-copy ${inline ? 'is-inline' : ''} ${className}`.trim()}><span lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>{primary}</span><small lang={locale === 'ar' ? 'en' : 'ar'} dir={locale === 'ar' ? 'ltr' : 'rtl'}>{secondary}</small></span>;
}

