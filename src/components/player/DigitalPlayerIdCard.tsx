import { QrCode, ShieldCheck } from 'lucide-react';
import type { Player, Sport, TrainingGroup } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { PlayerAvatar } from './PlayerUI';

export function DigitalPlayerIdCard({ player, sport, group }: { player: Player; sport?: Sport; group?: TrainingGroup }) {
  const pattern = Array.from({ length: 49 }, (_, index) => ((player.id.charCodeAt(index % player.id.length) + index * 7) % 5) > 1);
  return <article className="digital-player-id-card">
    <div className="digital-id-glow" aria-hidden="true" />
    <header><div className="digital-id-brand"><img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" /><span><strong><BilingualText value={bi('United Olympics Sports', 'يونايتد أوليمبيكس سبورت')} /></strong><small><BilingualText value={bi('Digital Player ID', 'بطاقة اللاعب الرقمية')} /></small></span></div><ShieldCheck aria-hidden="true" /></header>
    <div className="digital-id-person"><PlayerAvatar id={player.id} large /><div><small><BilingualText value={bi('Player Name', 'اسم اللاعب')} /></small><h2><BilingualText value={{ en: player.nameEn, ar: player.nameAr }} /></h2><span className="digital-id-status"><BilingualText value={player.status} /></span></div></div>
    <dl><div><dt><BilingualText value={bi('Player ID', 'رقم اللاعب')} /></dt><dd><code>{player.id}</code></dd></div><div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd>{sport ? <BilingualText value={sport.name} /> : '—'}</dd></div><div><dt><BilingualText value={bi('Training Group', 'مجموعة التدريب')} /></dt><dd>{group ? <BilingualText value={group.name} /> : '—'}</dd></div><div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={player.level} /></dd></div><div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><BilingualText value={player.status} /></dd></div><div><dt><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></dt><dd><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></dd></div></dl>
    <div className="demo-qr-block"><div className="demo-qr-pattern" aria-hidden="true">{pattern.map((filled, index) => <i key={index} className={filled ? 'filled' : ''} />)}</div><div><QrCode size={20} aria-hidden="true" /><strong><BilingualText value={bi('Demo QR', 'رمز QR تجريبي')} /></strong><p><BilingualText value={bi('Verification is not active in this phase.', 'التحقق غير مفعل في هذه المرحلة.')} /></p></div></div>
  </article>;
}
