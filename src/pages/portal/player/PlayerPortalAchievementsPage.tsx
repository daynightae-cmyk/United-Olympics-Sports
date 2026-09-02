import { Trophy } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
export function PlayerPortalAchievementsPage() { return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Achievements', 'بوابة اللاعب | الإنجازات')} title={bi('Achievements', 'الإنجازات')} description={bi('Player achievements.', 'إنجازات اللاعب.')} /><div className="admin-preview-card"><Trophy size={32} /><h3><BilingualText value={bi('Player Achievements', 'إنجازات اللاعب')} /></h3></div></div>; }
