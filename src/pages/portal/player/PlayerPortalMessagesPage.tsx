import { AlertCircle, Inbox, MessageSquare, Send, ShieldCheck, User } from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalMessagesPage() {
  const { player, coach, sport, messages } = usePlayerSession();
  if (!player) return null;

  return (
    <div className="space-y-6" id="player-messages-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><MessageSquare size={18} /><BilingualText value={bi('Recorded Communication', 'التواصل المسجل')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Athlete Messages', 'رسائل اللاعب')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('Existing message records addressed to or sent by this athlete are shown read-only. Sending, replying and realtime delivery are disabled until the shared provider exposes a safe messaging write contract.', 'يتم عرض سجلات الرسائل الموجودة المرسلة إلى هذا اللاعب أو الصادرة منه للقراءة فقط. يظل الإرسال والرد والتسليم اللحظي معطلاً حتى يوفّر مزود البيانات المشترك عقد كتابة آمنًا للمراسلة.')} /></p></div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Read-only provider records', 'سجلات مزود للقراءة فقط')} /></span>
        </div>
      </section>

      <section className="athlete-glass-card overflow-hidden border-amber-400/20">
        <header className="p-4 sm:p-5 bg-white/[.025] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0"><span className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/25 text-amber-300 grid place-items-center"><User size={19} /></span><div className="min-w-0"><strong className="text-sm font-bold text-white block truncate">{coach ? `${coach.nameEn} · ${coach.nameAr}` : <BilingualText value={bi('No coach record assigned', 'لا يوجد سجل مدرب معين')} />}</strong><span className="text-[11px] text-slate-400"><BilingualText value={sport?.name ?? bi('Sport not recorded', 'الرياضة غير مسجلة')} /></span></div></div>
          <span className="text-[11px] text-slate-500"><BilingualText value={bi(`${messages.length} recorded thread${messages.length === 1 ? '' : 's'}`, `${messages.length} محادثة مسجلة`)} /></span>
        </header>

        {messages.length ? (
          <div className="p-5 space-y-3">{messages.map((thread) => <article key={thread.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="flex items-start justify-between gap-3"><div><strong className="text-xs text-white"><BilingualText value={thread.participantName} /></strong><p className="mt-1 text-[11px] text-slate-400"><BilingualText value={thread.participantRole} /></p></div><span className="text-[10px] text-slate-500">{formatDate(thread.lastMessageTime)}</span></div><p className="mt-3 text-xs text-slate-300 leading-6">{thread.lastMessage}</p>{thread.unreadCount > 0 && <span className="mt-3 inline-flex px-2 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold"><BilingualText value={bi('Unread record', 'سجل غير مقروء')} /></span>}</article>)}</div>
        ) : (
          <div className="athlete-empty-system m-4 sm:m-5"><div><Inbox size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No message records are linked', 'لا توجد سجلات رسائل مرتبطة')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('No conversation is fabricated when the provider has no player-owned message record.', 'لا يتم إنشاء محادثة وهمية عندما لا يحتوي مزود البيانات على سجل رسائل مرتبط باللاعب.')} /></p></div></div>
        )}

        <div className="p-3 sm:p-4 bg-white/[.025] border-t border-white/10 flex items-center gap-2">
          <input type="text" disabled readOnly value="" aria-label="Message composer unavailable | محرر الرسائل غير متاح" placeholder="Sending contract not connected · عقد الإرسال غير متصل" className="flex-1 px-4 bg-white/[.025] border border-white/10 text-xs text-slate-400 placeholder-slate-500" />
          <button type="button" disabled className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-slate-500 grid place-items-center" aria-label="Send unavailable | الإرسال غير متاح"><Send size={16} className="rtl:rotate-180" /></button>
        </div>
        <div className="athlete-truth-note m-4"><AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('No send, reply, attachment, delivery receipt or realtime-presence action is reported as completed by this page.', 'لا تعتبر هذه الصفحة أي إجراء إرسال أو رد أو مرفق أو إيصال تسليم أو تواجد لحظي إجراءً مكتملاً.')} /></div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}`;
}
