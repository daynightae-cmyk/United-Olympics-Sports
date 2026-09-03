import { ArrowLeft, ArrowRight, ClipboardCheck, UserRound, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useRegistration, useUpdateRegistration } from '../../admin/data/adminHooks';
import { demoPlayers } from '../../data/demo/players';
import { demoPrograms } from '../../data/demo/programs';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';

export function AdminRegistrationsDetailPage() {
  const { registrationId } = useParams();
  const { item: registration, loading, error, refetch } = useRegistration(registrationId);
  const { update, loading: updateLoading } = useUpdateRegistration();

  if (loading) return <div className="admin-page"><PageHeader icon={ClipboardCheck} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Registration Detail', 'تفاصيل التسجيل')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !registration) return <div className="admin-page"><PageHeader icon={ClipboardCheck} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Registration not found', 'التسجيل غير موجود')} description={bi('Choose a valid registration from the Registrations directory.', 'اختر تسجيلاً صالحاً من دليل التسجيلات.')} /></div>;

  const player = demoPlayers.find(p => p.id === registration.playerId);
  const program = demoPrograms.find(p => p.id === registration.programId);
  const group = registration.groupId ? demoTrainingGroups.find(g => g.id === registration.groupId) : null;

  return <div className="admin-page">
    <PageHeader
      icon={ClipboardCheck}
      eyebrow={bi('Training Operations', 'عمليات التدريب')}
      title={bi('Registration Detail', 'تفاصيل التسجيل')}
      description={bi(`Registration ${registration.id}`, `التسجيل ${registration.id}`)}
      actions={<Link to="/admin/registrations" className="admin-secondary-button"><ArrowLeft /><BilingualText value={bi('Back to Registrations', 'العودة للتسجيلات')} /></Link>}
    />
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Registration Information', 'معلومات التسجيل')} /><ClipboardCheck /></div>
      <dl className="detail-list">
        <div><dt><BilingualText value={bi('Registration ID', 'رقم التسجيل')} /></dt><dd><code>{registration.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Player', 'اللاعب')} /></dt><dd>{player && <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />}</dd></div>
        <div><dt><BilingualText value={bi('Program', 'البرنامج')} /></dt><dd>{program && <BilingualText value={program.name} />}</dd></div>
        <div><dt><BilingualText value={bi('Group', 'المجموعة')} /></dt><dd>{group ? <BilingualText value={group.name} /> : <BilingualText value={bi('Not assigned', 'غير معين')} />}</dd></div>
        <div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={registration.status === 'confirmed'} /></dd></div>
        <div><dt><BilingualText value={bi('Requested At', 'تاريخ الطلب')} /></dt><dd>{new Date(registration.requestedAt).toLocaleDateString()}</dd></div>
        <div><dt><BilingualText value={bi('Confirmed At', 'تاريخ التأكيد')} /></dt><dd>{registration.confirmedAt ? new Date(registration.confirmedAt).toLocaleDateString() : <BilingualText value={bi('Not confirmed', 'غير مؤكد')} />}</dd></div>
      </dl>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Actions', 'الإجراءات')} /><ShieldCheck /></div>
      <div className="preview-form-grid">
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={registration.status} onChange={(e) => update(registration.id!, { status: e.target.value as any })}><option value="pending">Pending | قيد الانتظار</option><option value="confirmed">Confirmed | مؤكد</option><option value="cancelled">Cancelled | ملغي</option><option value="waitlisted">Waitlisted | في قائمة الانتظار</option></select></label>
      </div>
      <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p>
    </section>
  </div>;
}