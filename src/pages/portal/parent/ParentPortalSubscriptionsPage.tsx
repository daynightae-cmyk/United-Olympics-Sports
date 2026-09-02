import { CreditCard } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function ParentPortalSubscriptionsPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal | Subscriptions', 'بوابة ولي الأمر | الاشتراكات')} title={bi('Subscriptions', 'الاشتراكات')} description={bi('Parent subscriptions preview.', 'معاينة اشتراكات ولي الأمر.')} /><div className="admin-preview-card"><CreditCard size={32} /><h3><BilingualText value={bi('Parent Subscriptions', 'اشتراكات ولي الأمر')} /></h3></div></div>;
}
