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

export function StoreHomePage() {
  const { categories, products, isPreview } = useStore();
  const swimming = products.filter((product) => product.category === 'swimming').slice(0, 4);
  const athlete = products.filter((product) => ['apparel', 'accessories'].includes(product.category)).slice(0, 4);
  return <>
    <section className="store-home-hero">
      <div className="store-home-primary"><img src="/media/sports/football/football-01-hero.webp" alt="Football athlete training | رياضي يتدرب على كرة القدم" /><div className="store-hero-shade" /><div className="store-hero-copy"><span>UNITED PERFORMANCE</span><h1><StoreCopy value={{ en: 'Elevate Your Game', ar: 'ارتقِ بمستوى أدائك' }} /></h1><p><StoreCopy value={{ en: 'A disciplined retail experience designed around every athlete’s journey.', ar: 'تجربة تسوق منضبطة مصممة حول رحلة كل رياضي.' }} /></p><Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Shop the Collection', ar: 'تسوق المجموعة' }} inline /><DirectionArrow /></Link></div></div>
      <div className="store-hero-secondary"><article><img src="/media/sports/swimming/swimming-02-performance.webp" alt="Swimming performance training | تدريب أداء السباحة" /><div><small>SWIMMING</small><h2><StoreCopy value={{ en: 'Technique in every detail', ar: 'تقنية في كل تفصيلة' }} /></h2><Link to="/store/category/swimming"><StoreCopy value={{ en: 'Explore', ar: 'استكشف' }} inline /><DirectionArrow /></Link></div></article><article className="store-campaign-dark"><img src="/brand/united-olympics-sports-logo.png" alt="" aria-hidden="true" /><div><small>UNITED ESSENTIALS</small><h2><StoreCopy value={{ en: 'Built to belong together', ar: 'مصممة لتتكامل معًا' }} /></h2><Link to="/store/categories"><StoreCopy value={{ en: 'All Categories', ar: 'كل الفئات' }} inline /><DirectionArrow /></Link></div></article></div>
    </section>
    <CategoryRail categories={categories} />
    {!isPreview && <div className="store-page-pad"><StoreState kind="empty" title={{ en: 'Production catalog not connected', ar: 'كتالوج الإنتاج غير متصل' }} description={{ en: 'Connect verified products, pricing and media to publish the store catalog.', ar: 'اربط المنتجات والأسعار والوسائط الموثقة لنشر كتالوج المتجر.' }} /></div>}
    {isPreview && <>
      <section className="store-editorial-grid store-section"><article className="store-editorial-light"><div><span>SWIMMING ESSENTIALS</span><h2><StoreCopy value={{ en: 'Control begins in training', ar: 'التحكم يبدأ من التدريب' }} /></h2><Link className="store-button store-button-secondary" to="/store/category/swimming"><StoreCopy value={{ en: 'Explore Swimming', ar: 'استكشف السباحة' }} inline /></Link></div><img src="/media/sports/swimming/swimming-08-underwater.webp" alt="Swimming underwater technique | تقنية السباحة تحت الماء" /></article><article className="store-editorial-dark"><img src="/media/sports/basketball/basketball-01-shooting-technique.webp" alt="Basketball shooting training | تدريب تصويب كرة السلة" /><div><span>TRAIN WITH PURPOSE</span><h2><StoreCopy value={{ en: 'Performance is practiced', ar: 'الأداء يُصنع بالتدريب' }} /></h2><Link to="/store/category/basketball"><StoreCopy value={{ en: 'Basketball', ar: 'كرة السلة' }} inline /><DirectionArrow /></Link></div></article><article className="store-quality-card"><ShieldCheck /><h2><StoreCopy value={{ en: 'Premium Quality Module', ar: 'وحدة الجودة المتميزة' }} /></h2><p><StoreCopy value={{ en: 'Architecture ready for verified material, care and origin data.', ar: 'بنية جاهزة لبيانات الخامة والعناية والمنشأ الموثقة.' }} /></p></article></section>
      <section className="store-section"><SectionHeading eyebrow={{ en: 'Curated Preview', ar: 'معاينة منتقاة' }} title={{ en: 'New Arrivals', ar: 'وصل حديثًا' }} action={<Link to="/store/shop"><StoreCopy value={{ en: 'View All', ar: 'عرض الكل' }} inline /><DirectionArrow /></Link>} /><ProductGrid products={products.slice(0, 4)} /></section>
      <section className="store-section store-section-tinted"><SectionHeading eyebrow={{ en: 'Water Performance', ar: 'أداء السباحة' }} title={{ en: 'Swimming Essentials', ar: 'مستلزمات السباحة' }} action={<Link to="/store/category/swimming"><StoreCopy value={{ en: 'View Collection', ar: 'عرض المجموعة' }} inline /><DirectionArrow /></Link>} /><ProductGrid products={swimming} /></section>
      <section className="store-section"><SectionHeading eyebrow={{ en: 'United Selection', ar: 'اختيارات يونايتد' }} title={{ en: 'Athlete Essentials', ar: 'مستلزمات الرياضيين' }} action={<Link to="/store/category/apparel"><StoreCopy value={{ en: 'View Apparel', ar: 'عرض الملابس' }} inline /><DirectionArrow /></Link>} /><ProductGrid products={athlete} /></section>
      <section className="store-merch-banner"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><div><span>OFFICIAL IDENTITY</span><h2><StoreCopy value={{ en: 'United Olympics Sports Merchandise', ar: 'منتجات يونايتد أوليمبيكس سبورت' }} /></h2><p><StoreCopy value={{ en: 'Awaiting verified merchandise photography and production inventory.', ar: 'بانتظار صور المنتجات الرسمية ومخزون الإنتاج الموثق.' }} /></p></div><Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Open Catalog', ar: 'فتح الكتالوج' }} inline /></Link></section>
    </>}
  </>;
}

