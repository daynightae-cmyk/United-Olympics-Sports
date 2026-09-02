import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Player } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { PlayerAvatar, PlayerPreviewBadge } from './PlayerUI';

export function PlayerAppHeader({ player }: { player: Player }) {
  return <header className="player-app-header">
    <Link to="/player" className="player-brand" aria-label="United Olympics Sports Player App | تطبيق اللاعب يونايتد أوليمبيكس سبورت">
      <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
      <span><strong><BilingualText value={bi('United Olympics Sports', 'يونايتد أوليمبيكس سبورت')} /></strong><small><BilingualText value={bi('Player App', 'تطبيق اللاعب')} /></small></span>
    </Link>
    <div className="player-header-actions">
      <PlayerPreviewBadge />
      <div className="player-header-identity"><PlayerAvatar id={player.id} /><span><strong><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></strong><small><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></small></span></div>
      <Link className="player-public-link" to="/"><ExternalLink size={16} /><BilingualText value={bi('Public Website', 'الموقع العام')} /></Link>
    </div>
  </header>;
}
