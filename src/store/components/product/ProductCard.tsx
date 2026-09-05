import { hasSelectedVariants } from '../../storeUtils';
import { Check, Heart, ShoppingBag, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../StoreContext';
import { StoreCopy } from '../../StoreCopy';
import type { StoreProduct } from '../../storeTypes';

export function ProductPrice({ product, size = 'm' }: { product: StoreProduct; size?: 's' | 'm' | 'l' }) {
  const { locale } = useStore();
  const format = (value: number) => new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', { style: 'currency', currency: product.currency }).format(value);
  return <span className="store-price-group"><strong className={`store-price store-price-${size}`}>{format(product.price)}</strong>{product.compareAtPrice != null && <del aria-label={locale === 'ar' ? 'السعر السابق' : 'Previous price'}>{format(product.compareAtPrice)}</del>}</span>;
}

export function ProductMedia({ product, hero = false, source = product.image }: { product: StoreProduct; hero?: boolean; source?: string }) {
  const [loaded, setLoaded] = useState<string>();
  const [failed, setFailed] = useState<string>();
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => { if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) setLoaded(source); }, [source]);
  const showImage = source && failed !== source;
  return <div className={`store-product-media ${hero ? 'is-hero' : ''} ${showImage && loaded !== source ? 'is-loading' : ''}`} aria-busy={Boolean(showImage && loaded !== source)}>
    {showImage ? <img ref={imageRef} src={source} alt={`${product.name.en} | ${product.name.ar}`} loading={hero ? 'eager' : 'lazy'} decoding="async" onLoad={() => setLoaded(source)} onError={() => setFailed(source)} /> : <div className="store-media-fallback" role="img" aria-label={`Image unavailable: ${product.name.en} | الصورة غير متاحة`}><ShoppingBag aria-hidden="true" /><StoreCopy value={{ en: 'Image unavailable', ar: 'الصورة غير متاحة' }} /></div>}
  </div>;
}

export function ProductFacts({ product }: { product: StoreProduct }) {
  const { locale } = useStore();
  const labels = { available: { en: 'Available', ar: 'متاح' }, unavailable: { en: 'Unavailable', ar: 'غير متاح' }, preorder: { en: 'Preorder', ar: 'طلب مسبق' } };
  return <>{product.availability && <span className="store-availability"><StoreCopy value={labels[product.availability]} inline /></span>}{product.rating != null && product.reviewCount != null && <span className="store-product-rating"><Star aria-hidden="true" />{product.rating} <span>({product.reviewCount} {locale === 'ar' ? 'تقييم' : 'reviews'})</span></span>}</>;
}

export function ProductVariants({ product, size, color, onSize, onColor, compact = false }: { product: StoreProduct; size?: string; color?: string; onSize: (size: string) => void; onColor: (color: string) => void; compact?: boolean }) {
  const { locale } = useStore();
  return <div className={`store-variant-picker ${compact ? 'is-compact' : ''}`}>
    {!!product.colors?.length && <fieldset><legend>{locale === 'ar' ? 'اللون' : 'Color'}{color && <span> · {product.colors.find((item) => item.en === color)?.[locale]}</span>}</legend><div className="store-color-options">{product.colors.map((item) => <button key={item.en} type="button" aria-label={`${item.en} | ${item.ar}`} title={item[locale]} aria-pressed={color === item.en} onClick={() => onColor(item.en)} className={color === item.en ? 'is-selected' : ''}>{product.colorSwatches?.[item.en] ? <span className="store-color-dot" style={{ '--swatch': product.colorSwatches[item.en] } as CSSProperties}>{color === item.en && <Check aria-hidden="true" />}</span> : <span>{item[locale]}{color === item.en && ' ✓'}</span>}</button>)}</div></fieldset>}
    {!!product.sizes?.length && <fieldset><legend>{locale === 'ar' ? 'المقاس' : 'Size'}</legend><div className="store-size-options">{product.sizes.map((item) => <button type="button" key={item} aria-pressed={size === item} className={size === item ? 'is-selected' : ''} onClick={() => onSize(item)}>{item}</button>)}</div></fieldset>}
  </div>;
}

export function ProductCard({ product, compact = false }: { product: StoreProduct; compact?: boolean }) {
  const { wishlist, toggleWishlist, addToCart, locale } = useStore();
  const [size, setSize] = useState<string>();
  const [color, setColor] = useState<string>();
  const [added, setAdded] = useState(false);
  const hintId = useId();
  useEffect(() => { if (added) { const timer = setTimeout(() => setAdded(false), 2200); return () => clearTimeout(timer); } }, [added]);
  const wished = wishlist.includes(product.id);
  const ready = hasSelectedVariants(product, size, color) && product.availability !== 'unavailable';
  const source = product.variantMedia?.find((item) => item.color === color)?.image ?? product.image;
  const badges = { preview: { en: 'Preview', ar: 'معاينة' }, new: { en: 'New', ar: 'جديد' }, featured: { en: 'Featured', ar: 'مميز' } };
  return <article className={`store-product-card ${compact ? 'is-compact' : ''}`}>
    <div className="store-product-card-stage"><Link to={`/store/product/${product.slug}`} aria-label={`${product.name.en} | ${product.name.ar}`}><ProductMedia product={product} source={source} /></Link>
      {product.badge && <span className="store-product-badge">{badges[product.badge][locale]}</span>}
      <button type="button" className={`store-card-heart ${wished ? 'is-active' : ''}`} aria-pressed={wished} aria-label={wished ? 'Remove from wishlist | إزالة من المفضلة' : 'Add to wishlist | أضف إلى المفضلة'} onClick={() => toggleWishlist(product.id)}><Heart aria-hidden="true" /></button>
    </div>
    <div className="store-product-card-copy"><StoreCopy value={product.type} className="store-product-type" inline /><h3><Link to={`/store/product/${product.slug}`}><StoreCopy value={product.name} /></Link></h3>
      <ProductFacts product={product} /><ProductVariants product={product} size={size} color={color} onSize={setSize} onColor={setColor} compact />
      <div className="store-product-card-bottom"><ProductPrice product={product} /><button type="button" className={`store-quick-cart ${added ? 'is-added' : ''}`} disabled={!ready} aria-describedby={!ready ? hintId : undefined} onClick={() => { addToCart(product, { size, color, openCart: false }); setAdded(true); }} aria-label={`Quick add ${product.name.en} | إضافة ${product.name.ar}`}>
        {added ? <Check aria-hidden="true" /> : <ShoppingCart aria-hidden="true" />}<span>{locale === 'ar' ? (added ? 'تمت الإضافة' : 'إضافة سريعة') : (added ? 'Added' : 'Quick add')}</span>
      </button></div>
      <small className="store-selection-hint" id={hintId}>{!ready ? (locale === 'ar' ? 'اختر الخيارات المتاحة للمتابعة' : 'Select available options to continue') : '\u00a0'}</small>
      <span className="sr-only" role="status">{added ? `${product.name[locale]} ${locale === 'ar' ? 'تمت إضافته إلى السلة' : 'added to cart'}` : ''}</span>
    </div>
  </article>;
}
