import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Bell, Heart, LogOut, MapPin, Package, RefreshCw, Settings, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAccessToken, signOutEverywhere } from '../../lib/auth-client';
import { fetchWithRuntimeTimeout, withRuntimeTimeout } from '../../lib/runtime-timeout';
import { supabase } from '../../lib/supabase';
import { useStore } from '../StoreContext';
import { ProductGrid, StoreCopy, StoreState } from '../StoreComponents';

const STORE_ACCOUNT_TIMEOUT_MS = 10_000;

type StoreOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  items: unknown[];
  shippingAddress: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type StoreAddress = { id: string; label: string; address: Record<string, unknown> };
type StoreNotification = { id: string; type: 'order'; orderId: string; status: string; createdAt: string };

type StoreAccountSnapshot = {
  profile: {
    uid: string;
    email: string | null;
    provider: string;
    displayName: string | null;
    phone: string | null;
  };
  orders: StoreOrder[];
  addresses: StoreAddress[];
  notifications: StoreNotification[];
};

type StoreAccountContextValue = {
  state: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  account: StoreAccountSnapshot | null;
  error: string | null;
  reload: () => void;
};

const StoreAccountContext = createContext<StoreAccountContextValue | null>(null);

function cleanString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

async function loadStoreAccount(): Promise<StoreAccountSnapshot | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetchWithRuntimeTimeout('/api?route=store-account', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  }, STORE_ACCOUNT_TIMEOUT_MS);
  if (response.status === 401 || response.status === 403) return null;

  const payload = await response.json().catch(() => null) as {
    account?: Omit<StoreAccountSnapshot, 'profile'> & {
      profile: Omit<StoreAccountSnapshot['profile'], 'displayName' | 'phone'>;
    };
    error?: { code?: string };
  } | null;
  if (!response.ok || !payload?.account) throw new Error(payload?.error?.code || `STORE_ACCOUNT_${response.status}`);

  const { data: userResult } = await withRuntimeTimeout(
    'store-account-user',
    supabase.auth.getUser(token),
    STORE_ACCOUNT_TIMEOUT_MS,
  );
  const user = userResult.user;
  const metadata = user?.user_metadata ?? {};
  const displayName = cleanString(metadata.full_name)
    ?? cleanString(metadata.name)
    ?? cleanString(metadata.display_name)
    ?? null;
  const phone = cleanString(user?.phone) ?? cleanString(metadata.phone) ?? null;

  return {
    ...payload.account,
    profile: {
      ...payload.account.profile,
      displayName,
      phone,
    },
  };
}

export function StoreAccountBoundary() {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<StoreAccountContextValue['state']>('loading');
  const [account, setAccount] = useState<StoreAccountSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    setState('loading');
    setError(null);
    void loadStoreAccount()
      .then((nextAccount) => {
        if (!active) return;
        if (!nextAccount) {
          setAccount(null);
          setState('unauthenticated');
          return;
        }
        setAccount(nextAccount);
        setState('authenticated');
      })
      .catch((caught) => {
        if (!active) return;
        setAccount(null);
        setError(caught instanceof Error ? caught.message : 'STORE_ACCOUNT_FAILED');
        setState('error');
      });
    return () => { active = false; };
  }, [revision]);

  const value = useMemo<StoreAccountContextValue>(() => ({
    state,
    account,
    error,
    reload: () => setRevision((current) => current + 1),
  }), [account, error, state]);

  if (state === 'loading') {
    return (
      <div data-route-loading="true" className="store-page-pad" role="status" aria-live="polite" aria-busy="true">
        <StoreState kind="loading" title={{ en: 'Loading your account', ar: 'جارٍ تحميل حسابك' }} description={{ en: 'Verifying your session and customer data.', ar: 'جارٍ التحقق من الجلسة وبيانات العميل.' }} />
      </div>
    );
  }
  if (state === 'unauthenticated') {
    return <Navigate to="/store/login" replace state={{ from: location.pathname }} />;
  }
  if (state === 'error') {
    return (
      <div data-route-terminal="error" className="store-page-pad" role="alert">
        <StoreState
          kind="error"
          title={{ en: 'Account service unavailable', ar: 'خدمة الحساب غير متاحة' }}
          description={{ en: 'The account request reached a safe terminal state. It will not remain loading indefinitely.', ar: 'وصل طلب الحساب إلى حالة نهائية آمنة ولن يظل في التحميل بلا نهاية.' }}
          action={<button type="button" className="store-button store-button-primary" onClick={() => setRevision((current) => current + 1)}><RefreshCw /><StoreCopy value={{ en: 'Retry', ar: 'إعادة المحاولة' }} inline /></button>}
        />
      </div>
    );
  }

  return <StoreAccountContext.Provider value={value}><Outlet /></StoreAccountContext.Provider>;
}

