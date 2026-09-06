import { Target } from 'lucide-react';
import { useMemo } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalPreviewCard, PortalStatus } from '../../../components/portal/PortalUI';
import { demoPrograms } from '../../../data/demo/programs';
import { demoTrainingGroups } from '../../../data/demo/trainingGroups';
import { useCoachSession } from '../../../portals/coach/CoachSessionContext';

export function CoachSessionProgramsPage() {
  const { coach } = useCoachSession();
  const programs = useMemo(() => {
    if (!coach) return [];
    const assignedProgramIds = new Set(
      demoTrainingGroups
        .filter((group) => coach.groupIds.includes(group.id))
        .flatMap((group) => group.programIds),
    );
    return demoPrograms.filter((program) => assignedProgramIds.has(program.id));
  }, [coach]);

  return (
    <div className="admin-page">
      <PageHeader
        icon={Target}
        eyebrow={bi('Coach Portal · Programs', 'بوابة المدرب · البرامج')}
        title={bi('Assigned Programs', 'البرامج المكلف بها')}
        description={bi('Training plans are limited to programs attached to the active coach groups.', 'تقتصر خطط التدريب على البرامج المرتبطة بمجموعات المدرب النشط.')}
        actions={<PreviewNotice />}
      />
      {programs.length ? (
        <div className="portal-card-grid">
          {programs.map((program) => (
            <article className="portal-card" key={program.id}>
              <span className="portal-card-icon"><Target size={18} /></span>
              <h3><BilingualText value={program.name} /></h3>
              <p><BilingualText value={program.focus} /></p>
              <div className="program-pill-list">{program.pillars.map((pillar) => <span key={pillar.en}><BilingualText value={pillar} /></span>)}</div>
              <PortalStatus label={bi('Session-scoped preview', 'معاينة مرتبطة بالجلسة')} tone="neutral" />
            </article>
          ))}
        </div>
      ) : (
        <div className="enterprise-empty"><Target size={26} /><h3><BilingualText value={bi('No assigned programs', 'لا توجد برامج مكلف بها')} /></h3><p><BilingualText value={bi('The active coach groups do not currently reference a program.', 'مجموعات المدرب النشط لا تشير حاليًا إلى برنامج.')} /></p></div>
      )}
      <PortalPreviewCard title={bi('Program plan preview', 'معاينة خطة البرنامج')} description={bi('Program scope is derived only from the active coach assignment and local reference data.', 'يتم اشتقاق نطاق البرامج فقط من تكليف المدرب النشط والبيانات المرجعية المحلية.')} />
    </div>
  );
}
