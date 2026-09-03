import { BarChart3, Building2, CalendarCheck, DollarSign, FileText, FolderCog, Gamepad2, Globe, MapPin, Medal, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FuturePanel, PageHeader, StatusBadge, Tabs } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useBranch } from '../../admin/data/adminHooks';

const tabs = [
  { id: 'overview', label: bi('Overview', 'نظرة عامة') },
  { id: 'sports', label: bi('Sports', 'الرياضات') },
  { id: 'programs', label: bi('Programs', 'البرامج') },
  { id: 'groups', label: bi('Groups', 'المجموعات') },
  { id: 'coaches', label: bi('Coaches', 'المدربون') },
  { id: 'players', label: bi('Players', 'اللاعبون') },
  { id: 'schedule', label: bi('Schedule', 'الجدول') },
  { id: 'attendance', label: bi('Attendance', 'الحضور') },
  { id: 'performance', label: bi('Performance', 'الأداء') },
  { id: 'subscriptions', label: bi('Subscriptions', 'الاشتراكات') },
  { id: 'payments', label: bi('Payments', 'المدفوعات') },
  { id: 'reports', label: bi('Reports', 'التقارير') },
  { id: 'content', label: bi('Content', 'المحتوى') },
];

export function AdminBranchDetailPage() {
  const { branchId } = useParams();
  const { item: branch, loading, error } = useBranch(branchId);
  const [active, setActive] = useState('overview');

  if (loading) return <div className="admin-page"><PageHeader icon={Building2} eyebrow={bi('Branch Cockpit', 'مركز تحكم الفرع')} title={bi('Loading...', 'جاري التحميل...')} description={bi('Loading branch preview.', 'جاري تحميل معاينة الفرع.')} /></div>;
  if (error || !branch) return <FuturePanel
    title={bi('Branch not found', 'الفرع غير موجود')}
    description={bi('Choose a valid branch from the Branches directory.', 'اختر فرعاً صالحاً من دليل الفروع.')}
  />;

  const sports = branch.sportIds.map(id => ({ id, name: { en: `Sport ${id}`, ar: `رياضة ${id}` } }));
  const programs = branch.programIds.map(id => ({ id, name: { en: `Program ${id}`, ar: `برنامج ${id}` } }));
  const groups = branch.groupIds.map(id => ({ id, name: { en: `Group ${id}`, ar: `مجموعة ${id}` }, sportId: branch.sportIds[0] ?? '' }));
  const coaches = branch.coachIds.map(id => ({ id, nameEn: `Coach ${id}`, nameAr: `مدرب ${id}` }));
  const players = branch.playerIds.map(id => ({ id, nameEn: `Player ${id}`, nameAr: `لاعب ${id}` }));

  return <div className="admin-page">
    <PageHeader
      icon={Building2}
      eyebrow={bi('Branch Cockpit', 'مركز تحكم الفرع')}
      title={branch.name}
      description={bi('A centralised preview cockpit for all branch operations.', 'مركز تحكم مركزي تجريبي لجميع عمليات الفرع.')}
      actions={<StatusBadge active={branch.status === 'active'} />}
    />

    <section className="branch-identity-card">
      <div className="branch-identity-main">
        <Building2 />
        <h2><BilingualText value={branch.name} /></h2>
      </div>
      <dl>
            <div><dt><BilingualText value={bi('Country', 'الدولة')} /></dt><dd>{branch.countryId ? <BilingualText value={{ en: `Country ${branch.countryId}`, ar: `الدولة ${branch.countryId}` }} /> : <BilingualText value={bi('Unknown', 'غير معروف')} />}</dd></div>
        {branch.address && <div><dt><BilingualText value={bi('Address', 'العنوان')} /></dt><dd><BilingualText value={branch.address} /></dd></div>}
        <div><dt><BilingualText value={bi('Sports', 'الرياضات')} /></dt><dd>{sports.length}</dd></div>
        <div><dt><BilingualText value={bi('Programs', 'البرامج')} /></dt><dd>{programs.length}</dd></div>
        <div><dt><BilingualText value={bi('Groups', 'المجموعات')} /></dt><dd>{groups.length}</dd></div>
        <div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{coaches.length}</dd></div>
        <div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{players.length}</dd></div>
      </dl>
    </section>

    <Tabs items={tabs} active={active} onChange={setActive} />
    <section className="admin-tab-panel" role="tabpanel">
      {active === 'overview' && <div className="branch-overview-grid">
        <section className="admin-panel">
          <div className="panel-heading">
            <div><BilingualText value={bi('Branch Information', 'معلومات الفرع')} /><small><BilingualText value={bi('Preview fixture', 'بيانات تجريبية')} /></small></div>
            <Building2 />
          </div>
          <dl className="detail-list">
            <div><dt><BilingualText value={bi('Branch ID', 'معرف الفرع')} /></dt><dd><code>{branch.id}</code></dd></div>
        <div><dt><BilingualText value={bi('Country', 'الدولة')} /></dt><dd>{branch.countryId ? <BilingualText value={{ en: `Country ${branch.countryId}`, ar: `الدولة ${branch.countryId}` }} /> : <BilingualText value={bi('Unknown', 'غير معروف')} />}</dd></div>
            <div><dt><BilingualText value={bi('Organization', 'المنظمة')} /></dt><dd>{branch.organizationId}</dd></div>
            <div><dt><BilingualText value={bi('Players', 'اللاعبون')} /></dt><dd>{branch.playerIds.length}</dd></div>
            <div><dt><BilingualText value={bi('Coaches', 'المدربون')} /></dt><dd>{branch.coachIds.length}</dd></div>
          </dl>
        </section>
        <section className="admin-panel pipeline-card">
          <div className="panel-heading"><BilingualText value={bi('Operational Pipeline', 'خط التشغيل')} /><ShieldCheck /></div>
          <div className="pipeline-flow">
            {[bi('Branch Operations', 'عمليات الفرع'), bi('Sports Management', 'إدارة الرياضات'), bi('Training Delivery', 'تقديم التدريب'), bi('Player Development', 'تطوير اللاعبين')].map((item, index) => <span key={item.en}><BilingualText value={item} />{index < 3 && <i>→</i>}</span>)}
          </div>
        </section>
      </div>}

      {active === 'sports' && <div className="preview-list">
        {sports.map(sport => <div className="preview-line" key={sport.id}>
          <Gamepad2 /><BilingualText value={sport.name} />
          <span className="preview-badge"><BilingualText value={bi('Connected', 'متصل')} /></span>
          <Link className="admin-link-button small" to={`/admin/sports/${sport.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link>
        </div>)}
        {sports.length === 0 && <p className="empty-message"><BilingualText value={bi('No sports configured.', 'لا توجد رياضات مكونة.')} /></p>}
      </div>}

      {active === 'programs' && <div className="preview-list">
        {programs.map(program => <div className="preview-line" key={program.id}>
          <FolderCog /><BilingualText value={program.name} />
          <span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span>
        </div>)}
        {programs.length === 0 && <p className="empty-message"><BilingualText value={bi('No programs assigned.', 'لا توجد برامج مخصصة.')} /></p>}
      </div>}

      {active === 'groups' && <div className="preview-list">
        {groups.map(group => <div className="preview-line" key={group.id}>
          <Users /><BilingualText value={group.name} />
          <span className="preview-badge"><BilingualText value={bi('Active', 'نشط')} /></span>
          <Link className="admin-link-button small" to={`/admin/sports/${group.sportId}/groups/${group.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link>
        </div>)}
        {groups.length === 0 && <p className="empty-message"><BilingualText value={bi('No training groups.', 'لا توجد مجموعات تدريب.')} /></p>}
      </div>}

      {active === 'coaches' && <div className="preview-list">
        {coaches.map(coach => <div className="preview-line" key={coach.id}>
          <Medal /><span>{coach.nameEn} | {coach.nameAr}</span>
          <span className="preview-badge"><BilingualText value={bi('Assigned', 'مُعين')} /></span>
          <Link className="admin-link-button small" to={`/admin/coaches/${coach.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link>
        </div>)}
        {coaches.length === 0 && <p className="empty-message"><BilingualText value={bi('No coaches assigned.', 'لا يوجد مدربون معينون.')} /></p>}
      </div>}

      {active === 'players' && <div className="preview-list">
        {players.map(player => <div className="preview-line" key={player.id}>
          <Users /><code>{player.id}</code><span>{player.nameEn} | {player.nameAr}</span>
          <Link className="admin-link-button small" to={`/admin/players/${player.id}`}><BilingualText value={bi('Open', 'فتح')} /></Link>
        </div>)}
        {players.length === 0 && <p className="empty-message"><BilingualText value={bi('No players enrolled.', 'لا يوجد لاعبون مسجلون.')} /></p>}
      </div>}

      {active === 'schedule' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Schedule Preview', 'معاينة الجدول')} /><CalendarCheck /></div>
        <p><BilingualText value={bi('Session schedule will be linked to branch groups and training blocks.', 'سيتم ربط جدول الحصص بمجموعات الفرع وكتل التدريب.')} /></p>
        <div className="preview-line"><BilingualText value={bi('Morning Block', 'الكتلة الصباحية')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
        <div className="preview-line"><BilingualText value={bi('Evening Block', 'الكتلة المسائية')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
      </div>}

      {active === 'attendance' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Attendance Overview', 'نظرة عامة على الحضور')} /><BarChart3 /></div>
        <p><BilingualText value={bi('Aggregate attendance data across all branch groups and sessions.', 'بيانات الحضور الإجمالية عبر جميع مجموعات الفرع والحصص.')} /></p>
        <p className="empty-message"><BilingualText value={bi('No attendance data available in preview.', 'لا توجد بيانات حضور في المعاينة.')} /></p>
      </div>}

      {active === 'performance' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Performance Overview', 'نظرة عامة على الأداء')} /><BarChart3 /></div>
        <p><BilingualText value={bi('Aggregate performance metrics across all branch sports and programmes.', 'مقاييس الأداء الإجمالية عبر جميع رياضات وبرامج الفرع.')} /></p>
        <p className="empty-message"><BilingualText value={bi('No performance data available in preview.', 'لا توجد بيانات أداء في المعاينة.')} /></p>
      </div>}

      {active === 'subscriptions' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Subscriptions', 'الاشتراكات')} /><DollarSign /></div>
        <p><BilingualText value={bi('Subscription management overview for this branch.', 'نظرة عامة على إدارة الاشتراكات لهذا الفرع.')} /></p>
        <p className="empty-message"><BilingualText value={bi('No subscription data available in preview.', 'لا توجد بيانات اشتراكات في المعاينة.')} /></p>
      </div>}

      {active === 'payments' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Payment Records', 'سجلات الدفع')} /><DollarSign /></div>
        <p><BilingualText value={bi('Payment records and transaction history for this branch.', 'سجلات الدفع وتاريخ المعاملات لهذا الفرع.')} /></p>
        <p className="empty-message"><BilingualText value={bi('No payment data available in preview.', 'لا توجد بيانات دفع في المعاينة.')} /></p>
      </div>}

      {active === 'reports' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Branch Reports', 'تقارير الفرع')} /><FileText /></div>
        <p><BilingualText value={bi('Operational and performance reports for this branch.', 'التقارير التشغيلية وتقارير الأداء لهذا الفرع.')} /></p>
        <div className="preview-line"><BilingualText value={bi('Monthly Summary', 'الملخص الشهري')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
        <div className="preview-line"><BilingualText value={bi('Performance Report', 'تقرير الأداء')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
      </div>}

      {active === 'content' && <div className="admin-panel">
        <div className="panel-heading"><BilingualText value={bi('Branch Content', 'محتوى الفرع')} /><FileText /></div>
        <p><BilingualText value={bi('Content and media assets for this branch.', 'المحتوى والوسائط لهذا الفرع.')} /></p>
        <div className="preview-line"><BilingualText value={bi('Branch Gallery', 'معرض الفرع')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
        <div className="preview-line"><BilingualText value={bi('Brand Assets', 'أصول العلامة التجارية')} /><span className="preview-badge"><BilingualText value={bi('Preview', 'معاينة')} /></span></div>
      </div>}
    </section>
  </div>;
}