export function useStoreAccount() {
  const context = useContext(StoreAccountContext);
  if (!context) throw new Error('useStoreAccount must be used inside StoreAccountBoundary');
  return context;
}

const accountNav = [
  { to: '/store/account', end: true, icon: UserRound, value: { en: 'Profile', ar: 'الملف الشخصي' } },
  { to: '/store/orders', icon: Package, value: { en: 'My Orders', ar: 'طلباتي' } },
  { to: '/store/wishlist', icon: Heart, value: { en: 'Wishlist', ar: 'المفضلة' } },
  { to: '/store/addresses', icon: MapPin, value: { en: 'Addresses', ar: 'العناوين' } },
  { to: '/store/payment-methods', icon: WalletCards, value: { en: 'Payment Methods', ar: 'طرق الدفع' } },
  { to: '/store/notifications', icon: Bell, value: { en: 'Notifications', ar: 'الإشعارات' } },
  { to: '/store/settings', icon: Settings, value: { en: 'Settings', ar: 'الإعدادات' } },
];

function StoreAccountShell({ title, children }: { title: { en: string; ar: string }; children: ReactNode }) {
  const navigate = useNavigate();
  const { account } = useStoreAccount();
  const logout = useCallback(async () => {
    await signOutEverywhere().catch(() => undefined);
    navigate('/store/login', { replace: true });
  }, [navigate]);

  return (
    <div className="store-account-page">
      <aside className="store-account-sidebar">
        <div><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><h2><StoreCopy value={{ en: 'My Account', ar: 'حسابي' }} /></h2></div>
        <nav>
          {accountNav.map(({ to, end, icon: Icon, value }) => <NavLink key={to} to={to} end={end}><Icon /><StoreCopy value={value} /></NavLink>)}
          <button type="button" onClick={() => void logout()}><LogOut /><StoreCopy value={{ en: 'Logout', ar: 'تسجيل الخروج' }} /></button>
        </nav>
        <section><ShieldCheck /><h3><StoreCopy value={{ en: 'Verified session', ar: 'جلسة موثقة' }} /></h3><p>{account?.profile.email ?? account?.profile.uid}</p><Link to="/contact"><StoreCopy value={{ en: 'Support', ar: 'الدعم' }} inline /></Link></section>
      </aside>
      <main className="store-account-content"><div className="store-page-heading"><span>ACCOUNT</span><h1><StoreCopy value={title} /></h1></div>{children}</main>
    </div>
  );
}

export function ConnectedAccountPage() {
  const { account } = useStoreAccount();
  const profile = account!.profile;
  const name = profile.displayName || profile.email || 'Verified customer';
  return (
    <StoreAccountShell title={{ en: 'Profile', ar: 'الملف الشخصي' }}>
      <div className="store-profile-card">
        <span><UserRound /></span>
        <div>
          <h2>{name}</h2>
          <p>{profile.email || profile.uid}</p>
          {profile.phone ? <p>{profile.phone}</p> : null}
          <small>{profile.provider.toUpperCase()} · verified session</small>
        </div>
        <ShieldCheck aria-label="Verified account" />
      </div>
    </StoreAccountShell>
  );
}

