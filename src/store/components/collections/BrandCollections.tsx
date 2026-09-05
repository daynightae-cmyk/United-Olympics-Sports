import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../StoreContext';
import { StoreCopy } from '../../StoreCopy';
import { ProductCard } from '../product/ProductCard';
import type { StoreCollection } from '../../storeTypes';

/** Editorial configuration contains references only; StoreContext owns every product. */
export function BrandCollections({ collections }: { collections: StoreCollection[] }) {
  const { products, locale } = useStore();
  const [selected, setSelected] = useState(collections[0]?.slug);
  const collection = collections.find((item) => item.slug === selected) ?? collections[0];
  if (!collection) return null;
  const items = collection.productIds.flatMap((id) => { const product = products.find((item) => item.id === id); return product ? [product] : []; });
  return <section className="store-section store-collections" id="collections">
    <header className="store-section-heading"><div><span><StoreCopy value={{ en: 'United Olympics Sports', ar: 'يونايتد أوليمبيكس سبورت' }} inline /></span><h2><StoreCopy value={{ en: 'Find your collection', ar: 'اكتشف مجموعتك' }} /></h2></div><Link to="/store/categories">{locale === 'ar' ? 'كل الفئات' : 'All categories'}<ArrowRight /></Link></header>
    <div className="store-collection-tabs" role="group" aria-label="Collections | المجموعات">{collections.map((item) => <button key={item.slug} type="button" aria-pressed={item.slug === collection.slug} onClick={() => setSelected(item.slug)}>{item.name[locale]}</button>)}</div>
    <div className="store-collection-layout"><Link className="store-collection-story" to={`/store/category/${collection.category}`}>{collection.campaignMedia && <img src={collection.campaignMedia} alt="" loading="lazy" />}<div><small>{locale === 'ar' ? 'اكتشف التشكيلة' : 'EXPLORE THE EDIT'}<ArrowRight /></small><h3><StoreCopy value={collection.name} /></h3><p><StoreCopy value={collection.description} /></p></div></Link><div className="store-collection-products">{items.slice(0, 3).map((product) => <ProductCard product={product} key={product.id} />)}{!items.length && <div className="store-collection-empty"><ShoppingCopy /></div>}</div></div>
  </section>;
}

function ShoppingCopy() { return <><h3><StoreCopy value={{ en: 'The next chapter is taking shape', ar: 'التشكيلة القادمة قيد الإعداد' }} /></h3><p><StoreCopy value={{ en: 'Products and pricing will appear when the catalog is connected.', ar: 'ستظهر المنتجات والأسعار عند ربط الكتالوج.' }} /></p></>; }
