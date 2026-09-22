import { useState } from 'react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { PlayerHeroBanner } from '../../../portals/player/components/PlayerHeroBanner';
import { PlayerAthleteIdentityCard } from '../../../portals/player/components/PlayerAthleteIdentityCard';
import { PlayerNextSessionCard } from '../../../portals/player/components/PlayerNextSessionCard';
import { PlayerAttendanceSummaryCard } from '../../../portals/player/components/PlayerAttendanceSummaryCard';
import { PlayerPerformanceSnapshotCard } from '../../../portals/player/components/PlayerPerformanceSnapshotCard';
import { PlayerAchievementsCard } from '../../../portals/player/components/PlayerAchievementsCard';
import { PlayerQuickActionsCard } from '../../../portals/player/components/PlayerQuickActionsCard';
import { TrainingLog } from '../../../portals/player/components/TrainingLog';
import { useTrainingLog } from '../../../portals/player/hooks/useTrainingLog';
import { selectUpcomingSession } from '../../../portals/player/foundation/playerSelectors';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { MessageSquareText, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiSettings } from '../../../ui/theme/useUiSettings';

export function PlayerPortalOverviewPage() {
  const {
    player,
    sport,
    group,
    coach,
    program,
    branch,
    sessions,
    attendanceStats,
    feedback,
    overallScore,
    metrics,
    achievements,
    isPreviewSession,
    unreadNotificationCount,
  } = usePlayerSession();
  const { bilingualOrder } = useUiSettings();
  const [identityOpen, setIdentityOpen] = useState(false);

  if (!player) return null;

  const nextSession = selectUpcomingSession(sessions);
  const latestFeedback = [...feedback].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).at(0);
  const training = useTrainingLog(player.id);

  return (
    <div className="space-y-6" id="player-overview-page">
      {/* Semantic heading hierarchy for accessibility and test contract */}
      <h1 className="sr-only athlete-overview-title">
        <BilingualText value={bi('Player Portal Overview', 'نظرة عامة على بوابة اللاعب')} />
      </h1>

      {/* 01 — Hero / Portal Header */}
      <PlayerHeroBanner />

      {/* 02 — Primary 2-Column Reference Dashboard */}
      <div className="player-reference-dashboard-grid">
        {/* Left Column (Dominant Ivory Surfaces) */}
        <div className="player-reference-col-left space-y-5">
          {/* Athlete Profile */}
          <PlayerAthleteIdentityCard
            player={player}
            sport={sport}
            group={group}
            coach={coach}
            program={program}
            branch={branch}
            nextSession={nextSession}
            attendanceRate={attendanceStats.rate}
            overallScore={overallScore}
            preview={isPreviewSession}
            onOpenIdentity={() => setIdentityOpen(true)}
          />

          {/* Attendance Summary */}
          <PlayerAttendanceSummaryCard stats={attendanceStats} />

          {/* Achievements */}
          <PlayerAchievementsCard achievements={achievements.length > 0 ? achievements : player.achievements} />
        </div>

        {/* Right Column (Cinematic Dark Surfaces) */}
        <div className="player-reference-col-right space-y-5">
          {/* Next Training Session */}
          <PlayerNextSessionCard
            session={nextSession}
            sport={sport}
            group={group}
            coach={coach}
            branch={branch}
          />

          {/* Performance Snapshot */}
          <PlayerPerformanceSnapshotCard
            overallScore={overallScore}
            metrics={metrics}
          />

          {/* Quick Actions */}
          <PlayerQuickActionsCard unreadCount={unreadNotificationCount} />
        </div>
      </div>

      {/* 03 — Secondary Fold (Preserved Product Work: Feedback & Training Log) */}
      <div className="grid grid-cols-1 xl:grid-cols-[.9fr_1.1fr] gap-5 pt-3">
        <section className="athlete-dark-card p-5 sm:p-6">
          <header className="flex items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-[.16em] text-amber-400">
                <BilingualText value={bi('Coach perspective', 'رؤية المدرب')} />
              </span>
              <h3 className="mt-1 text-base font-black text-white">
                <BilingualText value={bi('Latest recorded feedback', 'أحدث الملاحظات المسجلة')} />
              </h3>
            </div>
            <MessageSquareText size={18} className="text-amber-400" />
          </header>
          {latestFeedback ? (
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-sm leading-7 text-slate-200">
                <BilingualText value={latestFeedback.summary} />
              </p>
              <Link to="/player/feedback" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-amber-300 hover:text-amber-200 transition-colors">
                <BilingualText value={bi('Open feedback center', 'فتح مركز الملاحظات')} />
                <ArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-white/[.015] p-4 text-xs text-slate-400 leading-relaxed">
              <BilingualText
                value={bi(
                  'No detailed coach feedback is recorded yet for this athlete.',
                  'لم يتم تسجيل ملاحظات تفصيلية بعد من المدرب لهذا اللاعب.'
                )}
              />
            </div>
          )}
        </section>

        <TrainingLog
          entries={training.entries}
          weeklyGoal={training.weeklyGoal}
          currentWeekMinutes={training.currentWeekMinutes}
          onAddEntry={training.addEntry}
          onDeleteEntry={training.deleteEntry}
          onUpdateGoal={training.updateWeeklyGoal}
        />
      </div>

      {/* Identity Preview Modal (Preserved) */}
      {identityOpen && (
        <div className="athlete-modal-overlay" role="presentation" onClick={() => setIdentityOpen(false)}>
          <div
            className="athlete-modal-content w-full max-w-lg athlete-dark-card p-6 border-amber-400/30"
            role="dialog"
            aria-modal="true"
            aria-labelledby="athlete-identity-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black">
                  <BilingualText value={bi('Identity preview', 'معاينة الهوية')} />
                </span>
                <h2 id="athlete-identity-modal-title" className="mt-1 text-xl font-black text-white">
                  {bilingualOrder === 'ar-first' ? player.nameAr : player.nameEn}
                  <span
                    lang={bilingualOrder === 'ar-first' ? 'en' : 'ar'}
                    dir={bilingualOrder === 'ar-first' ? 'ltr' : 'rtl'}
                    className="block text-base text-amber-300 mt-1 text-left rtl:text-right"
                  >
                    {bilingualOrder === 'ar-first' ? player.nameEn : player.nameAr}
                  </span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIdentityOpen(false)}
                className="p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white"
                aria-label="Close athlete identity | إغلاق هوية اللاعب"
              >
                <X size={18} />
              </button>
            </header>
            <div className="athlete-field-grid mt-5">
              <div className="athlete-field">
                <span><BilingualText value={bi('Player ID', 'معرف اللاعب')} /></span>
                <strong className="font-mono">{player.id}</strong>
              </div>
              <div className="athlete-field">
                <span><BilingualText value={bi('Sport', 'الرياضة')} /></span>
                <strong>{sport ? `${sport.name.en} · ${sport.name.ar}` : '—'}</strong>
              </div>
              <div className="athlete-field">
                <span><BilingualText value={bi('Program', 'البرنامج')} /></span>
                <strong>{program ? `${program.name.en} · ${program.name.ar}` : '—'}</strong>
              </div>
              <div className="athlete-field">
                <span><BilingualText value={bi('Branch / Venue', 'الفرع / الموقع')} /></span>
                <strong>{branch ? `${branch.name.en} · ${branch.name.ar}` : '—'}</strong>
              </div>
              <div className="athlete-field">
                <span><BilingualText value={bi('Level', 'المستوى')} /></span>
                <strong>{`${player.level.en} · ${player.level.ar}`}</strong>
              </div>
              <div className="athlete-field">
                <span><BilingualText value={bi('Coach', 'المدرب')} /></span>
                <strong>{coach ? `${coach.nameEn} · ${coach.nameAr}` : '—'}</strong>
              </div>
            </div>
            <div className="athlete-truth-note mt-5">
              <ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <BilingualText value={bi('This is a visual player-record preview, not an issued credential, access token or official membership card.', 'هذه معاينة بصرية لسجل اللاعب وليست بطاقة اعتماد صادرة أو رمز دخول أو بطاقة عضوية رسمية.')} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
