import { useId, useRef, useState } from 'react';
import { StoreCopy } from '../../StoreCopy';
import { useStore } from '../../StoreContext';
import type { BilingualText } from '../../../domain/contracts';
import type { DeliverySlot, LoyaltySummary, OrderEvent } from '../../storeTypes';

export type PromoResult = { status: 'applied' | 'invalid'; message: BilingualText; code?: string };
export type PromoProvider = { validate: (code: string) => Promise<PromoResult>; remove: () => Promise<void> };

/** The service owns pricing changes. A field response never computes a local discount. */
export function PromoCodeField({ provider }: { provider?: PromoProvider }) {
  const { locale } = useStore();
  const id = useId();
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'validating' | 'applied' | 'invalid' | 'removed'>('idle');
  const [message, setMessage] = useState<BilingualText>();
  const busy = useRef(false);
  const act = async () => {
    if (!provider || busy.current) return;
    busy.current = true;
    const removing = state === 'applied';
    setState('validating');
    try {
      if (removing) { await provider.remove(); setState('removed'); setMessage({ en: 'Promotion removed', ar: 'تمت إزالة العرض' }); }
      else { const result = await provider.validate(code.trim()); setState(result.status); setMessage(result.message); }
    } catch { setState(removing ? 'applied' : 'invalid'); setMessage({ en: 'Promotion service unavailable. Please try again.', ar: 'خدمة العروض غير متاحة. حاول مجددًا.' }); }
    finally { busy.current = false; }
  };
  return <section className="store-service-panel"><label htmlFor={id}><StoreCopy value={{ en: 'Promotion code', ar: 'رمز العرض' }} inline /></label>{provider ? <><div className="store-promo-input"><input id={id} value={code} disabled={state === 'applied' || state === 'validating'} onChange={(event) => { setCode(event.target.value); setState('idle'); setMessage(undefined); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); if (code.trim()) void act(); } }} /><button type="button" disabled={state === 'validating' || !code.trim()} onClick={() => void act()}>{state === 'validating' ? (locale === 'ar' ? 'جارٍ التحقق' : 'Validating') : state === 'applied' ? (locale === 'ar' ? 'إزالة' : 'Remove') : (locale === 'ar' ? 'تطبيق' : 'Apply')}</button></div><p role="status">{message && <StoreCopy value={message} />}</p></> : <p><StoreCopy value={{ en: 'Promotions are not configured yet', ar: 'العروض غير مهيأة بعد' }} /></p>}</section>;
}

export function DeliverySlotSelector({ slots, selected, onSelect }: { slots?: DeliverySlot[]; selected?: string; onSelect?: (id: string) => void }) {
  const { locale } = useStore();
  const name = useId();
  return <fieldset className="store-service-panel"><legend><StoreCopy value={{ en: 'Delivery options', ar: 'خيارات التوصيل' }} inline /></legend>{slots?.length ? slots.map((slot) => <label className="store-delivery-slot" key={slot.id}><input type="radio" name={name} disabled={!slot.available || !onSelect} checked={selected === slot.id} onChange={() => onSelect?.(slot.id)} /><span><strong>{slot.date}</strong><StoreCopy value={slot.window} /><StoreCopy value={slot.service} />{slot.cutoff && <small>{locale === 'ar' ? 'آخر موعد' : 'Cutoff'}: {slot.cutoff}</small>}</span><b>{new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { style: 'currency', currency: slot.currency }).format(slot.price)}</b></label>) : <p><StoreCopy value={{ en: 'Shipping configuration pending. No delivery slots are available.', ar: 'إعداد الشحن معلق. لا توجد مواعيد توصيل متاحة.' }} /></p>}</fieldset>;
}

export function RewardTierCard({ loyalty }: { loyalty?: LoyaltySummary }) {
  const { locale } = useStore();
  if (!loyalty) return null;
  return <section className="store-service-panel store-reward"><h2><StoreCopy value={loyalty.tier} /></h2><strong>{new Intl.NumberFormat(locale).format(loyalty.points)} {locale === 'ar' ? 'نقطة' : 'points'}</strong><ul>{loyalty.benefits.map((value) => <li key={value.en}><StoreCopy value={value} /></li>)}</ul></section>;
}

export function OrderTracker({ events, status }: { events?: OrderEvent[]; status?: BilingualText }) {
  return <section className="store-service-panel"><h2><StoreCopy value={{ en: 'Order timeline', ar: 'الخط الزمني للطلب' }} /></h2>{status && <p><StoreCopy value={status} /></p>}{events?.length ? <ol className="store-order-timeline">{events.map((event) => <li key={event.id} data-status={event.status}><strong><StoreCopy value={event.label} /></strong>{event.timestamp && <time dateTime={event.timestamp}>{event.timestamp}</time>}{event.description && <p><StoreCopy value={event.description} /></p>}</li>)}</ol> : <p><StoreCopy value={{ en: 'No verified order events are available', ar: 'لا توجد أحداث طلب موثقة متاحة' }} /></p>}</section>;
}
