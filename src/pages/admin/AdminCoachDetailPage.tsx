import { Building2, Medal, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, PlayerAvatar, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { getCoach, getCoachBranches, getCoachGroups } from '../../data/demo/selectors';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'groups', label: bi('Groups', 'المجموعات') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
  { id: 'evaluations', label: bi('Evaluations', 'التقييمات') },
];

export function AdminCoachDetailPage() {
  const { coachId } = useParams();
  const coach = getCoach(coachId);
  const [active, setActive] = useState('overview');

  if (!coach) return <FuturePanel
    title={bi('Coach not found', 'المدرب غير موجود')}
    description={bi('Choose a valid coach from the Coaches directory.', 'اختر مدرباً صالحاً من دليل المدربين.')}
  />;

  const groups = getCoachGroups(coach.id);
  const branches = getCoachBranches(coach.id);

  return <div className="admin-page">
    <PageHeader
      icon={Medal}
      eyebrow={bi('Coach Profile', 'ملف المدرب')}
      title={{ en: coach.nameEn, ar: coach.nameAr }}
      description={bi('A preview coach record showing specializations, groups and branches.', 'سجل مدرب تجريبي يوضح التخصصات والمجموعات والفروع.')}
      actions={<StatusBadge active={coach.status === 'active'} />}
    />

    <section className="coach-identity-card">
      <PlayerAvatar id={coach.id} large />
      <div className="coach-identity-main">
        <h2><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></h2>
        <code>{coach.id}</code>
        <span className="preview-badge"><BilingualText value={bi('Preview Identity', 'هوية تجريبية')} /></span>
      </div>
      <dl>
        <div><dt><BilingualText value={bi('Experience', 'الخبرة')} /></dt><dd>{coach.yearsOfExperience ?? '—'} <BilingualText value={bi('years', 'سنوات')} /></dd></div>
        <div><dt><BilingualText value={bi('Groups', 'المجموعات')} /></dt><dd>{groups.length}</dd></div>
        <div><dt><BilingualText value={bi('Branches', 'الفروع')} /></dt><dd>{branches.length}</dd></div>
        <div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{coach.playerIds.length}</dd></div>
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="coach-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Coach Information', 'معلومات المدرب')} /><small><BilingualText value={bi('Anonymized preview fixture', 'بيانات تجريبية مجهولة')} /></small></div>
            <Medal />
          </div>
          <dl className="detail-list">
            <div><dt><BilingualText value={bi('Coach ID', 'معرف المدرب')} /></dt><dd><code>{coach.id}</code></dd></div>
            <div><dt><BilingualText value={bi('Experience', 'الخبرة')} /></dt><dd>{coach.yearsOfExperience ?? '—'} <BilingualText value={bi('years', 'سنوات')} /></dd></div>
            <div><dt><BilingualText value={bi('Bio', 'السيرة')} /></dt><dd>{coach.bio && <BilingualText value={coach.bio} />}</dd></div>
            <div><dt><BilingualText value={bi('Certifications', 'الشهادات')} /></dt><dd>{coach.certifications.map((c, i) => <span key={i} className="specialization-tag"><BilingualText value={c} /></span>)}</dd></div>
          </dl>
        </section>
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Specializations', 'التخصصات')} /></div>
            <Trophy />
          </div>
          {coach.specializations.map((spec, i) => <div className="preview-line" key={i}>
            <BilingualText value={spec} />
          </div>)}
        </section>
        <section className="admin-panel pipeline-card">
          <div className="panel-heading"><BilingualText value={bi('Coaching Scope', 'نطاق التدريب')} /><Building2 /></div>
          <div className="pipeline-flow">
            {[bi('Coach', 'المدرب'), bi('Groups', 'المجموعات'), bi('Players', 'اللاعبون')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 2 && <i>→</i>}</span>)}
          </div>
        </section>
      </div>}

      {active === 'groups' && <div className="preview-list">
        {groups.map(group => <div className="preview-line" key={group.id}>
          <Users />
          <BilingualText value={group.name} />
          <span className="preview-badge"><BilingualText value={bi('Assigned', 'مُعين')} /></span>
          <Link className="admin-link-button small" to={`/admin/sports/${group.sportId}/groups/${group.id}`}>
            <BilingualText value={bi('Open Group', 'فتح المجموعة')} />
          </Link>
        </div>)}
        {groups.length === 0 && <p className="empty-message"><BilingualText value={bi('No groups assigned.', 'لا توجد مجموعات معينة.')} /></p>}
      </div>}

      {active === 'players' && <div className="preview-list">
        {coach.playerIds.map(pid => <div className="preview-line" key={pid}>
          <Medal />
          <code>{pid}</code>
          <Link className="admin-link-button small" to={`/admin/players/${pid}`}>
            <BilingualText value={bi('View Player', 'عرض اللاعب')} />
          </Link>
        </div>)}
        {coach.playerIds.length === 0 && <p className="empty-message"><BilingualText value={bi('No players assigned.', 'لا يوجد لاعبون معينون.')} /></p>}
      </div>}

      {active === 'evaluations' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Coach Evaluations', 'تقييمات المدرب')} /><Medal /></div>
        <p><BilingualText value={bi('Evaluation records and feedback authored by this coach.', 'سجلات التقييم والملاحظات التي كتبها هذا المدرب.')} /></p>
        <div className="preview-line"><BilingualText value={bi('Total Evaluations', 'إجمالي التقييمات')} /> <strong>—</strong></div>
        <div className="preview-line"><BilingualText value={bi('Recent Activity', 'النشاط الأخير')} /> <span className="preview-badge"><BilingualText value={bi('Awaiting Data', 'بانتظار البيانات')} /></span></div>
      </div>}
    </section>
  </div>;
}
