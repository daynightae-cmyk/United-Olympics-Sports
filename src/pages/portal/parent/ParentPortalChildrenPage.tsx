import { Activity, CalendarDays, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalChildrenPage() {
  const { parent, children, sports, groups, loading, error } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="parent-empty" role="status"><div><UsersRound/><h3><BilingualText value={bi('Loading linked children…','جارٍ تحميل الأبناء المرتبطين…')}/></h3></div></div>;
  if (error) return <div className="parent-empty" role="alert"><div><UsersRound/><h3><BilingualText value={bi('Family provider unavailable','موفر بيانات الأسرة غير متاح')}/></h3></div></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable','ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.','سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  return <div className="parent-page">
    <section className="parent-hero">
      <div className="parent-hero-row">
        <div>
          <span className="parent-kicker"><UsersRound size={18}/><BilingualText value={bi('Linked Athlete Profiles','ملفات اللاعبين المرتبطين')}/></span>
          <h1><BilingualText value={bi('Children','الأبناء')}/></h1>
          <p><BilingualText value={bi('Only athletes linked to the active Parent provider record are visible here.','تظهر هنا فقط ملفات اللاعبين المرتبطة بسجل ولي الأمر النشط لدى موفر البيانات.')}/></p>
        </div>
        <span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('Relationship-scoped view','عرض محكوم بالعلاقة')}/></span>
      </div>
      <div className="parent-metrics">
        <Metric label={bi('Linked children','الأبناء المرتبطون')} value={String(children.length)} tone="gold"/>
        <Metric label={bi('Sports','الرياضات')} value={String(new Set(children.map((child)=>child.sportId)).size)}/>
        <Metric label={bi('With groups','لديهم مجموعات')} value={String(children.filter((child)=>child.groupId).length)} tone="green"/>
        <Metric label={bi('Measured performance','أداء مقاس')} value={String(children.filter((child)=>child.performanceScore!==null).length)}/>
      </div>
    </section>

    {children.length ? <section className="parent-grid-2">{children.map((child)=>{
      const sport = sports.find((item)=>item.id===child.sportId);
      const group = child.groupId ? groups.find((item)=>item.id===child.groupId) : undefined;
      return <Link key={child.id} to={`/parent/children/${child.id}`} className="parent-panel" style={{textDecoration:'none'}}>
        <div className="parent-card-head">
          <span className="parent-avatar">{child.nameEn.charAt(0)}</span>
          <div style={{minWidth:0}}><h2>{child.nameEn}</h2><small lang="ar" dir="rtl">{child.nameAr}</small></div>
          <span className="parent-status good" style={{marginInlineStart:'auto'}}><BilingualText value={bi('Linked','مرتبط')}/></span>
        </div>
        <div className="parent-field-grid" style={{marginTop:14}}>
          <Field label={bi('Sport','الرياضة')} value={sport?.name.en}/>
          <Field label={bi('Group','المجموعة')} value={group?.name.en}/>
          <Field label={bi('Level','المستوى')} value={`${child.level.en} · ${child.level.ar}`}/>
          <Field label={bi('Attendance','الحضور')} value={`${child.attendanceRate}%`}/>
          <Field label={bi('Performance','الأداء')} value={child.performanceScore===null?undefined:`${child.performanceScore}/100`}/>
          <Field label={bi('Age','العمر')} value={child.age ? String(child.age) : undefined}/>
        </div>
        <div className="parent-actions" style={{marginTop:14}}>
          <span className="parent-secondary-action"><CalendarDays size={13}/><BilingualText value={bi('Open full record','فتح السجل الكامل')}/></span>
          <span className="parent-status neutral"><Activity size={11}/>{child.id}</span>
        </div>
      </Link>;
    })}</section> : <div className="parent-empty"><div><UsersRound/><h3><BilingualText value={bi('No linked children','لا يوجد أبناء مرتبطون')}/></h3><p><BilingualText value={bi('Link an athlete to this parent record from Admin first.','اربط لاعبًا بسجل ولي الأمر من الإدارة أولًا.')}/></p></div></div>}
  </div>;
}

function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
function Field({label,value}:{label:{en:string;ar:string};value?:string}){return <div className="parent-field"><span><BilingualText value={label}/></span><strong className={value?'':'missing'}>{value??<BilingualText value={bi('Not recorded','غير مسجل')}/>}</strong></div>}
