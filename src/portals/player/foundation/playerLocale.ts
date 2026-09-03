import type { BilingualOrder } from '../../../ui/theme/uiSettings';

export function playerLocale(order: BilingualOrder): string {
  return order === 'ar-first' ? 'ar-AE' : 'en-GB';
}

export function formatPlayerDate(value: string | Date, order: BilingualOrder, options?: Intl.DateTimeFormatOptions) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return order === 'ar-first' ? 'غير متاح' : 'Not available';
  return new Intl.DateTimeFormat(playerLocale(order), options ?? {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatPlayerTime(value: string | Date, order: BilingualOrder) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return order === 'ar-first' ? 'غير متاح' : 'Not available';
  return new Intl.DateTimeFormat(playerLocale(order), {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatPlayerDateTime(value: string | Date, order: BilingualOrder) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return order === 'ar-first' ? 'غير متاح' : 'Not available';
  return new Intl.DateTimeFormat(playerLocale(order), {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatMetricValue(value: number | undefined, unitEn?: string, unitAr?: string, order: BilingualOrder = 'en-first') {
  if (typeof value !== 'number' || Number.isNaN(value)) return order === 'ar-first' ? 'غير متاح' : 'Not available';
  const unit = order === 'ar-first' ? unitAr : unitEn;
  return unit ? `${value} ${unit}` : String(value);
}
