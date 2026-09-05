import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  Edit3,
  FolderKanban,
  Image,
  Package,
  PackageSearch,
  Plus,
  Search,
  Settings2,
  ShoppingBag,
  Tags,
  Truck,
  UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiEmptyState, UiStatusBadge } from '../../components/ui/UiPrimitives';
import type { StoreCategory, StoreProduct } from '../storeTypes';
import '../../styles/store-commerce.css';

const isPreview = import.meta.env.DEV;

function usePreviewCatalog() {
  const [data, setData] = useState<{ products: StoreProduct[]; categories: StoreCategory[] }>({ products: [], categories: [] });
  useEffect(() => {
    if (!isPreview) return;
    let active = true;
    void import('../storeData.preview').then((module) => {
      if (active) setData({ products: module.previewProducts, categories: module.previewCategories });
    });
    return () => { active = false; };
  }, []);
  return data;
}

function AdminHeading({ eyebrow, title, description, action }: { eyebrow: { en: string; ar: string }; title: { en: string; ar: string }; description: { en: string; ar: string }; action?: ReactNode }) {
  return <header className="store-admin-heading"><div><BilingualText value={eyebrow} className="store-admin-eyebrow" /><h1><BilingualText value={title} /></h1><p><BilingualText value={description} /></p></div>{action}</header>;
}

function TruthBanner() {
  return <div className="store-admin-truth"><AlertTriangle /><BilingualText value={bi('Commerce backend not connected · live orders, revenue, customers and inventory are intentionally unavailable.', 'لم يتم ربط خادم التجارة · الطلبات والإيرادات والعملاء والمخزون الفعلي غير متاحين عمدًا.')} /></div>;
}

function EmptyAdmin({ title, description }: { title: { en: string; ar: string }; description: { en: string; ar: string } }) {
  return <div className="store-admin-empty"><UiEmptyState title={title} description={description} /></div>;
}