function FilterPanel({ selected, onSelect, onClose, panelRef }: { selected: string; onSelect: (slug: string) => void; onClose?: () => void; panelRef?: RefObject<HTMLElement | null> }) {
  const { categories } = useStore();
  return <aside ref={panelRef} tabIndex={onClose ? -1 : undefined} className="store-filters"><header><h2><StoreCopy value={{ en: 'Filters', ar: 'تصفية' }} inline /></h2><div><button type="button" className="store-filter-clear" onClick={() => onSelect('')}><StoreCopy value={{ en: 'Clear All', ar: 'مسح الكل' }} inline /></button>{onClose && <button type="button" onClick={onClose} aria-label="Close filters | إغلاق التصفية"><X /></button>}</div></header><section><h3><StoreCopy value={{ en: 'Category', ar: 'الفئة' }} inline /></h3><label><input type="radio" name="category" checked={!selected} onChange={() => onSelect('')} /><span><StoreCopy value={{ en: 'All Categories', ar: 'كل الفئات' }} inline /></span></label>{categories.map((category) => <label key={category.slug}><input type="radio" name="category" checked={selected === category.slug} onChange={() => onSelect(category.slug)} /><span><StoreCopy value={category.name} inline /></span></label>)}</section><section><h3><StoreCopy value={{ en: 'Availability', ar: 'التوفر' }} inline /></h3><p><StoreCopy value={{ en: 'Awaiting production inventory source', ar: 'بانتظار مصدر مخزون الإنتاج' }} /></p></section><section><h3><StoreCopy value={{ en: 'Price', ar: 'السعر' }} inline /></h3><p><StoreCopy value={{ en: 'Uses configured catalog currency', ar: 'يستخدم عملة الكتالوج المهيأة' }} /></p></section>{onClose && <button type="button" className="store-button store-button-primary" onClick={onClose}><StoreCopy value={{ en: 'Apply Filters', ar: 'تطبيق التصفية' }} inline /></button>}</aside>;
}

