import { MessageSquare } from 'lucide-react';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
export function ParentPortalMessagesPage() { return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal | Messages', 'بوابة ولي الأمر | الرسائل')} title={bi('Messages', 'الرسائل')} description={bi('Parent messages.', 'رسائل ولي الأمر.')} /><div className="admin-preview-card"><MessageSquare size={32} /><h3><BilingualText value={bi('Parent Messages', 'رسائل ولي الأمر')} /></h3></div></div>; }
