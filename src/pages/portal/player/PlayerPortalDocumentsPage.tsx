import { FileText, Download, Eye, FolderOpen, Shield, Award, Calendar } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';

type Document = {
  id: string;
  name: { en: string; ar: string };
  category: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number }>;
  size: string;
  date: string;
  status: { en: string; ar: string };
};

const previewDocuments: Document[] = [
  { id: 'doc-001', name: { en: 'Medical Clearance Certificate', ar: 'شهادة اللياقة الطبية' }, category: { en: 'Medical', ar: 'طبية' }, icon: Shield, size: '245 KB', date: '2026-08-15', status: { en: 'Valid', ar: 'صالحة' } },
  { id: 'doc-002', name: { en: 'Player Registration Form', ar: 'نموذج تسجيل اللاعب' }, category: { en: 'Registration', ar: 'تسجيل' }, icon: FileText, size: '180 KB', date: '2026-08-10', status: { en: 'Submitted', ar: 'مُرسلة' } },
  { id: 'doc-003', name: { en: 'Parental Consent Form', ar: 'نموذج موافقة ولي الأمر' }, category: { en: 'Consent', ar: 'موافقة' }, icon: FolderOpen, size: '312 KB', date: '2026-07-28', status: { en: 'Signed', ar: 'موقعة' } },
  { id: 'doc-004', name: { en: 'Season 2025-26 Schedule', ar: 'جدول الموسم 2025-26' }, category: { en: 'Schedule', ar: 'جدول' }, icon: Calendar, size: '410 KB', date: '2026-07-15', status: { en: 'Current', ar: 'حالي' } },
  { id: 'doc-005', name: { en: 'Achievement Certificate - U12 Cup', ar: 'شهادة إنجاز - كأس تحت 12' }, category: { en: 'Achievement', ar: 'إنجاز' }, icon: Award, size: '890 KB', date: '2026-06-20', status: { en: 'Archived', ar: 'مؤرشفة' } },
];

export function PlayerPortalDocumentsPage() {
  const { player } = usePlayerSession();
  const athleteId = player?.id ?? '—';
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Documents', 'بوابة اللاعب | الوثائق')}
        title={bi('Documents', 'الوثائق')}
        description={bi('Documents and certificates — shown only when a verified athlete record is connected.', 'وثائق وشهادات — تظهر فقط عند ربط سجل رياضي موثق.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section className="documents-filter" aria-label="Document filters">
        <div className="filter-chips">
          {['all', 'medical', 'registration', 'consent', 'schedule', 'achievement'].map((cat) => (
            <button key={cat} className="filter-chip" type="button">
              <BilingualText value={
                cat === 'all' ? bi('All', 'الكل') :
                cat === 'medical' ? bi('Medical', 'طبية') :
                cat === 'registration' ? bi('Registration', 'تسجيل') :
                cat === 'consent' ? bi('Consent', 'موافقة') :
                cat === 'schedule' ? bi('Schedule', 'جدول') :
                bi('Achievement', 'إنجاز')
              } />
            </button>
          ))}
        </div>
      </section>
      <section className="documents-grid" aria-label="Documents list">
        {previewDocuments.map((doc) => (
          <article key={doc.id} className="document-card">
            <div className="document-icon">
              <doc.icon size={24} />
            </div>
            <div className="document-info">
              <h4><BilingualText value={doc.name} /></h4>
              <div className="document-meta">
                <span className="doc-category"><BilingualText value={doc.category} /></span>
                <span className="doc-size">{doc.size}</span>
                <span className="doc-date">{doc.date}</span>
              </div>
              <div className="document-status">
                <span className={`status-badge ${doc.status.en === 'Valid' || doc.status.en === 'Signed' || doc.status.en === 'Current' ? 'status-valid' : 'status-pending'}`}>
                  <BilingualText value={doc.status} />
                </span>
              </div>
            </div>
            <div className="document-actions">
              <button className="doc-action-btn" aria-label={bi('View', 'عرض').en} title={bi('View', 'عرض').en}>
                <Eye size={16} />
              </button>
              <button className="doc-action-btn" aria-label={bi('Download', 'تحميل').en} title={bi('Download', 'تحميل').en}>
                <Download size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
      <section className="documents-empty-note" aria-label="Documents note">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Document library is preview-only. Real documents will sync from verified backend.', 'مكتبة الوثائق تجريبية فقط. الوثائق الحقيقية ستتم مزامنتها من خادم موثق.')} />
          </p>
        </div>
      </section>
    </div>
  );
}