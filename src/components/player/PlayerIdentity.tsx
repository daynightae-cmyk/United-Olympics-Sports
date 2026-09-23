import { useState, type ReactNode } from 'react';
import { ShieldCheck, UserRound } from 'lucide-react';
import type { Player } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export function PlayerPortrait({ player, size = 'hero' }: { player: Player; size?: 'hero' | 'medium' | 'small' }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = Boolean(player.photo) && !failed;
  return <div className={`player-portrait player-portrait-${size} ${loaded ? 'is-loaded' : ''}`}>
    {showImage ? <img src={player.photo} alt={`${player.nameEn} | ${player.nameAr}`} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} loading={size === 'hero' ? 'eager' : 'lazy'} /> : <span aria-label="Player portrait unavailable | صورة اللاعب غير متاحة"><UserRound /></span>}
  </div>;
}

export function PlayerIdentityBadge({ children }: { children: ReactNode }) { return <span className="player-identity-badge">{children}</span>; }

export function PlayerIdentityStat({ value, label }: { value: string | number; label: ReturnType<typeof bi> }) {
  return <div className="player-identity-stat"><strong>{value}</strong><BilingualText value={label}/></div>;
}

type IdentityCardProps = {
  player: Player;
  sport: ReturnType<typeof bi>;
  group?: ReturnType<typeof bi>;
  coach?: { nameEn: string; nameAr: string };
  branch?: ReturnType<typeof bi>;
  attendance: number | null;
  performance: number | null;
  nextSession?: string;
};

export function PlayerIdentityCard({ player, sport, group, coach, branch, attendance, performance, nextSession }: IdentityCardProps) {
  return <section className={`player-hero-card sport-${player.sportId}`} aria-label="Athlete identity card | بطاقة هوية الرياضي">
    <div className="player-hero-light" aria-hidden="true"/>
    <div className="player-portrait-wrap"><PlayerPortrait player={player}/><small><BilingualText value={bi('Athlete portrait', 'صورة الرياضي')}/></small></div>
    <div className="player-identity"><span className="player-identity-kicker"><BilingualText value={sport}/></span><h2>{player.nameEn}<b lang="ar" dir="rtl">{player.nameAr}</b></h2><div className="player-id"><ShieldCheck/>{player.id}</div><div className="player-tags"><PlayerIdentityBadge><BilingualText value={player.status}/></PlayerIdentityBadge><PlayerIdentityBadge><BilingualText value={player.level}/></PlayerIdentityBadge>{group && <PlayerIdentityBadge><BilingualText value={group}/></PlayerIdentityBadge>}</div><dl className="player-identity-details">{player.age && <div><dt><BilingualText value={bi('Age','العمر')}/></dt><dd>{player.age}</dd></div>}{player.dateOfBirth && <div><dt><BilingualText value={bi('Birth date','تاريخ الميلاد')}/></dt><dd>{player.dateOfBirth}</dd></div>}{coach && <div><dt><BilingualText value={bi('Coach','المدرب')}/></dt><dd>{coach.nameEn.replace(' Preview','')}<span lang="ar" dir="rtl">{coach.nameAr.replace(' تجريبي','')}</span></dd></div>}{branch && <div><dt><BilingualText value={bi('Branch','الفرع')}/></dt><dd><BilingualText value={branch}/></dd></div>}</dl></div>
    <div className="player-hero-stats"><PlayerIdentityStat value={attendance === null ? '—' : `${attendance}%`} label={bi('Attendance','الحضور')}/><PlayerIdentityStat value={performance ?? '—'} label={bi('Performance','الأداء')}/><PlayerIdentityStat value={nextSession ?? '—'} label={bi('Next session','الحصة القادمة')}/></div>
    <div className="player-card-mark"><img src="/brand/united-olympics-sports-logo.png" alt=""/><span>UNITED<br/>ATHLETE</span></div>
  </section>;
}