export function CatalogPage({ categoriesOnly = false }: { categoriesOnly?: boolean }) {
  const { categories, products } = useStore();
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLElement>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const selected = params.get('category') ?? '';
  const filtered = useMemo(() => products.filter((product) => !selected || product.category === selected).sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : 0), [products, selected, sort]);
  const selectCategory = (category: string) => { const next = new URLSearchParams(params); category ? next.set('category', category) : next.delete('category'); setParams(next); };
  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => filterRef.current?.focus());
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setFiltersOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; filterTriggerRef.current?.focus(); };
  }, [filtersOpen]);
  return <div className="store-catalog-page">
    <div className="store-page-heading">
      <nav><Link to="/store">Home</Link><ChevronRight /><span>{categoriesOnly ? 'Categories' : 'Shop'}</span></nav>
      <span>UNITED COMMERCE</span>
      <h1><StoreCopy value={categoriesOnly ? { en: 'All Categories', ar: 'جميع الفئات' } : { en: 'Shop', ar: 'المتجر' }} /></h1>
      <p><StoreCopy value={{ en: 'A disciplined catalog architecture ready for verified products and inventory.', ar: 'بنية كتالوج منضبطة وجاهزة للمنتجات والمخزون الموثق.' }} /></p>
    </div>
    <CategoryRail categories={categories} active={selected} />
    <div className="store-catalog-toolbar">
      <div><strong>{filtered.length}</strong> <StoreCopy value={{ en: 'preview products', ar: 'منتجات معاينة' }} inline /></div>
      <button ref={filterTriggerRef} type="button" className="store-mobile-filter" onClick={() => setFiltersOpen(true)}><SlidersHorizontal /><StoreCopy value={{ en: 'Filters', ar: 'تصفية' }} inline /></button>
      <label><span className="sr-only">Sort | ترتيب</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured | مميز</option><option value="price-low">Price: Low | السعر: الأقل</option><option value="price-high">Price: High | السعر: الأعلى</option></select></label>
      <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')} aria-pressed={view === 'grid'} aria-label="Grid view | عرض شبكي"><Grid2X2 /></button>
      <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view | عرض قائمة"><List /></button>
    </div>
    <div className="store-catalog-layout"><FilterPanel selected={selected} onSelect={selectCategory} /><section><ProductGrid products={filtered} layout={view} /></section></div>
    {filtersOpen && <div className="store-filter-layer" role="dialog" aria-modal="true" aria-label="Product filters | تصفية المنتجات"><button className="store-drawer-backdrop" type="button" aria-label="Close filters | إغلاق التصفية" onClick={() => setFiltersOpen(false)} /><FilterPanel panelRef={filterRef} selected={selected} onSelect={selectCategory} onClose={() => setFiltersOpen(false)} /></div>}
  </div>;
}

export function CategoryPage() {
  const { slug } = useParams();
  const { categories, products } = useStore();
  const category = categories.find((item) => item.slug === slug);
  if (!category) return <div className="store-page-pad"><StoreState kind="empty" title={{ en: 'Category unavailable', ar: 'الفئة غير متاحة' }} description={{ en: 'This category is not present in the verified catalog.', ar: 'هذه الفئة غير موجودة في الكتالوج الموثق.' }} action={<Link className="store-button store-button-primary" to="/store/categories"><StoreCopy value={{ en: 'All Categories', ar: 'كل الفئات' }} inline /></Link>} /></div>;
  const categoryProducts = products.filter((product) => product.category === category.slug);
  return <div className="store-category-page"><section className="store-category-hero" style={{ '--sport-accent': category.accent } as React.CSSProperties}>{category.hero && <img src={category.hero} alt={`${category.name.en} | ${category.name.ar}`} />}<div className="store-category-hero-shade" /><div><span className="store-category-emblem" aria-hidden="true"><Package /></span><small>SPORT COLLECTION</small><h1><StoreCopy value={category.name} /></h1><p><StoreCopy value={category.description} /></p></div></section><CategoryRail categories={categories} active={category.slug} /><section className="store-section"><SectionHeading eyebrow={{ en: 'Preview Catalog', ar: 'كتالوج المعاينة' }} title={category.name} /><div className="store-catalog-layout"><FilterPanel selected={category.slug} onSelect={() => undefined} /><ProductGrid products={categoryProducts} /></div></section></div>;
}

