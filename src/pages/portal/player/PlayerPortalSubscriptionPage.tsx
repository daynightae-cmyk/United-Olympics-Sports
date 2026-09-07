import { useMemo, useState } from 'react';
import { Calendar, CreditCard, RotateCw, ShieldCheck } from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import SafeBrandLogo from '../../../components/ui/SafeBrandLogo';

export function PlayerPortalSubscriptionPage() {
  const { player, sport, group, parent, subscriptions } = usePlayerSession();
  const [isFlipped, setIsFlipped] = useState(false);

  const orderedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [subscriptions],
  );
  const currentSubscription = orderedSubscriptions.find((item) => item.status === 'active') ?? orderedSubscriptions[0];

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-subscription-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><CreditCard size={18} /><BilingualText value={bi('Membership Records', 'سجلات العضوية')} /></div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Membership & Athlete Identity', 'العضوية وهوية اللاعب')} /></h1>
            <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('Membership details below come from subscription records linked to this athlete. The visual card is an identity preview only and is not presented as an issued credential.', 'تأتي تفاصيل العضوية أدناه من سجلات الاشتراك المرتبطة بهذا اللاعب. البطاقة المرئية هي معاينة للهوية فقط ولا يتم تقديمها كاعتماد صادر.')} /></p>
          </div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Player-scoped records', 'سجلات خاصة باللاعب')} /></span>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 flex flex-col items-center">
          <button type="button" className="w-full max-w-md text-left rtl:text-right" onClick={() => setIsFlipped((value) => !value)} aria-label={bi('Flip identity preview', 'قلب معاينة الهوية').en}>
            {!isFlipped ? (
              <div className="digital-id-card min-h-[260px] flex flex-col justify-between transition-all duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5"><SafeBrandLogo className="w-10 h-10 object-contain" /><div><h3 className="font-['Cinzel',serif] text-xs font-bold tracking-wider text-slate-100">UNITED OLYMPICS SPORTS</h3><span className="text-[10px] text-amber-400 font-semibold block">يونايتد أوليمبيكس سبورت</span></div></div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider"><BilingualText value={bi('Identity Preview', 'معاينة الهوية')} /></span>
                </div>
                <div className="flex items-center gap-4 my-4 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-black font-extrabold text-2xl flex items-center justify-center border-2 border-amber-200 shadow-md">{player.nameEn.charAt(0)}</div>
                  <div><h4 className="text-lg font-bold text-white leading-tight">{player.nameEn}</h4><p className="text-xs text-amber-300 font-medium">{player.nameAr}</p><p className="text-[11px] text-slate-300 mt-1">{sport ? <BilingualText value={sport.name} /> : <BilingualText value={bi('Sport not recorded', 'الرياضة غير مسجلة')} />} · <BilingualText value={player.level} /></p></div>
                </div>
                <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] relative z-10">
                  <div><span className="text-slate-400 block"><BilingualText value={bi('Player ID', 'رقم اللاعب')} /></span><strong className="font-mono text-white tracking-wider">{player.id.toUpperCase()}</strong></div>
                  <div className="text-right rtl:text-left"><span className="text-slate-400 block"><BilingualText value={bi('Group', 'المجموعة')} /></span><strong className="text-amber-300">{group ? <BilingualText value={group.name} /> : '—'}</strong></div>
                </div>
              </div>
            ) : (
              <div className="digital-id-card min-h-[260px] flex flex-col justify-between transition-all duration-500 hover:scale-[1.01]">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 relative z-10"><span className="text-xs font-bold text-amber-300"><BilingualText value={bi('Recorded Identity Details', 'تفاصيل الهوية المسجلة')} /></span><span className="text-[10px] text-slate-400 font-mono">{player.id}</span></div>
                <div className="space-y-2.5 my-3 text-xs relative z-10">
                  <IdentityRow label={bi('Sport', 'الرياضة')} value={sport ? `${sport.name.en} · ${sport.name.ar}` : undefined} />
                  <IdentityRow label={bi('Guardian record', 'سجل ولي الأمر')} value={parent ? `${parent.nameEn} · ${parent.nameAr}` : undefined} />
                  <IdentityRow label={bi('Guardian contact', 'هاتف ولي الأمر')} value={parent?.phone} mono />
                </div>
                <div className="pt-2 border-t border-white/15 relative z-10 text-[10px] text-slate-400"><BilingualText value={bi('Visual preview — not an issued credential', 'معاينة مرئية — ليست اعتمادًا صادرًا')} /></div>
              </div>
            )}
          </button>
          <button type="button" onClick={() => setIsFlipped((value) => !value)} className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5"><RotateCw size={13} /><BilingualText value={isFlipped ? bi('Flip to front view', 'عرض واجهة البطاقة') : bi('Flip to recorded details', 'عرض التفاصيل المسجلة')} /></button>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {currentSubscription ? (
            <section className="athlete-glass-card p-6 border-l-2 border-l-amber-400 rtl:border-l-0 rtl:border-r-2 rtl:border-r-amber-400">
              <div className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase tracking-[.14em] text-amber-400 font-black"><BilingualText value={bi('Current subscription record', 'سجل الاشتراك الحالي')} /></span><h2 className="mt-1 text-lg font-bold text-white"><BilingualText value={currentSubscription.plan} /></h2></div><StatusBadge status={currentSubscription.status} /></div>
              <div className="athlete-field-grid mt-5">
                <SubscriptionField label={bi('Subscription ID', 'معرف الاشتراك')} value={currentSubscription.id} mono />
                <SubscriptionField label={bi('Program ID', 'معرف البرنامج')} value={currentSubscription.programId} mono />
                <SubscriptionField label={bi('Branch ID', 'معرف الفرع')} value={currentSubscription.branchId} mono />
                <SubscriptionField label={bi('Start date', 'تاريخ البداية')} value={formatDate(currentSubscription.startDate)} />
                <SubscriptionField label={bi('End date', 'تاريخ الانتهاء')} value={currentSubscription.endDate ? formatDate(currentSubscription.endDate) : undefined} />
                <SubscriptionField label={bi('Recorded amount', 'المبلغ المسجل')} value={`${currentSubscription.amount.toLocaleString()} ${currentSubscription.currency}`} />
              </div>
            </section>
          ) : (
            <section className="athlete-empty-system"><div><Calendar size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No subscription record is linked', 'لا يوجد سجل اشتراك مرتبط')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('No membership dates, plan, price or status are generated when the provider has no subscription for this athlete.', 'لا يتم إنشاء تواريخ عضوية أو خطة أو سعر أو حالة عندما لا يحتوي مزود البيانات على اشتراك لهذا اللاعب.')} /></p></div></section>
          )}

          {orderedSubscriptions.length > 1 && (
            <section className="athlete-glass-card p-5"><h3 className="text-sm font-bold text-white"><BilingualText value={bi('Other recorded subscriptions', 'اشتراكات مسجلة أخرى')} /></h3><div className="mt-3 space-y-2">{orderedSubscriptions.filter((item) => item.id !== currentSubscription?.id).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.025] p-3"><div><strong className="text-xs text-white"><BilingualText value={item.plan} /></strong><p className="mt-1 text-[10px] text-slate-500 font-mono">{item.id}</p></div><StatusBadge status={item.status} /></div>)}</div></section>
          )}
        </div>
      </div>
    </div>
  );
}

function IdentityRow({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-slate-400"><BilingualText value={label} />:</span><strong className={`${mono ? 'font-mono' : ''} text-slate-200`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function SubscriptionField({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function StatusBadge({ status }: { status: 'active' | 'pending' | 'expired' | 'cancelled' }) {
  const label = status === 'active' ? bi('Active', 'نشط') : status === 'pending' ? bi('Pending', 'قيد الانتظار') : status === 'expired' ? bi('Expired', 'منتهي') : bi('Cancelled', 'ملغي');
  const tone = status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : status === 'pending' ? 'bg-amber-400/10 text-amber-300 border-amber-400/20' : 'bg-white/5 text-slate-400 border-white/10';
  return <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${tone}`}><BilingualText value={label} /></span>;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })} · ${date.toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' })}`;
}
