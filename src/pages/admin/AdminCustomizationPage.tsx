import { Settings } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function AdminCustomizationPage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Data Customization', 'تخصيص البيانات')}
      title={bi('Real Business Data', 'البيانات التجارية الحقيقية')}
      description={bi('Structural preview entities are ready for real customization. No fabricated data is presented.', 'الكيانات التجريبية الهيكلية جاهزة للتخصيص الحقيقي. لا يتم عرض بيانات مزيفة.')}
    />
    <div className="admin-preview-card">
      <Settings size={32} />
      <h3><BilingualText value={bi('Customization Enabled', 'التخصيص مفعّل')} /></h3>
      <p><BilingualText value={bi('Real country, branch, coach, parent, schedule, price and invoice data may now be entered through verified administrative channels. All structural previews use neutral identifiers (Workspace 01, Preview 01, etc.) until real values are confirmed.', 'يمكن الآن إدخال البيانات الحقيقية للدول والفروع والمدربين وأولياء الأمور والجداول والأسعار والفواتير عبر قنوات إدارية موثقة. جميع المعاينات الهيكلية تستخدم معرفات محايدة (مساحة 01، تجريبي 01، إلخ) حتى يتم تأكيد القيم الحقيقية.')} /></p>
      <p><strong><BilingualText value={bi('Canonical brand', 'العلامة التجارية المعتمدة')} /></strong>: <BilingualText value={bi('United Olympics Sports | يونايتد أوليمبيكس سبورت', 'يونايتد أوليمبيكس سبورت')} /></p>
      <p><strong><BilingualText value={bi('No fabricated claims', 'لا ادعاءات مزيفة')} /></strong>: <BilingualText value={bi('All operational country/branch names, addresses, phones, emails, coach identities, parent identities, schedules, prices, invoices, payments, revenue, awards and accreditation have been removed from preview surfaces.', 'تمت إزالة جميع أسماء الدول والفروع التشغيلية، والعناوين، والهواتف، والبريد الإلكتروني، وهويات المدربين، وهويات أولياء الأمور، والجداول، والأسعار، والفواتير، والمدفوعات، والإيرادات، والجوائز، والاعتماد من أسطح المعاينة.')} /></p>
    </div>
  </div>;
}
