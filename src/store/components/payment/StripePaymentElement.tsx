import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { StoreCopy } from '../../StoreCopy';

type StripeError = { message?: string; type?: string };
type StripeIntent = { id?: string; status?: string };

type StripePaymentElementInstance = {
  mount: (target: HTMLElement) => void;
  unmount: () => void;
  destroy?: () => void;
};

type StripeElementsInstance = {
  create: (type: 'payment', options?: Record<string, unknown>) => StripePaymentElementInstance;
  submit?: () => Promise<{ error?: StripeError }>;
};

type StripeInstance = {
  elements: (options: {
    clientSecret: string;
    locale?: 'en' | 'ar';
    appearance?: Record<string, unknown>;
  }) => StripeElementsInstance;
  confirmPayment: (options: {
    elements: StripeElementsInstance;
    confirmParams: { return_url: string };
    redirect: 'if_required';
  }) => Promise<{ error?: StripeError; paymentIntent?: StripeIntent }>;
};

type StripeFactory = (publishableKey: string) => StripeInstance;

declare global {
  interface Window {
    Stripe?: StripeFactory;
  }
}

let stripeScriptPromise: Promise<StripeFactory> | null = null;

function loadStripeFactory(): Promise<StripeFactory> {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (stripeScriptPromise) return stripeScriptPromise;

  stripeScriptPromise = new Promise<StripeFactory>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-uos-stripe="true"]');
    if (existing) {
      const onReady = () => window.Stripe ? resolve(window.Stripe) : reject(new Error('STRIPE_JS_UNAVAILABLE'));
      existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener('error', () => reject(new Error('STRIPE_JS_LOAD_FAILED')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.dataset.uosStripe = 'true';
    script.addEventListener('load', () => {
      if (!window.Stripe) {
        reject(new Error('STRIPE_JS_UNAVAILABLE'));
        return;
      }
      resolve(window.Stripe);
    }, { once: true });
    script.addEventListener('error', () => reject(new Error('STRIPE_JS_LOAD_FAILED')), { once: true });
    document.head.appendChild(script);
  });

  return stripeScriptPromise;
}

async function waitForPaidOrder(token: string, orderId: string): Promise<'paid' | 'cancelled' | 'pending'> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch('/api/v1/store/account', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const payload = await response.json().catch(() => null) as {
        account?: { orders?: Array<{ id?: string; status?: string }> };
      } | null;
      const order = payload?.account?.orders?.find((item) => item.id === orderId);
      if (order?.status === 'paid') return 'paid';
      if (order?.status === 'cancelled') return 'cancelled';
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
  }
  return 'pending';
}