export function SearchResultsPage() {
  const { products } = useStore();
  const [params] = useSearchParams();
  const query = params.get('q')?.trim() ?? '';
  const results = products.filter((product) => `${product.name.en} ${product.name.ar} ${product.type.en} ${product.type.ar}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="store-section store-search-page"><div className="store-page-heading"><span>SEARCH</span><h1><StoreCopy value={{ en: 'Search Results', ar: 'نتائج البحث' }} /></h1><p>{query ? <><StoreCopy value={{ en: 'Results for', ar: 'نتائج البحث عن' }} inline /> “{query}”</> : <StoreCopy value={{ en: 'Enter a term in the store search.', ar: 'أدخل عبارة في بحث المتجر.' }} />}</p></div>{query ? <ProductGrid products={results} /> : <StoreState kind="empty" title={{ en: 'Start your search', ar: 'ابدأ البحث' }} description={{ en: 'Search products, sports or categories from the header.', ar: 'ابحث عن المنتجات أو الرياضات أو الفئات من الشريط العلوي.' }} />}</section>;
}

export function ProductDetailPage() {
  const { slug } = useParams();
  const { products, addToCart, wishlist, toggleWishlist, setMiniCartOpen } = useStore();
  const navigate = useNavigate();
  const product = products.find((item) => item.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | undefined>();
  const [color, setColor] = useState<string | undefined>(product?.colors?.[0]?.en);
  const [tab, setTab] = useState('description');
  const [mediaIndex, setMediaIndex] = useState(0);
  if (!product) return <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'Product unavailable', ar: 'المنتج غير متاح' }} description={{ en: 'This product is not available from the current verified source.', ar: 'هذا المنتج غير متاح من المصدر الموثق الحالي.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Return to Shop', ar: 'العودة للمتجر' }} inline /></Link>} /></div>;
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const wished = wishlist.includes(product.id);
  const media = [product.image, ...(product.gallery ?? [])].filter((source): source is string => Boolean(source));
  const activeMedia = media[mediaIndex];
  const changeMedia = (offset: number) => setMediaIndex((current) => (current + offset + media.length) % media.length);
  return <div className="store-product-page">
    <nav className="store-breadcrumb"><Link to="/store">Home</Link><ChevronRight /><Link to={`/store/category/${product.category}`}>{product.category}</Link><ChevronRight /><span>{product.name.en}</span></nav>
    <section className="store-product-layout">
      <div className="store-product-gallery">
        <div className="store-thumbnails">
          {media.length ? media.map((source, index) => <button key={source} type="button" className={index === mediaIndex ? 'is-active' : ''} onClick={() => setMediaIndex(index)} aria-pressed={index === mediaIndex} aria-label={`Product media ${index + 1} | صورة المنتج ${index + 1}`}><img src={source} alt="" /></button>) : <button type="button" className="is-active" disabled aria-label="Product media pending | صورة المنتج معلقة"><ShoppingBag /></button>}
        </div>
        <ProductMedia product={product} hero source={activeMedia} />
        {media.length > 1 && <><button className="store-gallery-prev" type="button" onClick={() => changeMedia(-1)} aria-label="Previous image | الصورة السابقة">‹</button><button className="store-gallery-next" type="button" onClick={() => changeMedia(1)} aria-label="Next image | الصورة التالية">›</button></>}
      </div>
      <div className="store-product-info">
        <span className="store-product-eyebrow"><StoreCopy value={product.type} inline /></span>
        <h1><StoreCopy value={product.name} /></h1>
        <div className="store-sku"><span>SKU</span><code>{product.sku}</code></div>
        <ProductPrice product={product} size="l" />
        <div className="store-availability"><span /><StoreCopy value={{ en: 'Production availability pending', ar: 'حالة التوفر الإنتاجية معلقة' }} inline /></div>
        <p><StoreCopy value={product.description} /></p>
        {product.colors && <fieldset className="store-variants"><legend><StoreCopy value={{ en: 'Color', ar: 'اللون' }} inline /></legend><div>{product.colors.map((item) => <button type="button" key={item.en} className={color === item.en ? 'is-selected' : ''} onClick={() => setColor(item.en)} aria-pressed={color === item.en}><i /><StoreCopy value={item} inline /></button>)}</div></fieldset>}
        {product.sizes && <fieldset className="store-sizes"><legend><StoreCopy value={{ en: 'Size', ar: 'المقاس' }} inline /></legend><div>{product.sizes.map((item) => <button type="button" key={item} className={size === item ? 'is-selected' : ''} onClick={() => setSize(item)} aria-pressed={size === item}>{item}</button>)}</div></fieldset>}
        <div className="store-buy-row"><QuantityStepper value={quantity} onChange={setQuantity} /><button className="store-button store-button-primary" type="button" onClick={() => addToCart(product, { quantity, size, color })}><ShoppingBag /><StoreCopy value={{ en: 'Add to Cart', ar: 'أضف إلى السلة' }} inline /></button></div>
        <button className="store-button store-button-dark" type="button" onClick={() => { addToCart(product, { quantity, size, color }); setMiniCartOpen(false); navigate('/store/checkout'); }}><StoreCopy value={{ en: 'Buy Now', ar: 'اشترِ الآن' }} inline /></button>
        <button className={`store-button store-button-wishlist ${wished ? 'is-active' : ''}`} type="button" onClick={() => toggleWishlist(product.id)} aria-pressed={wished}><Heart /><StoreCopy value={wished ? { en: 'Saved to Wishlist', ar: 'محفوظ في المفضلة' } : { en: 'Add to Wishlist', ar: 'أضف إلى المفضلة' }} inline /></button>
        <div className="store-product-benefits"><span><ShieldCheck /><StoreCopy value={{ en: 'Verified details pending', ar: 'التفاصيل الموثقة معلقة' }} /></span><span><Truck /><StoreCopy value={{ en: 'Shipping configuration pending', ar: 'إعداد الشحن معلق' }} /></span></div>
      </div>
    </section>
    <section className="store-product-tabs">
      <div role="tablist">{[['description', 'Description', 'الوصف'], ['specifications', 'Specifications', 'المواصفات'], ['size', 'Size Guide', 'دليل المقاسات'], ['shipping', 'Shipping', 'الشحن'], ['returns', 'Returns', 'الإرجاع']].map(([id, en, ar]) => <button type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)} key={id}><StoreCopy value={{ en, ar }} inline /></button>)}</div>
      <article role="tabpanel"><h2><StoreCopy value={tab === 'description' ? { en: 'Product Description', ar: 'وصف المنتج' } : { en: 'Configuration Pending', ar: 'الإعدادات معلقة' }} /></h2><p><StoreCopy value={tab === 'description' ? product.description : { en: 'This information will appear only when a verified commerce source supplies it.', ar: 'ستظهر هذه المعلومات فقط عند توفيرها من مصدر تجارة موثق.' }} /></p></article>
    </section>
    <section className="store-section"><SectionHeading eyebrow={{ en: 'Continue Exploring', ar: 'واصل الاستكشاف' }} title={{ en: 'You May Also Like', ar: 'قد يعجبك أيضًا' }} /><ProductGrid products={related} /></section>
    <div className="store-mobile-buy"><ProductPrice product={product} /><button type="button" onClick={() => addToCart(product, { quantity, size, color })}><ShoppingBag /><StoreCopy value={{ en: 'Add to Cart', ar: 'أضف للسلة' }} inline /></button></div>
  </div>;
}

function CartSummary({ checkout = false }: { checkout?: boolean }) {
  const { cart, subtotal } = useStore();
  const currency = cart[0]?.product.currency ?? 'AED';
  const format = (value: number) => new Intl.NumberFormat('en-AE', { style: 'currency', currency }).format(value);
  return <aside className="store-cart-summary"><h2><StoreCopy value={{ en: 'Order Summary', ar: 'ملخص الطلب' }} /></h2><dl><div><dt><StoreCopy value={{ en: 'Subtotal', ar: 'المجموع الفرعي' }} inline /></dt><dd>{format(subtotal)}</dd></div><div><dt><StoreCopy value={{ en: 'Shipping', ar: 'الشحن' }} inline /></dt><dd><StoreCopy value={{ en: 'Not configured', ar: 'غير مهيأ' }} inline /></dd></div><div><dt><StoreCopy value={{ en: 'Tax', ar: 'الضريبة' }} inline /></dt><dd><StoreCopy value={{ en: 'Not configured', ar: 'غير مهيأ' }} inline /></dd></div></dl><div className="store-summary-total"><StoreCopy value={{ en: 'Current item total', ar: 'إجمالي العناصر الحالي' }} inline /><strong>{format(subtotal)}</strong></div><p><ShieldCheck /><StoreCopy value={{ en: 'No payment or order will be submitted without a configured production provider.', ar: 'لن يتم إرسال دفع أو طلب دون موفر إنتاج مهيأ.' }} /></p>{!checkout && <Link className="store-button store-button-primary" to="/store/checkout"><StoreCopy value={{ en: 'Proceed to Checkout', ar: 'المتابعة للدفع' }} inline /><DirectionArrow /></Link>}</aside>;
}

export function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  return <div className="store-cart-page"><div className="store-page-heading"><span>YOUR SELECTION</span><h1><StoreCopy value={{ en: 'Your Cart', ar: 'سلة التسوق' }} /></h1></div>{cart.length ? <div className="store-cart-layout"><section className="store-cart-list">{cart.map((line) => <article key={`${line.product.id}-${line.size ?? ''}`}><div className="store-cart-image"><ProductMedia product={line.product} /></div><div className="store-cart-copy"><StoreCopy value={line.product.type} className="store-product-type" inline /><h2><Link to={`/store/product/${line.product.slug}`}><StoreCopy value={line.product.name} /></Link></h2>{line.size && <small><StoreCopy value={{ en: 'Size', ar: 'المقاس' }} inline />: {line.size}</small>}{line.color && <small><StoreCopy value={{ en: 'Color', ar: 'اللون' }} inline />: {line.color}</small>}<ProductPrice product={line.product} /></div><QuantityStepper value={line.quantity} onChange={(quantity) => updateQuantity(line.product.id, quantity)} /><button type="button" className="store-remove" onClick={() => removeFromCart(line.product.id)}><Trash2 /><StoreCopy value={{ en: 'Remove', ar: 'إزالة' }} inline /></button></article>)}</section><CartSummary /></div> : <StoreState kind="empty" title={{ en: 'Your cart is empty', ar: 'سلتك فارغة' }} description={{ en: 'Your selected products will appear here.', ar: 'ستظهر المنتجات التي تختارها هنا.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} />}</div>;
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
  return <div className="store-checkout-page"><div className="store-page-heading"><span>SECURE FLOW ARCHITECTURE</span><h1><StoreCopy value={{ en: 'Checkout', ar: 'إتمام الطلب' }} /></h1></div><div className="store-checkout-stepper">{checkoutSteps.map(({ id, icon: Icon, value }) => <button type="button" key={id} className={`${step === id ? 'is-active' : ''} ${step > id ? 'is-complete' : ''}`} onClick={() => id <= step && setStep(id)}><span>{step > id ? <CheckCircle2 /> : <Icon />}</span><i>{id}</i><StoreCopy value={value} /></button>)}</div><div className="store-checkout-layout"><form className="store-checkout-form" onSubmit={next}><header><span>0{step}</span><h2><StoreCopy value={checkoutSteps[step - 1].value} /></h2></header>{step === 1 && <div className="store-form-grid"><label><StoreCopy value={{ en: 'Email', ar: 'البريد الإلكتروني' }} inline /><input type="email" autoComplete="email" required placeholder="name@example.com" /></label><label><StoreCopy value={{ en: 'Phone', ar: 'رقم الهاتف' }} inline /><input type="tel" autoComplete="tel" required placeholder="+971" /></label></div>}{step === 2 && <div className="store-form-grid"><label className="wide"><StoreCopy value={{ en: 'Full Name', ar: 'الاسم الكامل' }} inline /><input autoComplete="name" required /></label><label><StoreCopy value={{ en: 'Country', ar: 'الدولة' }} inline /><select required defaultValue="AE"><option value="AE">United Arab Emirates | الإمارات</option></select></label><label><StoreCopy value={{ en: 'Emirate', ar: 'الإمارة' }} inline /><select required defaultValue=""><option value="" disabled>Select | اختر</option><option>Abu Dhabi | أبوظبي</option><option>Dubai | دبي</option><option>Sharjah | الشارقة</option><option>Ajman | عجمان</option><option>Umm Al Quwain | أم القيوين</option><option>Ras Al Khaimah | رأس الخيمة</option><option>Fujairah | الفجيرة</option></select></label><label><StoreCopy value={{ en: 'City', ar: 'المدينة' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Area', ar: 'المنطقة' }} inline /><input required /></label><label className="wide"><StoreCopy value={{ en: 'Street', ar: 'الشارع' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Building', ar: 'المبنى' }} inline /><input required /></label><label><StoreCopy value={{ en: 'Apartment / Villa', ar: 'شقة / فيلا' }} inline /><input /></label><label className="wide"><StoreCopy value={{ en: 'Additional Instructions', ar: 'تعليمات إضافية' }} inline /><textarea rows={3} /></label></div>}{step === 3 && <StoreState kind="unavailable" title={{ en: 'Delivery methods not configured', ar: 'طرق التوصيل غير مهيأة' }} description={{ en: 'A production shipping configuration is required before delivery selection can be completed.', ar: 'يلزم إعداد شحن إنتاجي قبل إكمال اختيار طريقة التوصيل.' }} />}{step === 4 && <StoreState kind="unavailable" title={{ en: 'Payment provider not configured', ar: 'موفر الدفع غير مهيأ' }} description={{ en: 'No payment option is rendered until a verified provider is connected. Raw card data is never stored here.', ar: 'لن يظهر خيار دفع حتى يتم ربط موفر موثق، ولا تُخزن بيانات البطاقة الخام هنا.' }} />}{step === 5 && <div className="store-review"><StoreState kind="unavailable" title={{ en: 'Order submission unavailable', ar: 'إرسال الطلب غير متاح' }} description={{ en: 'Address, shipping, tax and payment configuration must be verified before a real order can be submitted.', ar: 'يجب التحقق من العنوان والشحن والضريبة والدفع قبل إرسال طلب حقيقي.' }} />{cart.map((line) => <div key={line.product.id}><ShoppingBag /><StoreCopy value={line.product.name} /><span>× {line.quantity}</span><ProductPrice product={line.product} size="s" /></div>)}</div>}{notice && <div className="store-inline-error" role="alert"><X /><StoreCopy value={{ en: 'Order was not submitted. Production checkout is not configured.', ar: 'لم يتم إرسال الطلب. الدفع الإنتاجي غير مهيأ.' }} inline /></div>}<footer>{step > 1 && <button type="button" className="store-button store-button-secondary" onClick={() => setStep(step - 1)}><StoreCopy value={{ en: 'Back', ar: 'السابق' }} inline /></button>}<button type="submit" className="store-button store-button-primary">{step === 5 ? <StoreCopy value={{ en: 'Place Order', ar: 'تأكيد الطلب' }} inline /> : <StoreCopy value={{ en: 'Continue', ar: 'متابعة' }} inline />}<DirectionArrow /></button></footer></form><CartSummary checkout /></div></div>;
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
  return <AccountShell title={{ en: 'Profile', ar: 'الملف الشخصي' }}><div className="store-profile-card"><span><UserRound /></span><div><h2><StoreCopy value={{ en: 'Customer profile not connected', ar: 'ملف العميل غير متصل' }} /></h2><p><StoreCopy value={{ en: 'Name, email and phone will appear only after production authentication is connected.', ar: 'سيظهر الاسم والبريد والهاتف فقط بعد ربط المصادقة الإنتاجية.' }} /></p></div><button type="button" disabled><Edit3 /><StoreCopy value={{ en: 'Edit Profile', ar: 'تعديل الملف' }} inline /></button></div><StoreState kind="empty" title={{ en: 'No verified profile data', ar: 'لا توجد بيانات ملف موثقة' }} description={{ en: 'No personal information has been fabricated for this preview.', ar: 'لم يتم اختلاق أي معلومات شخصية لهذه المعاينة.' }} /></AccountShell>;
}

export function OrdersPage() {
  const [status, setStatus] = useState('all');
  const tabs = [['all', 'All', 'الكل'], ['processing', 'Processing', 'قيد المعالجة'], ['shipped', 'Shipped', 'تم الشحن'], ['delivered', 'Delivered', 'تم التسليم'], ['cancelled', 'Cancelled', 'ملغي']];
  return <AccountShell title={{ en: 'My Orders', ar: 'طلباتي' }}><div className="store-order-tabs" role="tablist">{tabs.map(([id, en, ar]) => <button type="button" role="tab" aria-selected={status === id} className={status === id ? 'is-active' : ''} onClick={() => setStatus(id)} key={id}>{en} <small>{ar}</small></button>)}</div><StoreState kind="empty" title={{ en: `No verified ${status === 'all' ? '' : `${status} `}orders`, ar: 'لا توجد طلبات موثقة' }} description={{ en: 'Orders will appear after a real commerce and authentication source is connected.', ar: 'ستظهر الطلبات بعد ربط مصدر تجارة ومصادقة حقيقي.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} /></AccountShell>;
}

export function OrderDetailPage() {
  const { id } = useParams();
  return <AccountShell title={{ en: 'Order Details', ar: 'تفاصيل الطلب' }}><StoreState kind="unavailable" title={{ en: 'Order source unavailable', ar: 'مصدر الطلب غير متاح' }} description={{ en: `No verified order was found for reference ${id ?? '—'}. Timeline, payment and shipment actions remain disabled.`, ar: `لم يتم العثور على طلب موثق للمرجع ${id ?? '—'}. يظل الخط الزمني وإجراءات الدفع والشحن معطلة.` }} action={<Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'Back to Orders', ar: 'العودة للطلبات' }} inline /></Link>} /></AccountShell>;
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
