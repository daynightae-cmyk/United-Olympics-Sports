import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Headphones, RotateCcw, ShieldCheck, Trophy, Truck } from 'lucide-react';
import { useStore } from '../../StoreContext';
import { DirectionArrow, ProductGrid, ProductMedia, ProductPrice, StoreCopy, StoreState } from '../../StoreComponents';
import type { StoreProduct } from '../../storeTypes';

function productFor(products: StoreProduct[], category: string, offset = 0) {
  return products.filter((product) => product.category === category)[offset];
}

function PromoMedia({ product, fallback }: { product?: StoreProduct; fallback: string }) {
  return product ? <ProductMedia product={product} hero /> : <div className="store-reference-media-fallback"><Trophy aria-hidden="true" /><span>{fallback}</span></div>;
}

function RankedProducts({ products }: { products: StoreProduct[] }) {
  return <div className="store-reference-ranked">{products.slice(0, 4).map((product, index) => <Link key={product.id} to={`/store/product/${product.slug}`}><b>{index + 1}</b><span className="store-reference-ranked-media"><ProductMedia product={product} /></span><span><strong><StoreCopy value={product.name} /></strong><ProductPrice product={product} size="s" /></span></Link>)}</div>;
}

export function StoreHomePage() {
  const { categories, products, isPreview, recentlyViewed } = useStore();
  const football = productFor(products, 'football');
  const swimming = productFor(products, 'swimming');
  const apparel = productFor(products, 'apparel');
  const accessories = productFor(products, 'accessories');
  const featured = products.filter((product) => product.badge === 'featured').slice(0, 4);
  const arrivals = products.filter((product) => product.badge === 'new').slice(0, 4);
  const best = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 4);
  const recent = recentlyViewed.flatMap((id) => {
    const item = products.find((product) => product.id === id);
    return item ? [item] : [];
  }).slice(0, 4);

  return <div className="store-reference-home">
    <section className="store-reference-hero-grid">
      <article className="store-reference-hero-main">
        <div className="store-reference-hero-photo"><PromoMedia product={football ?? swimming} fallback="United performance" /></div>
        <div className="store-reference-hero-overlay" />
        <div className="store-reference-hero-copy">
          <span className="store-reference-kicker"><StoreCopy value={{ en: 'UNITED PERFORMANCE', ar: 'أداء يونايتد' }} inline /></span>
          <h1 className="store-reference-light-title"><StoreCopy value={{ en: 'ELEVATE\nYOUR GAME', ar: 'ارتقِ\nبمستواك' }} /></h1>
          <h1 className="store-reference-dark-title"><StoreCopy value={{ en: 'GEAR FOR\nCHAMPIONS', ar: 'معدات\nللأبطال' }} /></h1>
          <p><StoreCopy value={{ en: 'Premium gear. Elite performance.', ar: 'معدات فاخرة. أداء النخبة.' }} /></p>
          <Link to="/store/shop" className="store-button store-button-primary"><StoreCopy value={{ en: 'SHOP NOW', ar: 'تسوق الآن' }} inline /><DirectionArrow /></Link>
        </div>
      </article>

      <div className="store-reference-hero-side">
        <Link to="/store/shop?collection=new" className="store-reference-promo store-reference-promo-light">
          <div><small><StoreCopy value={{ en: 'NEW COLLECTION', ar: 'مجموعة جديدة' }} /></small><strong><StoreCopy value={{ en: 'Fresh training essentials', ar: 'مستلزمات تدريب جديدة' }} /></strong><span><StoreCopy value={{ en: 'EXPLORE', ar: 'استكشف' }} inline /><ArrowRight /></span></div>
          <span className="store-reference-promo-media"><PromoMedia product={apparel} fallback="New collection" /></span>
        </Link>
        <Link to="/store/shop?collection=featured" className="store-reference-promo store-reference-promo-dark">
          <div><small><StoreCopy value={{ en: 'FEATURED GEAR', ar: 'معدات مميزة' }} /></small><strong><StoreCopy value={{ en: 'Built for the next session', ar: 'مصممة للحصة القادمة' }} /></strong><span><StoreCopy value={{ en: 'SHOP FEATURED', ar: 'تسوق المميز' }} inline /><ArrowRight /></span></div>
          <span className="store-reference-promo-media"><PromoMedia product={football} fallback="Featured gear" /></span>
        </Link>
      </div>
    </section>

    <nav className="store-reference-category-strip" aria-label="Featured categories | الفئات المميزة">
      {categories.slice(0, 7).map((category, index) => <Link key={category.slug} to={`/store/category/${category.slug}`}><span className="store-reference-category-icon">{String(index + 1).padStart(2, '0')}</span><StoreCopy value={category.name} /></Link>)}
      <Link className="store-reference-category-all" to="/store/categories"><span>+</span><StoreCopy value={{ en: 'VIEW ALL', ar: 'عرض الكل' }} /></Link>
    </nav>

    {!products.length && <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'Production catalog not connected', ar: 'كتالوج الإنتاج غير متصل' }} description={{ en: 'Inventory and pricing are not available yet. The retail shell remains ready for the verified catalog.', ar: 'المخزون والأسعار غير متاحين بعد. واجهة المتجر جاهزة للكتالوج الموثق.' }} /></div>}

    <section className="store-reference-feature-row">
      <Link to="/store/category/swimming" className="store-reference-feature-card">
        <div><small><StoreCopy value={{ en: 'SWIMMING ESSENTIALS', ar: 'أساسيات السباحة' }} /></small><strong><StoreCopy value={{ en: 'Performance in every lap', ar: 'أداء في كل لفة' }} /></strong><span><StoreCopy value={{ en: 'SHOP NOW', ar: 'تسوق الآن' }} inline /></span></div>
        <PromoMedia product={swimming} fallback="Swimming" />
      </Link>
      <Link to="/store/category/apparel" className="store-reference-feature-card store-reference-feature-action">
        <div><small><StoreCopy value={{ en: 'TRAIN HARD', ar: 'تدرب بجد' }} /></small><strong><StoreCopy value={{ en: 'Perform better', ar: 'أداء أفضل' }} /></strong><span><StoreCopy value={{ en: 'TRAINING GEAR', ar: 'معدات التدريب' }} inline /></span></div>
        <PromoMedia product={apparel} fallback="Training" />
      </Link>
      <div className="store-reference-feature-card store-reference-quality-card">
        <div><small><StoreCopy value={{ en: 'PREMIUM QUALITY', ar: 'جودة فاخرة' }} /></small><strong><StoreCopy value={{ en: 'Built for disciplined athletes', ar: 'مصممة للرياضيين المنضبطين' }} /></strong></div>
        <ul><li><BadgeCheck /><StoreCopy value={{ en: 'Authentic', ar: 'أصلي' }} inline /></li><li><ShieldCheck /><StoreCopy value={{ en: 'Secure', ar: 'آمن' }} inline /></li><li><Trophy /><StoreCopy value={{ en: 'Performance', ar: 'أداء' }} inline /></li></ul>
      </div>
    </section>

    <section className="store-reference-shelf-grid">
      <div className="store-reference-shelf">
        <header><h2><StoreCopy value={isPreview ? { en: 'NEW ARRIVALS', ar: 'وصل حديثًا' } : { en: 'NEW ARRIVALS', ar: 'وصل حديثًا' }} /></h2><Link to="/store/shop?collection=new"><StoreCopy value={{ en: 'VIEW ALL', ar: 'عرض الكل' }} /></Link></header>
        <ProductGrid products={(arrivals.length ? arrivals : products.slice(0, 4))} />
      </div>
      <div className="store-reference-shelf">
        <header><h2><StoreCopy value={{ en: 'FEATURED PRODUCTS', ar: 'منتجات مميزة' }} /></h2><Link to="/store/shop?collection=featured"><StoreCopy value={{ en: 'VIEW ALL', ar: 'عرض الكل' }} /></Link></header>
        <ProductGrid products={(featured.length ? featured : products.slice(4, 8))} />
      </div>
      <aside className="store-reference-best">
        <header><h2><StoreCopy value={{ en: 'BEST SELLERS', ar: 'الأكثر مبيعًا' }} /></h2><Link to="/store/shop"><StoreCopy value={{ en: 'VIEW ALL', ar: 'عرض الكل' }} /></Link></header>
        <RankedProducts products={best} />
      </aside>
    </section>

    {recent.length > 0 && <section className="store-section store-reference-recent"><header className="store-section-heading"><h2><StoreCopy value={{ en: 'Recently viewed', ar: 'شاهدت مؤخرًا' }} /></h2></header><ProductGrid products={recent} /></section>}

    <section className="store-reference-benefits">
      <div><Truck /><span><strong><StoreCopy value={{ en: 'FREE SHIPPING', ar: 'شحن مجاني' }} /></strong><small><StoreCopy value={{ en: 'On qualifying orders', ar: 'للطلبات المؤهلة' }} /></small></span></div>
      <div><RotateCcw /><span><strong><StoreCopy value={{ en: 'EASY RETURNS', ar: 'إرجاع سهل' }} /></strong><small><StoreCopy value={{ en: 'Clear return policy', ar: 'سياسة إرجاع واضحة' }} /></small></span></div>
      <div><BadgeCheck /><span><strong><StoreCopy value={{ en: 'AUTHENTIC PRODUCTS', ar: 'منتجات أصلية' }} /></strong><small><StoreCopy value={{ en: 'Official catalog source', ar: 'مصدر كتالوج رسمي' }} /></small></span></div>
      <div><Headphones /><span><strong><StoreCopy value={{ en: 'CUSTOMER SUPPORT', ar: 'دعم العملاء' }} /></strong><small><StoreCopy value={{ en: 'Help when you need it', ar: 'مساعدة عند الحاجة' }} /></small></span></div>
      <div><ShieldCheck /><span><strong><StoreCopy value={{ en: 'SECURE PAYMENT', ar: 'دفع آمن' }} /></strong><small><StoreCopy value={{ en: 'Provider-owned payment fields', ar: 'حقول دفع يديرها المزود' }} /></small></span></div>
    </section>
  </div>;
}
