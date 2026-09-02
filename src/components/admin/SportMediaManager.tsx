import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue, SportMediaAsset } from '../../domain/contracts';
import '../../styles/admin-media.css';

const usageLabels: Record<SportMediaAsset['usage'], ReturnType<typeof bi>> = {
  hero: bi('Hero', 'رئيسية'),
  'coach-child': bi('Coach + Child', 'مدرب + طفل'),
  children: bi('Children', 'أطفال'),
  youth: bi('Youth', 'ناشئون'),
  'youth-boys': bi('Youth Boys', 'ناشئون / أولاد'),
  'youth-girls': bi('Youth Girls', 'ناشئات / بنات'),
  women: bi('Women', 'نساء'),
  training: bi('Training', 'تدريب'),
  technique: bi('Technique', 'تقنية'),
  underwater: bi('Underwater', 'تحت الماء'),
  teamwork: bi('Teamwork', 'عمل جماعي'),
  coaching: bi('Coaching', 'توجيه المدرب'),
  group: bi('Group', 'جماعي'),
  match: bi('Match', 'مباراة'),
  goalkeeper: bi('Goalkeeper', 'حارس مرمى'),
  brand: bi('Brand', 'هوية بصرية'),
  performance: bi('Performance', 'أداء'),
  gallery: bi('Gallery', 'معرض'),
};

export function SportMediaManager({ assets, sportName }: { assets: SportMediaAsset[]; sportName: BilingualValue }) {
  const ordered = [...assets].sort((a, b) => a.order - b.order);
  const title = bi(`${sportName.en} Media`, `وسائط ${sportName.ar}`);

  return (
    <div className="sport-media-manager admin-panel">
      <div className="sport-media-heading">
        <div>
          <BilingualText value={title} className="admin-eyebrow" />
          <h2><BilingualText value={bi('Verified user media collection', 'مجموعة وسائط معتمدة من المستخدم')} /></h2>
          <p><BilingualText value={bi('Read-only Phase 1 media manager. Public sport pages and Admin use the same typed source of truth, with local rendering paths and original provenance kept together.', 'مدير وسائط للقراءة فقط في المرحلة الأولى. تستخدم صفحات الرياضات العامة والإدارة نفس المصدر الموحّد، مع حفظ مسار العرض المحلي ومرجع المصدر الأصلي معًا.')} /></p>
        </div>
        <span className="sport-media-count">{ordered.length}</span>
      </div>

      <div className="sport-media-table" role="table" aria-label={`${sportName.en} media | وسائط ${sportName.ar}`}>
        <div className="sport-media-row sport-media-header" role="row">
          <strong><BilingualText value={bi('Image Preview', 'معاينة الصورة')} /></strong>
          <strong><BilingualText value={bi('Usage', 'الاستخدام')} /></strong>
          <strong><BilingualText value={bi('Order', 'الترتيب')} /></strong>
          <strong><BilingualText value={bi('Alt Text', 'النص البديل')} /></strong>
          <strong><BilingualText value={bi('Source & Status', 'المصدر والحالة')} /></strong>
        </div>
        {ordered.map(asset => {
          const isLocal = asset.url.startsWith('/');
          return (
            <article className="sport-media-row" role="row" key={asset.id}>
              <div className="sport-media-preview" role="cell">
                <img src={asset.url} alt={`${asset.altEn} | ${asset.altAr}`} width={1648} height={928} loading="lazy" decoding="async" />
              </div>
              <div className="sport-media-usage" role="cell"><BilingualText value={usageLabels[asset.usage]} /><code>{asset.usage}</code></div>
              <div className="sport-media-order" role="cell">{String(asset.order).padStart(2, '0')}</div>
              <div className="sport-media-alt" role="cell"><span lang="en">{asset.altEn}</span><span lang="ar" dir="rtl">{asset.altAr}</span></div>
              <div className="sport-media-source" role="cell">
                <span className="sport-media-status"><span className="verified-dot" /><BilingualText value={bi('Verified User Asset', 'أصل معتمد من المستخدم')} /></span>
                <span className={isLocal ? 'source-chip local' : 'source-chip remote'}><BilingualText value={isLocal ? bi('Local Asset', 'أصل محلي') : bi('Remote Rendering Source', 'مصدر عرض خارجي')} /></span>
                {asset.sourceUrl && <a href={asset.sourceUrl} target="_blank" rel="noreferrer"><BilingualText value={bi('Original Source', 'المصدر الأصلي')} /></a>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
