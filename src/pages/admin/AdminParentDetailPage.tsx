import { Mail, Medal, Phone, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, PlayerAvatar, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getParent } from '../../data/demo/selectors';
import { getParentPlayers } from '../../data/demo/selectors';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'children', label: bi('Children', 'الأبناء') },
];

export function AdminParentDetailPage() {
  const { parentId } = useParams();
  const parent = getParent(parentId);
  const [active, setActive] = useState('overview');

  if (!parent) return <FuturePanel
    title={bi('Parent not found', 'ولي الأمر غير موجود')}
    description={bi('Choose a valid parent from the Parents directory.', 'اختر ولي أمر صالحاً من دليل أولياء الأمور.')}
  />;

  const children = getParentPlayers(parent.id);

  return <div className="admin-page">
    <PageHeader
      icon={Users}
      eyebrow={bi('Parent Profile', 'ملف ولي الأمر')}
      title={{ en: parent.nameEn, ar: parent.nameAr }}
      description={bi('A preview parent record linked to enrolled players.', 'سجل ولي أمر تجريبي مرتبط باللاعبين المسجلين.')}
      actions={<StatusBadge active={parent.status === 'active'} />}
    />

    <section className="parent-identity-card">
      <PlayerAvatar id={parent.id} large />
      <div className="parent-identity-main">
        <h2><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></h2>
        <code>{parent.id}</code>
        <span className="preview-badge"><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></span>
      </div>
      <dl>
        <div><dt><BilingualText value={bi('Children', 'الأبناء')} /></dt><dd>{children.length}</dd></div>
        <div><dt><BilingualText value={bi('Language', 'اللغة')} /></dt><dd>{parent.preferredLanguage === 'en' ? 'English' : 'العربية'}</dd></div>
        {parent.phone && <div><dt><BilingualText value={bi('Phone', 'الهاتف')} /></dt><dd><Phone />{parent.phone}</dd></div>}
        {parent.email && <div><dt><BilingualText value={bi('Email', 'البريد الإلكتروني')} /></dt><dd><Mail />{parent.email}</dd></div>}
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="parent-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Parent Information', 'معلومات ولي الأمر')} /><small><BilingualText value={bi('Anonymized preview fixture', 'بيانات تجريبية مجهولة')} /></small></div>
            <Users />
          </div>
          <dl className="detail-list">
            <div><dt><BilingualText value={bi('Parent ID', 'معرف ولي الأمر')} /></dt><dd><code>{parent.id}</code></dd></div>
            <div><dt><BilingualText value={bi('Name', 'الاسم')} /></dt><dd><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></dd></div>
            <div><dt><BilingualText value={bi('Language', 'اللغة')} /></dt><dd>{parent.preferredLanguage === 'en' ? 'English' : 'العربية'}</dd></div>
            <div><dt><BilingualText value={bi('Linked Players', 'اللاعبون المرتبطون')} /></dt><dd>{children.length}</dd></div>
          </dl>
        </section>
        <section className="admin-panel pipeline-card">
          <div className="panel-heading"><BilingualText value={bi('Portal Access', 'الوصول إلى البوابة')} /><Users /></div>
          <div className="pipeline-flow">
            {[bi('Parent Registration', 'تسجيل ولي الأمر'), bi('Player Linking', 'ربط اللاعب'), bi('Portal Access', 'الوصول إلى البوابة')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 2 && <i>→</i>}</span>)}
          </div>
        </section>
      </div>}

      {active === 'children' && <div className="children-preview-list">
        {children.map(player => <article className="preview-line" key={player.id}>
          <Medal />
          <code>{player.id}</code>
          <span>{player.nameEn} | {player.nameAr}</span>
          <Link className="admin-link-button small" to={`/admin/players/${player.id}`}>
            <BilingualText value={bi('View Player', 'عرض اللاعب')} />
          </Link>
        </article>)}
        {children.length === 0 && <p className="empty-message"><BilingualText value={bi('No children linked to this parent.', 'لا يوجد أبناء مرتبطون بهذا ولي الأمر.')} /></p>}
      </div>}
    </section>
  </div>;
}
