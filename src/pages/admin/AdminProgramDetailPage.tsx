import { FolderCog, Gamepad2, Globe, Users } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getProgram } from '../../data/demo/selectors';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'pillars', label: bi('Program Pillars', 'ركائز البرنامج') },
  { id: 'delivery', label: bi('Delivery', 'التقديم') },
];

export function AdminProgramDetailPage() {
  const { programId } = useParams();
  const program = getProgram(programId);
  const [active, setActive] = useState('overview');

  if (!program) return <FuturePanel
    title={bi('Program not found', 'البرنامج غير موجود')}
    description={bi('Choose a valid programme from the Programmes directory.', 'اختر برنامجاً صالحاً من دليل البرامج.')}
  />;

  return <div className="admin-page">
    <PageHeader
      icon={FolderCog}
      eyebrow={bi('Program Profile', 'ملف البرنامج')}
      title={program.name}
      description={bi('A preview programme record showing structure, pillars and delivery approach.', 'سجل برنامج تجريبي يوضح الهيكل والركائز ونهج التقديم.')}
    />

    <section className="program-identity-card">
      <div className="program-identity-main">
        <Gamepad2 />
        <h2><BilingualText value={program.name} /></h2>
        <span className="preview-badge"><BilingualText value={bi('Preview Program', 'برنامج تجريبي')} /></span>
      </div>
      <dl>
        <div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd><BilingualText value={program.sport} /></dd></div>
        <div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={program.ageGroup} /></dd></div>
        <div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={program.level} /></dd></div>
        <div><dt><BilingualText value={bi('Focus', 'التركيز')} /></dt><dd><BilingualText value={program.focus} /></dd></div>
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="program-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Program Information', 'معلومات البرنامج')} /><small><BilingualText value={bi('Preview fixture', 'بيانات تجريبية')} /></small></div>
            <FolderCog />
          </div>
          <dl className="detail-list">
            <div><dt><BilingualText value={bi('Program ID', 'معرف البرنامج')} /></dt><dd><code>{program.id}</code></dd></div>
            <div><dt><BilingualText value={bi('Slug', 'الرابط المختصر')} /></dt><dd><code>{program.slug}</code></dd></div>
            <div><dt><BilingualText value={bi('Sport', 'الرياضة')} /></dt><dd><BilingualText value={program.sport} /></dd></div>
            <div><dt><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></dt><dd><BilingualText value={program.ageGroup} /></dd></div>
            <div><dt><BilingualText value={bi('Level', 'المستوى')} /></dt><dd><BilingualText value={program.level} /></dd></div>
            <div><dt><BilingualText value={bi('Focus', 'التركيز')} /></dt><dd><BilingualText value={program.focus} /></dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Description', 'الوصف')} /></div>
            <Globe />
          </div>
          <p><BilingualText value={program.description} /></p>
        </section>
      </div>}

      {active === 'pillars' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Program Pillars', 'ركائز البرنامج')} /><FolderCog /></div>
        {program.pillars.map((pillar, index) => <div className="preview-line" key={index}>
          <strong>{index + 1}.</strong> <BilingualText value={pillar} />
        </div>)}
      </div>}

      {active === 'delivery' && <div className="program-delivery-grid">
        <section className="admin-panel">
          <div className="panel-heading"><BilingualText value={bi('Coach Approach', 'نهج المدرب')} /><Users /></div>
          <p><BilingualText value={program.coachApproach} /></p>
        </section>
        <section className="admin-panel">
          <div className="panel-heading"><BilingualText value={bi('Session Experience', 'تجربة الحصة')} /><Gamepad2 /></div>
          <p><BilingualText value={program.sessionExperience} /></p>
        </section>
      </div>}
    </section>
  </div>;
}
