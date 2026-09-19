import { DeliverySlotSelector, PromoCodeField } from './components/commerce/CommerceServices';
import { cartLineKey } from './storeUtils';
import { useStoreDialog } from './components/useStoreDialog';
import { StripePaymentElement } from './components/payment/StripePaymentElement';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Grid2X2,
  List,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from './StoreContext';
import {
  CategoryRail,
  DirectionArrow,
  ProductGrid,
  ProductMedia,
  ProductPrice,
  QuantityStepper,
  StoreCopy,
  StoreState,
} from './StoreComponents';

export { StoreHomePage } from './components/collections/StoreHome';

function FilterPanel({ selected, onSelect, onClose, panelRef }: { selected: string; onSelect: (slug: string) => void; onClose?: () => void; panelRef?: RefObject<HTMLElement | null> }) {
  const { categories } = useStore();
  return <aside ref={panelRef} tabIndex={onClose ? -1 : undefined} className="store-filters"><header><h2><StoreCopy value={{ en: 'Filters', ar: 'تصفية' }} inline /></h2><div><button type="button" className="store-filter-clear" onClick={() => onSelect('')}><StoreCopy value={{ en: 'Clear All', ar: 'مسح الكل' }} inline /></button>{onClose && <button type="button" onClick={onClose} aria-label="Close filters | إغلاق التصفية"><X /></button>}</div></header><section><h3><StoreCopy value={{ en: 'Category', ar: 'الفئة' }} inline /></h3><label><input type="radio" name="category" checked={!selected} onChange={() => onSelect('')} /><span><StoreCopy value={{ en: 'All Categories', ar: 'كل الفئات' }} inline /></span></label>{categories.map((category) => <label key={category.slug}><input type="radio" name="category" checked={selected === category.slug} onChange={() => onSelect(category.slug)} /><span><StoreCopy value={category.name} inline /></span></label>)}</section><section><h3><StoreCopy value={{ en: 'Availability', ar: 'التوفر' }} inline /></h3><p><StoreCopy value={{ en: 'Awaiting production inventory source', ar: 'بانتظار مصدر مخزون الإنتاج' }} /></p></section><section><h3><StoreCopy value={{ en: 'Price', ar: 'السعر' }} inline /></h3><p><StoreCopy value={{ en: 'Uses configured catalog currency', ar: 'يستخدم عملة الكتالوج المهيأة' }} /></p></section>{onClose && <button type="button" className="store-button store-button-primary" onClick={onClose}><StoreCopy value={{ en: 'Apply Filters', ar: 'تطبيق التصفية' }} inline /></button>}</aside>;
}

