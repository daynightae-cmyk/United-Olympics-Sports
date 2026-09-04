import { ArrowRight, Languages, Mail, Phone, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, UserAvatar } from '../../components/admin/AdminUI';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { EnterpriseEmpty, EnterpriseKpi, EnterpriseStatus, EnterpriseToolbar, PreviewNotice } from '../../components/enterprise/EnterpriseUI';
import { demoParents } from '../../data/demo/parents';
import { getPlayer } from '../../data/demo/selectors';

const hasUsefulContact = (value?: string) => Boolean(value && value.trim() && value.trim() !== '-');

export function AdminParentsPage() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const parents = useMemo(() => demoParents.filter(parent => {
    const childText = parent.playerIds.map(id => {
      const player = getPlayer(id);
      return player ? `${player.nameEn} ${player.nameAr} ${player.id}` : id;
    }).join(' ');
    return `${parent.nameEn} ${parent.nameAr} ${parent.id} ${childText}`.toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery]);

  const activeParents = demoParents.filter(parent => parent.status === 'active').length;
  const linkedPlayers = new Set(demoParents.flatMap(parent => parent.playerIds)).size;
  const arabicPreference = demoParents.filter(parent => parent.preferredLanguage === 'ar').length;

  return <div className="admin-page directory-v2-page directory-v2-parents">
    <PageHeader
      icon={UserRoundCheck}
      eyebrow={bi('Family Relationship Center', 'مركز علاقات الأسر')}
      title={bi('Parents & Guardians', 'أولياء الأمور')}
      description={bi('A family-first directory for linked athletes, communication preferences and contact readiness.', 'دليل متمحور حول الأسرة للاعبين المرتبطين وتفضيلات التواصل وجاهزية بيانات الاتصال.')}
      actions={<PreviewNotice />}
    />

    <section className="enterprise-kpi-grid directory-kpi-grid" aria-label="Parent overview | نظرة عامة على أولياء الأمور">
      <EnterpriseKpi icon={UserRoundCheck} label={bi('Parents', 'أولياء الأمور')} value={demoParents.length} detail={bi('Preview family profiles', 'ملفات أسرية تجريبية')} />
      <EnterpriseKpi icon={ShieldCheck} tone="green" label={bi('Active profiles', 'الملفات النشطة')} value={activeParents} detail={bi('Current preview status', 'حالة المعاينة الحالية')} />
      <EnterpriseKpi icon={UsersRound} tone="blue" label={bi('Linked athletes', 'اللاعبون المرتبطون')} value={linkedPlayers} detail={bi('Unique player relationships', 'علاقات لاعبين فريدة')} />
      <EnterpriseKpi icon={Languages} tone="orange" label={bi('Arabic preference', 'تفضيل العربية')} value={arabicPreference} detail={bi('Preferred communication language', 'لغة التواصل المفضلة')} />
    </section>

    <EnterpriseToolbar
      query={query}
      onQueryChange={setQuery}
      queryLabel={bi('Search parents, IDs or linked athletes', 'البحث عن أولياء الأمور أو المعرفات أو اللاعبين المرتبطين')}
      resultCount={bi(`${parents.length} parents`, `${parents.length} أولياء أمور`)}
    />

    {parents.length > 0 ? <section className="directory-card-grid" aria-label="Parent directory cards | بطاقات دليل أولياء الأمور">
      {parents.map(parent => {
        const children = parent.playerIds.map(id => getPlayer(id)).filter(Boolean);
        const phoneReady = hasUsefulContact(parent.phone);
        const emailReady = hasUsefulContact(parent.email);
        const contactReady = phoneReady || emailReady;

        return <article className="directory-card directory-card-parent" key={parent.id}>
          <div className="directory-card-glow" aria-hidden="true" />
          <header className="directory-card-header">
            <div className="directory-identity">
              <div className="directory-avatar"><UserAvatar name={parent.nameEn} large /></div>
              <div>
                <span className="directory-kicker"><BilingualText value={bi('Family profile', 'ملف الأسرة')} /></span>
                <h2><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></h2>
                <code>{parent.id}</code>
              </div>
            </div>
            <EnterpriseStatus label={parent.status === 'active' ? bi('Active', 'نشط') : bi('Inactive', 'غير نشط')} tone={parent.status === 'active' ? 'active' : 'neutral'} />
          </header>

          <div className="directory-family-banner">
            <div className="directory-family-icon"><UsersRound size={19} /></div>
            <div>
              <small><BilingualText value={bi('Linked athletes', 'اللاعبون المرتبطون')} /></small>
              <strong>{children.length}</strong>
            </div>
            <span className="directory-language-pill"><Languages size={14} /><BilingualText value={parent.preferredLanguage === 'ar' ? bi('Arabic preferred', 'العربية مفضلة') : bi('English preferred', 'الإنجليزية مفضلة')} /></span>
          </div>

          <section className="directory-card-section">
            <div className="directory-section-label"><BilingualText value={bi('Children / Athletes', 'الأبناء / اللاعبون')} /></div>
            <div className="directory-child-list">
              {children.length > 0 ? children.map(child => child && <div className="directory-child" key={child.id}>
                <span className="directory-child-avatar">{child.nameEn.slice(0, 1)}</span>
                <span><strong><BilingualText value={{ en: child.nameEn, ar: child.nameAr }} /></strong><small>{child.id}</small></span>
              </div>) : <span className="directory-muted"><BilingualText value={bi('No linked athletes', 'لا يوجد لاعبون مرتبطون')} /></span>}
            </div>
          </section>

          <section className="directory-card-section directory-contact-section">
            <div className="directory-section-label"><BilingualText value={bi('Contact readiness', 'جاهزية التواصل')} /></div>
            <div className="directory-contact-grid">
              <div className={phoneReady ? 'is-ready' : 'is-missing'}>
                <Phone size={15} />
                <span><small><BilingualText value={bi('Phone', 'الهاتف')} /></small><strong>{phoneReady ? parent.phone : <BilingualText value={bi('Not provided', 'غير مضاف')} />}</strong></span>
              </div>
              <div className={emailReady ? 'is-ready' : 'is-missing'}>
                <Mail size={15} />
                <span><small><BilingualText value={bi('Email', 'البريد الإلكتروني')} /></small><strong>{emailReady ? parent.email : <BilingualText value={bi('Not provided', 'غير مضاف')} />}</strong></span>
              </div>
            </div>
          </section>

          <footer className="directory-card-footer">
            <span className={`directory-readiness ${contactReady ? '' : 'is-warning'}`}>
              <ShieldCheck size={15} />
              <BilingualText value={contactReady ? bi('Contact channel available', 'قناة تواصل متاحة') : bi('Contact details pending', 'بيانات التواصل قيد الاستكمال')} />
            </span>
            <Link className="directory-open-button" to={`/admin/parents/${parent.id}`}>
              <BilingualText value={bi('Open family profile', 'فتح ملف الأسرة')} />
              <ArrowRight size={16} />
            </Link>
          </footer>
        </article>;
      })}
    </section> : <EnterpriseEmpty title={bi('No parents match', 'لا يوجد أولياء أمور مطابقون')} description={bi('Try another parent name, ID or linked athlete.', 'جرب اسم ولي أمر أو معرفًا أو لاعبًا مرتبطًا آخر.')} />}
  </div>;
}
