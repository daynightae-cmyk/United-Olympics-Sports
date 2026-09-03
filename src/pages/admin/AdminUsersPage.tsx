import { ArrowRight, Filter, Plus, Search, SlidersHorizontal, X, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, StatusBadge, UserAvatar } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../../admin/data/adminHooks';

export function AdminUsersPage() {
  const [query, setQuery] = useState(''); const [role, setRole] = useState('all'); const [status, setStatus] = useState('all'); const [showForm, setShowForm] = useState(false); const [filtersOpen, setFiltersOpen] = useState(false);
  const { data, loading, params, setParams, refetch } = useUsers({ page: 1, pageSize: 20 });
  const { create, loading: createLoading } = useCreateUser();
  const { update, loading: updateLoading } = useUpdateUser();
  const { delete: deleteFn, loading: deleteLoading } = useDeleteUser();

  const users = useMemo(() => data?.items.filter(user => {
    const matchesQuery = `${user.name.en} ${user.name.ar} ${user.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesRole = role === 'all' || user.roles.some(r => r.toLowerCase() === role);
    return matchesQuery && matchesRole && (status === 'all' || user.status === status);
  }) ?? [], [data, query, role, status]);

  return <div className="admin-page">
    <PageHeader eyebrow={bi('Access Management', 'إدارة الوصول')} title={bi('Users & Roles', 'المستخدمون والصلاحيات')} description={bi('Preview of administrative users and role assignments.', 'معاينة للمستخدمين الإداريين وتخصيص الأدوار.')} actions={<button className="admin-primary-button" onClick={() => setShowForm(true)}><Plus /><BilingualText value={bi('Add User', 'إضافة مستخدم')} /></button>} />
    <section className="player-filter-bar">
      <label className="filter-search"><Search /><span className="sr-only">Search Users | البحث عن المستخدمين</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Users | البحث عن المستخدمين" /></label>
      <button className="filter-drawer-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter /><BilingualText value={bi('Filters', 'الفلاتر')} /></button>
      <div className={`filter-fields ${filtersOpen ? 'open' : ''}`}>
        <label><BilingualText value={bi('Role', 'الدور')} /><select value={role} onChange={event => setRole(event.target.value)}><option value="all">All Roles | كل الأدوار</option><option value="admin">Admin | مدير</option><option value="manager">Manager | مشرف</option><option value="coach">Coach | مدرب</option><option value="viewer">Viewer | مشاهد</option></select></label>
        <label><BilingualText value={bi('Status', 'الحالة')} /><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All Statuses | كل الحالات</option><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label>
        <span className="result-count"><SlidersHorizontal /><BilingualText value={bi(`${users.length} preview records`, `${users.length} سجلات تجريبية`)} /></span>
      </div>
    </section>
    <section className="player-table-wrap"><table className="player-table"><caption className="sr-only">Users Directory | دليل المستخدمين</caption><thead><tr>{[bi('Avatar', 'الصورة'), bi('Name', 'الاسم'), bi('Email', 'البريد'), bi('Roles', 'الأدوار'), bi('Status', 'الحالة'), bi('Last Login', 'آخر دخول'), bi('Actions', 'الإجراءات')].map(label => <th key={label.en} scope="col"><BilingualText value={label} /></th>)}</tr></thead><tbody>{users.map(user => <tr key={user.id}><td><UserAvatar name={user.name.en} /></td><td><BilingualText value={user.name} /></td><td><code>{user.email}</code></td><td>{user.roles.map(r => <span key={r} className="role-badge"><BilingualText value={{ en: r, ar: r }} /></span>)}</td><td><StatusBadge active={user.status === 'active'} /></td><td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : <BilingualText value={bi('Never', 'أبداً')} />}</td><td><Link className="row-action" to={`/admin/users/${user.id}`} aria-label={`Open ${user.name.en} | فتح ${user.name.ar}`}><ArrowRight /></Link></td></tr>)}</tbody></table></section>
    <section className="player-mobile-list">{users.map(user => <article className="player-mobile-card" key={user.id}><div className="mobile-player-head"><UserAvatar name={user.name.en} /><BilingualText value={user.name} /><StatusBadge active={user.status === 'active'} /></div><div className="mobile-player-meta"><span><BilingualText value={bi('Email', 'البريد')} /><code>{user.email}</code></span><span><BilingualText value={bi('Roles', 'الأدوار')} />{user.roles.join(', ')}</span><span><BilingualText value={bi('Last Login', 'آخر دخول')} />{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : <BilingualText value={bi('Never', 'أبداً')} />}</span></div><Link className="admin-link-button" to={`/admin/users/${user.id}`}><BilingualText value={bi('Open User Record', 'فتح سجل المستخدم')} /><ArrowRight /></Link></article>)}</section>
    {showForm && <div className="admin-modal-backdrop" role="presentation" onMouseDown={() => setShowForm(false)}><section className="admin-modal" role="dialog" aria-modal="true" aria-label="Add User Preview Form | نموذج معاينة إضافة مستخدم" onMouseDown={event => event.stopPropagation()}><div className="modal-head"><div><BilingualText value={bi('Add User', 'إضافة مستخدم')} /><small><BilingualText value={bi('Local Preview State Only', 'حالة معاينة محلية فقط')} /></small></div><button className="admin-icon-button" onClick={() => setShowForm(false)} aria-label="Close | إغلاق"><X /></button></div><div className="preview-warning"><BilingualText value={bi('This form does not save to a database. It prepares the future data-entry experience only.', 'هذا النموذج لا يحفظ في قاعدة بيانات. إنه يجهز تجربة إدخال البيانات المستقبلية فقط.')} /></div><div className="preview-form-grid"><label><BilingualText value={bi('Name', 'الاسم')} /><input placeholder="Preview name | اسم تجريبي" /></label><label><BilingualText value={bi('Email', 'البريد الإلكتروني')} /><input type="email" placeholder="user@example.com" /></label><label><BilingualText value={bi('Roles', 'الأدوار')} /><select multiple><option>admin</option><option>manager</option><option>coach</option><option>viewer</option></select></label><label><BilingualText value={bi('Status', 'الحالة')} /><select><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label></div><button className="admin-secondary-button" onClick={() => setShowForm(false)}><BilingualText value={bi('Close Preview Form', 'إغلاق نموذج المعاينة')} /></button></section></div>}
  </div>;
}