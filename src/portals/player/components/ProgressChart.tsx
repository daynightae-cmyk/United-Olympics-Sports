import React, { useMemo } from 'react';
import type { AttendanceRecord } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

interface ProgressChartProps {
  records: AttendanceRecord[];
}

type AttendanceBar = {
  date: string;
  label: string;
  count: number;
};

export function ProgressChart({ records }: ProgressChartProps) {
  const data = useMemo<AttendanceBar[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bars: AttendanceBar[] = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - index));
      return {
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: 0,
      };
    });

    const byDate = new Map(bars.map((bar) => [bar.date, bar]));
    records.forEach((record) => {
      if (record.status !== 'present' && record.status !== 'late') return;
      const parsedDate = new Date(record.date);
      if (Number.isNaN(parsedDate.getTime())) return;
      const key = parsedDate.toISOString().slice(0, 10);
      const bar = byDate.get(key);
      if (bar) bar.count += 1;
    });

    return bars;
  }, [records]);

  const max = Math.max(0, ...data.map((item) => item.count));
  const hasRecordedAttendance = max > 0;

  return (
    <section className="athlete-glass-card p-5" aria-labelledby="player-attendance-frequency-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 id="player-attendance-frequency-title" className="text-sm font-bold text-white">
            <BilingualText value={bi('Recorded Attendance Frequency', 'تكرار الحضور المسجل')} />
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">
            <BilingualText value={bi('Last 30 days from available attendance records.', 'آخر 30 يومًا وفق سجلات الحضور المتاحة.')} />
          </p>
        </div>
      </div>

      {!hasRecordedAttendance ? (
        <div className="flex min-h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
          <p className="max-w-sm text-xs leading-relaxed text-slate-400">
            <BilingualText value={bi('No recorded attendance is available for this period.', 'لا توجد سجلات حضور متاحة لهذه الفترة.')} />
          </p>
        </div>
      ) : (
        <div
          className="grid h-52 grid-cols-[repeat(30,minmax(3px,1fr))] items-end gap-1 rounded-2xl border border-white/10 bg-black/10 px-3 pb-3 pt-5"
          role="img"
          aria-label="Recorded attendance frequency for the last 30 days | تكرار الحضور المسجل لآخر 30 يومًا"
        >
          {data.map((item, index) => {
            const height = item.count === 0 ? 2 : Math.max(18, Math.round((item.count / max) * 100));
            const showLabel = index % 5 === 0 || index === data.length - 1;

            return (
              <div key={item.date} className="flex h-full min-w-0 flex-col items-center justify-end gap-1">
                <div className="flex h-full w-full items-end justify-center">
                  <span
                    className={`block w-full max-w-3 rounded-t-md transition-[height] duration-300 ${
                      item.count > 0 ? 'bg-gradient-to-t from-amber-600 to-amber-300' : 'bg-white/10'
                    }`}
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count}`}
                  />
                </div>
                <span className="h-4 whitespace-nowrap text-[8px] text-slate-500">
                  {showLabel ? item.label : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="sr-only">
        {data.map((item) => `${item.label}: ${item.count}`).join(', ')}
      </div>
    </section>
  );
}