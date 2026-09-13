import { ArrowLeft, Medal, Award, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import { useAchievement, useGroup, usePlayer, useUpdateAchievement } from '../../admin/data/adminHooks';

export function AdminAchievementsDetailPage() {
  const { achievementId } = useParams();
  const { mode } = useAdminData();
  const isPreview = mode === 'preview';
  const { item: achievement, loading, error } = useAchievement(achievementId);
  const { update, loading: updateLoading } = useUpdateAchievement();
  const { item: player } = usePlayer(achievement?.playerId);
  const { item: group } = useGroup(achievement?.groupId);

  if (loading) return <div className="admin-page"><PageHeader icon={Medal} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievement Detail', 'تفاصيل الإنجاز')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !achievement) return <div className="admin-page"><PageHeader icon={Medal} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievement not found', 'الإنجاز غير موجود')} description={bi('Choose a valid achievement from the Achievements directory.', 'اختر إنجازاً صالحاً من دليل الإنجازات.')} /></div>;

  return <div className="admin-page">
    <PageHeader
      icon={Medal}
      eyebrow={bi('Training Operations', 'عمليات التدريب')}
      title={bi('Achievement Detail', 'تفاصيل الإنجاز')}
      description={achievement.title}
      actions={<Link to="/admin/achievements" className="admin-secondary-button"><ArrowLeft /><BilingualText value={bi('Back to Achievements', 'العودة للإنجازات')} /></Link>}
    />
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Achievement Information', 'معلومات الإنجاز')} /><Award /></div>
      <dl className="detail-list">
        <div><dt><BilingualText value={bi('Achievement ID', 'رقم الإنجاز')} /></dt><dd><code>{achievement.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Title', 'العنوان')} /></dt><dd><BilingualText value={achievement.title} /></dd></div>
        <div><dt><BilingualText value={bi('Description', 'الوصف')} /></dt><dd><BilingualText value={achievement.description} /></dd></div>
        <div><dt><BilingualText value={bi('Category', 'الفئة')} /></dt><dd><BilingualText value={achievement.category} /></dd></div>
        <div><dt><BilingualText value={bi('Player', 'اللاعب')} /></dt><dd>{player && <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />}</dd></div>
        <div><dt><BilingualText value={bi('Group', 'المجموعة')} /></dt><dd>{group && <BilingualText value={group.name} />}</dd></div>
        <div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={achievement.status === 'awarded'} /></dd></div>
        <div><dt><BilingualText value={bi('Awarded At', 'تاريخ المنح')} /></dt><dd>{new Date(achievement.awardedAt).toLocaleDateString()}</dd></div>
      </dl>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Actions', 'الإجراءات')} /><ShieldCheck /></div>
      <div className="preview-form-grid">
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={achievement.status} disabled={!isPreview || updateLoading} onChange={(e) => update(achievement.id!, { status: e.target.value as any })}><option value="awarded">Awarded | ممنوح</option><option value="pending">Pending | قيد الانتظار</option><option value="revoked">Revoked | ملغي</option></select></label>
      </div>
      {isPreview ? <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p> : <p className="enterprise-result"><BilingualText value={bi('Achievement status is managed by federation curriculums and is read-only in production.', 'حالة الإنجاز تُدار عبر مناهج الاتحادات وهي للقراءة فقط في الإنتاج.')} /></p>}
    </section>
  </div>;
}