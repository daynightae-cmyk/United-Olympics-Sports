import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProductMedia } from './ProductCard';
import { useStoreDialog } from '../useStoreDialog';
import { useStore } from '../../StoreContext';
import type { StoreProduct } from '../../storeTypes';

export function ProductGallery({ product, color }: { product: StoreProduct; color?: string }) {
  const { locale, direction } = useStore();
  const variant = product.variantMedia?.find((item) => item.color === color);
  const media = [...new Set([variant?.image, ...(variant?.gallery ?? []), product.image, ...(product.gallery ?? [])].filter((item): item is string => Boolean(item)))];
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  useStoreDialog(fullscreen, panel, () => setFullscreen(false));
  const change = (offset: number) => { if (media.length > 1) setIndex((current) => (current + offset + media.length) % media.length); setZoom(false); };
  const stage = (large: boolean) => <div className={`store-gallery-stage ${large && zoom ? 'is-zoomed' : ''}`} tabIndex={0} role="group" aria-label="Product images | صور المنتج" onKeyDown={(event) => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); change((event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1)); } }} onTouchStart={(event) => { start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={(event) => { if (!start.current || zoom) return; const dx = event.changedTouches[0].clientX - start.current.x; const dy = event.changedTouches[0].clientY - start.current.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) change((dx < 0 ? 1 : -1) * (direction === 'rtl' ? -1 : 1)); start.current = null; }}>
    <ProductMedia product={product} hero source={media[index] ?? media[0]} />
    {media.length > 1 && <><button className="store-gallery-prev" type="button" onClick={() => change(-1)} aria-label="Previous image | الصورة السابقة"><ChevronLeft /></button><button className="store-gallery-next" type="button" onClick={() => change(1)} aria-label="Next image | الصورة التالية"><ChevronRight /></button><output className="store-gallery-count" aria-live="polite">{index + 1} / {media.length}</output></>}
    {!!media.length && <button type="button" className="store-gallery-expand" aria-label={large ? 'Toggle zoom | تبديل التكبير' : 'Fullscreen image | عرض الصورة بملء الشاشة'} onClick={() => large ? setZoom(!zoom) : setFullscreen(true)}>{large ? zoom ? <ZoomOut /> : <ZoomIn /> : <Maximize2 />}</button>}
  </div>;
  return <div className="store-product-gallery">{stage(false)}{media.length > 1 && <div className="store-thumbnails">{media.map((source, i) => <button type="button" key={source} onClick={() => setIndex(i)} aria-pressed={index === i} aria-label={`${locale === 'ar' ? 'صورة المنتج' : 'Product image'} ${i + 1}`} className={index === i ? 'is-active' : ''}><img src={source} loading="lazy" alt="" /></button>)}</div>}{fullscreen && <div className="store-lightbox-layer"><button type="button" className="store-drawer-backdrop" aria-label="Close image viewer | إغلاق عارض الصور" onClick={() => setFullscreen(false)} /><div className="store-lightbox" role="dialog" aria-modal="true" aria-label="Product image viewer | عارض صور المنتج" tabIndex={-1} ref={panel}><button className="store-lightbox-close" type="button" onClick={() => setFullscreen(false)} aria-label="Close image viewer | إغلاق عارض الصور"><X /></button>{stage(true)}</div></div>}</div>;
}
