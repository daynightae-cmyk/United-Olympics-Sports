import { useState } from 'react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue, SportMediaAsset } from '../../domain/contracts';
import { ALL_APPROVED_MEDIA, type MediaAsset } from '../../data/media/publicMediaRegistry';
import { UosImage } from '../public/UosImage';
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

export function SportMediaManager({
  assets,
  sportName,
}: {
  assets: SportMediaAsset[];
  sportName: BilingualValue;
}) {
  const [viewMode, setViewMode] = useState<'sport' | 'central'>('sport');
  const orderedSportAssets = [...assets].sort((a, b) => a.order - b.order);
  const title = bi(`${sportName.en} Media`, `وسائط ${sportName.ar}`);

  return (
    <div className="sport-media-manager admin-panel">
      <div className="sport-media-heading">
        <div>
          <BilingualText value={title} className="admin-eyebrow" />
          <h2>
            <BilingualText
              value={
                viewMode === 'sport'
                  ? bi('Verified Sport Media Collection', 'مجموعة وسائط الرياضة المعتمدة')
                  : bi('Central Approved 20-Asset Media Registry', 'سجل الوسائط المركزي المعتمد (20 أصلاً)')
              }
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                'High-performance media management. Public pages and admin use the exact same typed MediaRegistry with responsive AVIF/WebP assets, calibrated athletic focal points, and verified source provenance.',
                'إدارة وسائط عالية الأداء. تستخدم الصفحات العامة والإدارة نفس سجل الوسائط المعتمد، مع أصول AVIF/WebP مستجيبة، وإحداثيات تركيز رياضية محددة، ومصادر موثقة.'
              )}
            />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-900/60 p-1 rounded-lg border border-amber-500/20 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('sport')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'sport' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BilingualText value={bi(`Sport Assets (${orderedSportAssets.length})`, `وسائط الرياضة (${orderedSportAssets.length})`)} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('central')}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                viewMode === 'central' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BilingualText value={bi(`Central Registry (20)`, `السجل المركزي (20)`)} />
            </button>
          </div>
          <span className="sport-media-count">
            {viewMode === 'sport' ? orderedSportAssets.length : ALL_APPROVED_MEDIA.length}
          </span>
        </div>
      </div>

      {viewMode === 'sport' ? (
        <div
          className="sport-media-table"
          role="table"
          aria-label={`${sportName.en} media | وسائط ${sportName.ar}`}
        >
          <div className="sport-media-row sport-media-header" role="row">
            <strong><BilingualText value={bi('Image Preview', 'معاينة الصورة')} /></strong>
            <strong><BilingualText value={bi('Usage', 'الاستخدام')} /></strong>
            <strong><BilingualText value={bi('Order', 'الترتيب')} /></strong>
            <strong><BilingualText value={bi('Alt Text', 'النص البديل')} /></strong>
            <strong><BilingualText value={bi('Source & Status', 'المصدر والحالة')} /></strong>
          </div>
          {orderedSportAssets.map((asset) => {
            const isLocal = asset.url.startsWith('/');
            return (
              <article className="sport-media-row" role="row" key={asset.id}>
                <div className="sport-media-preview" role="cell">
                  <img
                    src={asset.url}
                    alt={`${asset.altEn} | ${asset.altAr}`}
                    width={1648}
                    height={928}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="sport-media-usage" role="cell">
                  <BilingualText value={usageLabels[asset.usage]} />
                  <code>{asset.usage}</code>
                </div>
                <div className="sport-media-order" role="cell">
                  {String(asset.order).padStart(2, '0')}
                </div>
                <div className="sport-media-alt" role="cell">
                  <span lang="en">{asset.altEn}</span>
                  <span lang="ar" dir="rtl">{asset.altAr}</span>
                </div>
                <div className="sport-media-source" role="cell">
                  <span className="sport-media-status">
                    <span className="verified-dot" />
                    <BilingualText value={bi('Verified User Asset', 'أصل معتمد من المستخدم')} />
                  </span>
                  <span className={isLocal ? 'source-chip local' : 'source-chip remote'}>
                    <BilingualText
                      value={isLocal ? bi('Local Asset', 'أصل محلي') : bi('Remote Rendering Source', 'مصدر عرض خارجي')}
                    />
                  </span>
                  {asset.sourceUrl && (
                    <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
                      <BilingualText value={bi('Original Source', 'المصدر الأصلي')} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div
          className="sport-media-table"
          role="table"
          aria-label="Central Media Registry 20 Assets | سجل الوسائط المركزي 20 أصلاً"
        >
          <div className="sport-media-row sport-media-header" role="row">
            <strong><BilingualText value={bi('Image Preview', 'معاينة الصورة')} /></strong>
            <strong><BilingualText value={bi('Registry Key & Role', 'مفتاح السجل والدور')} /></strong>
            <strong><BilingualText value={bi('Focal Point', 'نقطة التركيز')} /></strong>
            <strong><BilingualText value={bi('Bilingual Alt & Description', 'النص والوصف باللغتين')} /></strong>
            <strong><BilingualText value={bi('Resolution & Sources', 'الأبعاد والمصادر')} /></strong>
          </div>
          {ALL_APPROVED_MEDIA.map((item: MediaAsset) => (
            <article className="sport-media-row" role="row" key={item.key}>
              <div className="sport-media-preview" role="cell" style={{ maxWidth: '180px' }}>
                <UosImage
                  asset={item}
                  className="rounded-md"
                  containerClassName="w-full aspect-video rounded-md"
                />
              </div>
              <div className="sport-media-usage" role="cell">
                <strong className="text-amber-400 font-mono text-xs">{item.key}</strong>
                <span className="text-xs text-neutral-300">
                  <BilingualText value={item.roleDescription} />
                </span>
                <span className="source-chip local uppercase text-[9px]">
                  {item.category} · {item.role}
                </span>
              </div>
              <div className="sport-media-order text-xs text-neutral-400" role="cell">
                <div className="font-mono text-[11px] text-amber-300/90 leading-relaxed">
                  <div>D: {item.objectPosition.desktop}</div>
                  <div>T: {item.objectPosition.tablet}</div>
                  <div>M: {item.objectPosition.mobile}</div>
                </div>
              </div>
              <div className="sport-media-alt" role="cell">
                <span lang="en" className="text-xs text-neutral-200">{item.alt.en}</span>
                <span lang="ar" dir="rtl" className="text-xs text-neutral-400">{item.alt.ar}</span>
              </div>
              <div className="sport-media-source" role="cell">
                <span className="sport-media-status">
                  <span className="verified-dot" />
                  <span className="text-[11px] font-mono text-neutral-300">
                    {item.width}×{item.height} ({item.sourceExtension})
                  </span>
                </span>
                <span className="source-chip local text-[9px]">
                  {item.src}
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 text-[10px] hover:underline"
                >
                  <BilingualText value={bi('Verified CDN Link', 'رابط المصدر المعتمد')} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default SportMediaManager;