export function StoreAdminDashboard() {
  const { products } = usePreviewCatalog();
  const cards = [
    { icon: ClipboardList, label: bi('Total Orders', 'إجمالي الطلبات'), value: '—', note: bi('Source unavailable', 'المصدر غير متاح') },
    { icon: CircleDollarSign, label: bi('Revenue', 'الإيرادات'), value: '—', note: bi('No fabricated totals', 'لا توجد إجماليات مختلقة') },
    { icon: Package, label: bi('Products', 'المنتجات'), value: isPreview ? String(products.length) : '—', note: isPreview ? bi('Development fixtures', 'بيانات تطوير تجريبية') : bi('Source unavailable', 'المصدر غير متاح') },
    { icon: FolderKanban, label: bi('Collections', 'المجموعات'), value: '—', note: bi('Source unavailable', 'المصدر غير متاح') },
    { icon: UsersRound, label: bi('Customers', 'العملاء'), value: '—', note: bi('Auth source unavailable', 'مصدر المصادقة غير متاح') },
  ];
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Store Administration', 'إدارة المتجر')} title={bi('Commerce Dashboard', 'لوحة تحكم التجارة')} description={bi('Operational architecture for the United Olympics Sports store.', 'البنية التشغيلية لمتجر يونايتد أوليمبيكس سبورت.')} action={<Link className="ui-button ui-button-outline" to="/store"><ShoppingBag /><BilingualText value={bi('Open Store', 'فتح المتجر')} /></Link>} /><TruthBanner /><section className="store-admin-kpis">{cards.map(({ icon: Icon, label, value, note }) => <article key={label.en}><div><BilingualText value={label} /><strong>{value}</strong><small><BilingualText value={note} /></small></div><span><Icon /></span></article>)}</section><section className="store-admin-dashboard-grid"><article className="store-admin-panel store-admin-chart"><header><div><h2><BilingualText value={bi('Sales Overview', 'نظرة عامة على المبيعات')} /></h2><p><BilingualText value={bi('Awaiting verified analytics data', 'بانتظار بيانات تحليلات موثقة')} /></p></div><BarChart3 /></header><div className="store-admin-chart-empty"><span /><span /><span /><span /><p><BilingualText value={bi('No live sales series', 'لا توجد سلسلة مبيعات فعلية')} /></p></div></article><article className="store-admin-panel"><header><div><h2><BilingualText value={bi('Orders by Status', 'الطلبات حسب الحالة')} /></h2><p><BilingualText value={bi('No order source connected', 'لا يوجد مصدر طلبات متصل')} /></p></div><ClipboardList /></header><div className="store-admin-donut"><span>—</span></div><ul className="store-admin-status-list"><li><i />Pending <b>—</b></li><li><i />Processing <b>—</b></li><li><i />Shipped <b>—</b></li><li><i />Delivered <b>—</b></li></ul></article><article className="store-admin-panel"><header><div><h2><BilingualText value={bi('Store Status', 'حالة المتجر')} /></h2><p><BilingualText value={bi('Integration readiness', 'جاهزية التكامل')} /></p></div><Settings2 /></header><div className="store-admin-readiness"><span><ShoppingBag />Catalog <UiStatusBadge tone="warning" label={bi('Not Connected', 'غير متصل')} /></span><span><CreditCard />Payments <UiStatusBadge tone="warning" label={bi('Not Connected', 'غير متصل')} /></span><span><Truck />Shipping <UiStatusBadge tone="warning" label={bi('Not Configured', 'غير مهيأ')} /></span><span><CircleDollarSign />Tax <UiStatusBadge tone="warning" label={bi('Not Configured', 'غير مهيأ')} /></span></div></article></section><section className="store-admin-lower"><article className="store-admin-panel"><header><div><h2><BilingualText value={bi('Top Products', 'أفضل المنتجات')} /></h2><p><BilingualText value={bi('Requires completed-order analytics', 'يتطلب تحليلات طلبات مكتملة')} /></p></div></header><EmptyAdmin title={bi('No verified sales ranking', 'لا يوجد ترتيب مبيعات موثق')} description={bi('Rankings remain empty until real order data exists.', 'يظل الترتيب فارغًا حتى تتوفر بيانات طلبات حقيقية.')} /></article><article className="store-admin-panel"><header><div><h2><BilingualText value={bi('Inventory Alerts', 'تنبيهات المخزون')} /></h2><p><BilingualText value={bi('Requires an inventory source', 'يتطلب مصدر مخزون')} /></p></div></header><EmptyAdmin title={bi('No inventory feed', 'لا يوجد تدفق مخزون')} description={bi('No stock status is being claimed.', 'لا يتم ادعاء أي حالة مخزون.')} /></article><article className="store-admin-panel"><header><div><h2><BilingualText value={bi('Recent Activity', 'النشاط الأخير')} /></h2><p><BilingualText value={bi('Requires a commerce audit stream', 'يتطلب سجل تدقيق للتجارة')} /></p></div></header><EmptyAdmin title={bi('No verified activity', 'لا يوجد نشاط موثق')} description={bi('Live customer activity is never fabricated.', 'لا يتم اختلاق نشاط عملاء فعلي.')} /></article></section><section className="store-admin-panel store-admin-table-panel"><header><div><h2><BilingualText value={bi('Recent Orders', 'الطلبات الأخيرة')} /></h2><p><BilingualText value={bi('Order records will appear from the production gateway.', 'ستظهر سجلات الطلبات من بوابة الإنتاج.')} /></p></div><Link to="/admin/store/orders"><BilingualText value={bi('View Orders', 'عرض الطلبات')} /><ChevronRight /></Link></header><EmptyAdmin title={bi('No verified orders', 'لا توجد طلبات موثقة')} description={bi('Connect the order gateway to populate this table.', 'اربط بوابة الطلبات لملء هذا الجدول.')} /></section></div>;
}

function ResourceToolbar({ createTo, createLabel, query = '', onQuery, disabled = onQuery === undefined }: { createTo?: string; createLabel?: { en: string; ar: string }; query?: string; onQuery?: (query: string) => void; disabled?: boolean }) {
  return <div className="store-admin-toolbar"><label><Search /><span className="sr-only">Search | البحث</span><input value={query} onChange={(event) => onQuery?.(event.target.value)} disabled={disabled} placeholder={disabled ? 'Source unavailable | المصدر غير متاح' : 'Search | البحث'} /></label><select disabled={disabled} aria-label="Status filter | تصفية الحالة"><option>All Status | كل الحالات</option><option>Preview | معاينة</option><option>Published | منشور</option></select>{createTo && createLabel && <Link className="ui-button ui-button-primary" to={createTo}><Plus /><BilingualText value={createLabel} /></Link>}</div>;
}

