import { demoCoaches } from '../../data/demo/coaches';
import { demoParents } from '../../data/demo/parents';
import { demoPlayers } from '../../data/demo/players';
import { demoPrograms } from '../../data/demo/programs';
import { demoSessions } from '../../data/demo/sessions';
import { demoTrainingGroups } from '../../data/demo/trainingGroups';
import { getGroup, getSport } from '../../data/demo/selectors';

export const activePlayer = demoPlayers[0];
export const activeParent = demoParents[0];
export const activeCoach = demoCoaches[0];
export const activePlayerSport = getSport(activePlayer.sportId);
export const activePlayerGroup = getGroup(activePlayer.groupId);
export const portalSessions = demoSessions;
export const portalGroups = demoTrainingGroups;
export const portalPrograms = demoPrograms;
export const portalChildren = activeParent.playerIds.map(id => demoPlayers.find(player => player.id === id)).filter((player): player is typeof demoPlayers[number] => Boolean(player));
export const portalCoachPlayers = demoPlayers.filter(player => activeCoach.playerIds.includes(player.id) || activeCoach.groupIds.includes(player.groupId ?? ''));

export const previewSubscriptions = [
  { id: 'subscription-preview-001', playerId: 'player-demo-001', plan: { en: 'Foundation Football', ar: 'أساس كرة القدم' }, amount: 450, currency: 'AED', renewal: '2026-09-30', status: 'active' as const },
  { id: 'subscription-preview-002', playerId: 'player-demo-002', plan: { en: 'Foundation Football', ar: 'أساس كرة القدم' }, amount: 450, currency: 'AED', renewal: '2026-09-30', status: 'pending' as const },
];

export const previewPayments = [
  { id: 'payment-preview-001', playerId: 'player-demo-001', amount: 450, currency: 'AED', date: '2026-08-05', method: { en: 'Card', ar: 'بطاقة' }, status: 'completed' as const },
  { id: 'payment-preview-002', playerId: 'player-demo-002', amount: 450, currency: 'AED', date: '2026-08-12', method: { en: 'Transfer', ar: 'تحويل' }, status: 'pending' as const },
];

export const previewDocuments = [
  { id: 'document-preview-001', title: { en: 'Membership card', ar: 'بطاقة العضوية' }, type: { en: 'Identity', ar: 'هوية' }, updated: '2026-08-20', status: 'Verified' },
  { id: 'document-preview-002', title: { en: 'Training consent', ar: 'موافقة التدريب' }, type: { en: 'Consent', ar: 'موافقة' }, updated: '2026-08-18', status: 'Preview' },
  { id: 'document-preview-003', title: { en: 'Progress certificate', ar: 'شهادة التقدم' }, type: { en: 'Certificate', ar: 'شهادة' }, updated: '2026-08-10', status: 'Preview' },
];
