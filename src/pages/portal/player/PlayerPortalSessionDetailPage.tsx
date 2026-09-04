import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PlayerSessionDetailContent } from '../../../portals/player/components/PlayerSessionDetailContent';

export function PlayerPortalSessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <div className="space-y-6" id="player-session-detail-page">
      {/* Back navigation */}
      <Link
        to="/player/schedule"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft size={16} className="rtl:rotate-180" />
        <span><BilingualText value={bi('Back to Training Schedule', 'العودة لجدول التدريب')} /></span>
      </Link>

      {sessionId && <PlayerSessionDetailContent sessionId={sessionId} />}
    </div>
  );
}
