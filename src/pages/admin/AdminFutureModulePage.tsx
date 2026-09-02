import { useLocation } from 'react-router-dom';
import { FuturePanel, PageHeader } from '../../components/admin/AdminUI';
import { bi } from '../../components/bilingual/BilingualText';

const modules: Record<string, { en: string; ar: string }> = {
  groups: bi('Training Groups / Teams', 'الفرق / مجموعات التدريب'), parents: bi('Parents', 'أولياء الأمور'), coaches: bi('Coaches', 'المدربون'), programs: bi('Programs', 'البرامج'), schedules: bi('Schedules', 'الجداول'), attendance: bi('Attendance Center', 'مركز الحضور'), performance: bi('Performance Center', 'مركز الأداء'), countries: bi('Countries', 'الدول'), branches: bi('Branches', 'الفروع'), subscriptions: bi('Subscriptions', 'الاشتراكات'), payments: bi('Payments', 'المدفوعات'), reports: bi('Reports', 'التقارير'), content: bi('Content', 'المحتوى'), users: bi('Users & Roles', 'المستخدمون والصلاحيات'), settings: bi('Settings', 'الإعدادات'),
};

export function AdminFutureModulePage() {
  const segment = useLocation().pathname.split('/').filter(Boolean)[1] ?? 'module'; const title = modules[segment] ?? bi('Admin Module', 'وحدة إدارية');
  return <div className="admin-page"><PageHeader eyebrow={bi('Future Module', 'وحدة مستقبلية')} title={title} description={bi('Navigation is route-safe while deep implementation remains deliberately scheduled for a later mission.', 'التنقل آمن عبر المسارات، بينما يظل التنفيذ العميق مجدولًا عمدًا لمهمة لاحقة.')} /><FuturePanel title={title} /></div>;
}
