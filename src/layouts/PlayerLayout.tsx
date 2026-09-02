import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { PlayerAppHeader } from '../components/player/PlayerAppHeader';
import { PlayerBottomNav } from '../components/player/PlayerBottomNav';
import { PlayerPreviewProvider, usePlayerPreview } from '../components/player/PlayerPreviewContext';
import { PlayerAttendancePage } from '../pages/player/PlayerAttendancePage';
import { PlayerDashboardPage } from '../pages/player/PlayerDashboardPage';
import { PlayerFeedbackPage } from '../pages/player/PlayerFeedbackPage';
import { PlayerIdPage } from '../pages/player/PlayerIdPage';
import { PlayerPerformancePage } from '../pages/player/PlayerPerformancePage';
import { PlayerProgressPage } from '../pages/player/PlayerProgressPage';
import '../styles/player.css';

function PlayerLayoutContent() {
  const { player, requestedId } = usePlayerPreview();
  if (!player) return <div className="player-shell player-error-shell"><section className="player-route-error"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><AlertTriangle aria-hidden="true" /><h1><BilingualText value={bi('Preview Player Not Found', 'اللاعب التجريبي غير موجود')} /></h1><p><BilingualText value={bi(`The requested preview identity ${requestedId} could not be resolved. No substitute player was selected.`, `تعذر العثور على الهوية التجريبية المطلوبة ${requestedId}. لم يتم اختيار لاعب بديل.`)} /></p><Link to="/"><ArrowLeft size={16} /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link></section></div>;

  return <div className="player-shell" data-preview-player={player.id}>
    <PlayerAppHeader player={player} />
    <main className="player-main">
      <Routes>
        <Route index element={<PlayerDashboardPage />} />
        <Route path="id" element={<PlayerIdPage />} />
        <Route path="progress" element={<PlayerProgressPage />} />
        <Route path="performance" element={<PlayerPerformancePage />} />
        <Route path="attendance" element={<PlayerAttendancePage />} />
        <Route path="feedback" element={<PlayerFeedbackPage />} />
        <Route path="*" element={<Navigate to="/player" replace />} />
      </Routes>
    </main>
    <PlayerBottomNav />
  </div>;
}

export function PlayerLayout() {
  return <PlayerPreviewProvider><PlayerLayoutContent /></PlayerPreviewProvider>;
}
