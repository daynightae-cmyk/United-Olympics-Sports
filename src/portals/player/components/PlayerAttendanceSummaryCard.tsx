import { Check, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

interface PlayerAttendanceSummaryCardProps {
  stats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    rate: number | null;
  };
}

export function PlayerAttendanceSummaryCard({ stats }: PlayerAttendanceSummaryCardProps) {
  const rate = stats.rate !== null ? Math.min(100, Math.max(0, stats.rate)) : null;

  // SVG circular progress parameters
  const radius = 32;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = rate !== null
    ? circumference - (rate / 100) * circumference
    : circumference;

  return (
    <article className="athlete-ivory-card attendance-summary-reference-card" aria-labelledby="ref-attendance-title">
      <header className="athlete-ivory-card__header">
        <h2 id="ref-attendance-title" className="athlete-ivory-card__title">
          <BilingualText value={bi('Attendance Summary', 'ملخص الحضور')} />
        </h2>
        <Link to="/player/attendance" className="athlete-ivory-card__period-link">
          <BilingualText value={bi('This Month', 'هذا الشهر')} />
        </Link>
      </header>

      <div className="attendance-summary-reference-row">
        {/* Present */}
        <div className="attendance-summary-metric-col">
          <div className="attendance-summary-icon-circle attendance-summary-icon-circle--present">
            <Check size={16} strokeWidth={3} />
          </div>
          <span className="attendance-summary-metric-label">
            <BilingualText value={bi('Present', 'حاضر')} />
          </span>
          <strong className="attendance-summary-metric-val">{stats.present}</strong>
        </div>

        {/* Absent */}
        <div className="attendance-summary-metric-col">
          <div className="attendance-summary-icon-circle attendance-summary-icon-circle--absent">
            <X size={16} strokeWidth={3} />
          </div>
          <span className="attendance-summary-metric-label">
            <BilingualText value={bi('Absent', 'غائب')} />
          </span>
          <strong className="attendance-summary-metric-val">{stats.absent}</strong>
        </div>

        {/* Late */}
        <div className="attendance-summary-metric-col">
          <div className="attendance-summary-icon-circle attendance-summary-icon-circle--late">
            <Clock size={16} strokeWidth={3} />
          </div>
          <span className="attendance-summary-metric-label">
            <BilingualText value={bi('Late', 'متأخر')} />
          </span>
          <strong className="attendance-summary-metric-val">{stats.late}</strong>
        </div>

        {/* Attendance Rate (Circular Ring) */}
        <div className="attendance-summary-rate-col">
          <div className="attendance-summary-ring-container">
            <svg height={radius * 2} width={radius * 2} className="attendance-summary-ring-svg">
              <circle
                stroke="rgba(0, 0, 0, 0.08)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#10B981"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="attendance-summary-ring-text">
              {rate !== null ? `${rate}%` : '—'}
            </div>
          </div>
          <div className="attendance-summary-rate-label-box">
            <span className="attendance-summary-rate-label-en">Attendance Rate</span>
            <span className="attendance-summary-rate-label-ar">معدل الحضور</span>
          </div>
        </div>
      </div>
    </article>
  );
}
