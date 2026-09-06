import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../StoreContext';
import { StoreCopy } from '../../StoreCopy';
import { ProductCard } from '../product/ProductCard';
import type { StoreCollection } from '../../storeTypes';

export const OFFICIAL_BRAND_COLLECTIONS: StoreCollection[] = [
  {
    slug: 'aquatic-speed',
    category: 'swimming',
    name: {
      en: 'Aquatic Speed Collection',
      ar: 'مجموعة الأداء المائي المميّز',
    },
    description: {
      en: 'Engineered competition goggles, hydrodynamic silicone caps, and speed training fins.',
      ar: 'نظارات سباحة احترافية، قبعات سيليكون متطورة، وزعانف سرعة مائية للبطولات.',
    },
    campaignMedia: 'https://i.postimg.cc/3wNVhZJj/Chat-GPT-Image-Sep-5-2026-01-46-30-PM.png',
    productIds: ['uos-prod-goggles', 'uos-prod-swim-cap', 'uos-prod-kickboard', 'uos-prod-swim-fins'],
  },
  {
    slug: 'gold-pitch',
    category: 'football',
    name: {
      en: 'Gold Pitch Dominance',
      ar: 'مجموعة الهيمنة الذهبية للملاعب',
    },
    description: {
      en: 'Official match balls, carbon armor shin guards, and high-tempo squad training kits.',
      ar: 'كرات المباريات الرسمية، واقيات الساق المقواة، وأطقم تدريب المباريات التكتيكية.',
    },
    campaignMedia: 'https://i.postimg.cc/HkBRFNHL/Chat-GPT-Image-Sep-5-2026-01-53-40-PM.png',
    productIds: ['uos-prod-ball-black', 'uos-prod-ball-ivory', 'uos-prod-shin-guards', 'uos-prod-pitch-jersey'],
  },
  {
    slug: 'championship-wear',
    category: 'apparel',
    name: {
      en: 'Championship Wear',
      ar: 'مجموعة الملابس الرياضية الفاخرة',
    },
    description: {
      en: 'Podium presentation track jackets, compression shorts, and Olympic matchday uniforms.',
      ar: 'سترات منصات التتويج الأولمبية، شورتات الضغط العضلي، وأزياء البطولات المعتمدة.',
    },
    campaignMedia: 'https://i.postimg.cc/pL23GvNP/Chat-GPT-Image-Sep-5-2026-01-53-48-PM-(1).png',
    productIds: ['uos-prod-track-jacket', 'uos-prod-match-kit', 'uos-prod-compression-shorts', 'uos-prod-gold-shorts'],
  },
  {
    slug: 'athlete-essentials',
    category: 'accessories',
    name: {
      en: 'Athlete Essentials',
      ar: 'حقائب ومستلزمات الرياضيين',
    },
    description: {
      en: 'Executive athlete travel duffles, insulated thermal flasks, and squad backpacks.',
      ar: 'حقائب سفر تنفيذية فاخرة، قوارير مياه معزولة ومحفورة بالليزر، وحقائب تدريب متطورة.',
    },
    campaignMedia: 'https://i.postimg.cc/Kv7dDzHH/Chat-GPT-Image-Sep-5-2026-01-53-58-PM.png',
    productIds: ['uos-prod-travel-duffle', 'uos-prod-hydro-bottle-black', 'uos-prod-hydro-bottle-gold', 'uos-prod-sports-backpack'],
  },
];

export function BrandCollections({ collections = OFFICIAL_BRAND_COLLECTIONS }: { collections?: StoreCollection[] }) {
  const { products, locale } = useStore();
  const activeCollections = collections.length ? collections : OFFICIAL_BRAND_COLLECTIONS;
  const [selectedSlug, setSelectedSlug] = useState(activeCollections[0]?.slug);
  
  const currentCollection =
    activeCollections.find((item) => item.slug === selectedSlug) ?? activeCollections[0];

  if (!currentCollection) return null;

  const items = currentCollection.productIds.flatMap((id) => {
    const product = products.find((p) => p.id === id);
    return product ? [product] : [];
  });

  return (
    <section className="store-section store-collections" id="collections">
      <header className="store-section-heading">
        <div>
          <span className="flex items-center gap-1.5 text-xs text-[#d4af37] font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <StoreCopy value={{ en: 'Featured Brand Collections', ar: 'مجموعات العلامة التجارية المميزة' }} inline />
          </span>
          <h2>
            <StoreCopy value={{ en: 'Official Olympic Sporting Collections', ar: 'المجموعات الرياضية الأولمبية الرسمية' }} />
          </h2>
        </div>
        <Link to="/store/shop" className="store-heading-link">
          {locale === 'ar' ? 'كل المنتجات والعتاد' : 'All Products & Gear'}
          <ArrowRight className="rtl:rotate-180" />
        </Link>
      </header>

      {/* Smooth Navigation Tabs */}
      <div className="store-collection-tabs" role="tablist" aria-label="Brand Collections | مجموعات العلامة التجارية">
        {activeCollections.map((item) => (
          <button
            key={`brand-col-tab-${item.slug}`}
            type="button"
            role="tab"
            aria-selected={item.slug === currentCollection.slug}
            className={`store-collection-tab ${item.slug === currentCollection.slug ? 'is-active' : ''}`}
            onClick={() => setSelectedSlug(item.slug)}
          >
            {item.name[locale]}
          </button>
        ))}
      </div>

      {/* Collection Layout with Interactive Dark Side Banner & Product Cards */}
      <div className="store-collection-layout">
        <Link
          className="store-collection-story group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181e2b] to-[#0d1118] border border-[#d4af37]/30 p-6 flex flex-col justify-end min-h-[380px] shadow-2xl transition-all duration-500 hover:border-[#f5d77f]/60 hover:shadow-[0_20px_50px_rgba(212,175,55,0.2)]"
          to={`/store/category/${currentCollection.category}`}
        >
          {currentCollection.campaignMedia && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={currentCollection.campaignMedia}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover opacity-65 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-85 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090c13] via-[#090c13]/60 to-transparent" />
            </div>
          )}
          <div className="relative z-10 text-white space-y-2">
            <small className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f5d77f] uppercase tracking-wider">
              {locale === 'ar' ? 'اكتشف التشكيلة الحصرية' : 'EXPLORE THE EDIT'}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </small>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-['Cabinet_Grotesk',sans-serif]">
              <StoreCopy value={currentCollection.name} />
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 leading-relaxed">
              <StoreCopy value={currentCollection.description} />
            </p>
          </div>
        </Link>

        {/* Product Previews with Quick Add */}
        <div className="store-collection-products">
          {items.slice(0, 3).map((product) => (
            <ProductCard product={product} key={`brand-col-prod-${product.id}`} />
          ))}
          {!items.length && (
            <div className="store-collection-empty">
              <h3>
                <StoreCopy value={{ en: 'The next chapter is taking shape', ar: 'التشكيلة القادمة قيد الإعداد' }} />
              </h3>
              <p>
                <StoreCopy
                  value={{
                    en: 'Products and pricing will appear when the catalog is connected.',
                    ar: 'ستظهر المنتجات والأسعار عند ربط الكتالوج.',
                  }}
                />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
