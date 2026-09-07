import { ArrowLeft, Banknote, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeletePayment, usePayment, usePlayer, useSubscription, useUpdatePayment } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseStatus, PreviewNotice } from '../../components/enterprise/EnterpriseUI';

const statusLabel = (status: string) => bi(status, status === 'completed' ? 'مكتمل' : status === 'pending' ? 'قيد الانتظار' : status === 'failed' ? 'فشل' : 'مسترد');
const statusTone = (status: string): 'active' | 'warning' | 'danger' | 'neutral' => status === 'completed' ? 'active' : status === 'pending' ? 'warning' : status === 'failed' ? 'danger' : 'neutral';

export function AdminPaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { item: payment, loading, error } = usePayment(paymentId);
  const { item: player } = usePlayer(payment?.playerId);
  const { item: subscription } = useSubscription(payment?.subscriptionId);
  const { update, loading: updateLoading } = useUpdatePayment();
  const { delete: deletePayment, loading: deleteLoading } = useDeletePayment();

  if (loading) return <FuturePanel title={bi('Loading payment', 'جارٍ تحميل الدفعة')} description={bi('Reading the finance record from the Admin data gateway.', 'جارٍ قراءة السجل المالي من بوابة بيانات الإدارة.')} />;
  if (error || !payment) return <FuturePanel title={bi('Payment not found', 'الدفعة غير موجودة')} description={bi('The requested payment is not available in the current provider.', 'الدفعة المطلوبة غير متاحة في موفر البيانات الحالي.')} />;

  const busy = updateLoading || deleteLoading;
  const setStatus = async (status: 'completed' | 'pending' | 'failed' | 'refunded') => { await update(payment.id, { status }); };
  const remove = async () => { if (busy) return; await deletePayment(payment.id); navigate('/admin/payments'); };

  return <div className="admin-page">
    <Link to="/admin/payments" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Payments', 'العودة للمدفوعات')} /></Link>
    <PageHeader
      eyebrow={bi('Finance', 'المالية')}
      title={bi('Payment', 'الدفعة')}
      description={bi(payment.id, payment.id)}
      actions={<div className="admin-header-actions"><PreviewNotice /><EnterpriseStatus label={statusLabel(payment.status)} tone={statusTone(payment.status)} /><button type="button" className="admin-danger-button" disabled={busy} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>}
    />

    <div className="admin-detail-grid">
      <section className="admin-detail-card"><h3><Banknote size={18} /> <BilingualText value={bi('Transaction', 'المعاملة')} /></h3>
        <p><strong><BilingualText value={bi('Payment ID', 'معرف الدفعة')} /></strong> <code>{payment.id}</code></p>
        <p><strong><BilingualText value={bi('Subscription', 'الاشتراك')} /></strong> {subscription ? <Link to={`/admin/subscriptions/${subscription.id}`}><BilingualText value={subscription.plan} /></Link> : payment.subscriptionId}</p>
        <p><strong><BilingualText value={bi('Player', 'اللاعب')} /></strong> {player ? <Link to={`/admin/players/${player.id}`}><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></Link> : payment.playerId}</p>
        <p><strong><BilingualText value={bi('Amount', 'المبلغ')} /></strong> <span className="mono">{payment.amount} {payment.currency}</span></p>
        <p><strong><BilingualText value={bi('Paid At', 'تاريخ الدفع')} /></strong> {payment.paidAt}</p>
        <p><strong><BilingualText value={bi('Method', 'الطريقة')} /></strong> <BilingualText value={payment.method} /></p>
        <p><strong><BilingualText value={bi('Reference', 'المرجع')} /></strong> {payment.reference ?? '—'}</p>
      </section>

      <section className="admin-detail-card"><h3><Banknote size={18} /> <BilingualText value={bi('Status Control', 'التحكم بالحالة')} /></h3><div className="admin-form-actions">{(['pending','completed','failed','refunded'] as const).map(value => <button key={value} type="button" className={payment.status === value ? 'admin-primary-button' : 'admin-secondary-button'} disabled={busy} onClick={() => void setStatus(value)}><BilingualText value={statusLabel(value)} /></button>)}</div><p><BilingualText value={bi('Changing Preview status does not contact a bank or payment processor.', 'تغيير حالة المعاينة لا يتصل ببنك أو معالج دفع.')} /></p></section>
    </div>
  </div>;
}
