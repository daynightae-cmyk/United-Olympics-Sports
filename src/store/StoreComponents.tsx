import { cartLineKey } from './storeUtils';
import { useStoreDialog } from './components/useStoreDialog';
import { StoreCopy } from './StoreCopy';
export { StoreCopy } from './StoreCopy';
import { ProductCard, ProductMedia, ProductPrice } from './components/product/ProductCard';
export { ProductCard, ProductMedia, ProductPrice } from './components/product/ProductCard';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../domain/contracts';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useStore } from './StoreContext';
import type { StoreCategory, StoreProduct } from './storeTypes';

export function StorePreviewNotice() {
  const { isPreview } = useStore();
  return <div className="store-truth-notice" role="status"><Sparkles aria-hidden="true" /><StoreCopy value={isPreview ? { en: 'Development preview · catalog values are not live inventory', ar: 'معاينة تطوير · قيم الكتالوج ليست مخزونًا فعليًا' } : { en: 'Commerce services are awaiting production configuration', ar: 'خدمات التجارة بانتظار إعداد بيئة الإنتاج' }} inline /></div>;
}

export function ProductGrid({ products, layout = 'grid' }: { products: StoreProduct[]; layout?: 'grid' | 'list' }) {
  const { isPreview } = useStore();
  if (!products.length) return <StoreState kind="empty" title={isPreview ? { en: 'No matching products', ar: 'لا توجد منتجات مطابقة' } : { en: 'Catalog unavailable', ar: 'الكتالوج غير متاح' }} description={isPreview ? { en: 'Try another category or search term.', ar: 'جرب فئة أخرى أو عبارة بحث مختلفة.' } : { en: 'Inventory and pricing are awaiting a production source.', ar: 'المخزون والأسعار بانتظار مصدر إنتاجي.' }} />;
  return <div className={`store-product-grid ${layout === 'list' ? 'is-list' : ''}`}>{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>;
}

export function QuantityStepper({ value, onChange, label = 'Quantity | الكمية' }: { value: number; onChange: (value: number) => void; label?: string }) {
  return <div className="store-quantity" aria-label={label}><button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity | تقليل الكمية"><Minus /></button><output aria-live="polite">{value}</output><button type="button" onClick={() => onChange(value + 1)} aria-label="Increase quantity | زيادة الكمية"><Plus /></button></div>;
}

export function StoreState({ kind, title, description, action }: { kind: 'empty' | 'error' | 'loading' | 'unavailable'; title: BilingualValue; description: BilingualValue; action?: ReactNode }) {
  const Icon = kind === 'error' ? X : kind === 'loading' ? Sparkles : PackageCheck;
  return <section className={`store-state store-state-${kind}`} role={kind === 'error' ? 'alert' : 'status'}><span><Icon aria-hidden="true" /></span><h2><StoreCopy value={title} /></h2><p><StoreCopy value={description} /></p>{action}</section>;
}

export function CategoryRail({ categories, active }: { categories: StoreCategory[]; active?: string }) {
  return <nav className="store-category-rail" aria-label="Store categories | فئات المتجر">{categories.map((category) => <NavLink key={category.slug} className={active === category.slug ? 'is-active' : ''} to={`/store/category/${category.slug}`} style={{ '--sport-accent': category.accent } as React.CSSProperties}><span className="store-category-mark" aria-hidden="true" /><StoreCopy value={category.name} /></NavLink>)}</nav>;
}

const mainNav = [
  { to: '/store', value: { en: 'Home', ar: 'الرئيسية' }, end: true },
  { to: '/store/shop', value: { en: 'Shop', ar: 'المتجر' } },
  { to: '/store/categories', value: { en: 'Categories', ar: 'الفئات' } },
  { to: '/store/shop?collection=new', value: { en: 'New Arrivals', ar: 'وصل حديثًا' } },
  { to: '/store#collections', value: { en: 'Collections', ar: 'المجموعات' } },
];

export function StoreHeader() {
  const { categories, products, locale, setLocale, cartCount, wishlist, setMiniCartOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLButtonElement>(null);
  const [megaOpen, setMegaOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const results = query.trim().length > 1 ? products.filter((product) => `${product.name.en} ${product.name.ar} ${product.type.en} ${product.type.ar}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 5) : [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); setMegaOpen(false); setSearchOpen(false); if (searchWrapRef.current?.contains(document.activeElement)) searchRef.current?.focus(); else if (headerRef.current?.querySelector('.store-mega')?.contains(document.activeElement)) megaRef.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setMegaOpen(false); if (!searchWrapRef.current?.contains(event.target as Node)) setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('pointerdown', onPointer); };
  }, []);

  const submitSearch = () => { if (query.trim()) { navigate(`/store/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setMenuOpen(false); } };

  return <header className="store-header" ref={headerRef}>
    <div className="store-announcement"><span><StoreCopy value={{ en: 'United Olympics Sports official commerce experience', ar: 'تجربة التسوق الرسمية ليونايتد أوليمبيكس سبورت' }} inline /></span><div><button type="button" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>{locale === 'en' ? 'العربية' : 'English'}</button><Link to="/store/orders"><StoreCopy value={{ en: 'Track Order', ar: 'تتبع الطلب' }} inline /></Link></div></div>
    <div className="store-main-header">
      <button type="button" className="store-mobile-menu" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Store menu | قائمة المتجر">{menuOpen ? <X /> : <Menu />}</button>
      <Link to="/store" className="store-brand"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><span><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small></span></Link>
      <div className="store-search-wrap" ref={searchWrapRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
        <form className="store-search" role="search" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}><Search aria-hidden="true" /><label className="sr-only" htmlFor="store-search">Search products | البحث عن المنتجات</label><input ref={searchRef} aria-expanded={searchOpen && query.trim().length > 1} aria-controls="store-search-results" onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); searchWrapRef.current?.querySelector<HTMLAnchorElement>('.store-search-results a')?.focus(); } }} id="store-search" value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }} placeholder={locale === 'ar' ? 'ابحث عن المنتجات أو الرياضات…' : 'Search products, sports, or collections…'} /><button type="submit" aria-label="Submit search | تنفيذ البحث"><ArrowRight /></button></form>
        {searchOpen && query.trim().length > 1 && <div className="store-search-results" id="store-search-results" role="region" aria-label="Search suggestions | اقتراحات البحث" onKeyDown={(event) => { if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return; event.preventDefault(); const links = [...event.currentTarget.querySelectorAll<HTMLAnchorElement>('a')]; const index = links.indexOf(document.activeElement as HTMLAnchorElement); const next = index + (event.key === 'ArrowDown' ? 1 : -1); if (next < 0) searchRef.current?.focus(); else links[next % links.length]?.focus(); }}>{results.length ? results.map((product) => <Link to={`/store/product/${product.slug}`} key={product.id} onClick={() => setSearchOpen(false)}><span className="store-search-thumb"><ProductMedia product={product} /></span><StoreCopy value={product.name} /><ProductPrice product={product} size="s" /></Link>) : <p><StoreCopy value={{ en: 'No matching products', ar: 'لا توجد منتجات مطابقة' }} /></p>}<Link className="store-search-all" to={`/store/search?q=${encodeURIComponent(query)}`} onClick={() => setSearchOpen(false)}><StoreCopy value={{ en: 'View all results', ar: 'عرض كل النتائج' }} inline /><ChevronRight /></Link></div>}
      </div>
      <div className="store-utilities"><button className="store-language" type="button" aria-label="Change language | تغيير اللغة" onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}>{locale === 'en' ? 'ع' : 'EN'}</button><ThemeToggle compact /><Link to="/store/account" aria-label="Account | الحساب"><UserRound /><span><StoreCopy value={{ en: 'Account', ar: 'الحساب' }} /></span></Link><Link to="/store/wishlist" aria-label="Wishlist | المفضلة"><Heart /><i>{wishlist.length}</i><span><StoreCopy value={{ en: 'Wishlist', ar: 'المفضلة' }} /></span></Link><button type="button" onClick={() => setMiniCartOpen(true)} aria-label="Cart | السلة"><ShoppingBag /><i>{cartCount}</i><span><StoreCopy value={{ en: 'Cart', ar: 'السلة' }} /></span></button></div>
    </div>
    <nav className={`store-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Store navigation | تنقل المتجر">
      <button type="button" ref={megaRef} className="store-mega-trigger" onClick={() => setMegaOpen((open) => !open)} aria-expanded={megaOpen}><SlidersHorizontal /><StoreCopy value={{ en: 'Shop by Category', ar: 'تسوق حسب الفئة' }} inline /><ChevronDown /></button>
      {mainNav.map((item) => <NavLink end={item.end} key={item.to} to={item.to} onClick={() => setMenuOpen(false)}><StoreCopy value={item.value} /></NavLink>)}
      <Link to="/" className="store-org-link"><StoreCopy value={{ en: 'Organization', ar: 'المؤسسة' }} /></Link>
      {megaOpen && <div className="store-mega" role="dialog" aria-label="Product categories | فئات المنتجات"><section><h3><StoreCopy value={{ en: 'Sports', ar: 'الرياضات' }} /></h3>{categories.slice(0, 6).map((category) => <Link key={category.slug} to={`/store/category/${category.slug}`} onClick={() => setMegaOpen(false)}><StoreCopy value={category.name} inline /><ChevronRight /></Link>)}</section><section><h3><StoreCopy value={{ en: 'Types', ar: 'الأنواع' }} /></h3>{categories.slice(6).map((category) => <Link key={category.slug} to={`/store/category/${category.slug}`} onClick={() => setMegaOpen(false)}><StoreCopy value={category.name} inline /><ChevronRight /></Link>)}<Link to="/store/shop" onClick={() => setMegaOpen(false)}><StoreCopy value={{ en: 'Training Essentials', ar: 'مستلزمات التدريب' }} inline /><ChevronRight /></Link></section><aside><img src="/media/sports/swimming/swimming-02-performance.webp" alt="Swimming performance training | تدريب أداء السباحة" /><div><span>UNITED PERFORMANCE</span><strong><StoreCopy value={{ en: 'Built for disciplined training', ar: 'مصمم للتدريب المنضبط' }} /></strong></div></aside></div>}
    </nav>
  </header>;
}

export function MiniCart() {
  const { miniCartOpen, setMiniCartOpen, cart, subtotal, locale, updateQuantity, removeFromCart } = useStore();
  const panelRef = useRef<HTMLElement>(null);
  useStoreDialog(miniCartOpen, panelRef, () => setMiniCartOpen(false));
  if (!miniCartOpen) return null;
  return <div className="store-drawer-layer"><button type="button" className="store-drawer-backdrop" aria-label="Close cart | إغلاق السلة" onClick={() => setMiniCartOpen(false)} /><aside ref={panelRef} tabIndex={-1} className="store-mini-cart" role="dialog" aria-modal="true" aria-labelledby="mini-cart-title"><header><div><small>YOUR SELECTION</small><h2 id="mini-cart-title"><StoreCopy value={{ en: 'Shopping Cart', ar: 'سلة التسوق' }} /></h2></div><button type="button" onClick={() => setMiniCartOpen(false)} aria-label="Close cart | إغلاق السلة"><X /></button></header>{cart.length ? <><div className="store-mini-cart-lines">{cart.map((line) => <article key={cartLineKey(line)}><div className="store-mini-thumb"><ProductMedia product={line.product} source={line.product.variantMedia?.find((item) => item.color === line.color)?.image ?? line.product.image} /></div><div><h3><StoreCopy value={line.product.name} /></h3>{line.size && <small>{line.size}</small>}{line.color && <small>{line.product.colors?.find((item) => item.en === line.color)?.[locale] ?? line.color}</small>}<ProductPrice product={line.product} size="s" /><QuantityStepper value={line.quantity} onChange={(quantity) => updateQuantity(cartLineKey(line), quantity)} /></div><button type="button" className="store-remove" onClick={() => removeFromCart(cartLineKey(line))} aria-label="Remove item | إزالة المنتج"><Trash2 /></button></article>)}</div><footer><div><StoreCopy value={{ en: 'Subtotal', ar: 'المجموع الفرعي' }} inline /><strong>{new Intl.NumberFormat('en-AE', { style: 'currency', currency: cart[0]?.product.currency ?? 'AED' }).format(subtotal)}</strong></div><Link className="store-button store-button-secondary" to="/store/cart" onClick={() => setMiniCartOpen(false)}><StoreCopy value={{ en: 'View Cart', ar: 'عرض السلة' }} inline /></Link><Link className="store-button store-button-primary" to="/store/checkout" onClick={() => setMiniCartOpen(false)}><StoreCopy value={{ en: 'Checkout', ar: 'إتمام الطلب' }} inline /><ArrowRight /></Link></footer></> : <StoreState kind="empty" title={{ en: 'Your cart is empty', ar: 'سلتك فارغة' }} description={{ en: 'Explore the catalog to prepare an order.', ar: 'استكشف الكتالوج لتجهيز طلبك.' }} action={<Link className="store-button store-button-primary" to="/store/shop" onClick={() => setMiniCartOpen(false)}><StoreCopy value={{ en: 'Continue Shopping', ar: 'متابعة التسوق' }} inline /></Link>} />}</aside></div>;
}

export function StoreFooter() {
  return <footer className="store-footer"><div className="store-footer-brand"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><div><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small><p><StoreCopy value={{ en: 'For the training. For the team. For you.', ar: 'للتدريب. للفريق. ولك.' }} /></p></div></div><div><h3><StoreCopy value={{ en: 'Store', ar: 'المتجر' }} /></h3><Link to="/store/shop"><StoreCopy value={{ en: 'Shop', ar: 'تسوق' }} inline /></Link><Link to="/store/categories"><StoreCopy value={{ en: 'Sports', ar: 'الرياضات' }} inline /></Link><Link to="/store/wishlist"><StoreCopy value={{ en: 'Wishlist', ar: 'المفضلة' }} inline /></Link></div><div><h3><StoreCopy value={{ en: 'Account', ar: 'الحساب' }} /></h3><Link to="/store/account"><StoreCopy value={{ en: 'Profile', ar: 'الملف الشخصي' }} inline /></Link><Link to="/store/orders"><StoreCopy value={{ en: 'Orders', ar: 'الطلبات' }} inline /></Link><Link to="/store/addresses"><StoreCopy value={{ en: 'Addresses', ar: 'العناوين' }} inline /></Link></div><div><h3><StoreCopy value={{ en: 'Organization', ar: 'المؤسسة' }} /></h3><Link to="/"><StoreCopy value={{ en: 'Main Website', ar: 'الموقع الرئيسي' }} inline /></Link><Link to="/contact"><StoreCopy value={{ en: 'Contact', ar: 'تواصل معنا' }} inline /></Link><Link to="/admin/store"><StoreCopy value={{ en: 'Store Admin', ar: 'إدارة المتجر' }} inline /></Link></div><small className="store-footer-note">© {new Date().getFullYear()} United Olympics Sports</small></footer>;
}

export function StoreLayout({ children }: { children: ReactNode }) {
  const { direction } = useStore();
  return <div className="store-shell" dir={direction}><StorePreviewNotice /><StoreHeader /><main className="store-main">{children}</main><StoreFooter /><MiniCart /></div>;
}

export const DirectionArrow = () => {
  const { direction } = useStore();
  return direction === 'rtl' ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />;
};
