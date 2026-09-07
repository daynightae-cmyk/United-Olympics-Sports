import { AlertCircle, CalendarDays, CheckCircle2, CreditCard, DollarSign, FileText, Plus, RefreshCw, WalletCards, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBranches, useCreatePayment, useCreateSubscription, usePayments, usePlayers, usePrograms, useSubscriptions } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseSelect, EnterpriseStatus, EnterpriseTable, EnterpriseToolbar, ExportMenu, PreviewNotice, RowMenu } from '../../components/enterprise/EnterpriseUI';
import { UiButton, UiPreviewState } from '../../components/ui/UiPrimitives';

const subscriptionTone = (status: string): 'active' | 'warning' | 'danger' | 'neutral' => status === 'active' ? 'active' : status === 'pending' ? 'warning' : status === 'expired' ? 'danger' : 'neutral';
const paymentTone = (status: string): 'active' | 'warning' | 'danger' | 'neutral' => status === 'completed' ? 'active' : status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'neutral';
const subscriptionStatusLabel = (status: string) => bi(status, status === 'active' ? 'نشط' : status === 'pending' ? 'قيد الانتظار' : status === 'expired' ? 'منتهٍ' : 'ملغي');
const paymentStatusLabel = (status: string) => bi(status, status === 'completed' ? 'مكتمل' : status === 'pending' ? 'قيد الانتظار' : status === 'failed' ? 'فشل' : 'مسترد');

const emptySubscription = { playerId: '', programId: '', branchId: '', planEn: '', planAr: '', startDate: '', endDate: '', amount: '', currency: 'AED', status: 'pending' };
const emptyPayment = { subscriptionId: '', amount: '', currency: 'AED', status: 'pending', method: 'card', reference: '', paidAt: '' };