export function StripePaymentElement({
  publishableKey,
  clientSecret,
  orderId,
  orderNumber,
  token,
  locale,
  onProviderAccepted,
  onPaid,
  onAwaitingWebhook,
}: {
  publishableKey: string;
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  token: string;
  locale: 'en' | 'ar';
  onProviderAccepted: () => void;
  onPaid: () => void;
  onAwaitingWebhook: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const elementsRef = useRef<StripeElementsInstance | null>(null);
  const paymentElementRef = useRef<StripePaymentElementInstance | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'confirming' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    let active = true;
    let mountedElement: StripePaymentElementInstance | null = null;

    void loadStripeFactory()
      .then((factory) => {
        if (!active || !mountRef.current) return;
        const stripe = factory(publishableKey);
        const lightMode = document.documentElement.dataset.theme === 'light';
        const elements = stripe.elements({
          clientSecret,
          locale,
          appearance: {
            theme: lightMode ? 'stripe' : 'night',
            variables: {
              colorPrimary: '#b9954e',
              colorBackground: lightMode ? '#fffdf8' : '#12110e',
              colorText: lightMode ? '#171611' : '#f5f0e4',
              colorDanger: '#c24141',
              borderRadius: '12px',
              fontFamily: 'DM Sans, Cairo, system-ui, sans-serif',
            },
          },
        });
        const paymentElement = elements.create('payment', { layout: 'tabs' });
        paymentElement.mount(mountRef.current);
        stripeRef.current = stripe;
        elementsRef.current = elements;
        paymentElementRef.current = paymentElement;
        mountedElement = paymentElement;
        setState('ready');
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : 'STRIPE_JS_LOAD_FAILED');
        setState('error');
      });

    return () => {
      active = false;
      try { mountedElement?.unmount(); } catch { /* Stripe owns the iframe lifecycle. */ }
      try { mountedElement?.destroy?.(); } catch { /* Best effort cleanup. */ }
      stripeRef.current = null;
      elementsRef.current = null;
      paymentElementRef.current = null;
    };
  }, [clientSecret, locale, publishableKey]);

  const confirm = async () => {
    const stripe = stripeRef.current;
    const elements = elementsRef.current;
    if (!stripe || !elements || state === 'confirming') return;

    setState('confirming');
    setMessage('');

    try {
      if (elements.submit) {
        const submitted = await elements.submit();
        if (submitted.error) throw new Error(submitted.error.message || 'PAYMENT_DETAILS_INVALID');
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/store/orders`,
        },
        redirect: 'if_required',
      });

      if (result.error) throw new Error(result.error.message || 'PAYMENT_CONFIRMATION_FAILED');

      const providerStatus = result.paymentIntent?.status;
      if (providerStatus !== 'succeeded' && providerStatus !== 'processing') {
        throw new Error(providerStatus ? `PAYMENT_STATUS_${providerStatus}` : 'PAYMENT_STATUS_UNKNOWN');
      }

      onProviderAccepted();
      const localStatus = await waitForPaidOrder(token, orderId);
      if (localStatus === 'paid') {
        onPaid();
        return;
      }
      if (localStatus === 'cancelled') {
        throw new Error('ORDER_CANCELLED_AFTER_PAYMENT');
      }
      onAwaitingWebhook();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PAYMENT_CONFIRMATION_FAILED');
      setState('error');
    }
  };

  return (
    <section className="store-stripe-payment" aria-label="Secure card payment | الدفع الآمن بالبطاقة">
      <header>
        <span><CreditCard aria-hidden="true" /></span>
        <div>
          <strong><StoreCopy value={{ en: 'Secure card payment', ar: 'دفع آمن بالبطاقة' }} inline /></strong>
          <small><StoreCopy value={{ en: `Order ${orderNumber}`, ar: `الطلب ${orderNumber}` }} inline /></small>
        </div>
        <ShieldCheck aria-hidden="true" />
      </header>

      <div ref={mountRef} className="store-stripe-element" />

      {state === 'loading' && <p className="store-payment-status" role="status"><LoaderCircle className="is-spinning" /><StoreCopy value={{ en: 'Loading secure payment fields…', ar: 'جارٍ تحميل حقول الدفع الآمنة…' }} inline /></p>}
      {state === 'error' && <p className="store-inline-error" role="alert"><X /><StoreCopy value={{ en: `Payment could not continue (${message}). No new charge was submitted.`, ar: `تعذر متابعة الدفع (${message}). لم يتم إرسال عملية تحصيل جديدة.` }} inline /></p>}

      <button type="button" className="store-button store-button-primary store-pay-button" disabled={state !== 'ready' && state !== 'error'} onClick={() => void confirm()}>
        {state === 'confirming' ? <><LoaderCircle className="is-spinning" /><StoreCopy value={{ en: 'Confirming payment…', ar: 'جارٍ تأكيد الدفع…' }} inline /></> : <><CheckCircle2 /><StoreCopy value={{ en: 'Pay securely', ar: 'ادفع بأمان' }} inline /></>}
      </button>

      <p className="store-security-note"><ShieldCheck /><StoreCopy value={{ en: 'Card details are collected by Stripe inside its secure Payment Element and are never stored by United Olympics Sports.', ar: 'تُجمع بيانات البطاقة بواسطة Stripe داخل عنصر الدفع الآمن ولا تقوم يونايتد أوليمبيكس سبورت بتخزينها.' }} inline /></p>
    </section>
  );
}
