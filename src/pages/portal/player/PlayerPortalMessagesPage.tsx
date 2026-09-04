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
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><MessageSquare size={18} /><BilingualText value={bi('Communication Workspace', 'مساحة التواصل')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Athlete Messaging Hub', 'مركز رسائل اللاعب')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('The interface is prepared for player-owned conversations, but no secure messaging backend is connected in this environment.', 'الواجهة مجهزة للمحادثات المرتبطة باللاعب، لكن لا توجد خدمة مراسلة آمنة خلفية متصلة في هذه البيئة.')} /></p></div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Service unavailable', 'الخدمة غير متاحة')} /></span>
        </div>
      </section>

      <section className="athlete-glass-card overflow-hidden border-amber-400/20">
        <header className="p-4 sm:p-5 bg-white/[.025] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0"><span className="w-11 h-11 rounded-xl bg-amber-400/12 border border-amber-400/25 text-amber-300 grid place-items-center"><User size={19} /></span><div className="min-w-0"><strong className="text-sm font-bold text-white block truncate">{coach ? `${coach.nameEn} · ${coach.nameAr}` : <BilingualText value={bi('No coach assigned', 'لا يوجد مدرب معين')} />}</strong><span className="text-[11px] text-slate-400"><BilingualText value={sport?.name ?? bi('Sport not assigned', 'الرياضة غير معينة')} /></span></div></div>
          <span className="text-[11px] text-slate-500"><BilingualText value={bi(`${messages.length} connected threads`, `${messages.length} محادثات متصلة`)} /></span>
        </header>

        {messages.length ? (
          <div className="p-5 space-y-3">{messages.map((thread) => <article key={thread.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><strong className="text-xs text-white"><BilingualText value={thread.participantName} /></strong><p className="mt-1 text-[11px] text-slate-400"><BilingualText value={thread.participantRole} /></p><p className="mt-3 text-xs text-slate-300 line-clamp-2">{thread.lastMessage}</p></article>)}</div>
        ) : (
          <div className="athlete-empty-system m-4 sm:m-5"><div><Inbox size={34} className="mx-auto text-slate-500" /><h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No messaging threads are connected', 'لا توجد محادثات متصلة')} /></h2><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('No conversation is fabricated for the preview. The composer remains disabled until a real communications service provides a player-owned thread.', 'لا يتم إنشاء محادثة وهمية للمعاينة. يظل محرر الرسائل معطلاً حتى توفر خدمة تواصل حقيقية محادثة مرتبطة باللاعب.')} /></p><div className="athlete-truth-note mt-4 text-left rtl:text-right"><AlertCircle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Sending, delivery status, attachments and realtime presence are not claimed.', 'لا يتم ادعاء الإرسال أو حالة التسليم أو المرفقات أو التواجد اللحظي.')} /></div></div></div>
        )}

        <div className="p-3 sm:p-4 bg-white/[.025] border-t border-white/10 flex items-center gap-2">
          <input type="text" disabled readOnly value="" aria-label="Message composer unavailable | محرر الرسائل غير متاح" placeholder="Messaging backend not connected · خدمة الرسائل غير متصلة" className="flex-1 px-4 bg-white/[.025] border border-white/10 text-xs text-slate-400 placeholder-slate-500" />
          <button type="button" disabled className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-slate-500 grid place-items-center" aria-label="Send unavailable | الإرسال غير متاح"><Send size={16} className="rtl:rotate-180" /></button>
        </div>
      </section>
    </div>
  );
}
