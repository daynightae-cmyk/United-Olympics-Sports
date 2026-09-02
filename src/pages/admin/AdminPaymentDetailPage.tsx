import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Banknote } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const demoPayments = [
  { id: 'pay-demo-001', subscriptionId: 'sub-demo-001', playerId: 'player-demo-001', amount: 450, currency: 'AED', status: 'completed' as const, paidAt: '2026-08-05', method: { en: 'Card', ar: 'بطاقة' }, reference: 'REF-001' },
  { id: 'pay-demo-002', subscriptionId: 'sub-demo-002', playerId: 'player-demo-003', amount: 600, currency: 'AED', status: 'pending' as const, paidAt: '-', method: { en: 'Transfer', ar: 'تحويل' }, reference: 'REF-002' },
];

export function AdminPaymentDetailPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const pay = demoPayments.find(p => p.id === paymentId);
  if (!pay) return <div className="admin-page"><PageHeader eyebrow={bi('Not Found', 'غير موجود')} title={bi('Payment not found', 'الدفعة غير موجودة')} description={bi('-', '-')} /></div>;
  return <div className="admin-page">
    <Link to="/admin/payments" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Payments', 'العودة للمدفوعات')} /></Link>
    <PageHeader eyebrow={bi('Finance', 'المالية')} title={bi('Payment', 'الدفعة')} description={bi(pay.id, pay.id)} />
    <div className="admin-detail-grid">
      <section className="admin-detail-card"><h3><Banknote size={18} /> <BilingualText value={bi('Transaction', 'المعاملة')} /></h3>
        <p><strong><BilingualText value={bi('Subscription', 'الاشتراك')} /></strong> {pay.subscriptionId}</p>
        <p><strong><BilingualText value={bi('Player', 'اللاعب')} /></strong> {pay.playerId}</p>
        <p><strong><BilingualText value={bi('Amount', 'المبلغ')} /></strong> <span className="mono">{pay.amount} {pay.currency}</span></p>
        <p><strong><BilingualText value={bi('Status', 'الحالة')} /></strong> {pay.status}</p>
        <p><strong><BilingualText value={bi('Paid At', 'تاريخ الدفع')} /></strong> {pay.paidAt}</p>
        <p><strong><BilingualText value={bi('Method', 'الطريقة')} /></strong> <BilingualText value={pay.method} /></p>
        <p><strong><BilingualText value={bi('Reference', 'المرجع')} /></strong> {pay.reference}</p>
      </section>
    </div>
  </div>;
}