function AdminTable({ children, headers }: { children: ReactNode; headers: Array<{ en: string; ar: string }> }) {
  return <div className="store-admin-table-wrap"><table className="store-admin-table"><thead><tr>{headers.map((header) => <th key={header.en}><BilingualText value={header} /></th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

export function StoreAdminProducts() {
  const { products } = usePreviewCatalog();
  const [query, setQuery] = useState('');
  const filtered = products.filter((product) => `${product.name.en} ${product.name.ar} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Catalog', 'الكتالوج')} title={bi('Products', 'المنتجات')} description={bi('Manage product identity, media, pricing, variants and publishing state.', 'إدارة هوية المنتج والوسائط والأسعار والمتغيرات وحالة النشر.')} /><TruthBanner /><ResourceToolbar query={query} onQuery={setQuery} createTo="/admin/store/products/new" createLabel={bi('Create Product', 'إنشاء منتج')} />{filtered.length ? <AdminTable headers={[bi('Product', 'المنتج'), bi('Category', 'الفئة'), bi('SKU', 'رمز SKU'), bi('Price', 'السعر'), bi('Stock', 'المخزون'), bi('Status', 'الحالة'), bi('Updated', 'التحديث'), bi('Actions', 'الإجراءات')]}>{filtered.map((product) => <tr key={product.id}><td><span className="store-admin-product-cell"><i><Package /></i><span><strong><BilingualText value={product.name} /></strong><small><BilingualText value={bi('Development fixture', 'بيانات تطوير تجريبية')} /></small></span></span></td><td>{product.category}</td><td><code>{product.sku}</code></td><td>{new Intl.NumberFormat('en-AE', { style: 'currency', currency: product.currency }).format(product.price)}</td><td>—</td><td><UiStatusBadge tone="preview" label={bi('Preview', 'معاينة')} /></td><td>—</td><td><Link to={`/admin/store/products/${product.id}`} aria-label={`Edit ${product.name.en} | تعديل ${product.name.ar}`}><Edit3 /></Link></td></tr>)}</AdminTable> : <EmptyAdmin title={bi('No matching verified products', 'لا توجد منتجات موثقة مطابقة')} description={bi('Adjust the search or connect a production product source.', 'عدّل البحث أو اربط مصدر منتجات إنتاجي.')} />}</div>;
}

export function StoreAdminCategories() {
  const { categories } = usePreviewCatalog();
  const [query, setQuery] = useState('');
  const filtered = categories.filter((category) => `${category.name.en} ${category.name.ar} ${category.slug}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Catalog Structure', 'هيكل الكتالوج')} title={bi('Categories', 'الفئات')} description={bi('Organize bilingual sports, types, artwork and display order.', 'تنظيم الرياضات والأنواع والوسائط وترتيب العرض باللغتين.')} /><TruthBanner /><ResourceToolbar query={query} onQuery={setQuery} createTo="/admin/store/categories/new" createLabel={bi('Create Category', 'إنشاء فئة')} />{filtered.length ? <AdminTable headers={[bi('Category', 'الفئة'), bi('Slug', 'المعرّف'), bi('Sport', 'الرياضة'), bi('Artwork', 'الوسائط'), bi('Status', 'الحالة'), bi('Sort Order', 'ترتيب العرض'), bi('Actions', 'الإجراءات')]}>{filtered.map((category, index) => <tr key={category.slug}><td><strong><BilingualText value={category.name} /></strong></td><td><code>{category.slug}</code></td><td>{category.slug}</td><td>{category.hero ? <UiStatusBadge tone="success" label={bi('Local Asset', 'أصل محلي')} /> : <UiStatusBadge tone="warning" label={bi('Pending', 'معلق')} />}</td><td><UiStatusBadge tone="preview" label={bi('Preview', 'معاينة')} /></td><td>{index + 1}</td><td><Link to={`/admin/store/categories/${category.slug}`}><Edit3 /></Link></td></tr>)}</AdminTable> : <EmptyAdmin title={bi('No matching verified categories', 'لا توجد فئات موثقة مطابقة')} description={bi('Adjust the search or connect the catalog gateway.', 'عدّل البحث أو اربط بوابة الكتالوج.')} />}</div>;
}

export function StoreAdminOrders() {
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Operations', 'العمليات')} title={bi('Orders', 'الطلبات')} description={bi('Review fulfillment, payment state, customer and item details.', 'مراجعة التنفيذ وحالة الدفع والعميل وتفاصيل العناصر.')} /><TruthBanner /><ResourceToolbar /><EmptyAdmin title={bi('No verified orders', 'لا توجد طلبات موثقة')} description={bi('Order rows and status controls remain unavailable until the production order gateway and roles are connected.', 'تظل صفوف الطلبات وعناصر التحكم بالحالة غير متاحة حتى ربط بوابة الطلبات وصلاحيات الإنتاج.')} /></div>;
}

export function StoreAdminInventory() {
  const { products } = usePreviewCatalog();
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Operations', 'العمليات')} title={bi('Inventory', 'المخزون')} description={bi('Variant-level availability, reservations and threshold architecture.', 'بنية التوفر والحجز وحدود التنبيه على مستوى المتغيرات.')} /><TruthBanner /><ResourceToolbar />{products.length ? <AdminTable headers={[bi('Product', 'المنتج'), bi('SKU', 'رمز SKU'), bi('Variant', 'المتغير'), bi('Available', 'المتاح'), bi('Reserved', 'المحجوز'), bi('Threshold', 'حد التنبيه'), bi('Status', 'الحالة')]}>{products.map((product) => <tr key={product.id}><td><strong><BilingualText value={product.name} /></strong></td><td><code>{product.sku}</code></td><td>—</td><td>—</td><td>—</td><td>—</td><td><UiStatusBadge tone="warning" label={bi('Not Connected', 'غير متصل')} /></td></tr>)}</AdminTable> : <EmptyAdmin title={bi('No inventory source', 'لا يوجد مصدر مخزون')} description={bi('No available, reserved or low-stock figures are being fabricated.', 'لا يتم اختلاق أرقام المتاح أو المحجوز أو المخزون المنخفض.')} />}</div>;
}

export function StoreAdminCollections() {
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Merchandising', 'الترويج التجاري')} title={bi('Collections', 'المجموعات')} description={bi('Compose artwork, assigned products, publishing state and display order.', 'تنظيم الوسائط والمنتجات المعينة وحالة النشر وترتيب العرض.')} /><TruthBanner /><ResourceToolbar createTo="/admin/store/collections/new" createLabel={bi('Create Collection', 'إنشاء مجموعة')} /><EmptyAdmin title={bi('No verified collections', 'لا توجد مجموعات موثقة')} description={bi('Collections will appear from the commerce source; none are claimed by this preview.', 'ستظهر المجموعات من مصدر التجارة، ولا تدعي هذه المعاينة وجود أي منها.')} /></div>;
}

export function StoreAdminDiscounts() {
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Commercial Rules', 'القواعد التجارية')} title={bi('Discounts', 'الخصومات')} description={bi('Discount controls are gated behind a real discount engine.', 'عناصر تحكم الخصم مشروطة بمحرك خصومات حقيقي.')} /><TruthBanner /><ResourceToolbar /><EmptyAdmin title={bi('Discount engine not available', 'محرك الخصومات غير متاح')} description={bi('No percentage, fixed amount, dates or eligibility rules are active.', 'لا توجد نسبة أو قيمة ثابتة أو تواريخ أو قواعد أهلية نشطة.')} /></div>;
}

export function StoreAdminSettings() {
  const sections = [
    { icon: ShoppingBag, title: bi('Store Information', 'معلومات المتجر'), text: bi('Legal identity and verified contact configuration.', 'الهوية القانونية وإعدادات التواصل الموثقة.') },
    { icon: CircleDollarSign, title: bi('Currency & Tax', 'العملة والضريبة'), text: bi('Requires approved regional commerce configuration.', 'يتطلب إعدادًا تجاريًا إقليميًا معتمدًا.') },
    { icon: Truck, title: bi('Shipping', 'الشحن'), text: bi('No delivery method or free-shipping threshold is configured.', 'لا توجد طريقة توصيل أو حد شحن مجاني مهيأ.') },
    { icon: CreditCard, title: bi('Payment Integration', 'تكامل الدفع'), text: bi('No provider is connected and no raw card data is stored.', 'لا يوجد موفر متصل ولا تُخزن بيانات بطاقة خام.') },
    { icon: Boxes, title: bi('Inventory', 'المخزون'), text: bi('Awaiting a verified inventory endpoint and reservation model.', 'بانتظار نقطة مخزون ونموذج حجز موثقين.') },
    { icon: Settings2, title: bi('Orders & Notifications', 'الطلبات والإشعارات'), text: bi('Requires production workflows and delivery channels.', 'يتطلب سير عمل وقنوات تسليم إنتاجية.') },
  ];
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Configuration', 'الإعداد')} title={bi('Store Settings', 'إعدادات المتجر')} description={bi('Central readiness view for the commerce capabilities.', 'عرض مركزي لجاهزية إمكانات التجارة.')} /><TruthBanner /><div className="store-admin-settings">{sections.map(({ icon: Icon, title, text }) => <article key={title.en}><span><Icon /></span><div><h2><BilingualText value={title} /></h2><p><BilingualText value={text} /></p></div><UiStatusBadge tone="warning" label={bi('Not Configured', 'غير مهيأ')} /></article>)}</div></div>;
}

export function StoreAdminEditor({ type }: { type: 'product' | 'category' | 'collection' }) {
  const { id } = useParams();
  const plural = type === 'product' ? 'products' : type === 'category' ? 'categories' : 'collections';
  const labels = type === 'product' ? bi('Product', 'منتج') : type === 'category' ? bi('Category', 'فئة') : bi('Collection', 'مجموعة');
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Draft Workspace', 'مساحة المسودة')} title={id === 'new' ? bi(`Create ${labels.en}`, `إنشاء ${labels.ar}`) : bi(`Edit ${labels.en}`, `تعديل ${labels.ar}`)} description={bi('The form preserves the intended model without claiming persistence.', 'يحافظ النموذج على بنية البيانات المقصودة دون ادعاء الحفظ.')} /><TruthBanner /><form className="store-admin-editor" onSubmit={(event) => event.preventDefault()}><section><h2><BilingualText value={bi('Bilingual Identity', 'الهوية ثنائية اللغة')} /></h2><div className="store-admin-form-grid"><label>Name EN<input required /></label><label lang="ar" dir="rtl">الاسم بالعربية<input required dir="rtl" /></label><label className="wide">Slug<input required /></label>{type === 'product' && <><label>Description EN<textarea rows={5} /></label><label lang="ar" dir="rtl">الوصف بالعربية<textarea rows={5} dir="rtl" /></label></>}</div></section>{type === 'product' && <><section><h2><BilingualText value={bi('Commerce', 'التجارة')} /></h2><div className="store-admin-form-grid"><label>Category<select><option>Select | اختر</option></select></label><label>Sport<select><option>Select | اختر</option></select></label><label>SKU<input /></label><label>Price<input type="number" min="0" step="0.01" /></label></div></section><section><h2><BilingualText value={bi('Media & Variants', 'الوسائط والمتغيرات')} /></h2><div className="store-admin-upload"><Image /><BilingualText value={bi('Product media manager awaits a persistence gateway.', 'مدير وسائط المنتج بانتظار بوابة حفظ.')} /></div></section></>}<footer><Link className="ui-button ui-button-outline" to={`/admin/store/${plural}`}><BilingualText value={bi('Cancel', 'إلغاء')} /></Link><button className="ui-button ui-button-primary" disabled type="submit"><BilingualText value={bi('Save unavailable', 'الحفظ غير متاح')} /></button></footer></form></div>;
}

export function StoreAdminOrderDetail() {
  const { id } = useParams();
  return <div className="store-admin-page"><AdminHeading eyebrow={bi('Order Detail', 'تفاصيل الطلب')} title={bi(`Order ${id ?? '—'}`, `الطلب ${id ?? '—'}`)} description={bi('A verified order is required to render customer, fulfillment and payment controls.', 'يلزم طلب موثق لعرض عناصر تحكم العميل والتنفيذ والدفع.')} /><TruthBanner /><EmptyAdmin title={bi('Verified order not found', 'لم يتم العثور على طلب موثق')} description={bi('No order details or status timeline were fabricated.', 'لم يتم اختلاق تفاصيل طلب أو خط زمني للحالة.')} /></div>;
}

export function StoreAdminRouter() {
  return <Routes><Route index element={<StoreAdminDashboard />} /><Route path="products" element={<StoreAdminProducts />} /><Route path="products/new" element={<StoreAdminEditor type="product" />} /><Route path="products/:id" element={<StoreAdminEditor type="product" />} /><Route path="categories" element={<StoreAdminCategories />} /><Route path="categories/new" element={<StoreAdminEditor type="category" />} /><Route path="categories/:id" element={<StoreAdminEditor type="category" />} /><Route path="orders" element={<StoreAdminOrders />} /><Route path="orders/:id" element={<StoreAdminOrderDetail />} /><Route path="inventory" element={<StoreAdminInventory />} /><Route path="collections" element={<StoreAdminCollections />} /><Route path="collections/new" element={<StoreAdminEditor type="collection" />} /><Route path="collections/:id" element={<StoreAdminEditor type="collection" />} /><Route path="discounts" element={<StoreAdminDiscounts />} /><Route path="settings" element={<StoreAdminSettings />} /><Route path="*" element={<Navigate to="/admin/store" replace />} /></Routes>;
}
