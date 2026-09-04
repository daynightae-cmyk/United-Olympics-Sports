import { CheckCircle2, Clock, FileQuestion, Receipt, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { Payment } from '../../../domain/contracts';

export function PlayerPortalPaymentsPage() {
  const { player, payments } = usePlayerSession();
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  if (!player) return null;

  const completedCount = payments.filter((item) => item.status === 'completed').length;
  const pendingCount = payments.filter((item) => item.status === 'pending').length;
  const currencies = Array.from(new Set(payments.map((item) => item.currency)));

  return (
    <div className="space-y-6" id="player-payments-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Receipt size={18} /><BilingualText value={bi('Recorded Billing Data', 'بيانات الدفع المسجلة')} /></div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Payments & Receipts', 'المدفوعات والإيصالات')} /></h1>
            <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Only payment records explicitly linked to athlete ${player.nameEn} are listed here. No balance, invoice or receipt is generated from missing data.`, `يتم عرض سجلات الدفع المرتبطة صراحةً باللاعب ${player.nameAr} فقط. ولا يتم إنشاء رصيد أو فاتورة أو إيصال من بيانات غير موجودة.`)} /></p>
          </div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Linked records only', 'السجلات المرتبطة فقط')} /></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <PaymentStat label={bi('All records', 'كل السجلات')} value={String(payments.length)} />
          <PaymentStat label={bi('Completed', 'المكتملة')} value={completedCount ? String(completedCount) : undefined} />
          <PaymentStat label={bi('Pending', 'قيد الانتظار')} value={pendingCount ? String(pendingCount) : undefined} />
          <PaymentStat label={bi('Currencies', 'العملات')} value={currencies.length ? currencies.join(', ') : undefined} />
        </div>
      </section>

      <section className="athlete-glass-card p-5 sm:p-6">
        <header className="flex items-center justify-between gap-3 pb-4 border-b border-white/10"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Transaction history', 'سجل المعاملات')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Linked Payment Records', 'سجلات الدفع المرتبطة')} /></h2></div><span className="text-xs font-mono text-slate-400">{payments.length}</span></header>

        {payments.length ? (
          <div className="mt-5 space-y-3" id="payments-history-list">
            {payments.map((payment) => (
              <article key={payment.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`w-11 h-11 rounded-xl grid place-items-center flex-shrink-0 border ${payment.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-400/10 border-amber-400/20 text-amber-400'}`}>{payment.status === 'completed' ? <CheckCircle2 size={19} /> : <Clock size={19} />}</span>
                  <div className="min-w-0"><strong className="text-sm font-bold text-white block"><BilingualText value={bi(`${payment.amount} ${payment.currency} payment record`, `سجل دفع بقيمة ${payment.amount} ${payment.currency}`)} /></strong><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400"><span className="font-mono">{payment.paidAt}</span><span><BilingualText value={payment.method} /></span>{payment.reference && <span className="font-mono text-slate-500">{payment.reference}</span>}</div></div>
                </div>
                <div className="athlete-action-row lg:justify-end"><PaymentStatus status={payment.status} /><button type="button" onClick={() => setSelectedReceipt(payment)} className="athlete-action-secondary"><Receipt size={13} /><BilingualText value={bi('Receipt record', 'سجل الإيصال')} /></button></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="athlete-empty-system mt-5"><div><FileQuestion size={34} className="mx-auto text-slate-500" /><h3 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No payment records are linked yet', 'لا توجد سجلات دفع مرتبطة حتى الآن')} /></h3><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Amounts, payment methods, transaction references and receipts remain empty until a billing record is connected to this athlete.', 'تظل المبالغ وطرق الدفع ومراجع المعاملات والإيصالات فارغة حتى يتم ربط سجل مالي بهذا اللاعب.')} /></p></div></div>
        )}
      </section>

      {selectedReceipt && (
        <div className="athlete-modal-overlay" onClick={() => setSelectedReceipt(null)} role="presentation">
          <div className="athlete-modal-content !max-w-lg p-6" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="payment-record-title" id="receipt-detail-modal">
            <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10"><div className="flex items-start gap-2"><Receipt size={18} className="text-amber-400 mt-0.5" /><div><span className="text-[10px] text-slate-500"><BilingualText value={bi('Payment record', 'سجل الدفع')} /></span><h2 id="payment-record-title" className="text-base font-bold text-white"><BilingualText value={bi('Receipt Details', 'تفاصيل الإيصال')} /></h2></div></div><button type="button" onClick={() => setSelectedReceipt(null)} className="p-2 text-slate-400 hover:text-white rounded-lg" aria-label="Close receipt details | إغلاق تفاصيل الإيصال"><X size={18} /></button></header>
            <div className="athlete-field-grid mt-5"><Field label={bi('Athlete', 'اللاعب')} value={`${player.nameEn} · ${player.nameAr}`} /><Field label={bi('Amount', 'المبلغ')} value={`${selectedReceipt.amount} ${selectedReceipt.currency}`} /><Field label={bi('Date', 'التاريخ')} value={selectedReceipt.paidAt} /><Field label={bi('Payment method', 'طريقة الدفع')} value={`${selectedReceipt.method.en} · ${selectedReceipt.method.ar}`} /><Field label={bi('Reference', 'المرجع')} value={selectedReceipt.reference} mono /><Field label={bi('Status', 'الحالة')} value={paymentStatusText(selectedReceipt.status)} /></div>
            <div className="athlete-truth-note mt-5"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('This modal reflects an existing payment record. It does not create a PDF invoice or claim a downloadable receipt file unless one is connected.', 'تعكس هذه النافذة سجل دفع موجودًا. ولا تنشئ فاتورة PDF ولا تدعي وجود ملف إيصال قابل للتنزيل ما لم يتم ربطه فعليًا.')} /></div>
            <div className="athlete-action-row mt-5 justify-end"><button type="button" onClick={() => setSelectedReceipt(null)} className="athlete-action-primary"><BilingualText value={bi('Close', 'إغلاق')} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentStat({ label, value }: { label: { en: string; ar: string }; value?: string }) {
  return <div className="athlete-stat-pill"><span><BilingualText value={label} /></span><strong className={value ? 'text-white text-sm font-bold' : 'text-slate-500 text-xs font-semibold'}>{value ?? <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function Field({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value || <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function paymentStatusText(status: Payment['status']) {
  return status === 'completed' ? 'Completed · مكتمل' : status === 'pending' ? 'Pending · قيد الانتظار' : status === 'failed' ? 'Failed · فشل' : 'Refunded · مسترد';
}

function PaymentStatus({ status }: { status: Payment['status'] }) {
  const tone = status === 'completed' ? 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10' : status === 'pending' ? 'text-amber-300 border-amber-400/20 bg-amber-400/10' : 'text-slate-300 border-white/10 bg-white/5';
  return <span className={`inline-flex min-h-10 items-center px-3 rounded-xl border text-[10px] font-bold ${tone}`}>{paymentStatusText(status)}</span>;
}
