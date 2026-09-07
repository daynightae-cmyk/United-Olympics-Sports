import { Mail, Medal, Phone, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteParent, useParent, usePlayers, useUpdateParent } from '../../admin/data/adminHooks';
import { FuturePanel, PageHeader, PlayerAvatar, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'children', label: bi('Children', 'الأبناء') },
];

export function AdminParentDetailPage() {
  const { parentId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: parent, loading, error } = useParent(parentId);
  const { data: playerResult } = usePlayers({ page: 1, pageSize: 300 });
  const { update, loading: updateLoading } = useUpdateParent();
  const { delete: deleteParent, loading: deleteLoading } = useDeleteParent();

  if (loading) return <FuturePanel title={bi('Loading parent profile', 'جارٍ تحميل ملف ولي الأمر')} description={bi('Reading the family relationship from the Admin data gateway.', 'جارٍ قراءة علاقة الأسرة من بوابة بيانات الإدارة.')} />;
  if (error || !parent) return <FuturePanel title={bi('Parent not found', 'ولي الأمر غير موجود')} description={bi('The requested parent is not available in the current data provider.', 'ولي الأمر المطلوب غير متاح في موفر البيانات الحالي.')} />;

  const children = parent.playerIds.map(id => playerResult.items.find(player => player.id === id)).filter(Boolean);
  const busy = updateLoading || deleteLoading;
  const toggleStatus = async () => { await update(parent.id, { status: parent.status === 'active' ? 'inactive' : 'active' }); };
  const remove = async () => { if (busy) return; await deleteParent(parent.id); navigate('/admin/parents'); };

  return <div className="admin-page">
    <PageHeader
      icon={Users}
      eyebrow={bi('Parent Profile', 'ملف ولي الأمر')}
      title={{ en: parent.nameEn, ar: parent.nameAr }}
      description={bi('Gateway-backed family profile linked to current player records.', 'ملف أسرة مدفوع ببوابة البيانات ومرتبط بسجلات اللاعبين الحالية.')}
      actions={<div className="admin-header-actions"><StatusBadge active={parent.status === 'active'} /><button type="button" className="admin-secondary-button" disabled={busy} onClick={() => void toggleStatus()}><BilingualText value={parent.status === 'active' ? bi('Deactivate', 'تعطيل') : bi('Activate', 'تفعيل')} /></button><button type="button" className="admin-danger-button" disabled={busy} onClick={() => void remove()}><Trash2 size={15} /><BilingualText value={bi('Delete', 'حذف')} /></button></div>}
    />

    <section className="parent-identity-card">
      <PlayerAvatar id={parent.id} large />
      <div className="parent-identity-main"><h2><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></h2><code>{parent.id}</code><span className="preview-badge"><BilingualText value={bi('Gateway Record', 'سجل بوابة البيانات')} /></span></div>
      <dl>
        <div><dt><BilingualText value={bi('Children', 'الأبناء')} /></dt><dd>{children.length}</dd></div>
        <div><dt><BilingualText value={bi('Language', 'اللغة')} /></dt><dd>{parent.preferredLanguage === 'en' ? 'English' : 'العربية'}</dd></div>
        {parent.phone && <div><dt><BilingualText value={bi('Phone', 'الهاتف')} /></dt><dd><Phone />{parent.phone}</dd></div>}
        {parent.email && <div><dt><BilingualText value={bi('Email', 'البريد الإلكتروني')} /></dt><dd><Mail />{parent.email}</dd></div>}
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="parent-overview-grid"><section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Parent Information', 'معلومات ولي الأمر')} /><small><BilingualText value={bi('Current provider record', 'سجل موفر البيانات الحالي')} /></small></div><Users /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Parent ID', 'معرف ولي الأمر')} /></dt><dd><code>{parent.id}</code></dd></div><div><dt><BilingualText value={bi('Name', 'الاسم')} /></dt><dd><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></dd></div><div><dt><BilingualText value={bi('Language', 'اللغة')} /></dt><dd>{parent.preferredLanguage === 'en' ? 'English' : 'العربية'}</dd></div><div><dt><BilingualText value={bi('Linked Players', 'اللاعبون المرتبطون')} /></dt><dd>{children.length}</dd></div></dl></section><section className="admin-panel pipeline-card"><div className="panel-heading"><BilingualText value={bi('Portal Relationship', 'علاقة البوابة')} /><Users /></div><p><BilingualText value={bi('This record defines the current parent-to-player relationship. Authentication remains governed by the portal authentication layer.', 'يحدد هذا السجل علاقة ولي الأمر باللاعب حاليًا. وتظل المصادقة خاضعة لطبقة مصادقة البوابة.')} /></p></section></div>}

      {active === 'children' && <div className="children-preview-list">{children.map(player => player && <article className="preview-line" key={player.id}><Medal /><code>{player.id}</code><span>{player.nameEn} | {player.nameAr}</span><Link className="admin-link-button small" to={`/admin/players/${player.id}`}><BilingualText value={bi('View Player', 'عرض اللاعب')} /></Link></article>)}{children.length === 0 && <p className="empty-message"><BilingualText value={bi('No players are linked to this parent.', 'لا يوجد لاعبون مرتبطون بولي الأمر هذا.')} /></p>}</div>}
    </section>
  </div>;
}
