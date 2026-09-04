import { ArrowLeft, ArrowRight, Check, CircleDot, Dumbbell, Goal, ShieldCheck, Sparkles, Trophy, Users } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { Sports3DIcon, Sports3DStage } from '../../design/sports3d';
import { footballMediaAssets } from '../../data/media/football';
import type { SportMediaAsset } from '../../domain/contracts';
import '../../styles/football.css';

const media = Object.fromEntries(footballMediaAssets.map(asset => [asset.id, asset])) as Record<string, SportMediaAsset>;

function FootballImage({ asset, priority = false, className = '' }: { asset: SportMediaAsset; priority?: boolean; className?: string }) {
  return <img className={`football-image ${className}`.trim()} src={asset.url} alt={`${asset.altEn} | ${asset.altAr}`} width={1648} height={928} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />;
}

const pillars = [
  [ShieldCheck, bi('Discipline', 'الانضباط'), bi('Consistent habits support focused training and steady development.', 'العادات المنتظمة تدعم التدريب المركز والتطور المستمر.')],
  [Users, bi('Teamwork', 'العمل الجماعي'), bi('Players learn to communicate, support teammates and understand shared responsibility.', 'يتعلم اللاعبون التواصل ودعم زملائهم وفهم المسؤولية المشتركة.')],
  [CircleDot, bi('Technique', 'المهارة الفنية'), bi('Ball control, movement and decision-making are developed through purposeful repetition.', 'يتطور التحكم بالكرة والحركة واتخاذ القرار من خلال التكرار الهادف.')],
  [Trophy, bi('Match Confidence', 'الثقة في المباريات'), bi('Training connects technical quality with composure in game-like situations.', 'يربط التدريب الجودة الفنية بالهدوء والثقة في مواقف تشبه المباريات.')],
  [Dumbbell, bi('Fitness', 'اللياقة'), bi('Movement quality and physical readiness are built as part of the football pathway.', 'تُبنى جودة الحركة والجاهزية البدنية كجزء من مسار كرة القدم.')],
] as const;

const pathways = [
  bi('Foundation', 'تأسيسي'),
  bi('Development', 'تطويري'),
  bi('Performance', 'أداء'),
];

