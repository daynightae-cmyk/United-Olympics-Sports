import { Download, FileCheck2, FileText, LockKeyhole, Printer } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalSection, PortalStatus } from '../../../components/portal/PortalUI';
import { UiButton } from '../../../components/ui/UiPrimitives';
import { previewDocuments } from '../portalData';

export function PlayerPortalDocumentsPage() {
  const [notice, setNotice] = useState(false);
  return <div className="admin-page">
    <PageHeader icon={FileText} eyebrow={bi('Player Portal · Documents', 'بوابة اللاعب · المستندات')} title={bi('Athlete Documents', 'مستندات الرياضي')} description={bi('Keep identity, consent and achievement references together in a clear preview vault.', 'اجمع مراجع الهوية والموافقة والإنجاز في خزنة معاينة واضحة.')} actions={<PreviewNotice />} />
    {notice && <div className="preview-notice" role="status"><BilingualText value={bi('Document preview opened locally', 'تم فتح معاينة المستند محليًا')} /></div>}
    <PortalSection title={bi('Document vault', 'خزنة المستندات')} description={bi('Preview records are not downloadable production files.', 'سجلات المعاينة ليست ملفات إنتاج قابلة للتنزيل.') }><div className="portal-card-grid">{previewDocuments.map(document => <article className="portal-card" key={document.id}><span className="portal-card-icon"><FileCheck2 size={18} /></span><h3><BilingualText value={document.title} /></h3><p><BilingualText value={document.type} /> · {document.updated}</p><div className="document-card-footer"><PortalStatus label={bi(document.status, document.status === 'Verified' ? 'موثق' : 'تجريبي')} tone={document.status === 'Verified' ? 'active' : 'pending'} /><UiButton variant="outline" type="button" onClick={() => setNotice(true)}><Download size={13} /><BilingualText value={bi('Preview', 'معاينة')} /></UiButton></div></article>)}</div></PortalSection>
    <div className="portal-preview-card"><div className="portal-preview-card-head"><span><LockKeyhole size={16} /></span><div><strong><BilingualText value={bi('Privacy boundary', 'حدود الخصوصية')} /></strong><small><BilingualText value={bi('Local preview only', 'معاينة محلية فقط')} /></small></div></div><p><BilingualText value={bi('No document is uploaded, stored or delivered by this reference implementation.', 'لا يتم رفع أو تخزين أو تسليم أي مستند من خلال هذه النسخة المرجعية.')} /></p><UiButton variant="outline" type="button" onClick={() => window.print()}><Printer size={14} /><BilingualText value={bi('Print preview', 'طباعة المعاينة')} /></UiButton></div>
  </div>;
}
