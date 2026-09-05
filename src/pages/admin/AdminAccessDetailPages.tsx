import { ArrowLeft, ShieldCheck, Trash2, UserRound, Activity, Clock } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuditActivityItem, useDeleteUser, useUpdateUser, useUser } from '../../admin/data/adminHooks';
import { PageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiButton, UiPreviewState } from '../../components/ui/UiPrimitives';

export function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { item: user, loading, error, refetch } = useUser(userId);
  const { update, loading: updating } = useUpdateUser();
  const { delete: remove, loading: deleting } = useDeleteUser();
  if (loading) return <div className="admin-page"><UiPreviewState title={bi('Loading user', 'جارٍ تحميل المستخدم')} description={bi('Reading the access record.', 'جارٍ قراءة سجل الوصول.')} /></div>;
  if (error || !user) return <div className="admin-page"><PageHeader icon={UserRound} eyebrow={bi('Access Management', 'إدارة الوصول')} title={bi('User not found', 'المستخدم غير موجود')} description={bi('Choose a valid user from Users & Roles.', 'اختر مستخدمًا صالحًا من المستخدمين والصلاحيات.')} actions={<Link className="admin-secondary-button" to="/admin/users"><ArrowLeft/><BilingualText value={bi('Back', 'عودة')} /></Link>} /></div>;
  const setStatus=async(status:'active'|'inactive')=>{ await update(user.id,{status}); await refetch(); };
  const deleteUser=async()=>{ if(!window.confirm('Delete this preview user? | حذف مستخدم المعاينة؟')) return; await remove(user.id); navigate('/admin/users'); };
  return <div className="admin-page">
    <PageHeader icon={UserRound} eyebrow={bi('Access Management', 'إدارة الوصول')} title={user.name} description={bi('Administrative identity, roles and access state. Changes persist in the browser preview store.', 'هوية الإدارة والأدوار وحالة الوصول. تستمر التغييرات في مخزن المعاينة بالمتصفح.')} actions={<Link className="admin-secondary-button" to="/admin/users"><ArrowLeft/><BilingualText value={bi('Back to Users', 'العودة للمستخدمين')} /></Link>} />
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Access Record', 'سجل الوصول')} /><ShieldCheck/></div><dl className="detail-list"><div><dt>ID</dt><dd><code>{user.id}</code></dd></div><div><dt><BilingualText value={bi('Email', 'البريد')} /></dt><dd><code>{user.email}</code></dd></div><div><dt><BilingualText value={bi('Roles', 'الأدوار')} /></dt><dd>{user.roles.join(', ')}</dd></div><div><dt><BilingualText value={bi('Status', 'الحالة')} /></dt><dd><StatusBadge active={user.status==='active'} /></dd></div><div><dt><BilingualText value={bi('Last Login', 'آخر دخول')} /></dt><dd>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'}</dd></div></dl></section>
    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Operational Actions', 'الإجراءات التشغيلية')} /><ShieldCheck/></div><div className="preview-form-grid"><label><BilingualText value={bi('Access status', 'حالة الوصول')} /><select value={user.status} disabled={updating} onChange={e=>void setStatus(e.target.value as 'active'|'inactive')}><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label></div><div className="page-actions"><UiButton variant="danger" disabled={deleting} onClick={()=>void deleteUser()}><Trash2/><BilingualText value={bi(deleting?'Deleting…':'Delete preview user', deleting?'جارٍ الحذف…':'حذف مستخدم المعاينة')} /></UiButton></div></section>
  </div>;
}

export function AdminAuditActivityDetailPage() {
  const { activityId } = useParams();
  const { item, loading, error } = useAuditActivityItem(activityId);
  if (loading) return <div className="admin-page"><UiPreviewState title={bi('Loading audit event', 'جارٍ تحميل حدث التدقيق')} description={bi('Reading governance history.', 'جارٍ قراءة سجل الحوكمة.')} /></div>;
  if (error || !item) return <div className="admin-page"><PageHeader icon={Activity} eyebrow={bi('Governance', 'الحوكمة')} title={bi('Audit event not found', 'حدث التدقيق غير موجود')} description={bi('Choose a valid event from Audit Activity.', 'اختر حدثًا صالحًا من سجل النشاط.')} actions={<Link className="admin-secondary-button" to="/admin/audit-activity"><ArrowLeft/><BilingualText value={bi('Back', 'عودة')} /></Link>} /></div>;
  return <div className="admin-page"><PageHeader icon={Activity} eyebrow={bi('Insights & Governance', 'الرؤى والحوكمة')} title={item.action} description={item.details} actions={<Link className="admin-secondary-button" to="/admin/audit-activity"><ArrowLeft/><BilingualText value={bi('Back to Audit Activity', 'العودة لسجل النشاط')} /></Link>} /><section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Immutable Audit Record', 'سجل تدقيق غير قابل للتعديل')} /><ShieldCheck/></div><dl className="detail-list"><div><dt><BilingualText value={bi('Event ID', 'معرف الحدث')} /></dt><dd><code>{item.id}</code></dd></div><div><dt><BilingualText value={bi('Actor', 'الفاعل')} /></dt><dd><BilingualText value={item.actorName}/></dd></div><div><dt><BilingualText value={bi('Entity', 'الكيان')} /></dt><dd><BilingualText value={item.entityType}/> · <code>{item.entityId}</code></dd></div><div><dt><BilingualText value={bi('Time', 'الوقت')} /></dt><dd><Clock size={15}/> {new Date(item.timestamp).toLocaleString()}</dd></div><div><dt>IP</dt><dd><code>{item.ip || '—'}</code></dd></div><div><dt><BilingualText value={bi('Details', 'التفاصيل')} /></dt><dd><BilingualText value={item.details}/></dd></div></dl></section></div>;
}
