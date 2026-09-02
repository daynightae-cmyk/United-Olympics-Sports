import { Users } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function ParentPortalChildrenPage() {
  return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal | Children', 'بوابة ولي الأمر | الأطفال')} title={bi('Children', 'الأطفال')} description={bi('Parent children overview.', 'نظرة عامة على أطفال ولي الأمر.')} /><div className="admin-preview-card"><Users size={32} /><h3><BilingualText value={bi('Children Overview', 'نظرة عامة على الأطفال')} /></h3></div></div>;
}
