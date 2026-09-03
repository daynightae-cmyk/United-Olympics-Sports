import { Activity, TrendingUp } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';

export function PlayerPortalPerformancePage() {
  const player = demoPlayers[0];
  const perf = { sessions: player.performanceHistory?.length ?? 0, avgScore: 0, trend: '—' };
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Performance', 'بوابة اللاعب | الأداء')}
        title={bi('Performance', 'الأداء')}
        description={bi('Sport-aware performance preview with truthful empty states.', 'معاينة أداء واعية بالرياضة مع حالات فارغة صادقة.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section className="admin-stat-grid compact" aria-label="Performance stats">
        <article className="admin-stat-card">
          <strong>{perf.sessions ?? '—'}</strong>
          <span><TrendingUp size={14} /><BilingualText value={bi('Sessions', 'الجلسات')} /></span>
        </article>
        <article className="admin-stat-card">
          <strong>{perf.avgScore ? `${perf.avgScore}/10` : '—'}</strong>
          <span><Activity size={14} /><BilingualText value={bi('Avg Score', 'المعدل')} /></span>
        </article>
      </section>
      <section aria-label="Performance note" style={{ marginTop: 14 }}>
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Performance metrics are preview-only and derived from anonymized records.', 'مؤشرات الأداء تجريبية فقط ومشتقة من سجلات مجهولة.')} />
          </p>
        </div>
      </section>
    </div>
  );
}
