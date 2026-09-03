import { TrendingUp } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoPlayers } from '../../data/demo/players';

export function AdminPerformancePage() {
  return <div className="admin-page">
    <PageHeader
      eyebrow={bi('Training Operations', 'العمليات التدريبية')}
      title={bi('Performance', 'الأداء')}
      description={bi('Player performance metrics preview.', 'معاينة مقاييس أداء اللاعبين.')}
    />
    <section className="player-filter-bar" aria-label="Performance filters | فلاتر الأداء">
      <label className="filter-search"><span className="sr-only">Search performance</span><input placeholder="Search players... | البحث عن اللاعبين..." /></label>
    </section>
    <div className="admin-grid-cards">
      {demoPlayers.slice(0, 4).map(p => (
        <article key={p.id} className="admin-preview-card">
          <h3><TrendingUp size={16} /> <BilingualText value={{ en: p.nameEn, ar: p.nameAr }} /></h3>
          <p><BilingualText value={bi('Performance records', 'سجلات الأداء')} />: {p.performanceHistory.length}</p>
        </article>
      ))}
    </div>
  </div>;
}
