import { UsersRound } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
export function PlayerPortalFeedbackPage() { return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Feedback', 'بوابة اللاعب | الملاحظات')} title={bi('Feedback', 'الملاحظات')} description={bi('Player feedback.', 'ملاحظات اللاعب.')} /><div className="admin-preview-card"><UsersRound size={32} /><h3><BilingualText value={bi('Player Feedback', 'ملاحظات اللاعب')} /></h3></div></div>; }
