import { Trophy, Award } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';

export function PlayerPortalAchievementsPage() {
  const player = demoPlayers[0];
  const achievements = player.achievements ?? [];
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Achievements', 'بوابة اللاعب | الإنجازات')}
        title={bi('Achievements', 'الإنجازات')}
        description={bi('Truthful achievement preview with empty-state readiness.', 'معاينة إنجازات صادقة مع جاهزية حالة فارغة.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section aria-label="Achievements list" style={{ display: 'grid', gap: 10 }}>
        {achievements.length ? achievements.map((a, i) => (
          <div key={i} className="player-preview-grid" style={{ padding: 16 }}>
            <Award size={20} style={{ color: '#d4b23a', marginBottom: 8 }} />
            <strong><BilingualText value={a} /></strong>
          </div>
        )) : (
          <div className="admin-preview-card" style={{ padding: 18 }}>
            <Trophy size={24} style={{ color: '#d4b23a', marginBottom: 10 }} />
            <h3><BilingualText value={bi('No verified achievements yet', 'لا توجد إنجازات موثقة بعد')} /></h3>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <BilingualText value={bi('Verified achievements will appear once coaching assessments are completed.', 'ستظهر الإنجازات الموثقة بمجرد إكمال التقييمات التدريبية.')} />
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
