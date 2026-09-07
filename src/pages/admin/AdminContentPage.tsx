import { ArrowRight, FileText, Image as ImageIcon, Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent, useCreateContent } from '../../admin/data/adminHooks';
import { PageHeader } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseSelect, EnterpriseStatus, EnterpriseTable, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { sportMediaAssets } from '../../data/media';

const emptyDraft = { titleEn: '', titleAr: '', typeEn: 'Article', typeAr: 'مقال', status: 'draft' as 'published' | 'draft' | 'archived' };
const statusTone = (status: string): 'active' | 'warning' | 'neutral' => status === 'published' ? 'active' : status === 'draft' ? 'warning' : 'neutral';
const statusLabel = (status: string) => bi(status, status === 'published' ? 'منشور' : status === 'draft' ? 'مسودة' : 'مؤرشف');

export function AdminContentPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const { data, loading, error } = useContent({ page: 1, pageSize: 300 });
  const { create, loading: createLoading } = useCreateContent();
  const records = data.items;
  const visible = useMemo(() => records.filter(record => `${record.id} ${record.title.en} ${record.title.ar} ${record.type.en} ${record.type.ar}`.toLowerCase().includes(query.trim().toLowerCase()) && (status === 'all' || record.status === status)), [records, query, status]);
  const setField = <K extends keyof typeof emptyDraft>(field: K, value: (typeof emptyDraft)[K]) => setDraft(current => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!draft.titleEn.trim() || !draft.titleAr.trim() || !draft.typeEn.trim() || !draft.typeAr.trim()) {
      setFormError('Title and type are required in both languages. | العنوان والنوع مطلوبان باللغتين.');
      return;
    }
    setFormError('');
    await create({ title: { en: draft.titleEn.trim(), ar: draft.titleAr.trim() }, type: { en: draft.typeEn.trim(), ar: draft.typeAr.trim() }, status: draft.status, updatedAt: new Date().toISOString() });
    setDraft(emptyDraft);
    setShowCreate(false);
    setSavedNotice(true);
  };

  return <div className="admin-page">
    <PageHeader icon={FileText} eyebrow={bi('Experience & Access', 'التجربة والوصول')} title={bi('Content & Media', 'المحتوى والوسائط')} description={bi('Manage editorial Content records through the Admin gateway while keeping verified media assets as a separate read-only registry.', 'أدر سجلات المحتوى التحريري عبر بوابة الإدارة مع إبقاء أصول الوسائط الموثقة كسجل منفصل للقراءة فقط.')} actions={<div className="admin-header-actions"><PreviewNotice /><button type="button" className="admin-primary-button" onClick={() => { setDraft(emptyDraft); setFormError(''); setShowCreate(true); }}><Plus size={16} /><BilingualText value={bi('Add Content', 'إضافة محتوى')} /></button></div>} />
    {savedNotice && <div className="preview-warning" role="status"><BilingualText value={bi('Content record saved to the browser Preview store.', 'تم حفظ سجل المحتوى في مخزن المعاينة بالمتصفح.')} /></div>}

    {showCreate && <section className="admin-panel" aria-label="Create content"><div className="panel-heading"><BilingualText value={bi('Create Content Record', 'إنشاء سجل محتوى')} /><button type="button" className="icon-button" onClick={() => !createLoading && setShowCreate(false)} aria-label="Close"><X size={16} /></button></div><div className="admin-form-grid">
      <label><BilingualText value={bi('Title (English)', 'العنوان بالإنجليزية')} /><input value={draft.titleEn} onChange={e => setField('titleEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Title (Arabic)', 'العنوان بالعربية')} /><input dir="rtl" value={draft.titleAr} onChange={e => setField('titleAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Type (English)', 'النوع بالإنجليزية')} /><input value={draft.typeEn} onChange={e => setField('typeEn', e.target.value)} /></label>
      <label><BilingualText value={bi('Type (Arabic)', 'النوع بالعربية')} /><input dir="rtl" value={draft.typeAr} onChange={e => setField('typeAr', e.target.value)} /></label>
      <label><BilingualText value={bi('Status', 'الحالة')} /><select value={draft.status} onChange={e => setField('status', e.target.value as typeof draft.status)}><option value="draft">Draft | مسودة</option><option value="published">Published | منشور</option><option value="archived">Archived | مؤرشف</option></select></label>
    </div>{formError && <p className="form-error" role="alert">{formError}</p>}<div className="admin-form-actions"><button type="button" className="admin-primary-button" disabled={createLoading} onClick={() => void submit()}><BilingualText value={createLoading ? bi('Saving…', 'جارٍ الحفظ…') : bi('Save Content', 'حفظ المحتوى')} /></button></div></section>}

    <EnterpriseToolbar query={query} onQueryChange={setQuery} queryLabel={bi('Search managed content', 'البحث في المحتوى المُدار')} filters={<EnterpriseSelect label={bi('Status', 'الحالة')} value={status} onChange={setStatus} options={[{ value: 'all', label: bi('All statuses', 'كل الحالات') }, { value: 'published', label: statusLabel('published') }, { value: 'draft', label: statusLabel('draft') }, { value: 'archived', label: statusLabel('archived') }]} />} resultCount={bi(`${visible.length} records`, `${visible.length} سجلات`)} />

    {loading ? <div className="admin-panel" role="status"><BilingualText value={bi('Loading content…', 'جارٍ تحميل المحتوى…')} /></div> : error ? <div className="admin-panel" role="alert">{error.message}</div> : visible.length ? <EnterpriseTable caption={bi('Managed content records', 'سجلات المحتوى المُدار')}><thead><tr><th><BilingualText value={bi('Title','العنوان')} /></th><th><BilingualText value={bi('Type','النوع')} /></th><th><BilingualText value={bi('Updated','آخر تحديث')} /></th><th><BilingualText value={bi('Status','الحالة')} /></th><th><BilingualText value={bi('Action','الإجراء')} /></th></tr></thead><tbody>{visible.map(record => <tr key={record.id}><td><strong><BilingualText value={record.title} /></strong><small>{record.id}</small></td><td><BilingualText value={record.type} /></td><td>{record.updatedAt}</td><td><EnterpriseStatus label={statusLabel(record.status)} tone={statusTone(record.status)} /></td><td><Link className="admin-link-button" to={`/admin/content/${record.id}`}><BilingualText value={bi('Open','فتح')} /><ArrowRight size={14} /></Link></td></tr>)}</tbody></EnterpriseTable> : <EnterpriseEmpty title={bi('No content matches', 'لا يطابق أي محتوى')} description={bi('Create a record or adjust the filters.', 'أنشئ سجلًا أو عدّل الفلاتر.')} />}

    <section className="portal-section" style={{ marginTop: 18 }}><header><div><h2><BilingualText value={bi('Verified Media Registry', 'سجل الوسائط الموثقة')} /></h2><p><BilingualText value={bi('Media assets are references only here; editorial CRUD above does not imply media upload or storage.', 'أصول الوسائط هنا مراجع فقط؛ عمليات المحتوى أعلاه لا تعني وجود رفع أو تخزين وسائط.')} /></p></div></header><div className="enterprise-grid-3">{sportMediaAssets.slice(0, 12).map(asset => <article className="enterprise-panel content-asset-card" key={asset.id}><div className="content-asset-image"><img src={asset.url} alt={`${asset.altEn} | ${asset.altAr}`} loading="lazy" decoding="async" /></div><div className="content-asset-copy"><div><ImageIcon size={14} /><EnterpriseStatus label={asset.sourceStatus === 'verified-user-asset' ? bi('Verified asset','أصل موثق') : bi('Preview asset','أصل معاينة')} tone={asset.sourceStatus === 'verified-user-asset' ? 'active' : 'neutral'} /></div><h3>{asset.id}</h3><p><BilingualText value={{ en: asset.altEn, ar: asset.altAr }} /></p></div></article>)}</div></section>
  </div>;
}
