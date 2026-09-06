import { Link } from 'react-router-dom';
import { Trophy, ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';
import { CategoryRail, DirectionArrow, ProductGrid, StoreState } from '../../StoreComponents';
import { StoreCopy } from '../../StoreCopy';
import { BrandCollections } from './BrandCollections';
import type { StoreProduct } from '../../storeTypes';
import type { BilingualText } from '../../../domain/contracts';

function Shelf({ title, products, to }: { title: BilingualText; products: StoreProduct[]; to: string }) {
  if (!products.length) return null;
  return (
    <section className="store-section">
      <header className="store-section-heading">
        <h2><StoreCopy value={title} /></h2>
        <Link to={to}><StoreCopy value={{ en: 'Explore all', ar: 'استكشف الكل' }} inline /><DirectionArrow /></Link>
      </header>
      <ProductGrid products={products} />
    </section>
  );
}

function HeroMedia({ product, fallback }: { product?: StoreProduct; fallback: BilingualText }) {
  return product?.image ? (
    <img src={product.image} alt={`${product.name.en} | ${product.name.ar}`} loading="lazy" />
  ) : (
    <div className="store-retail-media-fallback" role="img" aria-label={`${fallback.en} | ${fallback.ar}`}>
      <Trophy aria-hidden="true" />
    </div>
  );
}

export function StoreHomePage() {
  const { categories, products, isPreview, recentlyViewed, locale } = useStore();
  const swimmingHero = products.find((product) => product.category === 'swimming' && product.image);
  const footballHero = products.find((product) => product.category === 'football' && product.image);
  const competitionProducts = products.filter((product) => product.badge === 'featured' || product.badge === 'new').slice(0, 8);

  return (
    <>
      <section className="store-retail-hero">
        <div className="store-retail-hero-copy">
          <span><StoreCopy value={{ en: 'THE UNITED EDIT', ar: 'اختيارات يونايتد' }} inline /></span>
          <h1><StoreCopy value={{ en: 'Made for your\nnext move.', ar: 'لخطوتك\nالقادمة.' }} /></h1>
          <p><StoreCopy value={{ en: 'From the water to the training ground. Discover your sporting essentials.', ar: 'من المسبح إلى ميدان التدريب. اكتشف مستلزمات رحلتك الرياضية.' }} /></p>
          <Link to="/store/shop" className="store-button store-button-primary"><StoreCopy value={{ en: 'Explore the store', ar: 'استكشف المتجر' }} inline /><DirectionArrow /></Link>
          <small><StoreCopy value={isPreview ? { en: 'Preview catalog', ar: 'كتالوج معاينة' } : { en: 'Catalog', ar: 'الكتالوج' }} inline /></small>
        </div>
        <div className="store-retail-hero-media">
          <HeroMedia product={swimmingHero} fallback={{ en: 'Swimming collection', ar: 'مجموعة السباحة' }} />
          <span>01 / <StoreCopy value={{ en: 'SWIMMING', ar: 'السباحة' }} inline /></span>
        </div>
        <Link className="store-retail-hero-side" to="/store/category/football">
          <HeroMedia product={footballHero} fallback={{ en: 'Football collection', ar: 'مجموعة كرة القدم' }} />
          <div><StoreCopy value={{ en: 'The training edit', ar: 'تشكيلة التدريب' }} /><DirectionArrow /></div>
        </Link>
      </section>

      <CategoryRail categories={categories} />

      {!products.length && (
        <div className="store-page-pad">
          <StoreState kind="unavailable" title={{ en: 'Production catalog not connected', ar: 'كتالوج الإنتاج غير متصل' }} description={{ en: 'Inventory and pricing are not available yet. Explore our sport collections while the store is being prepared.', ar: 'المخزون والأسعار غير متاحين بعد. استكشف مجموعات الرياضات أثناء تجهيز المتجر.' }} />
        </div>
      )}

      <BrandCollections />

      <section className="store-section official-championship-line" id="championship-line">
        <header className="store-section-heading">
          <div>
            <span className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold tracking-wider uppercase mb-1"><Trophy className="w-3.5 h-3.5 text-[#f5d77f]" /><StoreCopy value={{ en: 'OFFICIAL COMPETITION COLLECTION', ar: 'مجموعة المنافسات الرسمية' }} inline /></span>
            <h2><StoreCopy value={{ en: 'Equipment for focused performance', ar: 'معدات لأداء رياضي مركز' }} /></h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl"><StoreCopy value={{ en: isPreview ? 'Products shown here come from the active preview catalog provider.' : 'Products shown here come from the configured catalog provider.', ar: isPreview ? 'المنتجات المعروضة هنا تأتي من موفر كتالوج المعاينة النشط.' : 'المنتجات المعروضة هنا تأتي من موفر الكتالوج المهيأ.' }} /></p>
          </div>
          <Link to="/store/shop" className="store-heading-link">{locale === 'ar' ? 'عرض الكتالوج الكامل' : 'View Full Catalog'}<ArrowRight className="rtl:rotate-180" /></Link>
        </header>
        <ProductGrid products={competitionProducts} />
      </section>

      <Shelf title={isPreview ? { en: 'Discover the preview', ar: 'اكتشف المعاينة' } : { en: 'New arrivals', ar: 'وصل حديثًا' }} products={isPreview ? products.slice(0, 4) : products.filter((product) => product.badge === 'new').slice(0, 4)} to="/store/shop" />
      <Shelf title={{ en: 'Swimming essentials', ar: 'مستلزمات السباحة' }} products={products.filter((product) => product.category === 'swimming').slice(0, 4)} to="/store/category/swimming" />
      <Shelf title={{ en: 'Meet you on the pitch', ar: 'نلتقي في الملعب' }} products={products.filter((product) => product.category === 'football').slice(0, 4)} to="/store/category/football" />
      <Shelf title={{ en: 'Athlete essentials', ar: 'مستلزمات الرياضيين' }} products={products.filter((product) => ['apparel', 'accessories'].includes(product.category)).slice(0, 4)} to="/store/category/apparel" />
      <Shelf title={{ en: 'Equipment & accessories', ar: 'المعدات والإكسسوارات' }} products={products.filter((product) => ['equipment', 'accessories'].includes(product.category)).slice(0, 4)} to="/store/category/equipment" />

      <section className="store-merch-banner">
        <img src="/brand/united-olympics-sports-logo.png" alt="" />
        <div><h2><StoreCopy value={{ en: 'United Olympics Sports official merchandise', ar: 'منتجات يونايتد أوليمبيكس سبورت الرسمية' }} /></h2><p><StoreCopy value={{ en: 'Official merchandise and athletic gear presented through the configured catalog source.', ar: 'المنتجات الرسمية والعتاد الرياضي معروضة عبر مصدر الكتالوج المهيأ.' }} /></p></div>
        <Link className="store-button store-button-secondary" to="/store/shop"><StoreCopy value={{ en: 'Explore catalog', ar: 'استكشف الكتالوج' }} inline /></Link>
      </section>

      <Shelf title={{ en: 'Recently viewed', ar: 'شاهدت مؤخرًا' }} products={recentlyViewed.flatMap((id) => { const item = products.find((product) => product.id === id); return item ? [item] : []; }).slice(0, 4)} to="/store/shop" />
    </>
  );
}
