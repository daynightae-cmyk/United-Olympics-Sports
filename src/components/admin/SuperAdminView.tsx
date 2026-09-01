import React, { useState } from 'react';
import { Program, BranchLocation, InvoiceRecord, PlayerRecord } from '../../types';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

interface SuperAdminViewProps {
  programs: Program[];
  branches: BranchLocation[];
  invoices: InvoiceRecord[];
  players: PlayerRecord[];
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  programs,
  branches,
  invoices,
  players,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'members' | 'facilities' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalTuition = invoices.reduce((acc, curr) => acc + curr.amount, 0);
  const paidTuition = invoices.filter((i) => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const pendingTuition = totalTuition - paidTuition;

  const filteredPlayers = players.filter((p) =>
    p.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sport.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Super Admin Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121218] border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-black text-amber-200">United Olympics Sports Executive HQ</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              DIRECTOR GENERAL HQ
            </span>
          </div>
          <div className="font-arabic text-sm text-amber-400 font-semibold" dir="rtl">
            منظومة الإدارة العليا والتحكم الشامل • العمليات والمالية وإدارة الفروع
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800">
          {[
            { id: 'overview', en: 'Executive Overview', ar: 'لوحة المؤشرات' },
            { id: 'finance', en: 'Tuition & Billing', ar: 'المالية والفواتير' },
            { id: 'members', en: 'Athletes & Staff', ar: 'اللاعبين والمدربين' },
            { id: 'facilities', en: '4 Campuses Hub', ar: 'الفروع والملاعب' },
            { id: 'audit', en: 'System Audit Logs', ar: 'سجل العمليات' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black shadow font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>{tab.en}</span> / <span className="font-arabic text-[11px]">{tab.ar}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Executive Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>TOTAL REVENUE (Q3)</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-amber-300">1,840,000 EGP</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+22.4% vs previous quarter</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>ACTIVE ATHLETES</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-zinc-100">850 Athletes</div>
              <div className="text-xs text-amber-400 font-arabic">عبر 4 فروع معتمدة</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>CAMPUS OCCUPANCY</span>
                <Building className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-400">92.8%</div>
              <div className="text-xs text-zinc-400">975 / 1,050 total slots filled</div>
            </div>

            <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span>ATTENDANCE DISCIPLINE</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black font-mono text-amber-300">96.2%</div>
              <div className="text-xs text-zinc-400 font-arabic">معدل الانضباط العام</div>
            </div>
          </div>

          {/* Regional Hub Breakdown */}
          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <h3 className="text-base font-bold text-white">4 Campuses Operations Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {branches.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="font-bold text-sm text-amber-200">{b.name.en.split(' (')[0]}</div>
                  <div className="text-xs text-zinc-400">{b.city.en}</div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${(b.activeAthletes / b.capacity) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                    <span>{b.activeAthletes} Enrolled</span>
                    <span>{b.capacity} Max</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Finance & Invoices */}
      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="text-xs text-zinc-400 uppercase font-mono">Total Billed</div>
              <div className="text-2xl font-black font-mono text-white mt-1">{totalTuition} EGP</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-emerald-500/30">
              <div className="text-xs text-emerald-400 uppercase font-mono">Collected (Paid)</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{paidTuition} EGP</div>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-amber-500/30">
              <div className="text-xs text-amber-400 uppercase font-mono">Pending Collection</div>
              <div className="text-2xl font-black font-mono text-amber-300 mt-1">{pendingTuition} EGP</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Master Invoice Ledger</h3>
              <button className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 hover:bg-zinc-800 cursor-pointer">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-zinc-100">{inv.studentName.en} ({inv.parentName.en})</div>
                    <div className="text-zinc-400 font-mono">{inv.invoiceNumber} • {inv.program.en}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-amber-300">{inv.amount} {inv.currency}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Members & Staff */}
      {activeTab === 'members' && (
        <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Athletes & Staff Directory</h3>
              <p className="font-arabic text-xs text-amber-400">سجل الرياضيين والكوادر التدريبية المعتمدة</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search athlete or sport..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img src={player.photo} alt={player.name.en} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-zinc-100">{player.name.en} ({player.name.ar})</div>
                    <div className="text-zinc-400">
                      {player.sport} • {player.squad} • {player.branch.en}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <div className="font-bold text-amber-300">OVR: {player.stats.overallRating}</div>
                    <div className="text-[10px] text-zinc-500">Rank #{player.rank}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    ACTIVE ATHLETE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Facilities & Pitch Hub */}
      {activeTab === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((b) => (
            <div key={b.id} className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="font-bold text-base text-amber-200">{b.name.en}</h4>
                  <h5 className="font-arabic text-xs text-amber-400">{b.name.ar}</h5>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">OPERATIONAL</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-bold text-zinc-300">Installed Pitch Equipment & Amenities:</div>
                {b.facilities.map((fac, idx) => (
                  <div key={idx} className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                    {fac.en}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: System Audit Logs */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-2xl bg-[#121218] border border-amber-500/30 space-y-4">
          <h3 className="text-base font-bold text-white">Real-Time Security & System Audit Trail</h3>
          <div className="space-y-2 font-mono text-xs">
            {[
              { time: '16:24:10', event: 'QR Attendance Pass scanned at Cairo Olympic City Gate 4 (Athlete #101 Karim)', level: 'INFO' },
              { time: '15:10:04', event: 'Tuition Payment 9,600 EGP processed via InstaPay Gateway for Talia Hassan', level: 'FINANCE' },
              { time: '14:45:22', event: 'Coach Tarek El-Khatib synced U15 match formation 4-3-3', level: 'COACH' },
              { time: '12:00:15', event: 'Safe Pickup Pass regenerated by Dr. Mona Hassan (Token UOS-SAFE-8842)', level: 'SECURITY' },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">{log.time}</span>
                  <span className="text-zinc-300">{log.event}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {log.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
