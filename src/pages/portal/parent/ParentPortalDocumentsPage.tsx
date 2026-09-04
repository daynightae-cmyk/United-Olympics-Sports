import { FileText, Download, Eye, FolderOpen, Shield, Award, Calendar, Users } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoParents } from '../../../data/demo/parents';
import { demoPlayers } from '../../../data/demo/players';

type ParentDocument = {
  id: string;
  name: { en: string; ar: string };
  category: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number }>;
  childName: { en: string; ar: string };
  size: string;
  date: string;
  status: { en: string; ar: string };
};

const parentDocuments: ParentDocument[] = [
  { id: 'pdoc-001', name: { en: 'Player 001 - Medical Clearance', ar: 'اللاعب 001 - شهادة طبية' }, category: { en: 'Medical', ar: 'طبية' }, icon: Shield, childName: { en: 'Player Demo 001', ar: 'لاعب تجريبي 001' }, size: '245 KB', date: '2026-08-15', status: { en: 'Valid', ar: 'صالحة' } },
  { id: 'pdoc-002', name: { en: 'Player 001 - Registration Form', ar: 'اللاعب 001 - نموذج تسجيل' }, category: { en: 'Registration', ar: 'تسجيل' }, icon: FileText, childName: { en: 'Player Demo 001', ar: 'لاعب تجريبي 001' }, size: '180 KB', date: '2026-08-10', status: { en: 'Submitted', ar: 'مُرسلة' } },
  { id: 'pdoc-003', name: { en: 'Player 002 - Consent Form', ar: 'اللاعب 002 - نموذج موافقة' }, category: { en: 'Consent', ar: 'موافقة' }, icon: FolderOpen, childName: { en: 'Player Demo 002', ar: 'لاعب تجريبي 002' }, size: '312 KB', date: '2026-07-28', status: { en: 'Signed', ar: 'موقعة' } },
  { id: 'pdoc-004', name: { en: 'Season Schedule - All Children', ar: 'جدول الموسم - جميع الأطفال' }, category: { en: 'Schedule', ar: 'جدول' }, icon: Calendar, childName: { en: 'All Children', ar: 'جميع الأطفال' }, size: '410 KB', date: '2026-07-15', status: { en: 'Current', ar: 'حالي' } },
  { id: 'pdoc-005', name: { en: 'Player 001 - Achievement Certificate', ar: 'اللاعب 001 - شهادة إنجاز' }, category: { en: 'Achievement', ar: 'إنجاز' }, icon: Award, childName: { en: 'Player Demo 001', ar: 'لاعب تجريبي 001' }, size: '890 KB', date: '2026-06-20', status: { en: 'Archived', ar: 'مؤرشفة' } },
];

export function ParentPortalDocumentsPage() {
  const parent = demoParents[0];
  const children = parent.playerIds.map(id => demoPlayers.find(p => p.id === id)).filter(Boolean);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Parent Portal | Documents', 'بوابة ولي الأمر | الوثائق')}
        title={bi('Documents', 'الوثائق')}
        description={bi('Family documents and certificates — preview data only.', 'وثائق وشهادات العائلة — بيانات تجريبية فقط.')}
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
        <div className="child-filter">
          <label>
            <BilingualText value={bi('Filter by Child', 'تصفية حسب الطفل')} />
            <select>
              <option value="all"><BilingualText value={bi('All Children', 'جميع الأطفال')} /></option>
              {children.map(child => (
                <option key={child!.id} value={child!.id}>
                  <BilingualText value={{ en: child!.nameEn, ar: child!.nameAr }} />
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section className="documents-grid" aria-label="Documents list">
        {parentDocuments.map((doc) => (
          <article key={doc.id} className="document-card">
            <div className="document-icon">
              <doc.icon size={24} />
            </div>
            <div className="document-info">
              <h4><BilingualText value={doc.name} /></h4>
              <div className="document-meta">
                <span className="doc-category"><BilingualText value={doc.category} /></span>
                <span className="doc-child"><Users size={12} /><BilingualText value={doc.childName} /></span>
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