export function AdminSubscriptionsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptySubscription);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading, error } = useSubscriptions({ page: 1, pageSize: 200 });
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 300 });
  const { data: programResult } = usePrograms({ page: 1, pageSize: 200 });
  const { data: branchResult } = useBranches({ page: 1, pageSize: 100 });
  const { create, loading: createLoading } = useCreateSubscription();
  const allSubscriptions = data.items;
  const players = playerResult.items;
  const programs = programResult.items;
  const branches = branchResult.items;
  const playerName = (id: string) => { const player = players.find((item) => item.id === id); return player ? { en: player.nameEn, ar: player.nameAr } : bi(id, id); };
  const programName = (id: string) => programs.find((item) => item.id === id)?.name ?? bi(id, id);
  const branchName = (id: string) => branches.find((item) => item.id === id)?.name ?? bi(id, id);
  const subscriptions = useMemo(() => allSubscriptions.filter((subscription) => `${subscription.id} ${subscription.playerId} ${subscription.plan.en} ${subscription.plan.ar}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || subscription.status === status)), [allSubscriptions, query, status]);
  const active = subscriptions.filter((subscription) => subscription.status === 'active').length;
  const pending = subscriptions.filter((subscription) => subscription.status === 'pending').length;
  const expired = subscriptions.filter((subscription) => subscription.status === 'expired').length;
  const visibleTotal = subscriptions.reduce((sum, subscription) => sum + subscription.amount, 0);
  const setField = (field: keyof typeof emptySubscription, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!draft.playerId || !draft.programId || !draft.branchId || !draft.planEn.trim() || !draft.planAr.trim() || !draft.startDate || !draft.amount || Number(draft.amount) <= 0) {
      setFormError('Player, program, branch, plan, start date and positive amount are required. | اللاعب والبرنامج والفرع والخطة وتاريخ البداية ومبلغ موجب مطلوبة.');
      return;
    }
    setFormError('');
    await create({ playerId: draft.playerId, programId: draft.programId, branchId: draft.branchId, plan: { en: draft.planEn.trim(), ar: draft.planAr.trim() }, status: draft.status as 'active' | 'pending' | 'expired' | 'cancelled', startDate: draft.startDate, endDate: draft.endDate || undefined, amount: Number(draft.amount), currency: draft.currency.trim().toUpperCase() || 'AED' });
    setDraft(emptySubscription); setShowCreate(false); setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={WalletCards} eyebrow={bi('Finance', 'المالية')} title={bi('Subscription Control', 'مركز الاشتراكات')} description={bi('Gateway-backed membership ledger with persistent preview CRUD and no live billing claim.', 'دفتر عضويات مدعوم ببوابة البيانات مع عمليات معاينة مستمرة دون ادعاء فوترة حية.')} actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptySubscription); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Subscription', 'إضافة اشتراك')} /></button></div>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Subscription saved to the browser preview store. No payment processor was contacted.', 'تم حفظ الاشتراك في مخزن المعاينة بالمتصفح. لم يتم الاتصال بأي معالج دفع.')} /></div>}
    {showCreate && <section className="admin-panel" aria-label="Create subscription"><div className="panel-heading"><BilingualText value={bi('Create Subscription', 'إنشاء اشتراك')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div><div className="admin-form-grid">
      <label><BilingualText value={bi('Player', 'اللاعب')} /><select value={draft.playerId} onChange={(e) => setField('playerId', e.target.value)}><option value="">Select player | اختر اللاعب</option>{players.map((player) => <option key={player.id} value={player.id}>{player.nameEn} | {player.nameAr}</option>)}</select></label>
      <label><BilingualText value={bi('Program', 'البرنامج')} /><select value={draft.programId} onChange={(e) => setField('programId', e.target.value)}><option value="">Select program | اختر البرنامج</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name.en} | {program.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Branch', 'الفرع')} /><select value={draft.branchId} onChange={(e) => setField('branchId', e.target.value)}><option value="">Select branch | اختر الفرع</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name.en} | {branch.name.ar}</option>)}</select></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={(e) => setField('status', e.target.value)}>{['pending','active','expired','cancelled'].map((value) => <option key={value} value={value}>{subscriptionStatusLabel(value).en} | {subscriptionStatusLabel(value).ar}</option>)}</select></label>
      <label><BilingualText value={bi('Plan (English)', 'الخطة بالإنجليزية')} /><input value={draft.planEn} onChange={(e) => setField('planEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Plan (Arabic)', 'الخطة بالعربية')} /><input dir="rtl" value={draft.planAr} onChange={(e) => setField('planAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Start Date', 'تاريخ البداية')} /><input type="date" value={draft.startDate} onChange={(e) => setField('startDate', e.target.value)} /></label>
      <label><BilingualText value={bi('End Date (optional)', 'تاريخ النهاية (اختياري)')} /><input type="date" value={draft.endDate} onChange={(e) => setField('endDate', e.target.value)} /></label>
      <label><BilingualText value={bi('Amount', 'المبلغ')} /><input type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => setField('amount', e.target.value)} /></label>
      <label><BilingualText value={bi('Currency', 'العملة')} /><input value={draft.currency} onChange={(e) => setField('currency', e.target.value)} /></label>
    </div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Subscription', 'حفظ الاشتراك')} /></button></div></section>}
    <section className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Active', 'نشط')} value={active} detail={bi('Current plans', 'الخطط الحالية')} icon={CheckCircle2} tone="green" /><EnterpriseKpi label={bi('Pending', 'قيد الانتظار')} value={pending} detail={bi('Needs review', 'تحتاج مراجعة')} icon={RefreshCw} tone="orange" /><EnterpriseKpi label={bi('Expired', 'منتهٍ')} value={expired} detail={bi('Current provider state', 'حالة موفر البيانات')} icon={AlertCircle} tone="blue" /><EnterpriseKpi label={bi('Visible value', 'القيمة الظاهرة')} value={`${visibleTotal.toFixed(2)} AED`} detail={bi('Filtered preview ledger', 'دفتر المعاينة المفلتر')} icon={DollarSign} /></section>
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search plan or player', 'البحث عن الخطة أو اللاعب')} filters={<EnterpriseSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All states', 'كل الحالات') }, ...['active','pending','expired','cancelled'].map((value) => ({ value, label: subscriptionStatusLabel(value) }))]} />} resultCount={bi(`${subscriptions.length} memberships`, `${subscriptions.length} عضوية`)} actions={<ExportMenu filename="subscriptions-preview.csv" headers={['Subscription','Player','Plan','Amount','Status']} rows={subscriptions.map((subscription) => [subscription.id, playerName(subscription.playerId).en, subscription.plan.en, `${subscription.amount} ${subscription.currency}`, subscription.status])} />} />
    {loading && <div className="enterprise-panel"><UiPreviewState title={bi('Loading subscriptions', 'جارٍ تحميل الاشتراكات')} description={bi('Preparing the provider ledger.', 'جارٍ تجهيز دفتر موفر البيانات.')} /></div>}{error && <div className="enterprise-panel"><UiPreviewState title={bi('Subscription ledger unavailable', 'تعذر عرض دفتر الاشتراكات')} description={bi('The Admin gateway returned an error.', 'أعادت بوابة الإدارة خطأً.')} /></div>}
    {!loading && !error && (subscriptions.length ? <><EnterpriseTable caption={bi('Subscription management table', 'جدول إدارة الاشتراكات')}><thead><tr>{[bi('Player','اللاعب'),bi('Plan','الخطة'),bi('Program','البرنامج'),bi('Branch','الفرع'),bi('End','النهاية'),bi('Amount','المبلغ'),bi('Status','الحالة'),bi('Actions','الإجراءات')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{subscriptions.map((subscription) => <tr key={subscription.id}><td><strong><BilingualText value={playerName(subscription.playerId)} /></strong><small>{subscription.id}</small></td><td><BilingualText value={subscription.plan} /></td><td><BilingualText value={programName(subscription.programId)} /></td><td><BilingualText value={branchName(subscription.branchId)} /></td><td>{subscription.endDate ?? '—'}</td><td><strong>{subscription.amount} {subscription.currency}</strong></td><td><EnterpriseStatus label={subscriptionStatusLabel(subscription.status)} tone={subscriptionTone(subscription.status)} /></td><td><RowMenu actions={[{ label: bi('Open subscription','فتح الاشتراك'), onClick: () => navigate(`/admin/subscriptions/${subscription.id}`) }]} /></td></tr>)}</tbody></EnterpriseTable><section className="finance-mobile-cards">{subscriptions.map((subscription) => <article className="enterprise-panel" key={subscription.id}><div className="mobile-finance-head"><div><strong><BilingualText value={playerName(subscription.playerId)} /></strong><small><BilingualText value={subscription.plan} /></small></div><EnterpriseStatus label={subscriptionStatusLabel(subscription.status)} tone={subscriptionTone(subscription.status)} /></div><p>{subscription.amount} {subscription.currency} · {subscription.endDate ?? '—'}</p><Link className="admin-link-button" to={`/admin/subscriptions/${subscription.id}`}><BilingualText value={bi('Open subscription','فتح الاشتراك')} /></Link></article>)}</section></> : <EnterpriseEmpty title={bi('No memberships match','لا تطابق أي عضويات')} description={bi('Reset the search or status filter.','أعد ضبط البحث أو فلتر الحالة.')} action={<UiButton type="button" variant="outline" onClick={() => { setQuery(''); setStatus('all'); }}><BilingualText value={bi('Reset filters','إعادة ضبط الفلاتر')} /></UiButton>} />)}
  </div>;
}

export function AdminPaymentsPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [method, setMethod] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyPayment);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading, error } = usePayments({ page: 1, pageSize: 200 });
  const { data: subscriptionResult } = useSubscriptions({ page: 1, pageSize: 200 });
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreatePayment();
  const allPayments = data.items;
  const subscriptions = subscriptionResult.items;
  const players = playerResult.items;
  const playerName = (id: string) => { const player = players.find((item) => item.id === id); return player ? { en: player.nameEn, ar: player.nameAr } : bi(id, id); };
  const payments = useMemo(() => allPayments.filter((payment) => `${payment.id} ${payment.playerId} ${payment.reference ?? ''}`.toLowerCase().includes(query.toLowerCase()) && (status === 'all' || payment.status === status) && (method === 'all' || payment.method.en.toLowerCase() === method)), [allPayments, query, status, method]);
  const collected = payments.filter((payment) => payment.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pending = payments.filter((payment) => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
  const failed = payments.filter((payment) => payment.status === 'failed').length;
  const setField = (field: keyof typeof emptyPayment, value: string) => setDraft((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    const subscription = subscriptions.find((item) => item.id === draft.subscriptionId);
    if (!subscription || !draft.amount || Number(draft.amount) <= 0 || !draft.paidAt) {
      setFormError('Subscription, positive amount and transaction date are required. | الاشتراك ومبلغ موجب وتاريخ المعاملة مطلوبة.');
      return;
    }
    setFormError('');
    const methodText = draft.method === 'transfer' ? bi('Transfer', 'تحويل') : bi('Card', 'بطاقة');
    await create({ subscriptionId: subscription.id, playerId: subscription.playerId, amount: Number(draft.amount), currency: draft.currency.trim().toUpperCase() || subscription.currency || 'AED', status: draft.status as 'completed' | 'pending' | 'failed' | 'refunded', paidAt: new Date(`${draft.paidAt}T00:00:00`).toISOString(), method: methodText, reference: draft.reference.trim() || undefined });
    setDraft(emptyPayment); setShowCreate(false); setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={CreditCard} eyebrow={bi('Finance', 'المالية')} title={bi('Payment Workspace', 'مساحة المدفوعات')} description={bi('Persistent preview transaction ledger without claiming payment processing or settlement.', 'دفتر معاملات معاينة مستمر دون ادعاء معالجة المدفوعات أو تسويتها.')} actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptyPayment); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Payment Record', 'إضافة سجل دفعة')} /></button></div>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Payment record saved locally. No charge or settlement was executed.', 'تم حفظ سجل الدفعة محليًا. لم يتم تنفيذ خصم أو تسوية.')} /></div>}
    {showCreate && <section className="admin-panel" aria-label="Create payment record"><div className="panel-heading"><BilingualText value={bi('Create Payment Record', 'إنشاء سجل دفعة')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div><div className="admin-form-grid">
      <label><BilingualText value={bi('Subscription', 'الاشتراك')} /><select value={draft.subscriptionId} onChange={(e) => setField('subscriptionId', e.target.value)}><option value="">Select subscription | اختر الاشتراك</option>{subscriptions.map((subscription) => <option key={subscription.id} value={subscription.id}>{subscription.id} · {playerName(subscription.playerId).en}</option>)}</select></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={(e) => setField('status', e.target.value)}>{['pending','completed','failed','refunded'].map((value) => <option key={value} value={value}>{paymentStatusLabel(value).en} | {paymentStatusLabel(value).ar}</option>)}</select></label>
      <label><BilingualText value={bi('Amount', 'المبلغ')} /><input type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => setField('amount', e.target.value)} /></label>
      <label><BilingualText value={bi('Currency', 'العملة')} /><input value={draft.currency} onChange={(e) => setField('currency', e.target.value)} /></label>
      <label><BilingualText value={bi('Method', 'الطريقة')} /><select value={draft.method} onChange={(e) => setField('method', e.target.value)}><option value="card">Card | بطاقة</option><option value="transfer">Transfer | تحويل</option></select></label>
      <label><BilingualText value={bi('Transaction Date', 'تاريخ المعاملة')} /><input type="date" value={draft.paidAt} onChange={(e) => setField('paidAt', e.target.value)} /></label>
      <label><BilingualText value={bi('Reference (optional)', 'المرجع (اختياري)')} /><input value={draft.reference} onChange={(e) => setField('reference', e.target.value)} /></label>
    </div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…','جارٍ الحفظ…') : bi('Save Payment Record','حفظ سجل الدفعة')} /></button></div></section>}
    <section className="enterprise-kpi-grid"><EnterpriseKpi label={bi('Collected','محصل')} value={`${collected.toFixed(2)} AED`} detail={bi('Completed preview rows','صفوف معاينة مكتملة')} icon={CheckCircle2} tone="green" /><EnterpriseKpi label={bi('Pending','قيد الانتظار')} value={`${pending.toFixed(2)} AED`} detail={bi('Requires review','تحتاج إلى مراجعة')} icon={CalendarDays} tone="orange" /><EnterpriseKpi label={bi('Failed','فشل')} value={failed} detail={bi('Preview exceptions','استثناءات المعاينة')} icon={AlertCircle} tone="blue" /><EnterpriseKpi label={bi('Transactions','المعاملات')} value={payments.length} detail={bi('Visible records','السجلات الظاهرة')} icon={FileText} /></section>
    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search payment or player','البحث عن الدفعة أو اللاعب')} filters={<><EnterpriseSelect label={bi('Status','الحالة')} value={status} onChange={setStatus} options={[{ value:'all', label:bi('All states','كل الحالات') }, ...['completed','pending','failed','refunded'].map((value) => ({ value, label: paymentStatusLabel(value) }))]} /><EnterpriseSelect label={bi('Method','الطريقة')} value={method} onChange={setMethod} options={[{ value:'all', label:bi('All methods','كل الطرق') },{ value:'card', label:bi('Card','بطاقة') },{ value:'transfer', label:bi('Transfer','تحويل') }]} /></>} resultCount={bi(`${payments.length} transactions`,`${payments.length} معاملة`)} actions={<ExportMenu filename="payments-preview.csv" headers={['Payment','Player','Amount','Method','Status','Date']} rows={payments.map((payment) => [payment.id, playerName(payment.playerId).en, `${payment.amount} ${payment.currency}`, payment.method.en, payment.status, payment.paidAt])} />} />
    {loading && <div className="enterprise-panel"><UiPreviewState title={bi('Loading payments','جارٍ تحميل المدفوعات')} description={bi('Preparing the preview transaction ledger.','جارٍ تجهيز دفتر المعاملات التجريبي.')} /></div>}{error && <div className="enterprise-panel"><UiPreviewState title={bi('Payment ledger unavailable','تعذر عرض دفتر المدفوعات')} description={bi('The Admin gateway returned an error.','أعادت بوابة الإدارة خطأً.')} /></div>}
    {!loading && !error && (payments.length ? <EnterpriseTable caption={bi('Payment transaction workspace','مساحة معاملات المدفوعات')}><thead><tr>{[bi('Payment','الدفعة'),bi('Player','اللاعب'),bi('Subscription','الاشتراك'),bi('Amount','المبلغ'),bi('Method','الطريقة'),bi('Date','التاريخ'),bi('Status','الحالة'),bi('Actions','الإجراءات')].map((label) => <th key={label.en}><BilingualText value={label} /></th>)}</tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td><strong>{payment.id}</strong><small>{payment.reference ?? bi('No reference','لا يوجد مرجع').en}</small></td><td><BilingualText value={playerName(payment.playerId)} /></td><td><Link to={`/admin/subscriptions/${payment.subscriptionId}`}>{payment.subscriptionId}</Link></td><td><strong>{payment.amount} {payment.currency}</strong></td><td><BilingualText value={payment.method} /></td><td>{payment.paidAt}</td><td><EnterpriseStatus label={paymentStatusLabel(payment.status)} tone={paymentTone(payment.status)} /></td><td><RowMenu actions={[{ label:bi('Open payment','فتح الدفعة'), onClick:() => navigate(`/admin/payments/${payment.id}`) }]} /></td></tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No payments match','لا تطابق أي مدفوعات')} description={bi('Try a different status, method or search term.','جرب حالة أو طريقة أو مصطلح بحث آخر.')} />)}
  </div>;
}
