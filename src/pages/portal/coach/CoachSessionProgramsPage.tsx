import { Target } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalPreviewCard, PortalStatus } from '../../../components/portal/PortalUI';
import { useCoachPortalGatewayData } from '../../../portals/coach/useCoachPortalGatewayData';

export function CoachSessionProgramsPage() {
  const { programs, sports, loading, error } = useCoachPortalGatewayData();

  if (loading) return <div className="admin-page"><div className="ui-skeleton" role="status"><span><BilingualText value={bi('Loading programs…', 'جارٍ تحميل البرامج…')} /></span><i /><i /><i /></div></div>;
  if (error) return <div className="admin-page"><div className="enterprise-empty"><Target size={24} /><h3><BilingualText value={bi('Programs unavailable', 'البرامج غير متاحة')} /></h3><p><BilingualText value={bi('The current data provider could not supply assigned programs.', 'تعذر على مصدر البيانات الحالي توفير البرامج المكلف بها.')} /></p></div></div>;

  return (
    <div className="admin-page">
      <PageHeader
        icon={Target}
        eyebrow={bi('Coach Portal · Programs', 'بوابة المدرب · البرامج')}
        title={bi('Assigned Programs', 'البرامج المكلف بها')}
        description={bi('Programs are derived only from program IDs attached to the active coach groups.', 'يتم اشتقاق البرامج فقط من معرفات البرامج المرتبطة بمجموعات المدرب النشط.')}
        actions={<PreviewNotice />}
      />
      {programs.length ? (
        <div className="portal-card-grid">
          {programs.map((program) => (
            <article className="portal-card" key={program.id}>
              <span className="portal-card-icon"><Target size={18} /></span>
              <h3><BilingualText value={program.name} /></h3>
              <p><BilingualText value={program.description} /></p>
              <p><BilingualText value={sports.find((sport) => sport.id === program.sportId)?.name ?? bi('Sport unavailable', 'الرياضة غير متاحة')} /> · <BilingualText value={program.level} /></p>
              <PortalStatus label={program.status === 'active' ? bi('Active provider program', 'برنامج نشط من مصدر البيانات') : bi('Inactive provider program', 'برنامج غير نشط من مصدر البيانات')} tone={program.status === 'active' ? 'active' : 'neutral'} />
            </article>
          ))}
        </div>
      ) : (
        <div className="enterprise-empty"><Target size={26} /><h3><BilingualText value={bi('No assigned programs', 'لا توجد برامج مكلف بها')} /></h3><p><BilingualText value={bi('The active coach groups do not reference a program in the provider records.', 'مجموعات المدرب النشط لا تشير إلى برنامج ضمن سجلات مصدر البيانات.')} /></p></div>
      )}
      <PortalPreviewCard title={bi('Program scope boundary', 'حدود نطاق البرامج')} description={bi('No organization-wide programs are exposed unless they are connected to the active coach groups.', 'لا يتم عرض برامج المؤسسة بالكامل ما لم تكن مرتبطة بمجموعات المدرب النشط.')} />
    </div>
  );
}
