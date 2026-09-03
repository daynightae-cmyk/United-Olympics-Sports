import { MessageSquareText, UsersRound } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';

export function PlayerPortalFeedbackPage() {
  const player = demoPlayers[0];
  const feedbackCount = player.coachFeedback?.length ?? 0;
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Feedback', 'بوابة اللاعب | الملاحظات')}
        title={bi('Feedback', 'الملاحظات')}
        description={bi('Coach feedback preview with truthful count.', 'معاينة ملاحظات المدربين مع عدد صادق.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section className="admin-stat-grid compact" aria-label="Feedback stats">
        <article className="admin-stat-card">
          <strong>{feedbackCount}</strong>
          <span><MessageSquareText size={14} /><BilingualText value={bi('Feedback Records', 'سجلات الملاحظات')} /></span>
        </article>
      </section>
      <section aria-label="Feedback note">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Feedback records are preview-only. Verified assessments remain deferred to coaching operations.', 'سجلات الملاحظات تجريبية فقط. التقييمات الموثقة مؤجلة إلى عمليات التدريب.')} />
          </p>
        </div>
      </section>
    </div>
  );
}
