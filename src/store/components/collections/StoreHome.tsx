import { Link } from 'react-router-dom';
import { useStore } from '../../StoreContext';
import { CategoryRail, DirectionArrow, ProductGrid, StoreState } from '../../StoreComponents';
import { StoreCopy } from '../../StoreCopy';
import { BrandCollections } from './BrandCollections';
import type { StoreProduct } from '../../storeTypes';
import type { BilingualText } from '../../../domain/contracts';

function Shelf({ title, products, to }: { title: BilingualText; products: StoreProduct[]; to: string }) {
  if (!products.length) return null;
  return <section className="store-section"><header className="store-section-heading"><h2><StoreCopy value={title} /></h2><Link to={to}><StoreCopy value={{ en: 'Explore all', ar: 'استكشف الكل' }} inline /><DirectionArrow /></Link></header><ProductGrid products={products} /></section>;
}

export function StoreHomePage() {
  const { categories, products, isPreview, recentlyViewed } = useStore();
  const collections = ['swimming', 'football', 'apparel', 'accessories', 'equipment'].flatMap((slug) => {
    const category = categories.find((item) => item.slug === slug);
    return category ? [{ ...category, category: category.slug, productIds: products.filter((p) => p.category === slug).map((p) => p.id), campaignMedia: slug === 'apparel' ? '/media/store/campaigns/training-ivory.webp' : slug === 'swimming' ? '/media/products/goggles-studio.webp' : category.hero }] : [];
  });
  return <>
    <section className="store-retail-hero"><div className="store-retail-hero-copy"><span><StoreCopy value={{ en: 'THE UNITED EDIT', ar: 'اختيارات يونايتد' }} inline /></span><h1><StoreCopy value={{ en: 'Made for your\nnext move.', ar: 'لخطوتك\nالقادمة.' }} /></h1><p><StoreCopy value={{ en: 'From the water to the training ground. Discover your sporting essentials.', ar: 'من المسبح إلى ميدان التدريب. اكتشف مستلزمات رحلتك الرياضية.' }} /></p><Link to="/store/shop" className="store-button store-button-primary"><StoreCopy value={{ en: 'Explore the store', ar: 'استكشف المتجر' }} inline /><DirectionArrow /></Link><small><StoreCopy value={{ en: 'Editorial collection preview', ar: 'معاينة تحريرية للمجموعة' }} inline /></small></div><div className="store-retail-hero-media"><img src="/media/products/goggles-studio.webp" alt="Swimming goggles · editorial preview | نظارة سباحة · معاينة تحريرية" fetchPriority="high" /><span>01 / <StoreCopy value={{ en: 'SWIMMING', ar: 'السباحة' }} inline /></span></div><Link className="store-retail-hero-side" to="/store/category/apparel"><img src="/media/store/campaigns/training-black.webp" alt="Training apparel · editorial preview | ملابس تدريب · معاينة تحريرية" loading="lazy" /><div><StoreCopy value={{ en: 'The training edit', ar: 'تشكيلة التدريب' }} /><DirectionArrow /></div></Link></section>
    <CategoryRail categories={categories} />
    {!products.length && <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'Production catalog not connected', ar: 'كتالوج الإنتاج غير متصل' }} description={{ en: 'Inventory and pricing are not available yet. Explore our sport collections while the store is being prepared.', ar: 'المخزون والأسعار غير متاحين بعد. استكشف مجموعات الرياضات أثناء تجهيز المتجر.' }} /></div>}
    <BrandCollections collections={collections} />
    <Shelf title={isPreview ? { en: 'Discover the preview', ar: 'اكتشف المعاينة' } : { en: 'New arrivals', ar: 'وصل حديثًا' }} products={isPreview ? products.slice(0, 4) : products.filter((p) => p.badge === 'new').slice(0, 4)} to="/store/shop" />
    <section className="store-editorial-split"><img src="/media/store/campaigns/training-ivory.webp" alt="Ivory training apparel · editorial preview | ملابس تدريب عاجية · معاينة تحريرية" loading="lazy" /><div><span><StoreCopy value={{ en: 'MOVEMENT. IN EVERY DETAIL.', ar: 'الحركة. في كل تفصيلة.' }} inline /></span><h2><StoreCopy value={{ en: 'Your sport.\nYour expression.', ar: 'رياضتك.\nأسلوبك.' }} /></h2><p><StoreCopy value={{ en: 'Discover the apparel collection, from warm-up to the everyday.', ar: 'اكتشف مجموعة الملابس، من الإحماء إلى يومك المعتاد.' }} /></p><Link to="/store/category/apparel" className="store-button store-button-secondary"><StoreCopy value={{ en: 'Explore apparel', ar: 'استكشف الملابس' }} inline /><DirectionArrow /></Link><small><StoreCopy value={{ en: 'Editorial preview', ar: 'معاينة تحريرية' }} inline /></small></div></section>
    <Shelf title={{ en: 'Swimming essentials', ar: 'مستلزمات السباحة' }} products={products.filter((p) => p.category === 'swimming').slice(0, 4)} to="/store/category/swimming" />
    <Shelf title={{ en: 'Meet you on the pitch', ar: 'نلتقي في الملعب' }} products={products.filter((p) => p.category === 'football').slice(0, 4)} to="/store/category/football" />
    <Shelf title={{ en: 'Athlete essentials', ar: 'مستلزمات الرياضيين' }} products={products.filter((p) => ['apparel', 'accessories'].includes(p.category)).slice(0, 4)} to="/store/category/apparel" />
    <Shelf title={{ en: 'Equipment & accessories', ar: 'المعدات والإكسسوارات' }} products={products.filter((p) => ['equipment', 'accessories'].includes(p.category)).slice(0, 4)} to="/store/category/equipment" />
    <section className="store-merch-banner"><img src="/brand/united-olympics-sports-logo.png" alt="" /><div><h2><StoreCopy value={{ en: 'United Olympics Sports merchandise', ar: 'منتجات يونايتد أوليمبيكس سبورت' }} /></h2><p><StoreCopy value={{ en: 'Official merchandise inventory is awaiting verification.', ar: 'مخزون المنتجات الرسمية بانتظار التحقق.' }} /></p></div><Link className="store-button store-button-secondary" to="/store/shop"><StoreCopy value={{ en: 'Explore catalog', ar: 'استكشف الكتالوج' }} inline /></Link></section>
    <Shelf title={{ en: 'Recently viewed', ar: 'شاهدت مؤخرًا' }} products={recentlyViewed.flatMap((id) => { const item = products.find((p) => p.id === id); return item ? [item] : []; }).slice(0, 4)} to="/store/shop" />
  </>;
}