export function FootballPage() {
  const [previewMessage, setPreviewMessage] = useState(false);
  const submitInterest = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setPreviewMessage(true); };

  return <div className="football-page">
    <section className="football-hero">
      <FootballImage asset={media['football-01']} priority />
      <div className="football-hero-shade" />
      <div className="football-hero-content">
        <Link className="football-back" to="/sports"><ArrowLeft size={16} /><BilingualText value={bi('All Sports', 'جميع الرياضات')} /></Link>
        <Sports3DStage sport="football" variant="badge" label="Football identity | هوية كرة القدم"><Sports3DIcon sport="football" size="hero" decorative /></Sports3DStage>
        <BilingualText className="football-kicker" value={bi('Football Program', 'برنامج كرة القدم')} icon={<Sparkles size={15} />} />
        <h1><BilingualText value={bi('Train with Purpose', 'تدرب بهدف')} /></h1>
        <p><BilingualText value={bi('A structured football experience focused on technique, discipline, confidence, teamwork and progressive player development.', 'تجربة كرة قدم منظمة تركز على المهارة والانضباط والثقة والعمل الجماعي وتطوير اللاعب بشكل تدريجي.')} /></p>
        <div className="football-actions">
          <a className="button primary" href="#football-interest"><BilingualText value={bi('Register Interest', 'سجل اهتمامك')} /><ArrowRight size={16} /></a>
          <a className="button secondary" href="#training-path"><BilingualText value={bi('Training Path', 'مسار التدريب')} /><ArrowRight size={16} /></a>
        </div>
      </div>
    </section>

    <section className="football-section football-about">
      <div className="football-copy">
        <BilingualText className="football-eyebrow" value={bi('About the Program', 'نبذة عن البرنامج')} />
        <h2><BilingualText value={bi('Build the player, not only the play.', 'نبني اللاعب، وليس اللعب فقط.')} /></h2>
        <p><BilingualText value={bi('Football at United Olympics Sports is presented as a progressive training journey. Sessions connect technical work, movement, communication and game understanding without making unverified promises about teams, facilities or competition schedules.', 'تُقدَّم كرة القدم في يونايتد أوليمبيكس سبورت كرحلة تدريب متدرجة تربط العمل الفني والحركة والتواصل وفهم اللعب دون تقديم وعود غير موثقة حول الفرق أو المنشآت أو جداول المنافسات.')} /></p>
      </div>
      <FootballImage asset={media['football-02']} />
    </section>

    <section className="football-section football-tinted">
      <div className="football-heading"><BilingualText className="football-eyebrow" value={bi('Why Choose Football Here', 'لماذا تختار كرة القدم هنا')} /><h2><BilingualText value={bi('Five foundations for meaningful progress', 'خمسة أسس لتقدم حقيقي')} /></h2></div>
      <div className="football-pillars">{pillars.map(([Icon, title, text]) => <article key={title.en}><Icon /><h3><BilingualText value={title} /></h3><p><BilingualText value={text} /></p></article>)}</div>
    </section>

    <section className="football-section football-method" id="training-path">
      <FootballImage asset={media['football-04']} />
      <div className="football-copy">
        <BilingualText className="football-eyebrow" value={bi('Training Path', 'مسار التدريب')} />
        <h2><BilingualText value={bi('Progression with a clear purpose', 'تدرج بهدف واضح')} /></h2>
        <p><BilingualText value={bi('The pathway is designed around readiness rather than invented age cut-offs. Coaches can later connect verified groups and schedules from the wider sports system.', 'صُمم المسار حول الجاهزية بدل اختلاق حدود عمرية ثابتة، ويمكن لاحقًا ربط المجموعات والجداول الموثقة من منظومة الرياضات الأوسع.')} /></p>
        <div className="football-path-list">{pathways.map((item, index) => <div key={item.en}><span>0{index + 1}</span><BilingualText value={item} /><p><BilingualText value={index === 0 ? bi('Core movement, ball familiarity and confident participation.', 'الحركة الأساسية والألفة مع الكرة والمشاركة بثقة.') : index === 1 ? bi('Technical repetition, decisions and team awareness.', 'تكرار المهارات واتخاذ القرار والوعي الجماعي.') : bi('Game readiness, composure and higher-intensity execution.', 'الجاهزية للعب والثبات والتنفيذ بكثافة أعلى.')} /></p></div>)}</div>
      </div>
    </section>

    <section className="football-section football-age-section">
      <div className="football-heading"><BilingualText className="football-eyebrow" value={bi('Age Group Readiness', 'جاهزية الفئات العمرية')} /><h2><BilingualText value={bi('A pathway that can grow with every player', 'مسار يمكنه أن ينمو مع كل لاعب')} /></h2><p><BilingualText value={bi('The interface is prepared for children, youth boys and youth girls. Actual group availability and schedules will be shown only after operational verification.', 'الواجهة مهيأة للأطفال والناشئين والفتيات الناشئات، ولن تُعرض المجموعات والجداول الفعلية إلا بعد التحقق التشغيلي.')} /></p></div>
      <div className="football-age-grid">
        <article><BilingualText value={bi('Children', 'الأطفال')} /><p><BilingualText value={bi('Confidence, movement and first technical habits.', 'الثقة والحركة والعادات الفنية الأولى.')} /></p></article>
        <article><BilingualText value={bi('Youth Boys', 'الناشئون')} /><p><BilingualText value={bi('Progressive technical and team development.', 'تطوير فني وجماعي متدرج.')} /></p></article>
        <article><BilingualText value={bi('Youth Girls', 'الفتيات الناشئات')} /><p><BilingualText value={bi('A prepared pathway for verified girls groups when available.', 'مسار مهيأ لمجموعات الفتيات الموثقة عند توفرها.')} /></p></article>
      </div>
      <FootballImage asset={media['football-07']} />
    </section>

    <section className="football-section football-coaching football-tinted">
      <div className="football-copy"><BilingualText className="football-eyebrow" value={bi('Coaching Experience', 'تجربة التدريب')} /><h2><BilingualText value={bi('Guidance inside every session', 'توجيه داخل كل حصة')} /></h2><p><BilingualText value={bi('Coach-led sessions combine explanation, repetition, observation and feedback so players understand both what to do and why it matters.', 'تجمع الحصص بقيادة المدرب بين الشرح والتكرار والملاحظة والتغذية الراجعة حتى يفهم اللاعب ما الذي يفعله ولماذا يهم.')} /></p></div>
      <FootballImage asset={media['football-06']} />
    </section>

    <section className="football-section football-story-grid">
      <article><FootballImage asset={media['football-05']} /><div><BilingualText className="football-eyebrow" value={bi('Teamwork', 'العمل الجماعي')} /><h3><BilingualText value={bi('One team, shared responsibility', 'فريق واحد، مسؤولية مشتركة')} /></h3></div></article>
      <article><FootballImage asset={media['football-08']} /><div><BilingualText className="football-eyebrow" value={bi('Performance', 'الأداء')} /><h3><BilingualText value={bi('Prepare for game intensity', 'استعد لكثافة اللعب')} /></h3></div></article>
      <article><FootballImage asset={media['football-09']} /><div><BilingualText className="football-eyebrow" value={bi('Goalkeeper Focus', 'تركيز حراس المرمى')} /><h3><BilingualText value={bi('Specialist moments matter', 'اللحظات التخصصية مهمة')} /></h3></div></article>
    </section>

    <section className="football-section football-gallery-section">
      <div className="football-heading"><BilingualText className="football-eyebrow" value={bi('Football Gallery', 'معرض كرة القدم')} /><h2><BilingualText value={bi('Ten verified football visuals', 'عشر صور كرة قدم معتمدة')} /></h2><p><BilingualText value={bi('Each asset remains a separate website image. No collage, contact sheet or stock replacement is used.', 'كل أصل يبقى صورة موقع مستقلة، دون كولاج أو لوحة تجميع أو استبدال بصور مخزنة.')} /></p></div>
      <div className="football-gallery">{footballMediaAssets.map(asset => <figure key={asset.id}><FootballImage asset={asset} /><figcaption><span>{String(asset.order).padStart(2, '0')}</span><BilingualText value={bi(asset.altEn, asset.altAr)} /></figcaption></figure>)}</div>
    </section>

    <section className="football-section football-interest" id="football-interest">
      <FootballImage asset={media['football-10']} />
      <div className="football-interest-shade" />
      <div className="football-interest-content">
        <BilingualText className="football-eyebrow" value={bi('Register Interest', 'سجل اهتمامك')} />
        <h2><BilingualText value={bi('Interested in the football pathway?', 'مهتم بمسار كرة القدم؟')} /></h2>
        <p><BilingualText value={bi('Share your interest below. This Phase 1 form is UI only and does not save or send data.', 'شارك اهتمامك أدناه. هذا النموذج في المرحلة الأولى واجهة فقط ولا يحفظ أو يرسل البيانات.')} /></p>
        <form onSubmit={submitInterest} className="football-interest-form">
          <label><BilingualText value={bi('Name', 'الاسم')} /><input required placeholder="Name | الاسم" /></label>
          <label><BilingualText value={bi('Email', 'البريد الإلكتروني')} /><input required type="email" placeholder="Email | البريد الإلكتروني" /></label>
          <button className="button primary" type="submit"><BilingualText value={bi('Preview Registration', 'معاينة التسجيل')} /><ArrowRight size={16} /></button>
        </form>
        {previewMessage && <p className="football-preview-note"><Check size={15} /><BilingualText value={bi('Preview only — no information was submitted or saved.', 'معاينة فقط — لم يتم إرسال أو حفظ أي معلومات.')} /></p>}
      </div>
    </section>

    <section className="football-related">
      <div><Goal /><BilingualText value={bi('Related Sports Navigation', 'التنقل إلى الرياضات المرتبطة')} /></div>
      <nav><Link to="/sports"><BilingualText value={bi('All Sports', 'جميع الرياضات')} /><ArrowRight size={15} /></Link><Link to="/sports/swimming"><BilingualText value={bi('Swimming', 'السباحة')} /><ArrowRight size={15} /></Link><Link to="/programs"><BilingualText value={bi('Programs', 'البرامج')} /><ArrowRight size={15} /></Link></nav>
    </section>
  </div>;
}
