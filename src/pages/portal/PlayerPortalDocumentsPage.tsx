import { FileText } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
export function PlayerPortalDocumentsPage() { return <div className="admin-page"><PageHeader eyebrow={bi('Player Portal | Documents', 'بوابة اللاعب | الوثائق')} title={bi('Documents', 'الوثائق')} description={bi('Player documents.', 'وثائق اللاعب.')} /><div className="admin-preview-card"><FileText size={32} /><h3><BilingualText value={bi('Documents', 'الوثائق')} /></h3></div></div>; }
