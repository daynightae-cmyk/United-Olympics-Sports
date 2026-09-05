import { useId, useState } from 'react';
import { StoreCopy } from '../../StoreCopy';
import { useStore } from '../../StoreContext';
import type { StoreProduct, StoreSizeGuide } from '../../storeTypes';

function Pending({ size = false }: { size?: boolean }) { return <p className="store-policy-pending"><StoreCopy value={size ? { en: 'Sizing information not configured yet', ar: 'بيانات المقاسات غير مهيأة بعد' } : { en: 'Policy not configured yet', ar: 'السياسة غير مهيأة بعد' }} /></p>; }

function SizeGuide({ guide }: { guide?: StoreSizeGuide }) {
  const { locale } = useStore();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fit, setFit] = useState('regular');
  if (!guide) return <Pending size />;
  const matches = height && weight ? guide.rules?.filter((rule) => rule.fit === fit && Number(height) >= rule.heightCm[0] && Number(height) <= rule.heightCm[1] && Number(weight) >= rule.weightKg[0] && Number(weight) <= rule.weightKg[1] && guide.rows.some((row) => row.size === rule.size)) : undefined;
  return <><p><StoreCopy value={guide.instructions} /></p><div className="store-size-table"><table><caption>{locale === 'ar' ? 'دليل مقاسات المنتج' : 'Product size guide'} · {guide.system}</caption><thead><tr><th scope="col">{locale === 'ar' ? 'المقاس' : 'Size'}</th>{guide.columns.map((column) => <th scope="col" key={column.en}>{column[locale]}</th>)}</tr></thead><tbody>{guide.rows.map((row) => <tr key={row.size}><th scope="row">{row.size}</th>{row.measurements.map((value, i) => <td key={i}>{value}</td>)}</tr>)}</tbody></table></div>
    <h3><StoreCopy value={{ en: 'Find your fit', ar: 'اعثر على مقاسك' }} /></h3>{guide.rules?.length ? <div className="store-fit-assistant"><label>{locale === 'ar' ? 'الطول (سم)' : 'Height (cm)'}<input type="number" min="1" value={height} onChange={(event) => setHeight(event.target.value)} /></label><label>{locale === 'ar' ? 'الوزن (كغ)' : 'Weight (kg)'}<input type="number" min="1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label><label>{locale === 'ar' ? 'القصة المفضلة' : 'Preferred fit'}<select value={fit} onChange={(event) => setFit(event.target.value)}><option value="close">{locale === 'ar' ? 'ضيقة' : 'Close'}</option><option value="regular">{locale === 'ar' ? 'عادية' : 'Regular'}</option><option value="relaxed">{locale === 'ar' ? 'واسعة' : 'Relaxed'}</option></select></label><output aria-live="polite">{matches?.length === 1 ? `${locale === 'ar' ? 'مطابقة جدول المنتج' : 'Product guide match'}: ${matches[0].size}` : locale === 'ar' ? 'لا توجد مطابقة محددة من قواعد المنتج' : 'No single match from the product rules'}</output></div> : <p><StoreCopy value={{ en: 'Fit guidance unavailable. Product sizing rules are not configured.', ar: 'إرشادات الملاءمة غير متاحة. قواعد مقاسات المنتج غير مهيأة.' }} /></p>}</>;
}

export function ProductInformation({ product }: { product: StoreProduct }) {
  const { locale } = useStore();
  const [active, setActive] = useState(0);
  const prefix = useId();
  const tabs = [{ en: 'Description', ar: 'الوصف' }, { en: 'Specifications', ar: 'المواصفات' }, { en: 'Materials & care', ar: 'الخامات والعناية' }, { en: 'Size guide', ar: 'دليل المقاسات' }, { en: 'Shipping', ar: 'الشحن' }, { en: 'Returns', ar: 'الإرجاع' }, { en: 'Warranty', ar: 'الضمان' }];
  const details = [{ value: product.materials, name: { en: 'Materials', ar: 'الخامات' } }, { value: product.construction, name: { en: 'Construction', ar: 'التصنيع' } }, { value: product.careInstructions, name: { en: 'Care', ar: 'العناية' } }, { value: product.origin, name: { en: 'Origin', ar: 'المنشأ' } }].filter((item) => item.value);
  return <section className="store-product-tabs"><div role="tablist" aria-label="Product details | تفاصيل المنتج">{tabs.map((label, index) => <button type="button" role="tab" id={`${prefix}-tab-${index}`} aria-controls={`${prefix}-panel`} aria-selected={active === index} tabIndex={active === index ? 0 : -1} className={active === index ? 'is-active' : ''} key={label.en} onClick={() => setActive(index)} onKeyDown={(event) => { let next = index; if (event.key === 'ArrowRight') next = (index + (locale === 'ar' ? -1 : 1) + tabs.length) % tabs.length; else if (event.key === 'ArrowLeft') next = (index + (locale === 'ar' ? 1 : -1) + tabs.length) % tabs.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = tabs.length - 1; else return; event.preventDefault(); setActive(next); document.getElementById(`${prefix}-tab-${next}`)?.focus(); }}>{label[locale]}</button>)}</div>
    <article role="tabpanel" tabIndex={0} id={`${prefix}-panel`} aria-labelledby={`${prefix}-tab-${active}`}><h2>{tabs[active][locale]}</h2>
      {active === 0 && <p><StoreCopy value={product.description} /></p>}
      {active === 1 && (product.specifications?.length ? <dl className="store-specifications">{product.specifications.map((item) => <div key={item.label.en}><dt><StoreCopy value={item.label} /></dt><dd><StoreCopy value={item.value} /></dd></div>)}</dl> : <p><StoreCopy value={{ en: 'Specifications not configured yet', ar: 'المواصفات غير مهيأة بعد' }} /></p>)}
      {active === 2 && <>{details.length || product.technologies?.length ? <div className="store-material-lab">{details.map((item) => <section key={item.name.en}><h3><StoreCopy value={item.name} /></h3><p><StoreCopy value={item.value!} /></p></section>)}{product.technologies?.map((item) => <section key={item.name.en}><h3><StoreCopy value={item.name} /></h3><p><StoreCopy value={item.description} /></p></section>)}</div> : <p><StoreCopy value={{ en: 'Material and care information not configured yet', ar: 'بيانات الخامات والعناية غير مهيأة بعد' }} /></p>}</>}
      {active === 3 && <SizeGuide guide={product.sizeGuide} />}
      {active >= 4 && (() => { const policy = [product.shippingProfile, product.returnPolicy, product.warranty][active - 4]; return policy ? <p><StoreCopy value={policy} /></p> : <Pending />; })()}
    </article>
  </section>;
}
