import { ArrowUpRight, BadgeCheck, PackageSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StoreCopy } from '../../StoreCopy';
import { APPROVED_PRODUCT_MEDIA } from '../../storeMediaProvenance';
import type { StoreCategorySlug } from '../../storeTypes';

type ShowcaseItem = {
  slug: keyof typeof APPROVED_PRODUCT_MEDIA;
  category: StoreCategorySlug;
  name: { en: string; ar: string };
  type: { en: string; ar: string };
};

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    slug: 'elite-hydro-pro-goggles',
    category: 'swimming',
    name: { en: 'Swimming Goggles', ar: 'نظارات السباحة' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
  {
    slug: 'championship-silicone-swim-cap',
    category: 'swimming',
    name: { en: 'Swimming Cap', ar: 'قبعة السباحة' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
  {
    slug: 'pitch-dominance-training-jersey',
    category: 'apparel',
    name: { en: 'Performance Jersey', ar: 'قميص الأداء الرياضي' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
  {
    slug: 'olympic-gold-trim-training-shorts',
    category: 'apparel',
    name: { en: 'Training Shorts', ar: 'شورت التدريب' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
  {
    slug: 'official-match-ball-royal-ivory',
    category: 'football',
    name: { en: 'White Match Football', ar: 'كرة مباريات بيضاء' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
  {
    slug: 'official-match-ball-onyx-gold',
    category: 'football',
    name: { en: 'Black Match Football', ar: 'كرة مباريات سوداء' },
    type: { en: 'Approved media', ar: 'وسائط معتمدة' },
  },
];

export function VerifiedMediaShowcase({ compact = false }: { compact?: boolean }) {
  return <section className={`store-verified-showcase ${compact ? 'is-compact' : ''}`} aria-labelledby="store-verified-showcase-title">
    <header className="store-verified-showcase-head">
      <div>
        <span className="store-verified-showcase-kicker"><BadgeCheck aria-hidden="true" /><StoreCopy value={{ en: 'OWNER-APPROVED PRODUCT MEDIA', ar: 'وسائط منتجات معتمدة من المالك' }} inline /></span>
        <h2 id="store-verified-showcase-title"><StoreCopy value={{ en: 'Product showcase', ar: 'معرض المنتجات' }} /></h2>
        <p><StoreCopy value={{ en: 'Approved product visuals are ready now. Live price, stock and checkout availability appear only after the production catalog supplies them.', ar: 'صور المنتجات المعتمدة جاهزة للعرض الآن. السعر والمخزون وإتاحة الشراء تظهر فقط بعد اتصال كتالوج الإنتاج.' }} /></p>
      </div>
      <div className="store-verified-showcase-status">
        <PackageSearch aria-hidden="true" />
        <StoreCopy value={{ en: 'Catalog connection pending', ar: 'بانتظار اتصال الكتالوج' }} />
      </div>
    </header>

    <div className="store-verified-showcase-grid">
      {SHOWCASE_ITEMS.map((item) => {
        const approved = APPROVED_PRODUCT_MEDIA[item.slug];
        return <Link key={item.slug} className="store-verified-showcase-card" to={`/store/category/${item.category}`}>
          <span className="store-verified-showcase-media">
            <img src={approved.primary} alt="" loading="lazy" decoding="async" />
            <span><StoreCopy value={item.type} inline /></span>
          </span>
          <span className="store-verified-showcase-copy">
            <strong><StoreCopy value={item.name} /></strong>
            <small><StoreCopy value={{ en: 'View category', ar: 'عرض الفئة' }} inline /><ArrowUpRight aria-hidden="true" /></small>
          </span>
        </Link>;
      })}
    </div>
  </section>;
}
