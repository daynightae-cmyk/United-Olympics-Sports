import { ArrowRight, BriefcaseBusiness, Dumbbell, MapPin, ShieldCheck, Trophy, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, UserAvatar } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseStatus, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { demoCoaches } from '../../data/demo/coaches';
import { getBranch, getGroup, getSport } from '../../data/demo/selectors';

export function AdminCoachesPage() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const coaches = useMemo(() => demoCoaches.filter(coach => {
    const branchText = coach.branchIds.map(id => getBranch(id)?.name.en ?? id).join(' ');
    const sportText = coach.sportIds.map(id => getSport(id)?.name.en ?? id).join(' ');
    return `${coach.nameEn} ${coach.nameAr} ${coach.id} ${branchText} ${sportText}`.toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery]);

  const activeCoaches = demoCoaches.filter(coach => coach.status === 'active').length;
  const groupAssignments = demoCoaches.reduce((sum, coach) => sum + coach.groupIds.length, 0);
  const sportCoverage = new Set(demoCoaches.flatMap(coach => coach.sportIds)).size;

  return <div className="admin-page directory-v2-page directory-v2-coaches">
    <PageHeader
      icon={BriefcaseBusiness}
      eyebrow={bi('Coach Operations', 'عمليات المدربين')}
      title={bi('Coach Command Center', 'مركز قيادة المدربين')}
      description={bi('A visual coaching directory built around assignments, sport coverage, roster reach and profile readiness.', 'دليل بصري للمدربين يركز على التكليفات وتغطية الرياضات والوصول للاعبين وجاهزية الملفات.')}
      actions={<PreviewNotice />}
    />

    <section className="enterprise-kpi-grid directory-kpi-grid" aria-label="Coach overview | نظرة عامة على المدربين">
      <EnterpriseKpi icon={BriefcaseBusiness} label={bi('Coaches', 'المدربون')} value={demoCoaches.length} detail={bi('Preview directory', 'الدليل التجريبي')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Active profiles', 'الملفات النشطة')} value={activeCoaches} detail={bi('Current preview status', 'حالة المعاينة الحالية')} />
      <EnterpriseKpi icon={UsersRound} tone="blue" label={bi('Group assignments', 'تكليفات المجموعات')} value={groupAssignments} detail={bi('Linked training groups', 'المجموعات التدريبية المرتبطة')} />
      <EnterpriseKpi icon={Trophy} tone="orange" label={bi('Sport coverage', 'تغطية الرياضات')} value={sportCoverage} detail={bi('Distinct assigned sports', 'رياضات مختلفة مكلف بها المدربون')} />
    </section>

    <EnterpriseToolbar
      query={query}
      onQueryChange={setQuery}
      queryLabel={bi('Search coaches, IDs, branches or sports', 'البحث عن المدربين أو المعرفات أو الفروع أو الرياضات')}
      resultCount={bi(`${coaches.length} coaches`, `${coaches.length} مدربين`)}
    />

    {coaches.length > 0 ? <section className="directory-card-grid" aria-label="Coach directory cards | بطاقات دليل المدربين">
      {coaches.map(coach => {
        const primaryBranch = getBranch(coach.branchIds[0]);
        const primaryGroup = getGroup(coach.groupIds[0]);
        const hasExperience = typeof coach.yearsOfExperience === 'number';

        return <article className="directory-card directory-card-coach" key={coach.id}>
          <div className="directory-card-glow" aria-hidden="true" />
          <header className="directory-card-header">
            <div className="directory-identity">
              <div className="directory-avatar"><UserAvatar name={coach.nameEn} large /></div>
              <div>
                <span className="directory-kicker"><BilingualText value={bi('Coach profile', 'ملف المدرب')} /></span>
                <h2><BilingualText value={{ en: coach.nameEn, ar: coach.nameAr }} /></h2>
                <code>{coach.id}</code>
              </div>
            </div>
            <EnterpriseStatus label={coach.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={coach.status === 'active' ? 'active' : 'neutral'} />
          </header>

          <div className="directory-metric-grid">
            <div><UsersRound size={16} /><span><BilingualText value={bi('Players', 'اللاعبون')} /><strong>{coach.playerIds.length}</strong></span></div>
            <div><Dumbbell size={16} /><span><BilingualText value={bi('Groups', 'المجموعات')} /><strong>{coach.groupIds.length}</strong></span></div>
            <div><MapPin size={16} /><span><BilingualText value={bi('Branches', 'الفروع')} /><strong>{coach.branchIds.length}</strong></span></div>
            <div><Trophy size={16} /><span><BilingualText value={bi('Sports', 'الرياضات')} /><strong>{coach.sportIds.length}</strong></span></div>
          </div>

          <section className="directory-card-section">
            <div className="directory-section-label"><BilingualText value={bi('Assigned sports', 'الرياضات المكلف بها')} /></div>
            <div className="directory-chip-row">
              {coach.sportIds.map(sportId => {
                const sport = getSport(sportId);
                return <span className="directory-chip directory-chip-gold" key={sportId}>{sport ? <BilingualText value={sport.name} /> : sportId}</span>;
              })}
            </div>
          </section>

          <section className="directory-card-section">
            <div className="directory-section-label"><BilingualText value={bi('Specialization', 'التخصص')} /></div>
            <div className="directory-chip-row">
              {coach.specializations.length > 0
                ? coach.specializations.map((specialization, index) => <span className="directory-chip" key={`${coach.id}-specialization-${index}`}><BilingualText value={specialization} /></span>)
                : <span className="directory-muted"><BilingualText value={bi('No specialization recorded', 'لا يوجد تخصص مسجل')} /></span>}
            </div>
          </section>

          <div className="directory-context-row">
            <div>
              <small><BilingualText value={bi('Primary branch', 'الفرع الأساسي')} /></small>
              <strong>{primaryBranch ? <BilingualText value={primaryBranch.name} /> : <BilingualText value={bi('Not assigned', 'غير محدد')} />}</strong>
            </div>
            <div>
              <small><BilingualText value={bi('Primary group', 'المجموعة الأساسية')} /></small>
              <strong>{primaryGroup ? <BilingualText value={primaryGroup.name} /> : <BilingualText value={bi('Not assigned', 'غير محددة')} />}</strong>
            </div>
            <div>
              <small><BilingualText value={bi('Experience', 'الخبرة')} /></small>
              <strong>{hasExperience ? <>{coach.yearsOfExperience} <BilingualText value={bi('years', 'سنوات')} /></> : <BilingualText value={bi('Not provided', 'غير مضافة')} />}</strong>
            </div>
          </div>

          <footer className="directory-card-footer">
            <span className="directory-readiness"><ShieldCheck size={15} /><BilingualText value={bi('Preview profile ready', 'ملف المعاينة جاهز')} /></span>
            <Link className="directory-open-button" to={`/admin/coaches/${coach.id}`}>
              <BilingualText value={bi('Open coach profile', 'فتح ملف المدرب')} />
              <ArrowRight size={16} />
            </Link>
          </footer>
        </article>;
      })}
    </section> : <EnterpriseEmpty title={bi('No coaches match', 'لا يوجد مدربون مطابقون')} description={bi('Try another coach name, ID, branch or sport.', 'جرب اسم مدرب أو معرفًا أو فرعًا أو رياضة أخرى.')} />}
  </div>;
}
