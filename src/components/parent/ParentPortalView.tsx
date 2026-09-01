import React, { useState } from 'react';
import { PlayerRecord, InvoiceRecord, TrainingSession } from '../../types';
import {
  Users,
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';

interface ParentPortalViewProps {
  childrenPlayers: PlayerRecord[];
  invoices: InvoiceRecord[];
  sessions: TrainingSession[];
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({
  childrenPlayers,
  invoices,
  sessions,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenPlayers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'attendance' | 'invoices' | 'coach_notes' | 'pickup'>('attendance');
  const [pickupCode, setPickupCode] = useState<string>('UOS-SAFE-PICKUP-8842');
  const [invoiceList, setInvoiceList] = useState<InvoiceRecord[]>(invoices);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  const currentChild = childrenPlayers.find((c) => c.id === selectedChildId) || childrenPlayers[0];

  const handlePayInvoice = (invId: string) => {
    setPayingInvoiceId(invId);
    setTimeout(() => {
      setInvoiceList((prev) =>
        prev.map((inv) =>
          inv.id === invId
            ? { ...inv, status: 'paid', paidAt: '2026-09-01', paymentMethod: 'InstaPay Direct' }
            : inv
        )
      );
      setPayingInvoiceId(null);
    }, 1000);
  };

  const regeneratePickupCode = () => {
    const randomCode = `UOS-SAFE-PICKUP-${Math.floor(1000 + Math.random() * 9000)}`;
    setPickupCode(randomCode);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Parent Overview Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-black text-amber-200">Parent Guardian Portal</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              DR. MONA HASSAN
            </span>
          </div>
          <div className="font-arabic text-sm text-amber-400 font-semibold" dir="rtl">
            بوابة أولياء الأمور • متابعة الحضور والمدفوعات والأمان
          </div>
        </div>

        {/* Multi-Child Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-mono">SELECT ATHLETE:</span>
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            {childrenPlayers.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedChildId === child.id
                    ? 'bg-amber-500 text-black shadow font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <img src={child.photo} alt={child.name.en} className="w-5 h-5 rounded-full object-cover" />
                <span>{child.name.en.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Child Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-[#14141c] to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentChild.photo}
            alt={currentChild.name.en}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{currentChild.name.en}</h3>
            <h4 className="font-arabic text-xs text-amber-400 font-semibold">{currentChild.name.ar}</h4>
            <div className="text-xs text-zinc-400 mt-1">
              Discipline: <span className="text-amber-200">{currentChild.sport}</span> • Campus:{' '}
              <span className="text-zinc-300">{currentChild.branch.en}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Attendance Rate</div>
            <div className="text-lg font-black text-emerald-400 font-mono">{currentChild.stats.attendanceRate}%</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-[10px] text-zinc-400 uppercase font-mono">Overall Form</div>
            <div className="text-lg font-black text-amber-300 font-mono">{currentChild.stats.overallRating}/100</div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
        {[
          { id: 'attendance', en: 'Live Attendance & Pitch Status', ar: 'الحضور والملعب' },
          { id: 'pickup', en: 'Safe Pickup QR Pass', ar: 'تصريح الاستلام الآمن' },
          { id: 'invoices', en: 'Tuition & Invoices', ar: 'الرسوم والفواتير' },
          { id: 'coach_notes', en: 'Coach Progress Report', ar: 'تقرير المدرب' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black shadow font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>{tab.en}</span> / <span className="font-arabic text-[11px]">{tab.ar}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Live Attendance & Pitch Status */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white">Weekly Training Schedule & Pitch Check-in</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-200">{sess.title.en}</span>
                    <span className="text-xs font-mono text-amber-300">{sess.time}</span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Pitch: {sess.pitch.en} • Head Coach: <span className="text-zinc-200">{sess.coach.en}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] text-emerald-300">Biometric turnstile check-in active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Phone className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Campus Security & WhatsApp Line</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Parents can contact the on-duty campus supervisor directly for early dismissal, authorized driver handover, or medical updates.
            </p>
            <p className="font-arabic text-xs text-amber-300/80" dir="rtl">
              خط تواصل مباشر مع مشرف أمن الفرع لحالات الخروج المبكر أو الإخطارات الطارئة.
            </p>

            <a
              href="https://wa.me/971503281920?text=Hello%20Campus%20Supervisor"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Campus Supervisor • الاتصال بمشرف الأمن</span>
            </a>
          </div>
        </div>
      )}

      {/* Tab 2: Safe Pickup QR Pass */}
      {activeTab === 'pickup' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#121218] border-2 border-amber-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Authorized Safe Pickup Pass</h3>
            <h4 className="font-arabic text-sm text-amber-300">تصريح الاستلام الآمن للأبناء من بوابات المجمع</h4>
            <p className="text-xs text-zinc-400">
              Present this encrypted QR token to the gate security officer when picking up <span className="text-amber-200 font-bold">{currentChild.name.en}</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white w-52 h-52 mx-auto flex items-center justify-center shadow-lg">
            <QrCode className="w-full h-full text-black" />
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-amber-500/30 space-y-1">
            <div className="text-[10px] uppercase font-mono text-zinc-400">One-Time Security Token</div>
            <div className="text-lg font-black font-mono text-amber-300 tracking-wider">{pickupCode}</div>
          </div>

          <button
            onClick={regeneratePickupCode}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 text-xs font-semibold transition cursor-pointer"
          >
            Regenerate Security Pass • تحديث الرمز
          </button>
        </div>
      )}

      {/* Tab 3: Tuition & Invoices */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Tuition & Membership Invoices</h3>
              <p className="font-arabic text-xs text-amber-400">الفواتير وسجل المدفوعات والاشتراكات المعتمدة</p>
            </div>
          </div>

          <div className="space-y-4">
            {invoiceList.map((inv) => (
              <div
                key={inv.id}
                className="p-6 rounded-2xl bg-[#121218] border border-amber-500/20 hover:border-amber-400/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-100">{inv.program.en}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Student: <span className="text-amber-200">{inv.studentName.en}</span> • Invoice ID:{' '}
                    <span className="font-mono text-zinc-300">{inv.invoiceNumber}</span>
                  </div>
                  <div className="text-xs text-zinc-500">Due Date: {inv.dueDate}</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-amber-300">
                      {inv.amount} {inv.currency}
                    </div>
                    {inv.paidAt && (
                      <div className="text-[10px] text-emerald-400 font-mono">Paid on {inv.paidAt}</div>
                    )}
                  </div>

                  {inv.status === 'paid' ? (
                    <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Receipt PDF</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePayInvoice(inv.id)}
                      disabled={payingInvoiceId === inv.id}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {payingInvoiceId === inv.id ? 'Processing...' : 'Pay via InstaPay • دفع إلكتروني'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Coach Progress Report */}
      {activeTab === 'coach_notes' && (
        <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Quarterly Athletic Progress Evaluation</h3>
              <p className="font-arabic text-xs text-amber-400">التقرير الفني الشامل لمستوى الطالب</p>
            </div>
            <span className="text-xs font-mono text-amber-300">Q3 2026 OFFICIAL REPORT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs text-zinc-400">Discipline & Attendance</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">Excellent (ممتاز)</div>
              <div className="text-[11px] text-zinc-500 mt-1">100% on-time arrival rate</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs text-zinc-400">Technical Skill Evolution</div>
              <div className="text-xl font-bold text-amber-300 mt-1">+18% Growth</div>
              <div className="text-[11px] text-zinc-500 mt-1">Biomechanics & stroke velocity</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs text-zinc-400">Next Competition</div>
              <div className="text-xl font-bold text-amber-200 mt-1">National Cup</div>
              <div className="text-[11px] text-zinc-500 mt-1">Qualified for 100m heats</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <div className="font-bold text-amber-300">Head Coach Summary:</div>
            <p className="leading-relaxed">
              "Athlete demonstrates exceptional dedication. We are currently conditioning stamina for the upcoming national finals in Cairo. Please ensure balanced recovery nutrition on Tuesdays and Thursdays."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
