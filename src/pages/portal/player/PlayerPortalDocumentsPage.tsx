import { Eye, FileCheck2, FileText, FolderOpen, ShieldCheck, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { usePlayerSession, type PlayerDocumentItem } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

const categories = [
  { id: 'all', label: bi('All records', 'جميع السجلات') },
  { id: 'identity', label: bi('Identity', 'الهوية') },
  { id: 'consent', label: bi('Consents', 'الموافقات') },
  { id: 'medical', label: bi('Medical', 'الطبي') },
  { id: 'certificate', label: bi('Certificates', 'الشهادات') },
  { id: 'evaluation', label: bi('Evaluations', 'التقييمات') },
] as const;

export function PlayerPortalDocumentsPage() {
  const { player, documents } = usePlayerSession();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<PlayerDocumentItem | null>(null);
  if (!player) return null;

  const filteredDocs = documents.filter((doc) => selectedCategory === 'all' || doc.category === selectedCategory);

  return (
    <div className="space-y-6" id="player-documents-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400"><FileText size={18} /><BilingualText value={bi('Athlete Document Records', 'سجلات مستندات اللاعب')} /></div>
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Document Vault', 'خزنة المستندات')} /></h1>
            <p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi(`Document metadata currently linked to athlete ${player.nameEn}. File storage and upload controls remain unavailable until a real storage service is connected.`, `بيانات المستندات المرتبطة حاليًا باللاعب ${player.nameAr}. يظل تخزين الملفات ورفعها غير متاح حتى يتم ربط خدمة تخزين حقيقية.`)} /></p>
          </div>
          <span className="athlete-data-scope"><ShieldCheck size={13} /><BilingualText value={bi('Linked records only', 'السجلات المرتبطة فقط')} /></span>
        </div>

        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10" role="tablist" aria-label="Document categories | فئات المستندات">
          {categories.map((category) => (
            <button key={category.id} type="button" role="tab" aria-selected={selectedCategory === category.id} onClick={() => setSelectedCategory(category.id)} className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedCategory === category.id ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
              <BilingualText value={category.label} />
            </button>
          ))}
        </div>
      </section>

      <section className="athlete-glass-card p-5 sm:p-6">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div><span className="text-[10px] font-black uppercase tracking-[.16em] text-amber-400"><BilingualText value={bi('Vault contents', 'محتويات الخزنة')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Linked Document Records', 'سجلات المستندات المرتبطة')} /></h2></div>
          <span className="text-xs font-mono text-slate-400">{filteredDocs.length} <BilingualText value={bi('records', 'سجلات')} /></span>
        </header>

        {filteredDocs.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5" id="documents-vault-grid">
            {filteredDocs.map((doc) => (
              <article key={doc.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-3"><span className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 grid place-items-center"><FileCheck2 size={20} /></span><DocumentStatus status={doc.status} /></div>
                  <h3 className="mt-4 text-sm font-bold text-white"><BilingualText value={doc.title} /></h3>
                  <div className="athlete-field-grid mt-4">
                    <Field label={bi('Record ID', 'معرف السجل')} value={doc.id} mono />
                    <Field label={bi('Category', 'الفئة')} value={categoryLabel(doc.category)} />
                    <Field label={bi('Issue date', 'تاريخ الإصدار')} value={doc.issueDate} />
                    <Field label={bi('Expiry date', 'تاريخ الانتهاء')} value={doc.expiryDate} />
                    <Field label={bi('Verification body', 'جهة التحقق')} value={`${doc.verifiedBy.en} · ${doc.verifiedBy.ar}`} />
                    <Field label={bi('Recorded file size', 'حجم الملف المسجل')} value={doc.fileSize} />
                  </div>
                </div>
                <button type="button" onClick={() => setPreviewDoc(doc)} className="athlete-action-secondary self-start"><Eye size={13} /><BilingualText value={bi('View record details', 'عرض تفاصيل السجل')} /></button>
              </article>
            ))}
          </div>
        ) : (
          <div className="athlete-empty-system mt-5"><div><FolderOpen size={34} className="mx-auto text-slate-500" /><h3 className="mt-4 text-base font-bold text-white"><BilingualText value={selectedCategory === 'all' ? bi('No document records are linked yet', 'لا توجد سجلات مستندات مرتبطة حتى الآن') : bi('No records in this category', 'لا توجد سجلات في هذه الفئة')} /></h3><p className="mt-2 text-xs leading-6 text-slate-400"><BilingualText value={bi('Nothing is generated to fill the vault. Records appear only when document metadata is connected to the athlete.', 'لا يتم إنشاء بيانات لملء الخزنة. تظهر السجلات فقط عند ربط بيانات مستندات باللاعب.')} /></p></div></div>
        )}

        <div className="athlete-truth-note mt-5"><Upload size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><div><strong className="text-slate-200"><BilingualText value={bi('Upload unavailable', 'الرفع غير متاح')} /></strong><div className="mt-1"><BilingualText value={bi('No storage bucket or upload endpoint is connected to the Player Portal, so no file selector is presented as a working upload action.', 'لا توجد حاوية تخزين أو نقطة رفع متصلة ببوابة اللاعب، لذلك لا يتم عرض اختيار الملفات كعملية رفع فعالة.')} /></div></div></div>
      </section>

      {previewDoc && (
        <div className="athlete-modal-overlay" onClick={() => setPreviewDoc(null)} role="presentation">
          <div className="athlete-modal-content !max-w-lg p-6 sm:p-7" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="document-record-title" id="document-preview-modal">
            <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10"><div className="flex items-start gap-2"><FileCheck2 size={18} className="text-amber-400 mt-0.5" /><div><span className="text-[10px] text-slate-500"><BilingualText value={bi('Document record', 'سجل المستند')} /></span><h2 id="document-record-title" className="text-base font-bold text-white"><BilingualText value={previewDoc.title} /></h2></div></div><button type="button" onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:text-white rounded-lg" aria-label="Close document record | إغلاق سجل المستند"><X size={18} /></button></header>
            <div className="athlete-field-grid mt-5"><Field label={bi('Record ID', 'معرف السجل')} value={previewDoc.id} mono /><Field label={bi('Athlete', 'اللاعب')} value={`${player.nameEn} · ${player.nameAr}`} /><Field label={bi('Category', 'الفئة')} value={categoryLabel(previewDoc.category)} /><Field label={bi('Status', 'الحالة')} value={statusLabel(previewDoc.status)} /><Field label={bi('Issue date', 'تاريخ الإصدار')} value={previewDoc.issueDate} /><Field label={bi('Expiry date', 'تاريخ الانتهاء')} value={previewDoc.expiryDate} /></div>
            <div className="athlete-truth-note mt-5"><ShieldCheck size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('This view shows record metadata only. A downloadable file is not claimed unless a real file source is connected.', 'يعرض هذا القسم بيانات السجل فقط. ولا يتم ادعاء وجود ملف قابل للتنزيل ما لم يتم ربط مصدر ملف حقيقي.')} /></div>
            <div className="athlete-action-row mt-5 justify-end"><button type="button" onClick={() => setPreviewDoc(null)} className="athlete-action-primary"><BilingualText value={bi('Close', 'إغلاق')} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: { en: string; ar: string }; value?: string; mono?: boolean }) {
  return <div className="athlete-field"><span><BilingualText value={label} /></span><strong className={`${mono ? 'font-mono' : ''} ${value ? '' : 'athlete-unavailable'}`}>{value || <BilingualText value={bi('Not recorded', 'غير مسجل')} />}</strong></div>;
}

function categoryLabel(category: PlayerDocumentItem['category']) {
  const labels: Record<PlayerDocumentItem['category'], string> = { identity: 'Identity · الهوية', consent: 'Consent · الموافقة', medical: 'Medical · طبي', certificate: 'Certificate · شهادة', evaluation: 'Evaluation · تقييم' };
  return labels[category];
}

function statusLabel(status: PlayerDocumentItem['status']) {
  return status === 'verified' ? 'Verified · موثق' : status === 'pending' ? 'Pending · قيد المراجعة' : 'Expired · منتهي';
}

function DocumentStatus({ status }: { status: PlayerDocumentItem['status'] }) {
  const tone = status === 'verified' ? 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10' : status === 'pending' ? 'text-amber-300 border-amber-400/25 bg-amber-400/10' : 'text-slate-400 border-white/10 bg-white/5';
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${tone}`}>{statusLabel(status)}</span>;
}
