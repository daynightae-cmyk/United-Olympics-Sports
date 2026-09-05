import { CheckCircle2, Clock, MessageCircle, MessageSquareText, ShieldCheck, Sparkles, Target, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalFeedbackPage() {
  const { player, sport, coach, feedback, messages } = usePlayerSession();
  if (!player) return null;

  const canMessage = messages.length > 0;
  const strengthCount = feedback.reduce((sum, item) => sum + item.strengths.length, 0);
  const focusCount = feedback.reduce((sum, item) => sum + item.focusAreas.length, 0);

  return (
    <div className="space-y-6" id="player-feedback-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400"><MessageSquareText size={18} /></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400"><BilingualText value={bi('Recorded Coaching Feedback', 'ملاحظات التدريب المسجلة')} /></span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Coach Feedback & Development Focus', 'ملاحظات المدرب ومحاور التطوير')} /></h1>
            <p className="text-xs text-slate-300 leading-6"><BilingualText value={bi('Only feedback records already linked to this athlete are shown. No future review, message, or coaching action is implied when a record does not exist.', 'يتم عرض سجلات الملاحظات المرتبطة بهذا اللاعب فقط. ولا يتم افتراض تقييم مستقبلي أو رسالة أو إجراء تدريبي عند عدم وجود سجل فعلي.')} /></p>
          </div>
          {canMessage ? (
            <Link to="/player/messages" className="athlete-action-primary self-start"><MessageCircle size={15} /><BilingualText value={bi('Open Messages', 'فتح الرسائل')} /></Link>
          ) : (
            <span className="athlete-action-disabled self-start" aria-disabled="true"><MessageCircle size={15} /><BilingualText value={bi('Messaging not connected', 'المراسلة غير متصلة')} /></span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <FeedbackStat label={bi('Recorded evaluations', 'التقييمات المسجلة')} value={String(feedback.length)} />
          <FeedbackStat label={bi('Primary coach', 'المدرب المشرف')} value={coach ? `${coach.nameEn} · ${coach.nameAr}` : undefined} />
          <FeedbackStat label={bi('Recorded strengths', 'نقاط القوة المسجلة')} value={strengthCount ? String(strengthCount) : undefined} />
          <FeedbackStat label={bi('Recorded focus areas', 'محاور التطوير المسجلة')} value={focusCount ? String(focusCount) : undefined} />
        </div>
      </section>

      {feedback.length > 0 ? (
        <section className="space-y-4" id="coach-feedback-feed" aria-label="Recorded coach feedback | ملاحظات المدرب المسجلة">
          {feedback.map((item) => (
            <article key={item.id} className="athlete-glass-card p-5 sm:p-6 border-amber-400/20 space-y-4">
              <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/25 text-amber-300 flex items-center justify-center flex-shrink-0"><User size={19} /></div>
                  <div className="min-w-0">
                    <strong className="text-sm font-bold text-white block truncate">{coach ? `${coach.nameEn} · ${coach.nameAr}` : <BilingualText value={bi('Coach not assigned', 'المدرب غير معين')} />}</strong>
                    <span className="text-[11px] text-amber-300"><BilingualText value={sport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /> · <BilingualText value={bi('Recorded review', 'مراجعة مسجلة')} /></span>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400"><Clock size={13} /><BilingualText value={bi('Recorded', 'مسجل')} /> · <span className="font-mono">{item.createdAt}</span></span>
              </header>

              <div className="rounded-2xl border border-white/8 bg-white/[.025] p-4 text-xs sm:text-sm leading-7 text-slate-200"><BilingualText value={item.summary} /></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[.04] p-4">
                  <h2 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5"><CheckCircle2 size={14} /><BilingualText value={bi('Recorded Strengths', 'نقاط القوة المسجلة')} /></h2>
                  {item.strengths.length ? <div className="mt-3 flex flex-wrap gap-2">{item.strengths.map((value) => <span key={value.en} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/12 text-emerald-300 border border-emerald-500/20"><BilingualText value={value} /></span>)}</div> : <p className="mt-3 text-xs text-slate-500"><BilingualText value={bi('No strengths recorded in this review.', 'لا توجد نقاط قوة مسجلة في هذه المراجعة.')} /></p>}
                </section>

                <section className="rounded-2xl border border-amber-400/15 bg-amber-400/[.04] p-4">
                  <h2 className="text-xs font-bold text-amber-400 flex items-center gap-1.5"><Target size={14} /><BilingualText value={bi('Recorded Development Focus', 'محاور التطوير المسجلة')} /></h2>
                  {item.focusAreas.length ? <div className="mt-3 flex flex-wrap gap-2">{item.focusAreas.map((value) => <span key={value.en} className="text-xs px-2.5 py-1 rounded-full bg-amber-400/12 text-amber-300 border border-amber-400/20"><Sparkles size={11} className="inline me-1" /><BilingualText value={value} /></span>)}</div> : <p className="mt-3 text-xs text-slate-500"><BilingualText value={bi('No development focus recorded in this review.', 'لا توجد محاور تطوير مسجلة في هذه المراجعة.')} /></p>}
                </section>
              </div>

              <footer className="athlete-truth-note"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('This card reflects the stored preview feedback record only; it does not create a new evaluation or certify a result.', 'تعكس هذه البطاقة سجل الملاحظات التجريبي المخزن فقط؛ ولا تنشئ تقييمًا جديدًا ولا تعتمد نتيجة.')} /></footer>
            </article>
          ))}
        </section>
      ) : (
        <section className="athlete-empty-system"><div><MessageSquareText size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No coach feedback is recorded yet', 'لا توجد ملاحظات مدرب مسجلة حتى الآن')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('This area remains empty until a feedback record is linked to the athlete. Nothing is generated to simulate a coaching review.', 'تبقى هذه المساحة فارغة حتى يتم ربط سجل ملاحظات باللاعب. ولا يتم إنشاء أي بيانات لمحاكاة تقييم تدريبي.')} /></p></div></section>
      )}
    </div>
  );
}

function FeedbackStat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-white text-sm font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}
