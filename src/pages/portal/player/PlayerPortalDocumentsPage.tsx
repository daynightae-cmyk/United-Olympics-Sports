import React, { useState } from 'react';
import {
  FileText,
  FileCheck2,
  ShieldCheck,
  Printer,
  Eye,
  X,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { usePlayerSession, PlayerDocumentItem } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalDocumentsPage() {
  const { player, documents } = usePlayerSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<PlayerDocumentItem | null>(null);

  if (!player) {
    return null;
  }

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory === 'all') return true;
    return doc.category === selectedCategory;
  });

  return (
    <div className="space-y-6" id="player-documents-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                <FileText size={18} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                <BilingualText value={bi('Athletic Records & Credentials', 'سجلات ومستندات الرياضي')} />
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              <BilingualText value={bi('Document Vault', 'خزنة وثائق الرياضي')} />
            </h1>
            <p className="text-xs text-slate-300">
              <BilingualText
                value={bi(
                  `Digital document repository and registrations for ${player.nameEn}`,
                  `المستودع الرقمي للوثائق وسجلات التسجيل للاعب ${player.nameAr}`
                )}
              />
            </p>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span><BilingualText value={bi('Secure Repository', 'مستودع آمن')} /></span>
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
          {[
            { id: 'all', label: { en: 'All Records', ar: 'جميع الوثائق' } },
            { id: 'identity', label: { en: 'Identity & Pass', ar: 'الهوية والبطاقة' } },
            { id: 'consent', label: { en: 'Consents & Waivers', ar: 'الموافقات' } },
            { id: 'medical', label: { en: 'Medical Clearance', ar: 'الفحص الطبي' } },
            { id: 'certificate', label: { en: 'Certificates', ar: 'الشهادات' } },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <BilingualText value={cat.label} />
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Truthful Empty State */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="documents-vault-grid">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="athlete-glass-card athlete-glass-card-interactive p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                    <FileCheck2 size={20} />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    {doc.status}
                  </span>
                </div>

                <strong className="text-sm font-bold text-white block mb-1">
                  <BilingualText value={doc.title} />
                </strong>

                <div className="space-y-1 text-xs text-slate-400 mt-2">
                  <div className="flex items-center justify-between">
                    <span><BilingualText value={bi('Issued By', 'جهة الإصدار')} />:</span>
                    <span className="text-slate-300 font-medium">
                      <BilingualText value={doc.verifiedBy} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><BilingualText value={bi('Issued', 'تاريخ الإصدار')} />:</span>
                    <span className="font-mono text-slate-300">{doc.issueDate}</span>
                  </div>
                  {doc.expiryDate && (
                    <div className="flex items-center justify-between">
                      <span><BilingualText value={bi('Valid Until', 'صالح حتى')} />:</span>
                      <span className="font-mono text-amber-300">{doc.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">{doc.fileSize}</span>
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} className="text-amber-400" />
                  <span><BilingualText value={bi('View Document', 'معاينة الوثيقة')} /></span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="athlete-glass-card p-12 text-center text-slate-400 space-y-4 max-w-xl mx-auto border-dashed border-white/15">
          <div className="w-16 h-16 rounded-2xl bg-white/5 text-amber-400 border border-white/10 flex items-center justify-center mx-auto">
            <FolderOpen size={30} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">
              <BilingualText value={bi('No athlete documents uploaded yet.', 'لم يتم رفع أي مستندات للرياضي بعد.')} />
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              <BilingualText
                value={bi(
                  'Player documents will appear here when registration records are uploaded or issued by United Olympics Sports.',
                  'ستظهر مستندات اللاعب هنا عند رفع وثائق التسجيل أو إصدارها من إدارة يونايتد أوليمبيكس سبورت.'
                )}
              />
            </p>
          </div>

          <div className="pt-3">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-400/20 cursor-pointer transition-all">
              <Upload size={14} />
              <span><BilingualText value={bi('Upload Document', 'رفع مستند')} /></span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // truthful confirmation notice
                    alert(`Document upload: ${file.name} selected for upload.`);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="athlete-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div
            className="athlete-modal-content !max-w-lg p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
            id="document-preview-modal"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <FileCheck2 size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  <BilingualText value={previewDoc.title} />
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Document ID', 'معرّف الوثيقة')} />:</span>
                  <strong className="text-white font-mono">{previewDoc.id.toUpperCase()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Athlete Name', 'اسم اللاعب')} />:</span>
                  <strong className="text-amber-400">{player.nameEn} · {player.nameAr}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Verification Body', 'جهة الاعتماد')} />:</span>
                  <strong className="text-white">
                    <BilingualText value={previewDoc.verifiedBy} />
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400"><BilingualText value={bi('Validation Status', 'حالة الصلاحية')} />:</span>
                  <strong className="text-emerald-400 font-semibold">{previewDoc.status}</strong>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span><BilingualText value={bi('Print Copy', 'طباعة نسخة')} /></span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-black font-bold transition-colors"
              >
                <BilingualText value={bi('Close', 'إغلاق')} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
