import { ArrowRight, Building2, Flag, Globe, ShieldCheck, Trash2, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useState } from 'react';
import { useBranches, useCountry, useDeleteCountry, usePlayers, useUpdateCountry } from '../../admin/data/adminHooks';
import { UiButton, UiPreviewState } from '../../components/ui/UiPrimitives';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'branches', label: bi('Branches', 'الفروع') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
];

export function AdminCountryDetailPage() {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState('overview');
  const { item: country, loading, error, refetch } = useCountry(countryId);
  const { data: branchesData } = useBranches({ page: 1, pageSize: 200 });
  const { data: playersData } = usePlayers({ page: 1, pageSize: 1000 });
  const { update, loading: updating } = useUpdateCountry();
  const { delete: remove, loading: deleting } = useDeleteCountry();

  if (loading) return <div className="admin-page"><UiPreviewState title={bi('Loading country', 'جارٍ تحميل الدولة')} description={bi('Reading the Admin data gateway.', 'جارٍ قراءة بوابة بيانات الإدارة.')} /></div>;
  if (error || !country) return <div className="admin-page"><PageHeader icon={Flag} eyebrow={bi('Country Profile', 'ملف الدولة')} title={bi('Country not found', 'الدولة غير موجودة')} description={bi('Choose a valid country from the Countries directory.', 'اختر دولة صالحة من دليل الدول.')} /></div>;

  const branches = branchesData.items.filter(branch => branch.countryId === country.id);
  const allPlayerIds = new Set(branches.flatMap(branch => branch.playerIds));
  const branchPlayers = playersData.items.filter(player => allPlayerIds.has(player.id));

  const setStatus = async (status: 'active' | 'inactive') => {
    await update(country.id, { status });
    await refetch();
  };
  const deleteCountry = async () => {
    if (branches.length) return;
    if (!window.confirm('Delete this Preview country? | حذف دولة المعاينة؟')) return;
    await remove(country.id);
    navigate('/admin/countries');
  };

  return <div className="admin-page">
    <PageHeader
      icon={Flag}
      eyebrow={bi('Country Profile', 'ملف الدولة')}
      title={country.name}
      description={bi('Country-level operations assembled from the Admin data gateway.', 'عمليات على مستوى الدولة مجمعة من بوابة بيانات الإدارة.')}
      actions={<StatusBadge active={country.status === 'active'} />}
    />

    <section className="country-identity-card">
      <div className="country-identity-main"><Globe /><code>{country.code}</code><h2><BilingualText value={country.name} /></h2></div>
      <dl>
        <div><dt><BilingualText value={bi('Country Code', 'رمز الدولة')} /></dt><dd><code>{country.code}</code></dd></div>
        <div><dt><BilingualText value={bi('Branches', 'الفروع')} /></dt><dd>{branches.length}</dd></div>
        <div><dt><BilingualText value={bi('Total Players', 'إجمالي اللاعبين')} /></dt><dd>{branchPlayers.length}</dd></div>
      </dl>
    </section>

    <section className="admin-panel">
      <div className="panel-heading"><BilingualText value={bi('Country Controls', 'ضوابط الدولة')} /><ShieldCheck /></div>
      <div className="preview-form-grid"><label><BilingualText value={bi('Operating status', 'حالة التشغيل')} /><select value={country.status} disabled={updating} onChange={event => void setStatus(event.target.value as 'active' | 'inactive')}><option value="active">Active | نشط</option><option value="inactive">Inactive | غير نشط</option></select></label></div>
      <p className="preview-warning"><BilingualText value={bi('Changes persist in the browser Preview store. They do not claim a production database write.', 'تستمر التغييرات في مخزن المعاينة بالمتصفح، ولا يتم الادعاء بكتابتها في قاعدة بيانات إنتاجية.')} /></p>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="country-overview-grid">
        <section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Country Information', 'معلومات الدولة')} /><small><BilingualText value={bi('Admin gateway record', 'سجل بوابة الإدارة')} /></small></div><Flag /></div><dl className="detail-list"><div><dt><BilingualText value={bi('Country ID', 'معرف الدولة')} /></dt><dd><code>{country.id}</code></dd></div><div><dt><BilingualText value={bi('Code', 'الرمز')} /></dt><dd><code>{country.code}</code></dd></div><div><dt><BilingualText value={bi('Organization', 'المنظمة')} /></dt><dd>{country.organizationId}</dd></div><div><dt><BilingualText value={bi('Total Branches', 'إجمالي الفروع')} /></dt><dd>{branches.length}</dd></div></dl></section>
        <section className="admin-panel"><div className="panel-heading"><div><BilingualText value={bi('Branch Distribution', 'توزيع الفروع')} /></div><Building2 /></div>{branches.map(branch => <div className="preview-line" key={branch.id}><BilingualText value={branch.name} /><StatusBadge active={branch.status === 'active'} /><Link className="admin-link-button small" to={`/admin/branches/${branch.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link></div>)}{!branches.length && <p className="empty-message"><BilingualText value={bi('No branches configured for this country.', 'لا توجد فروع مكونة لهذه الدولة.')} /></p>}</section>
        <section className="admin-panel pipeline-card"><div className="panel-heading"><BilingualText value={bi('Operational Scope', 'النطاق التشغيلي')} /><Users /></div><div className="pipeline-flow">{[bi('Country Operations', 'عمليات الدولة'), bi('Branch Management', 'إدارة الفروع'), bi('Player Coverage', 'تغطية اللاعبين')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 2 && <i>→</i>}</span>)}</div></section>
      </div>}
      {active === 'branches' && <div className="branch-list-inline">{branches.map(branch => <article className="country-branch-card" key={branch.id}><h3><BilingualText value={branch.name} /></h3><p><BilingualText value={bi('Sports', 'الرياضات')} />: {branch.sportCount} | <BilingualText value={bi('Players', 'اللاعبون')} />: {branch.playerCount} | <BilingualText value={bi('Coaches', 'المدربون')} />: {branch.coachCount}</p><Link className="admin-link-button" to={`/admin/branches/${branch.id}`}><BilingualText value={bi('Open Branch', 'فتح الفرع')} /><ArrowRight /></Link></article>)}{branches.length === 0 && <p className="empty-message"><BilingualText value={bi('No branches configured for this country.', 'لا توجد فروع مكونة لهذه الدولة.')} /></p>}</div>}
      {active === 'players' && <div className="player-list-inline">{branchPlayers.map(player => <Link className="preview-line" to={`/admin/players/${player.id}`} key={player.id}><code>{player.id}</code><span>{player.nameEn} | {player.nameAr}</span><ArrowRight /></Link>)}{branchPlayers.length === 0 && <p className="empty-message"><BilingualText value={bi('No players associated with this country.', 'لا يوجد لاعبون مرتبطون بهذه الدولة.')} /></p>}</div>}
    </section>

    <section className="admin-panel"><div className="panel-heading"><BilingualText value={bi('Danger Zone', 'منطقة الخطر')} /><ShieldCheck /></div>{branches.length > 0 && <p className="preview-warning"><BilingualText value={bi('Remove or reassign this country’s branches before deleting the country record.', 'احذف أو أعد تعيين فروع هذه الدولة قبل حذف سجل الدولة.')} /></p>}<UiButton variant="danger" disabled={deleting || branches.length > 0} onClick={() => void deleteCountry()}><Trash2 /><BilingualText value={bi(deleting ? 'Deleting…' : 'Delete Preview country', deleting ? 'جارٍ الحذف…' : 'حذف دولة المعاينة')} /></UiButton></section>
  </div>;
}