export function CatalogPage({ categoriesOnly = false, fixedCategory }: { categoriesOnly?: boolean; fixedCategory?: string }) {
  const { categories, products, locale, isPreview } = useStore();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const selected = fixedCategory ?? params.get('category') ?? '';
  const collection = params.get('collection');
  const filtered = useMemo(() => products.filter((product) => (!selected || product.category === selected) && (!collection || (collection === 'new' ? product.badge === 'new' : collection === 'featured' ? product.badge === 'featured' : product.collectionIds?.includes(collection)))).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : 0), [products, selected, sort, collection]);
  const navigate = useNavigate();
  const selectCategory = (category: string) => { if (fixedCategory) { navigate(category ? `/store/category/${category}` : '/store/shop'); return; } const next = new URLSearchParams(params); if (category) next.set('category', category); else next.delete('category'); setParams(next); };
  useStoreDialog(filtersOpen, filterRef, () => setFiltersOpen(false));
  return <div className="store-catalog-page">
    <div className="store-page-heading">
      <nav><Link to="/store"><StoreCopy value={{ en: 'Store', ar: 'المتجر' }} inline /></Link><ChevronRight /><span>{locale === 'ar' ? (categoriesOnly ? 'الفئات' : 'تسوق') : (categoriesOnly ? 'Categories' : 'Shop')}</span></nav>
      <span>UNITED COMMERCE</span>
      <h1><StoreCopy value={fixedCategory ? categories.find((item) => item.slug === fixedCategory)?.name ?? { en: 'Collection', ar: 'المجموعة' } : categoriesOnly ? { en: 'All Categories', ar: 'جميع الفئات' } : { en: 'Shop', ar: 'المتجر' }} /></h1>
      <p><StoreCopy value={{ en: 'Find your sport. Discover your essentials.', ar: 'اختر رياضتك. اكتشف مستلزماتك.' }} /></p>
    </div>
    <CategoryRail categories={categories} active={selected} />
    <div className="store-catalog-toolbar">
      <div><strong>{filtered.length}</strong> <StoreCopy value={isPreview ? { en: 'preview products', ar: 'منتجات معاينة' } : { en: 'products', ar: 'منتجات' }} inline /></div>
      <button ref={filterTriggerRef} type="button" className="store-mobile-filter" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}><SlidersHorizontal /><StoreCopy value={{ en: 'Filters', ar: 'تصفية' }} inline /></button>
      <label><span className="sr-only">Sort | ترتيب</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">{locale === 'ar' ? 'ترتيب الكتالوج' : 'Catalog order'}</option><option value="price-low">Price: Low | السعر: الأقل</option><option value="price-high">Price: High | السعر: الأعلى</option></select></label>
      <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view | عرض شبكي"><Grid2X2 /></button>
      <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view | عرض قائمة"><List /></button>
    </div>
    <div className="store-catalog-layout"><FilterPanel selected={selected} onSelect={selectCategory} /><section><ProductGrid products={filtered} layout={view} /></section></div>
    {filtersOpen && <div className="store-filter-layer" role="dialog" aria-modal="true" aria-label="Product filters | تصفية المنتجات"><button className="store-drawer-backdrop" type="button" aria-label="Close filters | إغلاق التصفية" onClick={() => setFiltersOpen(false)} /><FilterPanel panelRef={filterRef} selected={selected} onSelect={selectCategory} onClose={() => setFiltersOpen(false)} /></div>}
  </div>;
}

export function CategoryPage() {
  const { slug } = useParams();
  const { categories } = useStore();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return <div className="store-page-pad"><StoreState kind="empty" title={{ en: 'Category unavailable', ar: 'الفئة غير متاحة' }} description={{ en: 'This category is not present in the verified catalog.', ar: 'هذه الفئة غير موجودة في الكتالوج الموثق.' }} action={<Link className="store-button store-button-primary" to="/store/categories"><StoreCopy value={{ en: 'All Categories', ar: 'كل الفئات' }} inline /></Link>} /></div>;
  return <CatalogPage key={category.slug} fixedCategory={category.slug} />;
}

