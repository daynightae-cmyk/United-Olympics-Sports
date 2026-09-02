import { ArrowRight, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const demoSubscriptions = [
  { id: 'sub-demo-001', playerId: 'player-demo-001', plan: { en: 'Foundation Football', ar: 'أساس كرة القدم' }, amount: 450, currency: 'AED', status: 'active' as const },
  { id: 'sub-demo-002', playerId: 'player-demo-003', plan: { en: 'Progressive Swimming', ar: 'سباحة متقدمة' }, amount: 600, currency: 'AED', status: 'pending' as const },
];

export function AdminSubscriptionsPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Finance', 'المالية')}
      title={bi('Subscriptions', 'الاشتراكات')}
      description={bi('Subscription plans and memberships preview.', 'معاينة خطط الاشتراكات والعضويات.')}
    />
    <div className="admin-table-preview">
      <table>
        <thead><tr><th><BilingualText value={bi('Subscription', 'الاشتراك')} /></th><th><BilingualText value={bi('Player', 'اللاعب')} /></th><th><BilingualText value={bi('Plan', 'الخطة')} /></th><th><BilingualText value={bi('Amount', 'المبلغ')} /></th><th><BilingualText value={bi('Status', 'الحالة')} /></th></tr></thead>
        <tbody>
          {demoSubscriptions.map(s => (
            <tr key={s.id}>
              <td><Link to={`/admin/subscriptions/${s.id}`} className="admin-link-button"><BilingualText value={{ en: s.id, ar: s.id }} /><ArrowRight size={14} /></Link></td>
              <td>{s.playerId}</td>
              <td><BilingualText value={s.plan} /></td>
              <td><span className="mono">{s.amount} {s.currency}</span></td>
              <td><StatusBadge active={s.status === 'active'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>;
}
