import { Heart, ShoppingBag, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../StoreContext';
import { ProductGrid, QuantityStepper, StoreState } from '../../StoreComponents';
import { StoreCopy } from '../../StoreCopy';
import { ProductFacts, ProductPrice, ProductVariants } from './ProductCard';
import { ProductGallery } from './ProductGallery';
import { ProductInformation } from './ProductInformation';
import { hasSelectedVariants } from '../../storeUtils';
import type { StoreProduct } from '../../storeTypes';

export function ProductDetailPage() {
  const { slug } = useParams();
  const { products } = useStore();
  const product = products.find((item) => item.slug === slug);
  return product ? <ProductDetail key={product.id} product={product} /> : <div className="store-page-pad"><StoreState kind="unavailable" title={{ en: 'Product unavailable', ar: 'المنتج غير متاح' }} description={{ en: 'This product is not available from the current verified source.', ar: 'هذا المنتج غير متاح من المصدر الموثق الحالي.' }} action={<Link to="/store/shop" className="store-button store-button-primary"><StoreCopy value={{ en: 'Return to shop', ar: 'العودة للمتجر' }} inline /></Link>} /></div>;
}

function ProductDetail({ product }: { product: StoreProduct }) {
  const { products, categories, addToCart, wishlist, toggleWishlist, recordView, locale, isPreview } = useStore();
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  useEffect(() => { recordView(product.id); }, [product.id, recordView]);
  const ready = hasSelectedVariants(product, size, color) && product.availability !== 'unavailable';
  const wished = wishlist.includes(product.id);
  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const add = () => addToCart(product, { size, color, quantity });
  return <div className="store-product-page"><nav className="store-breadcrumb" aria-label="Breadcrumb | مسار التنقل"><Link to="/store">{locale === 'ar' ? 'المتجر' : 'Store'}</Link><ChevronRight /><Link to={`/store/category/${product.category}`}>{categories.find((item) => item.slug === product.category)?.name[locale]}</Link><ChevronRight /><span>{product.name[locale]}</span></nav>
    <section className="store-product-layout"><ProductGallery key={`${product.id}-${color ?? ''}`} product={product} color={color} /><div className="store-product-info"><span className="store-product-eyebrow"><StoreCopy value={product.type} inline /></span><h1><StoreCopy value={product.name} /></h1><ProductPrice product={product} size="l" /><ProductFacts product={product} />{isPreview && <p className="store-selection-hint"><StoreCopy value={{ en: 'Preview product · not available for purchase', ar: 'منتج معاينة · غير متاح للشراء' }} inline /></p>}<p><StoreCopy value={product.description} /></p><ProductVariants product={product} size={size} color={color} onSize={setSize} onColor={setColor} /><p id="store-purchase-hint" className="store-selection-hint">{!ready && <StoreCopy value={{ en: 'Select available size and color options to continue', ar: 'اختر المقاس واللون المتاحين للمتابعة' }} inline />}</p><div className="store-buy-row"><QuantityStepper value={quantity} onChange={setQuantity} /><button type="button" className="store-button store-button-primary" disabled={!ready} aria-describedby="store-purchase-hint" onClick={add}><ShoppingBag /><StoreCopy value={{ en: 'Add to cart', ar: 'أضف إلى السلة' }} inline /></button></div><button type="button" disabled={!ready} className="store-button store-button-secondary" onClick={() => { addToCart(product, { size, color, quantity, openCart: false }); navigate('/store/checkout'); }}><StoreCopy value={{ en: 'Proceed to checkout', ar: 'المتابعة لإتمام الطلب' }} inline /></button><button type="button" className="store-button store-button-wishlist" aria-pressed={wished} onClick={() => toggleWishlist(product.id)}><Heart /><StoreCopy value={wished ? { en: 'Saved to wishlist', ar: 'محفوظ في المفضلة' } : { en: 'Save to wishlist', ar: 'احفظ في المفضلة' }} inline /></button><div className="store-sku"><span>SKU</span><code>{product.sku}</code></div></div></section>
    <ProductInformation product={product} />
    {!!related.length && <section className="store-section"><header className="store-section-heading"><h2><StoreCopy value={{ en: 'Explore the collection', ar: 'استكشف المجموعة' }} /></h2></header><ProductGrid products={related} /></section>}
    <div className="store-mobile-buy"><ProductPrice product={product} /><button type="button" disabled={!ready} aria-describedby="store-purchase-hint" onClick={add}><ShoppingBag /><span>{locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}</span></button></div>
  </div>;
}