export function ConnectedOrdersPage() {
  const { account } = useStoreAccount();
  const [status, setStatus] = useState('all');
  const tabs = [['all', 'All', 'الكل'], ['pending', 'Pending', 'قيد الانتظار'], ['paid', 'Paid', 'مدفوع'], ['cancelled', 'Cancelled', 'ملغي']];
  const orders = account!.orders.filter((order) => status === 'all' || order.status === status);
  return (
    <StoreAccountShell title={{ en: 'My Orders', ar: 'طلباتي' }}>
      <div className="store-order-tabs" role="tablist">{tabs.map(([id, en, ar]) => <button type="button" role="tab" aria-selected={status === id} className={status === id ? 'is-active' : ''} onClick={() => setStatus(id)} key={id}>{en} <small>{ar}</small></button>)}</div>
      {orders.length ? <div className="store-order-list">{orders.map((order) => <article key={order.id} className="store-profile-card"><Package /><div><h2>{order.orderNumber}</h2><p>{order.status} · {new Intl.NumberFormat('en-AE', { style: 'currency', currency: order.currency }).format(order.totalMinor / 100)}</p><small>{new Date(order.createdAt).toLocaleString()}</small></div></article>)}</div> : <StoreState kind="empty" title={{ en: 'No orders in this status', ar: 'لا توجد طلبات بهذه الحالة' }} description={{ en: 'Only orders belonging to your authenticated account are shown.', ar: 'يتم عرض الطلبات الخاصة بحسابك الموثق فقط.' }} />}
    </StoreAccountShell>
  );
}

function addressText(address: Record<string, unknown>): string {
  return ['address1', 'address', 'street', 'area', 'city', 'country']
    .map((key) => address[key])
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .join(', ');
}

export function ConnectedAddressesPage() {
  const { account } = useStoreAccount();
  return (
    <StoreAccountShell title={{ en: 'Addresses', ar: 'العناوين' }}>
      {account!.addresses.length ? <div className="store-order-list">{account!.addresses.map((item) => <article key={item.id} className="store-profile-card"><MapPin /><div><h2>{item.label}</h2><p>{addressText(item.address) || 'Saved delivery address'}</p></div></article>)}</div> : <StoreState kind="empty" title={{ en: 'No saved delivery addresses yet', ar: 'لا توجد عناوين توصيل محفوظة بعد' }} description={{ en: 'Addresses will appear after an authenticated checkout uses them.', ar: 'ستظهر العناوين بعد استخدامها في طلب موثّق.' }} />}
    </StoreAccountShell>
  );
}

export function ConnectedNotificationsPage() {
  const { account } = useStoreAccount();
  return (
    <StoreAccountShell title={{ en: 'Notifications', ar: 'الإشعارات' }}>
      {account!.notifications.length ? <div className="store-order-list">{account!.notifications.map((item) => <article key={item.id} className="store-profile-card"><Bell /><div><h2><StoreCopy value={{ en: 'Order update', ar: 'تحديث طلب' }} /></h2><p>{item.status}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div></article>)}</div> : <StoreState kind="empty" title={{ en: 'No account notifications yet', ar: 'لا توجد إشعارات للحساب بعد' }} description={{ en: 'Verified order updates will appear here.', ar: 'ستظهر هنا تحديثات الطلبات الموثقة.' }} />}
    </StoreAccountShell>
  );
}

export function ConnectedWishlistPage() {
  const { products, wishlist } = useStore();
  const items = products.filter((product) => wishlist.includes(product.id));
  return (
    <StoreAccountShell title={{ en: 'Wishlist', ar: 'المفضلة' }}>
      {items.length ? <ProductGrid products={items} /> : <StoreState kind="empty" title={{ en: 'Your wishlist is empty', ar: 'قائمة المفضلة فارغة' }} description={{ en: 'Saved products from this authenticated browser session will appear here.', ar: 'ستظهر هنا المنتجات المحفوظة من جلسة المتصفح الموثقة.' }} action={<Link className="store-button store-button-primary" to="/store/shop"><StoreCopy value={{ en: 'Explore Products', ar: 'استكشف المنتجات' }} inline /></Link>} />}
    </StoreAccountShell>
  );
}

