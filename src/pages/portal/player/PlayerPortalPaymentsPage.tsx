import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  X,
  Printer,
  FileQuestion,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import type { Payment } from '../../../domain/contracts';

export function PlayerPortalPaymentsPage() {
  const { player, payments, subscriptions } = usePlayerSession();
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  if (!player) return null;

  return (
    <div className="space-y-6" id="player-payments-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Receipt size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                <BilingualText value={bi('Account Billing & Receipts', 'الفواتير والإيصالات')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Payments & Transaction Records', 'سجل الدفعات والمعاملات')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Financial transactions on record for athlete ${player.nameEn}`,
                  `المعاملات المالية المسجلة للاعب ${player.nameAr}`
                )}
              />
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-400" />
            <span><BilingualText value={bi('Payment Records', 'سجلات الدفع')} /></span>
          </span>
        </div>
      </div>

      {/* Transaction List / Truthful Empty State */}
      <div className="athlete-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white">
              <BilingualText value={bi('Transactions History', 'سجل المعاملات المالية')} />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              <BilingualText value={bi('Payment receipts on record', 'إيصالات السداد المسجلة في الحساب')} />
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {payments.length} <BilingualText value={bi('records', 'سجلات')} />
          </span>
        </div>

        {payments.length > 0 ? (
          <div className="space-y-3" id="payments-history-list">
            {payments.map((txn) => {
              const isCompleted = txn.status === 'completed';
              return (
                <div
                  key={txn.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>

                    <div className="space-y-0.5">
                      <strong className="text-xs sm:text-sm font-bold text-white block">
                        <BilingualText value={bi(`Membership Dues (${txn.currency} ${txn.amount})`, `رسوم العضوية (${txn.amount} ${txn.currency})`)} />
                      </strong>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono">{txn.paidAt}</span>
                        <span>·</span>
                        <span><BilingualText value={txn.method} /></span>
                        <span>·</span>
                        <span className="font-mono text-slate-500 text-[11px]">{txn.reference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      }`}
                    >
                      {txn.status}
                    </span>

                    <button
                      onClick={() => setSelectedReceipt(txn)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt size={13} className="text-amber-400" />
                      <span><BilingualText value={bi('View Receipt', 'عرض الإيصال')} /></span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <FileQuestion size={32} className="mx-auto text-slate-500" />
            <h4 className="text-sm font-bold text-slate-200">
              <BilingualText value={bi('No payment records are available for this player.', 'لا توجد سجلات دفع متاحة لهذا اللاعب.')} />
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              <BilingualText
                value={bi(
                  'No billing records are associated with your athlete profile at this time.',
                  'لا توجد سجلات فواتير مرتبطة بملف الرياضي حالياً.'
                )}
              />
            </p>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="athlete-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div
            className="athlete-modal-content !max-w-md p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
            id="receipt-detail-modal"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  <BilingualText value={bi('Payment Receipt', 'إيصال الدفع')} />
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Reference', 'رقم المرجع')} />:</span>
                  <strong className="text-white font-mono">{selectedReceipt.reference}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Athlete', 'اسم الرياضي')} />:</span>
                  <strong className="text-amber-400">{player.nameEn} · {player.nameAr}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Amount', 'المبلغ')} />:</span>
                  <strong className="text-white font-mono text-sm">{selectedReceipt.amount} {selectedReceipt.currency}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Date', 'التاريخ')} />:</span>
                  <span className="font-mono text-slate-200">{selectedReceipt.paidAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Payment Method', 'طريقة الدفع')} />:</span>
                  <strong className="text-white"><BilingualText value={selectedReceipt.method} /></strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Status', 'الحالة')} />:</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedReceipt.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span><BilingualText value={bi('Print Receipt', 'طباعة الإيصال')} /></span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors"
              >
                <BilingualText value={bi('Close', 'إغلاق')} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
