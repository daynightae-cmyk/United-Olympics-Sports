import { Calendar, CreditCard, RotateCw, ShieldCheck, UserRound } from 'lucide-react';
import { useState } from 'react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalSubscriptionPage() {
  const { player, sport, group, subscriptions } = usePlayerSession();
  const [isFlipped, setIsFlipped] = useState(false);
  if (!player) return null;

  return (
    <div className="space-y-6" id="player-subscription-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><CreditCard size={18} /><BilingualText value={bi('Membership & Athlete Identity', 'العضوية وهوية اللاعب')} /></div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Membership Record & Digital ID Preview', 'سجل العضوية ومعاينة البطاقة الرقمية')} /></h1>
            <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('Membership details are rendered only from linked subscription records. The digital card below is an identity preview, not an issued credential or access pass.', 'يتم عرض تفاصيل العضوية فقط من سجلات الاشتراك المرتبطة. والبطاقة الرقمية أدناه هي معاينة للهوية وليست بطاقة اعتماد أو تصريح دخول صادرًا.')} /></p>
          </div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Preview identity', 'هوية تجريبية')} /></span>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <section className="xl:col-span-6 athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-5"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Digital identity', 'الهوية الرقمية')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Athlete ID Preview', 'معاينة بطاقة اللاعب')} /></h2></div><UserRound size={19} className="text-amber-400" /></header>

          <button type="button" onClick={() => setIsFlipped((value) => !value)} className="w-full text-left rtl:text-right rounded-[26px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300" aria-pressed={isFlipped} aria-label="Flip athlete identity preview | قلب معاينة بطاقة اللاعب">
            {!isFlipped ? (
              <div className="digital-id-card min-h-[265px] flex flex-col justify-between">
                <div className="flex items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5 min-w-0"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" className="w-10 h-10 object-contain" /><div className="min-w-0"><strong className="block text-[11px] text-white tracking-wide truncate">United Olympics Sports</strong><span lang="ar" dir="rtl" className="block text-[10px] text-amber-300">يونايتد أوليمبيكس سبورت</span></div></div>
                  <span className="athlete-data-scope"><BilingualText value={bi('Preview', 'معاينة')} /></span>
                </div>

                <div className="my-5 flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-black grid place-items-center text-2xl font-black border border-amber-200/70">{player.nameEn.charAt(0)}</div>
                  <div className="min-w-0"><h3 className="text-lg font-black text-white truncate">{player.nameEn}</h3><p lang="ar" dir="rtl" className="text-xs font-bold text-amber-300 text-left rtl:text-right">{player.nameAr}</p><p className="mt-1 text-[11px] text-slate-300"><BilingualText value={sport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /> · <BilingualText value={player.level} /></p></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15 relative z-10">
                  <CardField label={bi('Player ID', 'معرف اللاعب')} value={player.id.toUpperCase()} mono />
                  <CardField label={bi('Training group', 'المجموعة التدريبية')} value={group ? `${group.name.en} · ${group.name.ar}` : undefined} />
                </div>
              </div>
            ) : (
              <div className="digital-id-card min-h-[265px] flex flex-col justify-between">
                <div className="relative z-10"><span className="text-[10px] uppercase tracking-[.16em] text-amber-300 font-black"><BilingualText value={bi('Identity details', 'تفاصيل الهوية')} /></span><h3 className="mt-1 text-lg font-black text-white"><BilingualText value={bi('Player Record Reference', 'مرجع سجل اللاعب')} /></h3></div>
                <div className="athlete-field-grid my-5 relative z-10">
                  <CardField label={bi('Player', 'اللاعب')} value={`${player.nameEn} · ${player.nameAr}`} />
                  <CardField label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
                  <CardField label={bi('Level', 'المستوى')} value={`${player.level.en} · ${player.level.ar}`} />
                  <CardField label={bi('Credential status', 'حالة الاعتماد')} value={undefined} />
                </div>
                <div className="athlete-truth-note relative z-10"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('No QR, expiry date, access privilege, emergency contact, or official credential number is invented for this preview.', 'لا يتم اختلاق رمز QR أو تاريخ انتهاء أو صلاحية دخول أو بيانات طوارئ أو رقم اعتماد رسمي لهذه المعاينة.')} /></div>
              </div>
            )}
          </button>

          <button type="button" onClick={() => setIsFlipped((value) => !value)} className="mt-4 athlete-action-secondary"><RotateCw size={13} /><BilingualText value={isFlipped ? bi('Show card front', 'عرض واجهة البطاقة') : bi('Show identity details', 'عرض تفاصيل الهوية')} /></button>
        </section>

        <section className="xl:col-span-6 athlete-glass-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Subscription data', 'بيانات الاشتراك')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Membership Records', 'سجلات العضوية')} /></h2></div><span className="text-xs font-mono text-slate-400">{subscriptions.length}</span></header>

          {subscriptions.length ? (
            <div className="mt-4 space-y-3">
              {subscriptions.map((subscription) => (
                <article key={subscription.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><strong className="text-sm text-white"><BilingualText value={subscription.plan} /></strong><span className="mt-1 block text-[10px] font-mono text-slate-500">{subscription.id}</span></div><span className="athlete-data-scope"><BilingualText value={bi(subscription.status, subscription.status === 'active' ? 'نشط' : subscription.status === 'pending' ? 'قيد الانتظار' : subscription.status === 'expired' ? 'منتهي' : 'ملغى')} /></span></div>
                  <div className="athlete-field-grid mt-4"><CardField label={bi('Start date', 'تاريخ البداية')} value={subscription.startDate} /><CardField label={bi('End date', 'تاريخ النهاية')} value={subscription.endDate} /><CardField label={bi('Recorded amount', 'المبلغ المسجل')} value={`${subscription.amount} ${subscription.currency}`} /><CardField label={bi('Branch reference', 'مرجع الفرع')} value={subscription.branchId} mono /></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="athlete-empty-system mt-4"><div><Calendar size={32} className="mx-auto text-slate-500" /><h3 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No membership record is linked yet', 'لا يوجد سجل عضوية مرتبط حتى الآن')} /></h3><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Plan name, status, dates, fees and renewal controls remain unavailable until a real subscription record is connected to this athlete.', 'يظل اسم الخطة والحالة والتواريخ والرسوم وخيارات التجديد غير متاحة حتى يتم ربط سجل اشتراك حقيقي بهذا اللاعب.')} /></p></div></div>
          )}
        </section>
      </div>
    </div>
  );
}

function CardField({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}
