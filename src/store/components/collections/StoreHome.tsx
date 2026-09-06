import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';
import { CategoryRail, DirectionArrow, ProductGrid, StoreState } from '../../StoreComponents';
import { StoreCopy } from '../../StoreCopy';
import { BrandCollections } from './BrandCollections';
import { BRAND_PRODUCTS } from '../../storeData.preview';
import { ProductCard } from '../product/ProductCard';
import type { StoreProduct } from '../../storeTypes';
import type { BilingualText } from '../../../domain/contracts';

function Shelf({ title, products, to }: { title: BilingualText; products: StoreProduct[]; to: string }) {
  if (!products.length) return null;
  return (
    <section className="store-section">
      <header className="store-section-heading">
        <h2>
          <StoreCopy value={title} />
        </h2>
        <Link to={to}>
          <StoreCopy value={{ en: 'Explore all', ar: 'استكشف الكل' }} inline />
          <DirectionArrow />
        </Link>
      </header>
      <ProductGrid products={products} />
    </section>
  );
}

export function StoreHomePage() {
  const { categories, products, isPreview, recentlyViewed, locale } = useStore();

  return (
    <>
      {/* Retail Hero with Verified Brand Imagery */}
      <section className="store-retail-hero">
        <div className="store-retail-hero-copy">
          <span>
            <StoreCopy value={{ en: 'THE UNITED EDIT', ar: 'اختيارات يونايتد' }} inline />
          </span>
          <h1>
            <StoreCopy value={{ en: 'Made for your\nnext move.', ar: 'لخطوتك\nالقادمة.' }} />
          </h1>
          <p>
            <StoreCopy
              value={{
                en: 'From the water to the training ground. Discover your sporting essentials.',
                ar: 'من المسبح إلى ميدان التدريب. اكتشف مستلزمات رحلتك الرياضية.',
              }}
            />
          </p>
          <Link to="/store/shop" className="store-button store-button-primary">
            <StoreCopy value={{ en: 'Explore the store', ar: 'استكشف المتجر' }} inline />
            <DirectionArrow />
          </Link>
          <small>
            <StoreCopy value={{ en: 'Editorial collection preview', ar: 'معاينة تحريرية للمجموعة' }} inline />
          </small>
        </div>
        <div className="store-retail-hero-media">
          <img
            src="https://i.postimg.cc/3wNVhZJj/Chat-GPT-Image-Sep-5-2026-01-46-30-PM.png"
            alt="Swimming goggles · editorial preview | نظارة سباحة · معاينة تحريرية"
            fetchPriority="high"
          />
          <span>
            01 / <StoreCopy value={{ en: 'SWIMMING', ar: 'السباحة' }} inline />
          </span>
        </div>
        <Link className="store-retail-hero-side" to="/store/category/apparel">
          <img
            src="https://i.postimg.cc/XYVtHWMV/Chat-GPT-Image-Sep-5-2026-01-53-48-PM.png"
            alt="Training apparel · editorial preview | ملابس تدريب · معاينة تحريرية"
            loading="lazy"
          />
          <div>
            <StoreCopy value={{ en: 'The training edit', ar: 'تشكيلة التدريب' }} />
            <DirectionArrow />
          </div>
        </Link>
      </section>

      <CategoryRail categories={categories} />

      {!products.length && (
        <div className="store-page-pad">
          <StoreState
            kind="unavailable"
            title={{ en: 'Production catalog not connected', ar: 'كتالوج الإنتاج غير متصل' }}
            description={{
              en: 'Inventory and pricing are not available yet. Explore our sport collections while the store is being prepared.',
              ar: 'المخزون والأسعار غير متاحين بعد. استكشف مجموعات الرياضات أثناء تجهيز المتجر.',
            }}
          />
        </div>
      )}

      {/* Featured Brand Collections with dynamic tabs and interactive dark side banner */}
      <BrandCollections />

      {/* Dedicated Section: Official Academy Championship Line (خط منتجات الأكاديمية الرسمي للبطولات) */}
      <section className="store-section official-championship-line" id="championship-line">
        <header className="store-section-heading">
          <div>
            <span className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold tracking-wider uppercase mb-1">
              <Trophy className="w-3.5 h-3.5 text-[#f5d77f]" />
              <StoreCopy
                value={{
                  en: 'OFFICIAL ACADEMY CHAMPIONSHIP LINE',
                  ar: 'خط منتجات الأكاديمية الرسمي للبطولات',
                }}
                inline
              />
            </span>
            <h2>
              <StoreCopy
                value={{
                  en: 'Gear Engineered for Olympic Excellence',
                  ar: 'عتاد ومعدات مصممة للتميز الأولمبي',
                }}
              />
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              <StoreCopy
                value={{
                  en: 'Exclusive competition kits, training equipment, and athlete accessories crafted for United Olympics Sports.',
                  ar: 'أطقم المنافسات الحصرية، ومعدات التدريب المتطورة، ومستلزمات الرياضيين المعتمدة من يونايتد أوليمبيكس سبورت.',
                }}
              />
            </p>
          </div>
          <Link to="/store/shop" className="store-heading-link">
            {locale === 'ar' ? 'عرض الكتالوج الكامل' : 'View Full Catalog'}
            <ArrowRight className="rtl:rotate-180" />
          </Link>
        </header>

        <div className="store-product-grid">
          {BRAND_PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard product={product} key={`champ-line-${product.id}`} />
          ))}
        </div>
      </section>

      <Shelf
        title={isPreview ? { en: 'Discover the preview', ar: 'اكتشف المعاينة' } : { en: 'New arrivals', ar: 'وصل حديثًا' }}
        products={isPreview ? products.slice(0, 4) : products.filter((p) => p.badge === 'new').slice(0, 4)}
        to="/store/shop"
      />

      <section className="store-editorial-split">
        <img
          src="https://i.postimg.cc/pL23GvNP/Chat-GPT-Image-Sep-5-2026-01-53-48-PM-(1).png"
          alt="Podium track jacket · editorial preview | سترة التتويج · معاينة تحريرية"
          loading="lazy"
        />
        <div>
          <span>
            <StoreCopy value={{ en: 'MOVEMENT. IN EVERY DETAIL.', ar: 'الحركة. في كل تفصيلة.' }} inline />
          </span>
          <h2>
            <StoreCopy value={{ en: 'Your sport.\nYour expression.', ar: 'رياضتك.\nأسلوبك.' }} />
          </h2>
          <p>
            <StoreCopy
              value={{
                en: 'Discover the championship apparel collection, from podium jackets to competition kits.',
                ar: 'اكتشف مجموعة الملابس الرياضية للبطولات، من سترات التتويج إلى أطقم المنافسات.',
              }}
            />
          </p>
          <Link to="/store/category/apparel" className="store-button store-button-secondary">
            <StoreCopy value={{ en: 'Explore apparel', ar: 'استكشف الملابس' }} inline />
            <DirectionArrow />
          </Link>
          <small>
            <StoreCopy value={{ en: 'Editorial preview', ar: 'معاينة تحريرية' }} inline />
          </small>
        </div>
      </section>

      <Shelf
        title={{ en: 'Swimming essentials', ar: 'مستلزمات السباحة' }}
        products={products.filter((p) => p.category === 'swimming').slice(0, 4)}
        to="/store/category/swimming"
      />
      <Shelf
        title={{ en: 'Meet you on the pitch', ar: 'نلتقي في الملعب' }}
        products={products.filter((p) => p.category === 'football').slice(0, 4)}
        to="/store/category/football"
      />
      <Shelf
        title={{ en: 'Athlete essentials', ar: 'مستلزمات الرياضيين' }}
        products={products.filter((p) => ['apparel', 'accessories'].includes(p.category)).slice(0, 4)}
        to="/store/category/apparel"
      />
      <Shelf
        title={{ en: 'Equipment & accessories', ar: 'المعدات والإكسسوارات' }}
        products={products.filter((p) => ['equipment', 'accessories'].includes(p.category)).slice(0, 4)}
        to="/store/category/equipment"
      />

      <section className="store-merch-banner">
        <img src="/brand/united-olympics-sports-logo.png" alt="" />
        <div>
          <h2>
            <StoreCopy
              value={{
                en: 'United Olympics Sports official merchandise',
                ar: 'منتجات يونايتد أوليمبيكس سبورت الرسمية',
              }}
            />
          </h2>
          <p>
            <StoreCopy
              value={{
                en: 'Official merchandise and athletic gear verified for all academies.',
                ar: 'المنتجات الرسمية والعتاد الرياضي المعتمد لجميع الأكاديميات.',
              }}
            />
          </p>
        </div>
        <Link className="store-button store-button-secondary" to="/store/shop">
          <StoreCopy value={{ en: 'Explore catalog', ar: 'استكشف الكتالوج' }} inline />
        </Link>
      </section>

      <Shelf
        title={{ en: 'Recently viewed', ar: 'شاهدت مؤخرًا' }}
        products={recentlyViewed
          .flatMap((id) => {
            const item = products.find((p) => p.id === id);
            return item ? [item] : [];
          })
          .slice(0, 4)}
        to="/store/shop"
      />
    </>
  );
}
