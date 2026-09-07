import { FileText, FolderOpen, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

export function PlayerPortalDocumentsPage() {
  const { player, documents } = usePlayerSession();
  if (!player) return null;

  return (
    <div className="admin-page" id="player-documents-page">
      <PageHeader
        eyebrow={bi('Player Portal | Documents', 'بوابة اللاعب | الوثائق')}
        title={bi('Documents', 'الوثائق')}
        description={bi('Only document records backed by a connected document/storage contract may appear here.', 'لا تظهر هنا إلا سجلات الوثائق المدعومة بعقد وثائق/تخزين متصل.')}
        actions={<span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('No synthetic files', 'لا ملفات اصطناعية')} /></span>}
      />

      {documents.length ? (
        <section className="documents-grid" aria-label="Documents list">
          {documents.map((document) => (
            <article key={document.id} className="document-card">
              <div className="document-icon"><FileText size={24} /></div>
              <div className="document-info">
                <h4><BilingualText value={document.title} /></h4>
                <div className="document-meta"><span className="doc-category">{document.category}</span><span className="doc-date">{document.issueDate}</span></div>
                <div className="document-status"><span className="status-badge status-pending">{document.status}</span></div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="athlete-empty-system">
          <div>
            <FolderOpen size={42} className="mx-auto text-slate-500" />
            <h2 className="mt-4 text-base font-bold text-white"><BilingualText value={bi('No document contract is connected', 'لا يوجد عقد وثائق متصل')} /></h2>
            <p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Medical certificates, consent forms, registrations, schedules, file sizes and achievement certificates are not generated as preview content. View and download actions remain unavailable until real storage-backed records exist for this athlete.', 'لا يتم إنشاء الشهادات الطبية أو نماذج الموافقة أو التسجيلات أو الجداول أو أحجام الملفات أو شهادات الإنجاز كمحتوى معاينة. وتظل إجراءات العرض والتنزيل غير متاحة حتى توجد سجلات حقيقية مرتبطة بالتخزين لهذا اللاعب.')} /></p>
          </div>
        </section>
      )}

      <section className="documents-empty-note" aria-label="Documents data boundary">
        <div className="admin-preview-card" style={{ padding: 18 }}><p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}><BilingualText value={bi(`Athlete scope: ${player.id}. A future document provider must enforce this scope before file metadata or download URLs are exposed.`, `نطاق اللاعب: ${player.id}. يجب على مزود الوثائق المستقبلي فرض هذا النطاق قبل إظهار بيانات الملفات أو روابط التنزيل.`)} /></p></div>
      </section>
    </div>
  );
}
