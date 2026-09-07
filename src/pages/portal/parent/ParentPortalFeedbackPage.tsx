import { MessageCircle, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty, PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalFeedbackPage() {
  const { parent, children, loading, error } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="enterprise-empty" role="status"><BilingualText value={bi('Loading family context…', 'جارٍ تحميل سياق الأسرة…')} /></div>;
  if (error) return <div className="enterprise-empty" role="alert"><BilingualText value={bi('Family provider unavailable', 'موفر بيانات الأسرة غير متاح')} /></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable', 'ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.', 'سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  return <div className="admin-page">
    <PageHeader
      icon={MessageCircle}
      eyebrow={bi('Parent Portal · Feedback', 'بوابة ولي الأمر · الملاحظات')}
      title={bi('Coach Feedback', 'ملاحظات المدرب')}
      description={bi('A truthful provider boundary for detailed coaching notes.', 'حدود صادقة لموفر البيانات فيما يخص ملاحظات التدريب التفصيلية.')}
      actions={<PreviewNotice />}
    />

    <section className="enterprise-kpi-grid">
      <div className="enterprise-kpi-card"><span className="enterprise-kpi-icon"><UserRound size={18}/></span><div><small><BilingualText value={bi('Linked children', 'الأبناء المرتبطون')} /></small><strong>{children.length}</strong><p><BilingualText value={bi('Current provider relationship', 'علاقة موفر البيانات الحالية')} /></p></div></div>
      <div className="enterprise-kpi-card"><span className="enterprise-kpi-icon"><ShieldCheck size={18}/></span><div><small><BilingualText value={bi('Detailed feedback records', 'سجلات الملاحظات التفصيلية')} /></small><strong>—</strong><p><BilingualText value={bi('Contract not connected', 'العقد غير متصل')} /></p></div></div>
    </section>

    <section className="parent-panel">
      <div className="parent-panel-head"><div><h2><BilingualText value={bi('Provider capability', 'قدرة موفر البيانات')} /></h2><p><BilingualText value={bi('The current shared Admin/Parent gateway exposes player performance summaries but does not expose a coach-feedback entity or timeline.', 'يعرض موفر البيانات المشترك الحالي بين الإدارة وولي الأمر ملخصات أداء اللاعب، لكنه لا يعرض كيانًا أو خطًا زمنيًا لملاحظات المدرب.')} /></p></div></div>
      <div className="parent-truth" style={{ marginTop: 14 }}><ShieldCheck size={13}/><BilingualText value={bi('Fixture coaching notes have been removed from this Parent route. No coach name, note, strength or focus area is fabricated.', 'تمت إزالة ملاحظات التدريب التجريبية الثابتة من هذا المسار. لا يتم اختلاق اسم مدرب أو ملاحظة أو نقاط قوة أو مجالات تركيز.')} /></div>
    </section>

    <EnterpriseEmpty
      title={bi('Detailed coach feedback not connected yet', 'ملاحظات المدرب التفصيلية غير متصلة بعد')}
      description={bi('When a real feedback contract is added to the shared provider, records linked to this family’s athletes can appear here.', 'عند إضافة عقد ملاحظات حقيقي إلى موفر البيانات المشترك، يمكن عرض السجلات المرتبطة بلاعبي هذه الأسرة هنا.')}
    />
  </div>;
}
