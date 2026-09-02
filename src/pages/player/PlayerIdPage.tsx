import { ShieldCheck } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { DigitalPlayerIdCard } from '../../components/player/DigitalPlayerIdCard';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerSectionHeader } from '../../components/player/PlayerUI';

export function PlayerIdPage() {
  const { player, sport, group } = usePlayerPreview();
  if (!player) return null;
  return <div className="player-page">
    <PlayerSectionHeader eyebrow={bi('My ID', 'هويتي')} title={bi('Digital Player ID', 'بطاقة اللاعب الرقمية')} description={bi('A premium preview identity card using the shared anonymized player record. It is not a production credential.', 'بطاقة هوية تجريبية احترافية تستخدم سجل اللاعب المجهول المشترك. وهي ليست بطاقة اعتماد إنتاجية.')} />
    <DigitalPlayerIdCard player={player} sport={sport} group={group} />
    <section className="player-truth-note"><ShieldCheck aria-hidden="true" /><div><strong><BilingualText value={bi('Demo QR Only', 'رمز QR تجريبي فقط')} /></strong><p><BilingualText value={bi('Verification is not active in this phase. No production identity check, backend lookup or live validation occurs.', 'التحقق غير مفعل في هذه المرحلة. لا يحدث فحص هوية إنتاجي أو استعلام خادم أو تحقق مباشر.')} /></p></div></section>
  </div>;
}
