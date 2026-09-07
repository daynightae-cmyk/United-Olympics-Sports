import { ArrowLeft, CreditCard, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBranch, useDeleteSubscription, usePayments, usePlayer, useProgram, useSubscription, useUpdateSubscription } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseStatus, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const statusLabel = (status: string) => bi(status, status === 'active' ? 'نشط' : status === 'pending' ? 'قيد الانتظار' : status === 'expired' ? 'منتهٍ' : 'ملغي');

export function AdminSubscriptionDetailPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const navigate = useNavigate();
  const { item: subscription, loading, error } = useSubscription(subscriptionId);
  const { item: player } = usePlayer(subscription?.playerId);
  const { item: program } = useProgram(subscription?.programId);
  const { item: branch } = useBranch(subscription?.branchId);
  const { data: paymentResult } = usePayments({ page: 1, pageSize: 300 });
  const { update, loading: updateLoading } = useUpdateSubscription();
  const { delete: deleteSubscription, loading: deleteLoading } = useDeleteSubscription();

  if (loading) return <FuturePanel title={bi('Loading subscription', 'جارٍ تحميل الاشتراك')} description={bi('Reading the finance record from the Admin data gateway.', 'جارٍ قراءة السجل المالي من بوابة بيانات الإدارة.')} />;
  if (error || !subscription) return <FuturePanel title={bi('Subscription not found', 'الاشتراك غير موجود')} description={bi('The requested subscription is not available in the current provider.', 'الاشتراك المطلوب غير متاح في موفر البيانات الحالي.')} />;

  const payments = paymentResult.items.filter((payment) => payment.subscriptionId === subscription.id);
  const busy = updateLoading || deleteLoading;
  const deleteBlocked = payments.length > 0;
  const setStatus = async (status: 'active' | 'pending' | 'expired' | 'cancelled') => { await update(subscription.id, { status }); };
  const remove = async () => { if (busy || deleteBlocked) return; await deleteSubscription(subscription.id); navigate('/admin/subscriptions'); };

  return <div className="admin-page">
    <Link to="/admin/subscriptions" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Subscriptions', 'العودة للاشتراكات')} /></Link>
    <PageHeader eyebrow={bi('Finance', 'المالية')} title={subscription.plan} description={bi('Gateway-backed subscription preview. No live billing or renewal action is claimed.', 'معاينة اشتراك مدعومة ببوابة البيانات. لا يتم ادعاء فوترة أو تجديد حي.')} actions={<div className="admin-header-actions"><PreviewNotice /><EnterpriseStatus label={statusLabel(subscription.status)} tone={subscription.status === 'active' ? 'active' : subscription.status === 'pending' ? 'warning' : subscription.status === 'expired' ? 'danger' : 'neutral'} /><button type="button" className="admin-danger-button" disabled={busy || deleteBlocked} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>} />
    {deleteBlocked && <div className="preview-warning" role="status"><BilingualText value={bi('Deletion is protected while payment records reference this subscription.', 'الحذف محمي ما دامت سجلات دفعات تشير إلى هذا الاشتراك.')} /></div>}

    <div className="admin-detail-grid">
      <section className="admin-detail-card"><h3><CreditCard size={18} /> <BilingualText value={bi('Plan Details', 'تفاصيل الخطة')} /></h3><p><strong><BilingualText value={bi('Subscription ID', 'معرف الاشتراك')} /></strong> <code>{subscription.id}</code></p><p><strong><BilingualText value={bi('Player', 'اللاعب')} /></strong> {player ? <Link to={`/admin/players/${player.id}`}><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></Link> : subscription.playerId}</p><p><strong><BilingualText value={bi('Program', 'البرنامج')} /></strong> {program ? <Link to={`/admin/programs/${program.id}`}><BilingualText value={program.name} /></Link> : subscription.programId}</p><p><strong><BilingualText value={bi('Branch', 'الفرع')} /></strong> {branch ? <Link to={`/admin/branches/${branch.id}`}><BilingualText value={branch.name} /></Link> : subscription.branchId}</p><p><strong><BilingualText value={bi('Amount', 'المبلغ')} /></strong> <span className="mono">{subscription.amount} {subscription.currency}</span></p><p><strong><BilingualText value={bi('Start', 'البداية')} /></strong> {subscription.startDate}</p><p><strong><BilingualText value={bi('End', 'النهاية')} /></strong> {subscription.endDate ?? '—'}</p></section>
      <section className="admin-detail-card"><h3><CreditCard size={18} /> <BilingualText value={bi('Status Control', 'التحكم بالحالة')} /></h3><div className="admin-form-actions">{(['pending','active','expired','cancelled'] as const).map((value) => <button key={value} type="button" className={subscription.status === value ? 'admin-primary-button' : 'admin-secondary-button'} disabled={busy} onClick={() => void setStatus(value)}><BilingualText value={statusLabel(value)} /></button>)}</div></section>
      <section className="admin-detail-card"><h3><CreditCard size={18} /> <BilingualText value={bi('Payment Records', 'سجلات الدفعات')} /></h3>{payments.length ? <div className="linked-player-list">{payments.map((payment) => <Link key={payment.id} to={`/admin/payments/${payment.id}`}><span>{payment.id}</span><strong>{payment.amount} {payment.currency}</strong></Link>)}</div> : <p><BilingualText value={bi('No payment records reference this subscription.', 'لا توجد سجلات دفعات تشير إلى هذا الاشتراك.')} /></p>}</section>
    </div>
  </div>;
}
