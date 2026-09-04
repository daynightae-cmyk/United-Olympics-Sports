import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const demoSubscriptions = [
  { id: 'sub-demo-001', playerId: 'player-demo-001', plan: { en: 'Foundation Football', ar: 'أساس كرة القدم' }, amount: 450, currency: 'AED', status: 'active' as const, startDate: '2026-08-01', endDate: '2027-08-01', branchId: 'branch-workspace-01', programId: 'program-demo-football-foundation' },
  { id: 'sub-demo-002', playerId: 'player-demo-003', plan: { en: 'Progressive Swimming', ar: 'سباحة متقدمة' }, amount: 600, currency: 'AED', status: 'pending' as const, startDate: '2026-09-01', endDate: '2027-09-01', branchId: 'branch-workspace-04', programId: 'program-demo-swimming-progressive' },
];

export function AdminSubscriptionDetailPage() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const sub = demoSubscriptions.find(s => s.id === subscriptionId);
  if (!sub) return <div className="admin-page"><PageHeader eyebrow={bi('Not Found', 'غير موجود')} title={bi('Subscription not found', 'الاشتراك غير موجود')} description={bi('-', '-')} /></div>;
  return <div className="admin-page">
    <Link to="/admin/subscriptions" className="admin-back-link"><ArrowLeft size={16} /><BilingualText value={bi('Back to Subscriptions', 'العودة للاشتراكات')} /></Link>
    <PageHeader eyebrow={bi('Finance', 'المالية')} title={bi('Subscription', 'الاشتراك')} description={bi('Subscription preview — no processing claim.', 'معاينة اشتراك — لا يُدّعى وجود معالجة.')} />
    <div className="preview-badge" style={{ marginBottom: 16 }}><BilingualText value={bi('Preview Data — No live billing gateway', 'بيانات تجريبية — لا يوجد بوابة دفع حقيقية')} /></div>
    <div className="admin-detail-grid">
      <section className="admin-detail-card"><h3><CreditCard size={18} /> <BilingualText value={bi('Plan Details', 'تفاصيل الخطة')} /></h3>
        <p><strong><BilingualText value={bi('Plan', 'الخطة')} /></strong> <BilingualText value={sub.plan} /></p>
        <p><strong><BilingualText value={bi('Amount', 'المبلغ')} /></strong> <span className="mono">{sub.amount} {sub.currency}</span></p>
        <p><strong><BilingualText value={bi('Status', 'الحالة')} /></strong> <span>{sub.status}</span></p>
        <p><strong><BilingualText value={bi('Start', 'البداية')} /></strong> {sub.startDate}</p>
        <p><strong><BilingualText value={bi('End', 'النهاية')} /></strong> {sub.endDate}</p>
        <p><strong><BilingualText value={bi('Branch', 'الفرع')} /></strong> {sub.branchId}</p>
      </section>
    </div>
  </div>;
}
