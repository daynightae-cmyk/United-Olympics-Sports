import type { BilingualText } from '../../domain/contracts';

export function formatBilingualDate(value?: string): BilingualText {
  if (!value) return { en: 'Not recorded', ar: 'غير مسجل' };
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return { en: value, ar: value };
  return {
    en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date),
    ar: new Intl.DateTimeFormat('ar-AE', { day: 'numeric', month: 'short', year: 'numeric' }).format(date),
  };
}

export function metricValue(value?: number): string {
  return typeof value === 'number' ? String(value) : '—';
}