export function SearchResultsPage() {
  const { products } = useStore();
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const results = products.filter((product) => `${product.name.en} ${product.name.ar} ${product.type.en} ${product.type.ar}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="store-section store-search-page"><div className="store-page-heading"><span>SEARCH</span><h1><StoreCopy value={{ en: 'Search Results', ar: 'نتائج البحث' }} /></h1><p>{query ? <><StoreCopy value={{ en: 'Results for', ar: 'نتائج البحث عن' }} inline /> “{query}”</> : <StoreCopy value={{ en: 'Enter a term in the store search.', ar: 'أدخل عبارة في بحث المتجر.' }} />}</p></div>{query ? <ProductGrid products={results} /> : <StoreState kind="empty" title={{ en: 'Start your search', ar: 'ابدأ البحث' }} description={{ en: 'Search products, sports or categories from the header.', ar: 'ابحث عن المنتجات أو الرياضات أو الفئات من الشريط العلوي.' }} />}</section>;
}

export { ProductDetailPage } from './components/product/ProductDetail';

function CartSummary({ checkout = false }: { checkout?: boolean }) {
  const { cart, subtotal } = useStore();
  const currency = cart[0]?.product.currency ?? 'AED';
  const format = (value: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency }).format(value);
  return <aside className="store-cart-summary"><h2><StoreCopy value={{ en: 'Order Summary', ar: 'ملخص الطلب' }} /></h2><PromoCodeField /><dl><div><dt><StoreCopy value={{ en: 'Subtotal', ar: 'المجموع الفرعي' }} inline /></dt><dd>{format(subtotal)}</dd></div><div><dt><StoreCopy value={{ en: 'Shipping', ar: 'الشحن' }} inline /></dt><dd><StoreCopy value={{ en: 'Not configured', ar: 'غير مهيأ' }} inline /></dd></div><div><dt><StoreCopy value={{ en: 'Tax', ar: 'الضريبة' }} inline /></dt><dd><StoreCopy value={{ en: 'Not configured', ar: 'غير مهيأ' }} inline /></dd></div></dl><div className="store-summary-total"><StoreCopy value={{ en: 'Current item total', ar: 'إجمالي العناصر الحالي' }} inline /><strong>{format(subtotal)}</strong></div><p><ShieldCheck /><StoreCopy value={{ en: 'No payment or order will be submitted without a configured production provider.', ar: 'لن يتم إرسال دفع أو طلب دون موفر إنتاج مهيأ.' }} /></p>{!checkout && <Link className="store-button store-button-primary" to="/store/checkout"><StoreCopy value={{ en: 'Proceed to Checkout', ar: 'المتابعة للدفع' }} inline /><DirectionArrow /></Link>}</aside>;
}

function CartJourneyPanel() {
  const steps = [
    { id: 1, en: 'Contact', ar: 'معلومات التواصل' },
    { id: 2, en: 'Delivery Address', ar: 'عنوان التوصيل' },
    { id: 3, en: 'Delivery Method', ar: 'طريقة التوصيل' },
    { id: 4, en: 'Payment Method', ar: 'طريقة الدفع' },
    { id: 5, en: 'Order Review', ar: 'مراجعة الطلب' },
  ];
  return <aside className="store-cart-journey"><header><strong><StoreCopy value={{ en: 'CHECKOUT', ar: 'الدفع' }} /></strong><small><StoreCopy value={{ en: 'Secure 5-step flow', ar: 'مسار آمن من 5 خطوات' }} /></small></header>{steps.map((item) => <div key={item.id}><b>{item.id}</b><span><strong>{item.en}</strong><small>{item.ar}</small></span></div>)}<Link to="/store/checkout" className="store-button store-button-primary"><StoreCopy value={{ en: 'PROCEED TO CHECKOUT', ar: 'المتابعة للدفع' }} inline /></Link></aside>;
}

export function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  return <div className="store-cart-page"><div className="store-page-heading"><span>YOUR SELECTION</span><h1><StoreCopy value={{ en: 'Your Cart', ar: 'سلة التسوق' }} /></h1></div>{cart.length ? <div className="store-cart-layout store-reference-cart-layout"><section className="store-cart-list">{cart.map((line) => <article key={cartLineKey(line)}><div className="store-cart-image"><ProductMedia product={line.product} source={line.product.variantMedia?.find((item) => item.color === line.color)?.image ?? line.product.image} /></div><div className="store-cart-copy"><StoreCopy value={line.product.type} className="store-product-type" inline /><h2><Link to={`/store/product/${line.product.slug}`}><StoreCopy value={line.product.name} /></Link></h2>{line.size && <small><StoreCopy value={{ en: 'Size', ar: 'المقاس' }} inline />: {line.size}</small>}{line.color && <small><StoreCopy value={{ en: 'Color', ar: 'اللون' }} inline />: {line.color}</small>}<ProductPrice product={line.product} /></div><QuantityStepper value={line.quantity} onChange={(quantity) => updateQuantity(cartLineKey(line), quantity)} /><button type="button" className="store-remove" onClick={() => removeFromCart(cartLineKey(line))}><Trash2 /><StoreCopy value={{ en: 'Remove', ar: 'إزالة' }} inline /></button></article>)}</section><CartSummary /><CartJourneyPanel /></div> : <StoreState kind="empty" title={{ en: 'Your cart is empty', ar: 'سلتك فارغة' }} description={{ en: 'Your selected products will appear here.', ar: 'ستظهر المنتجات التي تختارها هنا.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} />}</div>;
}

const checkoutSteps = [
  { id: 1, icon: UserRound, value: { en: 'Contact', ar: 'التواصل' } },
  { id: 2, icon: MapPin, value: { en: 'Delivery Address', ar: 'عنوان التوصيل' } },
  { id: 3, icon: Truck, value: { en: 'Delivery Method', ar: 'طريقة التوصيل' } },
  { id: 4, icon: CreditCard, value: { en: 'Payment Method', ar: 'طريقة الدفع' } },
  { id: 5, icon: CheckCircle2, value: { en: 'Review & Pay', ar: 'المراجعة والدفع' } },
];

type PaymentRuntimeState =
  | { status: 'loading' }
  | { status: 'ready'; publishableKey: string }
  | { status: 'unavailable'; reason?: string }
  | { status: 'error'; message: string };

type PreparedOrder = {
  orderId: string;
  orderNumber: string;
  totalMinor: number;
  currency: string;
};

type CheckoutState =
  | { status: 'idle' }
  | { status: 'preparing' }
  | { status: 'ready'; order: PreparedOrder; clientSecret: string; token: string; publishableKey: string }
  | { status: 'paid'; order: PreparedOrder }
  | { status: 'awaiting-webhook'; order: PreparedOrder }
  | { status: 'auth-required' }
  | { status: 'failed'; message: string };

function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `uos-checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutPage() {
  const { cart, clearCart, isPreview, locale } = useStore();
  const [step, setStep] = useState(1);
  const [checkout, setCheckout] = useState<CheckoutState>({ status: 'idle' });
  const [paymentRuntime, setPaymentRuntime] = useState<PaymentRuntimeState>({ status: 'loading' });
  const [formSnapshot, setFormSnapshot] = useState<Record<string, string>>({});
  const preparingRef = useRef(false);

  useEffect(() => {
    let active = true;
    if (isPreview) {
      setPaymentRuntime({ status: 'unavailable', reason: 'preview' });
      return () => { active = false; };
    }

    void fetch('/api/v1/payments/config')
      .then(async (response) => {
        const payload = await response.json().catch(() => null) as {
          payment?: { enabled?: boolean; publishableKey?: string; reason?: string };
        } | null;
        if (!active) return;
        if (response.ok && payload?.payment?.enabled && payload.payment.publishableKey) {
          setPaymentRuntime({ status: 'ready', publishableKey: payload.payment.publishableKey });
          return;
        }
        setPaymentRuntime({ status: 'unavailable', reason: payload?.payment?.reason });
      })
      .catch((error) => {
        if (!active) return;
        setPaymentRuntime({ status: 'error', message: error instanceof Error ? error.message : 'PAYMENT_CONFIG_FAILED' });
      });

    return () => { active = false; };
  }, [isPreview]);

  const checkoutOwnsOrder = checkout.status === 'ready' || checkout.status === 'paid' || checkout.status === 'awaiting-webhook';
  if (!cart.length && !checkoutOwnsOrder) {
    return <div className="store-page-pad"><StoreState kind="empty" title={{ en: 'Checkout needs cart items', ar: 'الدفع يحتاج إلى عناصر في السلة' }} description={{ en: 'Add a verified product before entering checkout.', ar: 'أضف منتجًا موثقًا قبل الانتقال إلى الدفع.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Open Shop', ar: 'فتح المتجر' }} inline /></Link>} /></div>;
  }

  const cancelPreparedOrder = async (token: string, orderId: string) => {
    try {
      await fetch('/api/v1/store/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      });
    } catch {
      // Cancellation is best-effort here; the server-side payment claim TTL remains the final safety net.
    }
  };

  const prepareSecurePayment = async (snapshot: Record<string, string>) => {
    if (preparingRef.current) return;
    if (paymentRuntime.status !== 'ready') {
      setCheckout({ status: 'failed', message: 'PAYMENT_PROVIDER_NOT_READY' });
      return;
    }

    preparingRef.current = true;
    setCheckout({ status: 'preparing' });
    let token = '';
    let preparedOrder: PreparedOrder | null = null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      token = sessionData.session?.access_token ?? '';
      if (!token) {
        setCheckout({ status: 'auth-required' });
        return;
      }

      const orderResponse = await fetch('/api/v1/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
          shippingAddress: {
            email: snapshot.email,
            phone: snapshot.phone,
            fullName: snapshot.fullName,
            country: snapshot.country,
            emirate: snapshot.emirate,
            city: snapshot.city,
            area: snapshot.area,
            street: snapshot.street,
            building: snapshot.building,
            apartment: snapshot.apartment,
            instructions: snapshot.instructions,
          },
        }),
      });
      const orderPayload = await orderResponse.json().catch(() => null) as {
        ok?: boolean;
        order?: { orderId?: string; orderNumber?: string; totalMinor?: number; currency?: string };
        error?: { message?: string };
      } | null;
      if (
        !orderResponse.ok
        || !orderPayload?.ok
        || !orderPayload.order?.orderId
        || !orderPayload.order.orderNumber
        || typeof orderPayload.order.totalMinor !== 'number'
        || !orderPayload.order.currency
      ) {
        throw new Error(orderPayload?.error?.message || `CHECKOUT_HTTP_${orderResponse.status}`);
      }

      preparedOrder = {
        orderId: orderPayload.order.orderId,
        orderNumber: orderPayload.order.orderNumber,
        totalMinor: orderPayload.order.totalMinor,
        currency: orderPayload.order.currency,
      };

      const intentResponse = await fetch('/api/v1/payments/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          charge: true,
          orderId: preparedOrder.orderId,
          idempotencyKey: newIdempotencyKey(),
        }),
      });
      const intentPayload = await intentResponse.json().catch(() => null) as {
        ok?: boolean;
        intent?: { clientSecret?: string; status?: string };
        error?: { message?: string };
      } | null;
      if (!intentResponse.ok || !intentPayload?.ok || !intentPayload.intent?.clientSecret) {
        throw new Error(intentPayload?.error?.message || `PAYMENT_INTENT_HTTP_${intentResponse.status}`);
      }

      setCheckout({
        status: 'ready',
        order: preparedOrder,
        clientSecret: intentPayload.intent.clientSecret,
        token,
        publishableKey: paymentRuntime.publishableKey,
      });
    } catch (error) {
      if (preparedOrder && token) await cancelPreparedOrder(token, preparedOrder.orderId);
      setCheckout({ status: 'failed', message: error instanceof Error ? error.message : 'CHECKOUT_PAYMENT_SETUP_FAILED' });
    } finally {
      preparingRef.current = false;
    }
  };

  const next = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkout.status === 'preparing' || checkout.status === 'ready' || checkout.status === 'paid' || checkout.status === 'awaiting-webhook') return;

    const data = new FormData(event.currentTarget);
    const snapshot: Record<string, string> = { ...formSnapshot };
    data.forEach((value, key) => { snapshot[key] = String(value); });
    setFormSnapshot(snapshot);

    if (step < 5) {
      if (step === 4 && paymentRuntime.status !== 'ready') return;
      setStep(step + 1);
      return;
    }

    void prepareSecurePayment(snapshot);
  };

  const paymentStep = step === 4 && (
    paymentRuntime.status === 'loading'
      ? <StoreState kind="loading" title={{ en: 'Checking secure payment', ar: 'جارٍ التحقق من الدفع الآمن' }} description={{ en: 'Verifying the payment provider configuration before an order can be reserved.', ar: 'جارٍ التحقق من إعداد موفر الدفع قبل حجز أي طلب.' }} />
      : paymentRuntime.status === 'ready'
        ? <section className="store-payment-readiness"><CreditCard aria-hidden="true" /><div><strong><StoreCopy value={{ en: 'Secure card payment is ready', ar: 'الدفع الآمن بالبطاقة جاهز' }} /></strong><p><StoreCopy value={{ en: 'Your order is created only after review. Card details are collected by Stripe, not by this website.', ar: 'يتم إنشاء الطلب بعد المراجعة فقط، وتُجمع بيانات البطاقة بواسطة Stripe وليس بواسطة هذا الموقع.' }} /></p></div><ShieldCheck aria-hidden="true" /></section>
        : paymentRuntime.status === 'error'
          ? <StoreState kind="error" title={{ en: 'Payment readiness check failed', ar: 'تعذر التحقق من جاهزية الدفع' }} description={{ en: 'No order or payment was created. Refresh and retry after the payment service is reachable.', ar: 'لم يتم إنشاء طلب أو دفع. أعد المحاولة بعد توفر خدمة الدفع.' }} />
          : <StoreState kind="unavailable" title={isPreview ? { en: 'Payment is disabled in Preview', ar: 'الدفع معطل في وضع المعاينة' } : { en: 'Payment activation required', ar: 'يلزم تفعيل الدفع' }} description={isPreview ? { en: 'Preview products never create real orders or charges.', ar: 'منتجات المعاينة لا تنشئ طلبات أو عمليات تحصيل حقيقية.' } : { en: 'Stripe must have a server secret, signed-webhook secret and publishable key before checkout can reserve an order.', ar: 'يجب إعداد مفتاح Stripe السري ومفتاح توقيع الـWebhook والمفتاح العام قبل أن يقوم الدفع بحجز الطلب.' }} />
  );

  const reviewStep = step === 5 && (
    <div className="store-review">
      {checkout.status === 'idle' || checkout.status === 'failed' || checkout.status === 'auth-required' ? <>
        <section className="store-review-truth"><ShieldCheck aria-hidden="true" /><div><strong><StoreCopy value={{ en: 'Server-authoritative order total', ar: 'إجمالي الطلب معتمد من الخادم' }} /></strong><p><StoreCopy value={{ en: 'The server revalidates catalog price and inventory before it creates the pending order. The browser cannot override the payable amount.', ar: 'يعيد الخادم التحقق من السعر والمخزون قبل إنشاء الطلب المعلق، ولا يستطيع المتصفح تغيير مبلغ الدفع.' }} /></p></div></section>
        {cart.map((line) => <div key={cartLineKey(line)}><ShoppingBag /><StoreCopy value={line.product.name} /><span>× {line.quantity}</span><ProductPrice product={line.product} size="s" /></div>)}
      </> : null}

      {checkout.status === 'preparing' && <StoreState kind="loading" title={{ en: 'Preparing secure payment', ar: 'جارٍ تجهيز الدفع الآمن' }} description={{ en: 'Creating the pending order and a server-authoritative Stripe PaymentIntent.', ar: 'جارٍ إنشاء الطلب المعلق وStripe PaymentIntent بمبلغ معتمد من الخادم.' }} />}

      {checkout.status === 'ready' && <StripePaymentElement
        publishableKey={checkout.publishableKey}
        clientSecret={checkout.clientSecret}
        orderId={checkout.order.orderId}
        orderNumber={checkout.order.orderNumber}
        token={checkout.token}
        locale={locale}
        onProviderAccepted={() => undefined}
        onPaid={() => {
          clearCart();
          setCheckout({ status: 'paid', order: checkout.order });
        }}
        onAwaitingWebhook={() => {
          clearCart();
          setCheckout({ status: 'awaiting-webhook', order: checkout.order });
        }}
      />}

      {checkout.status === 'paid' && <div className="store-inline-success" role="status"><CheckCircle2 /><StoreCopy value={{ en: `Payment confirmed · ${checkout.order.orderNumber}. The signed webhook reconciled the order to paid.`, ar: `تم تأكيد الدفع · ${checkout.order.orderNumber}. قام الـWebhook الموقّع بتحويل الطلب إلى مدفوع.` }} inline /><Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'View orders', ar: 'عرض الطلبات' }} inline /></Link></div>}

      {checkout.status === 'awaiting-webhook' && <div className="store-payment-awaiting" role="status"><ShieldCheck /><div><strong><StoreCopy value={{ en: 'Payment accepted by provider', ar: 'تم قبول الدفع لدى مزود الخدمة' }} /></strong><p><StoreCopy value={{ en: `Order ${checkout.order.orderNumber} is awaiting signed webhook reconciliation. Do not submit another payment.`, ar: `الطلب ${checkout.order.orderNumber} بانتظار مطابقة الـWebhook الموقّع. لا ترسل عملية دفع أخرى.` }} /></p><Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'Open my orders', ar: 'فتح طلباتي' }} inline /></Link></div></div>}

      {checkout.status === 'auth-required' && <div className="store-inline-error" role="alert"><X /><StoreCopy value={{ en: 'Sign in to your store account before a pending order can be created.', ar: 'سجل الدخول إلى حساب المتجر قبل إنشاء طلب معلق.' }} inline /><Link className="store-button store-button-secondary" to="/store/login"><StoreCopy value={{ en: 'Sign in', ar: 'تسجيل الدخول' }} inline /></Link></div>}

      {checkout.status === 'failed' && <div className="store-inline-error" role="alert"><X /><StoreCopy value={{ en: `Secure payment setup failed (${checkout.message}). Any newly prepared order was cancelled when possible; no successful charge was declared.`, ar: `تعذر تجهيز الدفع الآمن (${checkout.message}). تم إلغاء أي طلب جديد عند الإمكان ولم يتم إعلان أي تحصيل ناجح.` }} inline /></div>}
    </div>
  );

  const canContinue = step !== 4 || paymentRuntime.status === 'ready';
  const showFormActions = checkout.status !== 'ready' && checkout.status !== 'paid' && checkout.status !== 'awaiting-webhook';

  return <div className="store-checkout-page">
    <div className="store-page-heading"><span>{isPreview ? 'CHECKOUT PREVIEW' : 'SECURE CHECKOUT'}</span><h1><StoreCopy value={{ en: 'Checkout', ar: 'إتمام الطلب' }} /></h1></div>
    <div className="store-checkout-stepper">{checkoutSteps.map(({ id, icon: Icon, value }) => <button type="button" key={id} className={`${step === id ? 'is-active' : ''} ${step > id ? 'is-complete' : ''}`} onClick={() => id <= step && checkout.status !== 'ready' && setStep(id)}><span>{step > id ? <CheckCircle2 /> : <Icon />}</span><i>{id}</i><StoreCopy value={value} /></button>)}</div>
    <div className="store-checkout-layout">
      <form className="store-checkout-form" onSubmit={next}>
        <header><span>0{step}</span><h2><StoreCopy value={checkoutSteps[step - 1].value} /></h2></header>
        {step === 1 && <div className="store-form-grid"><label><StoreCopy value={{ en: 'Email', ar: 'البريد الإلكتروني' }} inline /><input name="email" type="email" autoComplete="email" required placeholder="name@example.com" defaultValue={formSnapshot.email ?? ''} /></label><label><StoreCopy value={{ en: 'Phone', ar: 'رقم الهاتف' }} inline /><input name="phone" type="tel" autoComplete="tel" required placeholder="+971" defaultValue={formSnapshot.phone ?? ''} /></label></div>}
        {step === 2 && <div className="store-form-grid"><label className="wide"><StoreCopy value={{ en: 'Full Name', ar: 'الاسم الكامل' }} inline /><input name="fullName" autoComplete="name" required defaultValue={formSnapshot.fullName ?? ''} /></label><label><StoreCopy value={{ en: 'Country', ar: 'الدولة' }} inline /><select name="country" required defaultValue="AE"><option value="AE">United Arab Emirates | الإمارات</option></select></label><label><StoreCopy value={{ en: 'Emirate', ar: 'الإمارة' }} inline /><select name="emirate" required defaultValue={formSnapshot.emirate ?? ''}><option value="" disabled>Select | اختر</option><option>Abu Dhabi | أبوظبي</option><option>Dubai | دبي</option><option>Sharjah | الشارقة</option><option>Ajman | عجمان</option><option>Umm Al Quwain | أم القيوين</option><option>Ras Al Khaimah | رأس الخيمة</option><option>Fujairah | الفجيرة</option></select></label><label><StoreCopy value={{ en: 'City', ar: 'المدينة' }} inline /><input name="city" required defaultValue={formSnapshot.city ?? ''} /></label><label><StoreCopy value={{ en: 'Area', ar: 'المنطقة' }} inline /><input name="area" required defaultValue={formSnapshot.area ?? ''} /></label><label className="wide"><StoreCopy value={{ en: 'Street', ar: 'الشارع' }} inline /><input name="street" required defaultValue={formSnapshot.street ?? ''} /></label><label><StoreCopy value={{ en: 'Building', ar: 'المبنى' }} inline /><input name="building" required defaultValue={formSnapshot.building ?? ''} /></label><label><StoreCopy value={{ en: 'Apartment / Villa', ar: 'شقة / فيلا' }} inline /><input name="apartment" defaultValue={formSnapshot.apartment ?? ''} /></label><label className="wide"><StoreCopy value={{ en: 'Additional Instructions', ar: 'تعليمات إضافية' }} inline /><textarea name="instructions" rows={3} defaultValue={formSnapshot.instructions ?? ''} /></label></div>}
        {step === 3 && <DeliverySlotSelector />}
        {paymentStep}
        {reviewStep}
        {showFormActions && <footer>
          {step > 1 && checkout.status !== 'preparing' && <button type="button" className="store-button store-button-secondary" onClick={() => setStep(step - 1)}><StoreCopy value={{ en: 'Back', ar: 'السابق' }} inline /></button>}
          <button type="submit" className="store-button store-button-primary" disabled={!canContinue || checkout.status === 'preparing' || checkout.status === 'auth-required'}>
            {step === 5
              ? <StoreCopy value={{ en: checkout.status === 'preparing' ? 'Preparing secure payment…' : 'Create order & continue to payment', ar: checkout.status === 'preparing' ? 'جارٍ تجهيز الدفع الآمن…' : 'أنشئ الطلب وتابع للدفع' }} inline />
              : <StoreCopy value={{ en: 'Continue', ar: 'متابعة' }} inline />}
            <DirectionArrow />
          </button>
        </footer>}
      </form>
      {checkout.status === 'paid' || checkout.status === 'awaiting-webhook'
        ? <aside className="store-cart-summary store-confirmed-order-summary"><h2><StoreCopy value={{ en: 'Order Status', ar: 'حالة الطلب' }} /></h2><dl><div><dt><StoreCopy value={{ en: 'Order', ar: 'الطلب' }} inline /></dt><dd>{checkout.order.orderNumber}</dd></div><div><dt><StoreCopy value={{ en: 'Payment', ar: 'الدفع' }} inline /></dt><dd><StoreCopy value={checkout.status === 'paid' ? { en: 'Paid', ar: 'مدفوع' } : { en: 'Provider accepted · reconciling', ar: 'مقبول لدى المزود · جارٍ المطابقة' }} inline /></dd></div></dl><p><ShieldCheck /><StoreCopy value={{ en: 'The cart was cleared after provider acceptance to prevent duplicate checkout.', ar: 'تم تفريغ السلة بعد قبول مزود الدفع لمنع تكرار عملية الشراء.' }} /></p></aside>
        : <CartSummary checkout />}
    </div>
  </div>;
}

export function OrderSuccessPage() {
  return <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'No completed order operation', ar: 'لا توجد عملية طلب مكتملة' }} description={{ en: 'Success is shown only after a genuine payment and order response.', ar: 'تظهر حالة النجاح فقط بعد استجابة دفع وطلب حقيقية.' }} action={<Link className="store-button store-button-primary" to="/store"><StoreCopy value={{ en: 'Store Home', ar: 'رئيسية المتجر' }} inline /></Link>} /></div>;
}
