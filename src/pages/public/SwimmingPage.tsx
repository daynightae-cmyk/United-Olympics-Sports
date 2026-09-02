import { ArrowLeft, Sparkles, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getSwimmingMediaByUsage, swimmingMediaAssets } from '../../data/media/swimming';
import type { SportMediaAsset } from '../../domain/contracts';
import '../../styles/swimming.css';

function MediaImage({ asset, priority = false, className = '' }: { asset: SportMediaAsset; priority?: boolean; className?: string }) {
  return (
    <img
      className={`swim-media ${className}`.trim()}
      src={asset.url}
      alt={`${asset.altEn} | ${asset.altAr}`}
      width={1648}
      height={928}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
    />
  );
}

function StoryCard({ asset, title, text, featured = false }: { asset: SportMediaAsset; title: ReturnType<typeof bi>; text: ReturnType<typeof bi>; featured?: boolean }) {
  return (
    <article className={featured ? 'swim-story featured' : 'swim-story'}>
      <MediaImage asset={asset} />
      <div className="swim-story-copy">
        <span className="swim-usage">{asset.usage}</span>
        <h2><BilingualText value={title} /></h2>
        <p><BilingualText value={text} /></p>
      </div>
    </article>
  );
}

export function SwimmingPage() {
  const hero = getSwimmingMediaByUsage('hero')!;
  const coachChild = getSwimmingMediaByUsage('coach-child')!;
  const children = getSwimmingMediaByUsage('children')!;
  const boys = getSwimmingMediaByUsage('youth-boys')!;
  const girls = getSwimmingMediaByUsage('youth-girls')!;
  const women = getSwimmingMediaByUsage('women')!;
  const technique = getSwimmingMediaByUsage('technique')!;
  const underwater = getSwimmingMediaByUsage('underwater')!;
  const group = getSwimmingMediaByUsage('group')!;
  const performance = getSwimmingMediaByUsage('performance')!;

  return (
    <div className="swimming-page">
      <section className="swim-hero">
        <MediaImage asset={hero} priority />
        <div className="swim-hero-overlay" />
        <div className="swim-hero-content">
          <Link className="swim-back" to="/sports"><ArrowLeft size={16} /><BilingualText value={bi('All Sports', 'جميع الرياضات')} /></Link>
          <span className="swim-kicker"><Waves size={16} /><BilingualText value={bi('Swimming', 'السباحة')} /></span>
          <h1><BilingualText value={bi('Technique. Confidence. Performance.', 'تقنية. ثقة. أداء.')} /></h1>
          <p><BilingualText value={bi('A visual journey through child development, youth training, technical coaching, group work and performance preparation.', 'رحلة بصرية عبر تطوير الأطفال وتدريب الناشئين والتعليم التقني والعمل الجماعي والاستعداد للأداء.')} /></p>
        </div>
      </section>

      <section className="swim-section">
        <div className="swim-section-heading"><Sparkles size={18} /><div><h2><BilingualText value={bi('Coaching from the first strokes', 'التدريب منذ الخطوات الأولى')} /></h2><p><BilingualText value={bi('Close guidance is presented with a verified United Olympics Sports swimming visual.', 'يظهر التوجيه المباشر من خلال صورة سباحة موثقة ليونايتد أوليمبيكس سبورت.')} /></p></div></div>
        <StoryCard featured asset={coachChild} title={bi('Child development', 'تطوير الأطفال')} text={bi('Direct coach support during a kickboard exercise in the pool.', 'دعم مباشر من المدرب خلال تمرين باستخدام لوح التدريب داخل المسبح.')} />
      </section>

      <section className="swim-section swim-dark-band">
        <div className="swim-section-heading"><div><h2><BilingualText value={bi('Girls and women coaching', 'تدريب البنات والنساء')} /></h2><p><BilingualText value={bi('Poolside instruction, preparation and group communication shown without invented names, locations or credentials.', 'توجيه بجانب المسبح واستعداد وتواصل جماعي دون اختلاق أسماء أو مواقع أو مؤهلات.')} /></p></div></div>
        <div className="swim-two-grid">
          <StoryCard asset={women} title={bi('Focused poolside instruction', 'توجيه مركز بجانب المسبح')} text={bi('A female coach gives direct instruction while other swimmers prepare nearby.', 'مدربة تقدم توجيهًا مباشرًا بينما تستعد سباحات أخريات بالقرب منها.')} />
          <StoryCard asset={girls} title={bi('Youth girls development', 'تطوير الفتيات الناشئات')} text={bi('A female coach speaks with a group of girls during an in-pool session.', 'مدربة تتحدث مع مجموعة من الفتيات خلال حصة داخل المسبح.')} />
        </div>
      </section>

      <section className="swim-section">
        <StoryCard featured asset={boys} title={bi('Youth development', 'تطوير الناشئين')} text={bi('Poolside feedback connects individual attention with an active lane training environment.', 'تربط الملاحظات بجانب المسبح بين الاهتمام الفردي وبيئة تدريب نشطة في المسارات.')} />
      </section>

      <section className="swim-section">
        <div className="swim-two-grid swim-technical-grid">
          <StoryCard asset={technique} title={bi('Technique coaching', 'تعليم التقنية')} text={bi('A coach times and observes lane drills while swimmers work with training boards.', 'مدرب يتابع التوقيت ويراقب تدريبات المسارات بينما يستخدم السباحون ألواح التدريب.')} />
          <StoryCard asset={underwater} title={bi('Underwater performance', 'الأداء تحت الماء')} text={bi('A split-level view shows a coach guiding a streamlined body position beneath the surface.', 'لقطة تجمع فوق وتحت سطح الماء تظهر المدرب وهو يوجه وضعية الجسم الانسيابية.')} />
        </div>
      </section>

      <section className="swim-section swim-dark-band">
        <div className="swim-two-grid">
          <StoryCard asset={group} title={bi('Group training', 'التدريب الجماعي')} text={bi('A female coach addresses multiple swimmers together at the pool edge.', 'مدربة توجه عدة سباحات معًا عند حافة المسبح.')} />
          <StoryCard asset={performance} title={bi('Race preparation', 'الاستعداد للسباق')} text={bi('A coach supervises swimmers holding race-start positions on the blocks.', 'مدرب يشرف على سباحين في وضعيات انطلاق السباق فوق المنصات.')} />
        </div>
      </section>

      <section className="swim-section swim-gallery-section">
        <div className="swim-section-heading"><div><h2><BilingualText value={bi('Beginner swimming gallery', 'معرض سباحة المبتدئين')} /></h2><p><BilingualText value={bi(`${swimmingMediaAssets.length} verified user assets power the full Swimming experience and the Admin media view from one typed source. This final gallery placement uses one image rather than forcing all ten into one screen.`, `تغذي ${swimmingMediaAssets.length} أصول معتمدة من المستخدم تجربة السباحة كاملة وعرض الوسائط في الإدارة من مصدر typed واحد. يستخدم موضع المعرض النهائي صورة واحدة بدل حشر الصور العشر في شاشة واحدة.`)} /></p></div></div>
        <div className="swim-gallery-single"><MediaImage asset={children} /></div>
      </section>
    </div>
  );
}
