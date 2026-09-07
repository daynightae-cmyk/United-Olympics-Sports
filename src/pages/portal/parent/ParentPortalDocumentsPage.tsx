import { FileText, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalDocumentsPage() {
  const { parent, children, loading, error } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family context…', 'جارٍ تحميل سياق الأسرة…')} /></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Family provider unavailable', 'موفر بيانات الأسرة غير متاح')} /></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.', 'سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  return <div className="admin-page">
    <PageHeader
      icon={FileText}
      eyebrow={bi('Parent Portal · Documents', 'بوابة ولي الأمر · الوثائق')}
      title={bi('Documents', 'الوثائق')}
      description={bi('Family document center with an explicit storage/provider boundary.', 'مركز وثائق الأسرة مع حدود صريحة للتخزين وموفر البيانات.')}
      actions={<PreviewNotice />}
    />

    <section className="enterprise-kpi-grid">
      <div className="enterprise-kpi-card"><span className="enterprise-kpi-icon"><Users size={18}/></span><div><small><BilingualText value={bi('Linked children', 'الأبناء المرتبطون')} /></small><strong>{children.length}</strong><p><BilingualText value={bi('Provider relationships', 'علاقات موفر البيانات')} /></p></div></div>
      <div className="enterprise-kpi-card"><span className="enterprise-kpi-icon"><FileText size={18}/></span><div><small><BilingualText value={bi('Document records', 'سجلات الوثائق')} /></small><strong>—</strong><p><BilingualText value={bi('Document contract not connected', 'عقد الوثائق غير متصل')} /></p></div></div>
    </section>

    <section className="parent-panel">
      <div className="parent-panel-head"><div><h2><BilingualText value={bi('Storage boundary', 'حدود التخزين')} /></h2><p><BilingualText value={bi('The current shared provider does not expose family document metadata, file storage, signed URLs, upload status or download permissions.', 'لا يعرض موفر البيانات المشترك الحالي بيانات وصفية لوثائق الأسرة أو تخزين الملفات أو الروابط الموقعة أو حالة الرفع أو صلاحيات التنزيل.')} /></p></div></div>
      <div className="parent-truth" style={{ marginTop: 14 }}><ShieldCheck size={13}/><BilingualText value={bi('Fabricated medical certificates, consent forms, file sizes and download buttons have been removed. No document is claimed to exist until a verified document/storage contract provides it.', 'تمت إزالة الشهادات الطبية ونماذج الموافقة وأحجام الملفات وأزرار التنزيل المختلقة. لا يتم الادعاء بوجود أي وثيقة حتى يوفرها عقد وثائق/تخزين موثق.')} /></div>
    </section>

    <EnterpriseEmpty
      title={bi('Document service not connected yet', 'خدمة الوثائق غير متصلة بعد')}
      description={bi('When verified document metadata and storage permissions are connected, family-scoped files can be listed here safely.', 'عند ربط بيانات وصفية موثقة للوثائق وصلاحيات التخزين، يمكن عرض ملفات الأسرة هنا بأمان.')}
    />
  </div>;
}
