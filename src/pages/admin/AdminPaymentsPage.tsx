import { ArrowRight, Banknote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const demoPayments = [
  { id: 'pay-demo-001', subscriptionId: 'sub-demo-001', playerId: 'player-demo-001', amount: 450, currency: 'AED', status: 'completed' as const, paidAt: '2026-08-05', method: { en: 'Card', ar: 'بطاقة' } },
  { id: 'pay-demo-002', subscriptionId: 'sub-demo-002', playerId: 'player-demo-003', amount: 600, currency: 'AED', status: 'pending' as const, paidAt: '-', method: { en: 'Transfer', ar: 'تحويل' } },
];

export function AdminPaymentsPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Finance', 'المالية')}
      title={bi('Payments', 'المدفوعات')}
      description={bi('Payment transactions preview.', 'معاينة معاملات المدفوعات.')}
    />
    <div className="admin-table-preview">
      <table>
        <thead><tr><th><BilingualText value={bi('Payment', 'الدفعة')} /></th><th><BilingualText value={bi('Subscription', 'الاشتراك')} /></th><th><BilingualText value={bi('Amount', 'المبلغ')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th></tr></thead>
        <tbody>
          {demoPayments.map(p => (
            <tr key={p.id}>
              <td><Link to={`/admin/payments/${p.id}`} className="admin-link-button"><BilingualText value={{ en: p.id, ar: p.id }} /><ArrowRight size={14} /></Link></td>
              <td>{p.subscriptionId}</td>
              <td><span className="mono">{p.amount} {p.currency}</span></td>
              <td><StatusBadge active={p.status === 'completed'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}
