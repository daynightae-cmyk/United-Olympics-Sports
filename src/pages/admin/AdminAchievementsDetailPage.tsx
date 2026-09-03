import { ArrowLeft, ArrowRight, Medal, Award, UserRound, Calendar, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useAchievement, useUpdateAchievement } from '../../admin/data/adminHooks';
import { demoPlayers } from '../../data/demo/players';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';

export function AdminAchievementsDetailPage() {
  const { achievementId } = useParams();
  const { item: achievement, loading, error, refetch } = useAchievement(achievementId);
  const { update, loading: updateLoading } = useUpdateAchievement();

  if (loading) return <div className="admin-page"><PageHeader icon={Medal} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievement Detail', 'تفاصيل الإنجاز')} description={bi('Loading...', 'جاري التحميل...')} /></div>;
  if (error || !achievement) return <div className="admin-page"><PageHeader icon={Medal} eyebrow={bi('Training Operations', 'عمليات التدريب')} title={bi('Achievement not found', 'الإنجاز غير موجود')} description={bi('Choose a valid achievement from the Achievements directory.', 'اختر إنجازاً صالحاً من دليل الإنجازات.')} /></div>;

  const player = achievement.playerId ? demoPlayers.find(p => p.id === achievement.playerId) : null;
  const group = achievement.groupId ? demoTrainingGroups.find(g => g.id === achievement.groupId) : null;

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
        <label><BilingualText value={bi('Status', 'الحالة')} /><select defaultValue={achievement.status} onChange={(e) => update(achievement.id!, { status: e.target.value as any })}><option value="awarded">Awarded | ممنوح</option><option value="pending">Pending | قيد الانتظار</option><option value="revoked">Revoked | ملغي</option></select></label>
      </div>
      <p className="preview-warning"><BilingualText value={bi('Changes are saved in preview session only.', 'التغييرات محفوظة في جلسة المعاينة فقط.')} /></p>
    </section>
  </div>;
}