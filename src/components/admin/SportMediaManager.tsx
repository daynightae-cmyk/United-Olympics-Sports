import { BilingualText, bi } from '../bilingual/BilingualText';
import type { SportMediaAsset } from '../../domain/contracts';
import '../../styles/admin-media.css';

const usageLabels: Record<SportMediaAsset['usage'], ReturnType<typeof bi>> = {
  hero: bi('Hero', 'رئيسية'),
  'coach-child': bi('Coach + Child', 'مدرب + طفل'),
  children: bi('Children', 'أطفال'),
  'youth-boys': bi('Youth Boys', 'ناشئون / أولاد'),
  'youth-girls': bi('Youth Girls', 'ناشئات / بنات'),
  women: bi('Women', 'نساء'),
  technique: bi('Technique', 'تقنية'),
  underwater: bi('Underwater', 'تحت الماء'),
  group: bi('Group', 'جماعي'),
  performance: bi('Performance', 'أداء'),
  gallery: bi('Gallery', 'معرض'),
};

export function SportMediaManager({ assets }: { assets: SportMediaAsset[] }) {
  const ordered = [...assets].sort((a, b) => a.order - b.order);

  return (
    <div className="sport-media-manager admin-panel">
      <div className="sport-media-heading">
        <div>
          <BilingualText value={bi('Swimming Media', 'وسائط السباحة')} className="admin-eyebrow" />
          <h2><BilingualText value={bi('Verified ten-image collection', 'مجموعة الصور العشر الموثقة')} /></h2>
          <p><BilingualText value={bi('Read-only Phase 1 media manager. Public Swimming and Admin use the same typed source of truth.', 'مدير وسائط للقراءة فقط في المرحلة الأولى. تستخدم صفحة السباحة العامة والإدارة نفس المصدر الموحّد typed.')} /></p>
        </div>
        <span className="sport-media-count">{ordered.length}/10</span>
      </div>

      <div className="sport-media-table" role="table" aria-label="Swimming media | وسائط السباحة">
        <div className="sport-media-row sport-media-header" role="row">
          <strong><BilingualText value={bi('Image Preview', 'معاينة الصورة')} /></strong>
          <strong><BilingualText value={bi('Usage', 'الاستخدام')} /></strong>
          <strong><BilingualText value={bi('Order', 'الترتيب')} /></strong>
          <strong><BilingualText value={bi('Alt Text', 'النص البديل')} /></strong>
          <strong><BilingualText value={bi('Source Status', 'حالة المصدر')} /></strong>
        </div>
        {ordered.map(asset => (
          <article className="sport-media-row" role="row" key={asset.id}>
            <div className="sport-media-preview" role="cell">
              <img src={asset.url} alt={`${asset.altEn} | ${asset.altAr}`} width={1648} height={928} loading="lazy" decoding="async" />
            </div>
            <div className="sport-media-usage" role="cell"><BilingualText value={usageLabels[asset.usage]} /><code>{asset.usage}</code></div>
            <div className="sport-media-order" role="cell">{String(asset.order).padStart(2, '0')}</div>
            <div className="sport-media-alt" role="cell"><span lang="en">{asset.altEn}</span><span lang="ar" dir="rtl">{asset.altAr}</span></div>
            <div className="sport-media-status" role="cell"><span className="verified-dot" /><BilingualText value={bi('Verified User Asset', 'أصل معتمد من المستخدم')} /></div>
          </article>
        ))}
      </div>
    </div>
  );
}