export function ConnectedOrderDetailPage() {
  const { account } = useStoreAccount();
  const { id } = useParams();
  const order = account!.orders.find((item) => item.id === id || item.orderNumber === id);
  if (!order) {
    return (
      <StoreAccountShell title={{ en: 'Order Details', ar: 'تفاصيل الطلب' }}>
        <StoreState kind="empty" title={{ en: 'Order not found', ar: 'لم يتم العثور على الطلب' }} description={{ en: `No verified order was found for reference ${id ?? '—'} in this authenticated account.`, ar: `لم يتم العثور على طلب موثق للمرجع ${id ?? '—'} في هذا الحساب الموثق.` }} action={<Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'Back to Orders', ar: 'العودة للطلبات' }} inline /></Link>} />
      </StoreAccountShell>
    );
  }
  const total = new Intl.NumberFormat('en-AE', { style: 'currency', currency: order.currency }).format(order.totalMinor / 100);
  return (
    <StoreAccountShell title={{ en: 'Order Details', ar: 'تفاصيل الطلب' }}>
      <div className="store-profile-card">
        <span><Package /></span>
        <div>
          <h2>{order.orderNumber}</h2>
          <p>{order.status} · {total}</p>
          <small>{new Date(order.createdAt).toLocaleString()}</small>
          <small>{order.items.length} item{order.items.length === 1 ? '' : 's'} · verified against your authenticated account</small>
        </div>
      </div>
      <p><Link className="store-button store-button-secondary" to="/store/orders"><StoreCopy value={{ en: 'Back to Orders', ar: 'العودة للطلبات' }} inline /></Link></p>
    </StoreAccountShell>
  );
}

export function ConnectedPaymentMethodsPage() {
  return (
    <StoreAccountShell title={{ en: 'Payment Methods', ar: 'طرق الدفع' }}>
      <StoreState kind="empty" title={{ en: 'No saved payment methods', ar: 'لا توجد طرق دفع محفوظة' }} description={{ en: 'A tokenized payment provider must be connected before saved methods can appear.', ar: 'يجب ربط موفر دفع يعتمد الرموز قبل ظهور طرق الدفع المحفوظة.' }} />
      <p className="store-security-note"><ShieldCheck /><StoreCopy value={{ en: 'Raw card numbers are never stored by this interface.', ar: 'لا تخزن هذه الواجهة أرقام البطاقات الخام مطلقًا.' }} inline /></p>
    </StoreAccountShell>
  );
}

export function ConnectedSettingsPage() {
  const { locale, setLocale } = useStore();
  return (
    <StoreAccountShell title={{ en: 'Settings', ar: 'الإعدادات' }}>
      <div className="store-settings-grid">
        <section>
          <h2><StoreCopy value={{ en: 'Language', ar: 'اللغة' }} /></h2>
          <div className="store-setting-choice">
            <button type="button" className={locale === 'en' ? 'is-active' : ''} onClick={() => setLocale('en')}>English</button>
            <button type="button" className={locale === 'ar' ? 'is-active' : ''} onClick={() => setLocale('ar')}>العربية</button>
          </div>
        </section>
        <section>
          <h2><StoreCopy value={{ en: 'Theme', ar: 'المظهر' }} /></h2>
          <p><StoreCopy value={{ en: 'Use the theme control in the header to choose light, dark or system mode.', ar: 'استخدم أداة المظهر في رأس الصفحة لاختيار الفاتح أو الداكن أو النظام.' }} /></p>
        </section>
      </div>
    </StoreAccountShell>
  );
}
