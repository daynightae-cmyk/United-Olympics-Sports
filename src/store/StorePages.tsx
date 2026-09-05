import { DeliverySlotSelector, OrderTracker, PromoCodeField, RewardTierCard } from './components/commerce/CommerceServices';
import { cartLineKey } from './storeUtils';
import { useStoreDialog } from './components/useStoreDialog';
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Edit3,
  Grid2X2,
  Heart,
  List,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode, type RefObject } from 'react';
import { Link, NavLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from './StoreContext';
import {
  CategoryRail,
  DirectionArrow,
  ProductCard,
  ProductGrid,
  ProductMedia,
  ProductPrice,
  QuantityStepper,
  StoreCopy,
  StoreState,
} from './StoreComponents';
import type { StoreCategorySlug, StoreProduct } from './storeTypes';

function SectionHeading({ eyebrow, title, action }: { eyebrow: { en: string; ar: string }; title: { en: string; ar: string }; action?: ReactNode }) {
  return <header className="store-section-heading"><div><span><StoreCopy value={eyebrow} inline /></span><h2><StoreCopy value={title} /></h2></div>{action}</header>;
}

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
  const selectCategory = (category: string) => { if (fixedCategory) { navigate(category ? `/store/category/${category}` : '/store/shop'); return; } const next = new URLSearchParams(params); category ? next.set('category', category) : next.delete('category'); setParams(next); };
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
  const { categories, products, locale, isPreview } = useStore();
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

export function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  return <div className="store-cart-page"><div className="store-page-heading"><span>YOUR SELECTION</span><h1><StoreCopy value={{ en: 'Your Cart', ar: 'سلة التسوق' }} /></h1></div>{cart.length ? <div className="store-cart-layout"><section className="store-cart-list">{cart.map((line) => <article key={cartLineKey(line)}><div className="store-cart-image"><ProductMedia product={line.product} source={line.product.variantMedia?.find((item) => item.color === line.color)?.image ?? line.product.image} /></div><div className="store-cart-copy"><StoreCopy value={line.product.type} className="store-product-type" inline /><h2><Link to={`/store/product/${line.product.slug}`}><StoreCopy value={line.product.name} /></Link></h2>{line.size && <small><StoreCopy value={{ en: 'Size', ar: 'المقاس' }} inline />: {line.size}</small>}{line.color && <small><StoreCopy value={{ en: 'Color', ar: 'اللون' }} inline />: {line.color}</small>}<ProductPrice product={line.product} /></div><QuantityStepper value={line.quantity} onChange={(quantity) => updateQuantity(cartLineKey(line), quantity)} /><button type="button" className="store-remove" onClick={() => removeFromCart(cartLineKey(line))}><Trash2 /><StoreCopy value={{ en: 'Remove', ar: 'إزالة' }} inline /></button></article>)}</section><CartSummary /></div> : <StoreState kind="empty" title={{ en: 'Your cart is empty', ar: 'سلتك فارغة' }} description={{ en: 'Your selected products will appear here.', ar: 'ستظهر المنتجات التي تختارها هنا.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} />}</div>;
}

const checkoutSteps = [
  { id: 1, icon: UserRound, value: { en: 'Contact', ar: 'التواصل' } },
  { id: 2, icon: MapPin, value: { en: 'Delivery Address', ar: 'عنوان التوصيل' } },
  { id: 3, icon: Truck, value: { en: 'Delivery Method', ar: 'طريقة التوصيل' } },
  { id: 4, icon: CreditCard, value: { en: 'Payment Method', ar: 'طريقة الدفع' } },
  { id: 5, icon: CheckCircle2, value: { en: 'Order Review', ar: 'مراجعة الطلب' } },
];

export function CheckoutPage() {
  const { cart } = useStore();
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState(false);
  if (!cart.length) return <div className="store-page-pad"><StoreState kind="empty" title={{ en: 'Checkout needs cart items', ar: 'الدفع يحتاج إلى عناصر في السلة' }} description={{ en: 'Add a verified product before entering checkout.', ar: 'أضف منتجًا موثقًا قبل الانتقال إلى الدفع.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Open Shop', ar: 'فتح المتجر' }} inline /></Link>} /></div>;
  const next = (event: FormEvent) => { event.preventDefault(); if (step < 5) { setStep(step + 1); setNotice(false); } else setNotice(true); };
  return <div className="store-checkout-page"><div className="store-page-heading"><span>CHECKOUT PREVIEW</span><h1><StoreCopy value={{ en: 'Checkout', ar: 'إتمام الطلب' }} /></h1></div><div className="store-checkout-stepper">{checkoutSteps.map(({ id, icon: Icon, value }) => <button type="button" key={id} className={`${step === id ? 'is-active' : ''} ${step > id ? 'is-complete' : ''}`} onClick={() => id <= step && setStep(id)}><span>{step > id ? <CheckCircle2 /> : <Icon />}</span><i>{id}</i><StoreCopy value={value} /></button>)}</div><div className="store-checkout-layout"><form className="store-checkout-form" onSubmit={next}><header><span>0{step}</span><h2><StoreCopy value={checkoutSteps[step - 1].value} /></h2></header>{step === 1 && <div className="store-form-grid"><label><StoreCopy value={{ en: 'Email', ar: 'البريد الإلكتروني' }} inline /><input type="email" autoComplete="email" required placeholder="name@example.com" /></label><label><StoreCopy value={{ en: 'Phone', ar: 'رقم الهاتف' }} inline /><input type="tel" autoComplete="tel" required placeholder="+971" /></label></div>}{step === 2 && <div className="store-form-grid"><label className="wide"><StoreCopy value={{ en: 'Full Name', ar: 'الاسم الكامل' }} inline /><input autoComplete="name" required /></label><label><StoreCopy value={{ en: 'Country', ar: 'الدولة' }} inline /><select required defaultValue="AE"><option value="AE">United Arab Emirates | الإمارات</option></select></label><label><StoreCopy value={{ en: 'Emirate', ar: 'الإمارة' }} inline /><select required defaultValue=""><option value="" disabled>Select | اختر</option><option>Abu Dhabi | أبوظبي</option><option>Dubai | دبي</option><option>Sharjah | الشارقة</option><option>Ajman | عجمان</option><option>Umm Al Quwain | أم القيوين</option><option>Ras Al Khaimah | رأس الخيمة</option><option>Fujairah | الفجيرة</option></select></label><label><StoreCopy value={{ en: 'City', ar: 'المدينة' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Area', ar: 'المنطقة' }} inline /><input required /></label><label className="wide"><StoreCopy value={{ en: 'Street', ar: 'الشارع' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Building', ar: 'المبنى' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Apartment / Villa', ar: 'شقة / فيلا' }} inline /><input /></label><label className="wide"><StoreCopy value={{ en: 'Additional Instructions', ar: 'تعليمات إضافية' }} inline /><textarea rows={3} /></label></div>}{step === 3 && <DeliverySlotSelector />}{step === 3 && <StoreState kind="unavailable" title={{ en: 'Delivery methods not configured', ar: 'طرق التوصيل غير مهيأة' }} description={{ en: 'A production shipping configuration is required before delivery selection can be completed.', ar: 'يلزم إعداد شحن إنتاجي قبل إكمال اختيار طريقة التوصيل.' }} />}{step === 4 && <StoreState kind="unavailable" title={{ en: 'Payment provider not configured', ar: 'موفر الدفع غير مهيأ' }} description={{ en: 'No payment option is rendered until a verified provider is connected. Raw card data is never stored here.', ar: 'لن يظهر خيار دفع حتى يتم ربط موفر موثق، ولا تُخزن بيانات البطاقة الخام هنا.' }} />}{step === 5 && <div className="store-review"><StoreState kind="unavailable" title={{ en: 'Order submission unavailable', ar: 'إرسال الطلب غير متاح' }} description={{ en: 'Address, shipping, tax and payment configuration must be verified before a real order can be submitted.', ar: 'يجب التحقق من العنوان والشحن والضريبة والدفع قبل إرسال طلب حقيقي.' }} />{cart.map((line) => <div key={cartLineKey(line)}><ShoppingBag /><StoreCopy value={line.product.name} /><span>× {line.quantity}</span><ProductPrice product={line.product} size="s" /></div>)}</div>}{notice && <div className="store-inline-error" role="alert"><X /><StoreCopy value={{ en: 'Order was not submitted. Production checkout is not configured.', ar: 'لم يتم إرسال الطلب. الدفع الإنتاجي غير مهيأ.' }} inline /></div>}<footer>{step > 1 && <button type="button" className="store-button store-button-secondary" onClick={() => setStep(step - 1)}><StoreCopy value={{ en: 'Back', ar: 'السابق' }} inline /></button>}<button type="submit" className="store-button store-button-primary">{step === 5 ? <StoreCopy value={{ en: 'Place Order', ar: 'تأكيد الطلب' }} inline /> : <StoreCopy value={{ en: 'Continue', ar: 'متابعة' }} inline />}<DirectionArrow /></button></footer></form><CartSummary checkout /></div></div>;
}

const accountNav = [
  { to: '/store/account', end: true, icon: UserRound, value: { en: 'Profile', ar: 'الملف الشخصي' } },
  { to: '/store/orders', icon: Package, value: { en: 'My Orders', ar: 'طلباتي' } },
  { to: '/store/wishlist', icon: Heart, value: { en: 'Wishlist', ar: 'المفضلة' } },
  { to: '/store/addresses', icon: MapPin, value: { en: 'Addresses', ar: 'العناوين' } },
  { to: '/store/payment-methods', icon: WalletCards, value: { en: 'Payment Methods', ar: 'طرق الدفع' } },
  { to: '/store/notifications', icon: Bell, value: { en: 'Notifications', ar: 'الإشعارات' } },
  { to: '/store/settings', icon: Settings, value: { en: 'Settings', ar: 'الإعدادات' } },
];

function AccountShell({ title, children }: { title: { en: string; ar: string }; children: ReactNode }) {
  return <div className="store-account-page"><aside className="store-account-sidebar"><div><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><h2><StoreCopy value={{ en: 'My Account', ar: 'حسابي' }} /></h2></div><nav>{accountNav.map(({ to, end, icon: Icon, value }) => <NavLink key={to} to={to} end={end}><Icon /><StoreCopy value={value} /></NavLink>)}<button type="button" disabled title="Authentication not connected | المصادقة غير متصلة"><LogOut /><StoreCopy value={{ en: 'Logout', ar: 'تسجيل الخروج' }} /></button></nav><section><ShieldCheck /><h3><StoreCopy value={{ en: 'Need assistance?', ar: 'تحتاج إلى مساعدة؟' }} /></h3><p><StoreCopy value={{ en: 'Use the official contact route for verified support details.', ar: 'استخدم صفحة التواصل الرسمية للحصول على بيانات الدعم الموثقة.' }} /></p><Link to="/contact"><StoreCopy value={{ en: 'Contact', ar: 'تواصل' }} inline /></Link></section></aside><main className="store-account-content"><div className="store-page-heading"><span>ACCOUNT</span><h1><StoreCopy value={title} /></h1></div>{children}</main></div>;
}

export function AccountPage() {
  return <AccountShell title={{ en: 'Profile', ar: 'الملف الشخصي' }}><RewardTierCard /><div className="store-profile-card"><span><UserRound /></span><div><h2><StoreCopy value={{ en: 'Customer profile not connected', ar: 'ملف العميل غير متصل' }} /></h2><p><StoreCopy value={{ en: 'Name, email and phone will appear only after production authentication is connected.', ar: 'سيظهر الاسم والبريد والهاتف فقط بعد ربط المصادقة الإنتاجية.' }} /></p></div><button type="button" disabled><Edit3 /><StoreCopy value={{ en: 'Edit Profile', ar: 'تعديل الملف' }} inline /></button></div><StoreState kind="empty" title={{ en: 'No verified profile data', ar: 'لا توجد بيانات ملف موثقة' }} description={{ en: 'No personal information has been fabricated for this preview.', ar: 'لم يتم اختلاق أي معلومات شخصية لهذه المعاينة.' }} /></AccountShell>;
}

export function OrdersPage() {
  const [status, setStatus] = useState('all');
  const tabs = [['all', 'All', 'الكل'], ['processing', 'Processing', 'قيد المعالجة'], ['shipped', 'Shipped', 'تم الشحن'], ['delivered', 'Delivered', 'تم التسليم'], ['cancelled', 'Cancelled', 'ملغي']];
  return <AccountShell title={{ en: 'My Orders', ar: 'طلباتي' }}><div className="store-order-tabs" role="tablist">{tabs.map(([id, en, ar]) => <button type="button" role="tab" aria-selected={status === id} className={status === id ? 'is-active' : ''} onClick={() => setStatus(id)} key={id}>{en} <small>{ar}</small></button>)}</div><StoreState kind="empty" title={{ en: `No verified ${status === 'all' ? '' : `${status} `}orders`, ar: 'لا توجد طلبات موثقة' }} description={{ en: 'Orders will appear after a real commerce and authentication source is connected.', ar: 'ستظهر الطلبات بعد ربط مصدر تجارة ومصادقة حقيقي.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} /></AccountShell>;
}

export function OrderDetailPage() {
  const { id } = useParams();
  return <AccountShell title={{ en: 'Order Details', ar: 'تفاصيل الطلب' }}><OrderTracker /><StoreState kind="unavailable" title={{ en: 'Order source unavailable', ar: 'مصدر الطلب غير متاح' }} description={{ en: `No verified order was found for reference ${id ?? '—'}. Timeline, payment and shipment actions remain disabled.`, ar: `لم يتم العثور على طلب موثق للمرجع ${id ?? '—'}. يظل الخط الزمني وإجراءات الدفع والشحن معطلة.` }} action={<Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'Back to Orders', ar: 'العودة للطلبات' }} inline /></Link>} /></AccountShell>;
}

export function WishlistPage() {
  const { products, wishlist } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));
  return <AccountShell title={{ en: 'Wishlist', ar: 'المفضلة' }}>{items.length ? <ProductGrid products={items} /> : <StoreState kind="empty" title={{ en: 'Your wishlist is empty', ar: 'قائمة المفضلة فارغة' }} description={{ en: 'Save products here while comparing your training essentials.', ar: 'احفظ المنتجات هنا أثناء مقارنة مستلزمات التدريب.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Explore Products', ar: 'استكشف المنتجات' }} inline /></Link>} />}</AccountShell>;
}

export function AddressesPage() {
  return <AccountShell title={{ en: 'Addresses', ar: 'العناوين' }}><StoreState kind="empty" title={{ en: 'No saved addresses', ar: 'لا توجد عناوين محفوظة' }} description={{ en: 'Saved addresses require an authenticated production account.', ar: 'تتطلب العناوين المحفوظة حساب إنتاج موثّق.' }} /><button type="button" className="store-button store-button-secondary" disabled><MapPin /><StoreCopy value={{ en: 'Add Address', ar: 'إضافة عنوان' }} inline /></button></AccountShell>;
}

export function PaymentMethodsPage() {
  return <AccountShell title={{ en: 'Payment Methods', ar: 'طرق الدفع' }}><StoreState kind="empty" title={{ en: 'No saved payment methods', ar: 'لا توجد طرق دفع محفوظة' }} description={{ en: 'A tokenized payment provider must be connected before saved methods can appear.', ar: 'يجب ربط موفر دفع يعتمد الرموز قبل ظهور طرق الدفع المحفوظة.' }} /><p className="store-security-note"><ShieldCheck /><StoreCopy value={{ en: 'Raw card numbers are never stored by this interface.', ar: 'لا تخزن هذه الواجهة أرقام البطاقات الخام مطلقًا.' }} inline /></p></AccountShell>;
}

export function NotificationsPage() {
  return <AccountShell title={{ en: 'Notifications', ar: 'الإشعارات' }}><StoreState kind="empty" title={{ en: 'No verified notifications', ar: 'لا توجد إشعارات موثقة' }} description={{ en: 'Order, delivery, store and system notifications will appear from the connected service.', ar: 'ستظهر إشعارات الطلب والتوصيل والمتجر والنظام من الخدمة المتصلة.' }} /></AccountShell>;
}

export function StoreSettingsPage() {
  const { locale, setLocale } = useStore();
  return <AccountShell title={{ en: 'Settings', ar: 'الإعدادات' }}><div className="store-settings-grid"><section><h2><StoreCopy value={{ en: 'Language', ar: 'اللغة' }} /></h2><div className="store-setting-choice"><button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => setLocale('en')}>English</button><button type="button" className={locale === 'ar' ? 'is-active' : ''} onClick={() => setLocale('ar')}>العربية</button></div></section><section><h2><StoreCopy value={{ en: 'Theme', ar: 'المظهر' }} /></h2><p><StoreCopy value={{ en: 'Use the theme control in the header to choose light, dark or system mode.', ar: 'استخدم أداة المظهر في رأس الصفحة لاختيار الفاتح أو الداكن أو النظام.' }} /></p></section><section><h2><StoreCopy value={{ en: 'Communication Preferences', ar: 'تفضيلات التواصل' }} /></h2><p><StoreCopy value={{ en: 'Requires an authenticated notification service.', ar: 'تتطلب خدمة إشعارات ومصادقة متصلة.' }} /></p></section><section><h2><StoreCopy value={{ en: 'Privacy & Account Controls', ar: 'الخصوصية والتحكم بالحساب' }} /></h2><p><StoreCopy value={{ en: 'Production account controls are not configured in this environment.', ar: 'عناصر التحكم بالحساب الإنتاجي غير مهيأة في هذه البيئة.' }} /></p></section></div></AccountShell>;
}

export function OrderSuccessPage() {
  return <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'No completed order operation', ar: 'لا توجد عملية طلب مكتملة' }} description={{ en: 'Success is shown only after a genuine payment and order response.', ar: 'تظهر حالة النجاح فقط بعد استجابة دفع وطلب حقيقية.' }} action={<Link className="store-button store-button-primary" to="/store"><StoreCopy value={{ en: 'Store Home', ar: 'رئيسية المتجر' }} inline /></Link>} /></div>;
}
