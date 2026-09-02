import { ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export function PlayerPreviewBadge() {
  return <span className="player-preview-badge"><ShieldCheck size={14} /><BilingualText value={bi('Player App Preview', 'معاينة تطبيق اللاعب')} /></span>;
}

export function PlayerAvatar({ id, large = false }: { id: string; large?: boolean }) {
  return <span className={`player-avatar-mark ${large ? 'large' : ''}`} aria-label={`Preview player avatar ${id} | صورة لاعب تجريبية ${id}`}><UserRound aria-hidden="true" /><small>{id.slice(-3)}</small></span>;
}

export function PlayerSectionHeader({ eyebrow, title, description, action }: { eyebrow?: BilingualValue; title: BilingualValue; description?: BilingualValue; action?: ReactNode }) {
  return <header className="player-section-header"><div>{eyebrow && <BilingualText value={eyebrow} className="player-eyebrow" />}<h1><BilingualText value={title} /></h1>{description && <p><BilingualText value={description} /></p>}</div>{action}</header>;
}

export function PlayerEmptyState({ title, description }: { title: BilingualValue; description: BilingualValue }) {
  return <section className="player-empty-state"><ShieldCheck aria-hidden="true" /><h2><BilingualText value={title} /></h2><p><BilingualText value={description} /></p></section>;
}
