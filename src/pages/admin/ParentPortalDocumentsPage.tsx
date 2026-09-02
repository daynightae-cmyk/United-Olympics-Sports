import { FileText } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
export function ParentPortalDocumentsPage() { return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal | Documents', 'بوابة ولي الأمر | الوثائق')} title={bi('Documents', 'الوثائق')} description={bi('Parent documents.', 'وثائق ولي الأمر.')} /><div className="admin-preview-card"><FileText size={32} /><h3><BilingualText value={bi('Parent Documents', 'وثائق ولي الأمر')} /></h3></div></div>; }
