import { CheckCircle2, ShieldCheck, UserRound } from 'lucide-react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseEmpty } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalAttendancePage() {
  const { parent, children, loading, error } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="parent-empty" role="status"><div><CheckCircle2/><h3><BilingualText value={bi('Loading attendance summaries…','جارٍ تحميل ملخصات الحضور…')}/></h3></div></div>;
  if (error) return <div className="parent-empty" role="alert"><div><CheckCircle2/><h3><BilingualText value={bi('Attendance provider unavailable','موفر بيانات الحضور غير متاح')}/></h3></div></div>;
  if (!parent) return <EnterpriseEmpty title={bi('Family profile unavailable','ملف الأسرة غير متاح')} description={bi('Sign in again from the Parent login page.','سجّل الدخول مجددًا من صفحة ولي الأمر.')} />;

  const average = children.length ? Math.round(children.reduce((sum, child) => sum + child.attendanceRate, 0) / children.length) : null;
  const strong = children.filter((child) => child.attendanceRate >= 85).length;
  const attention = children.filter((child) => child.attendanceRate < 70).length;

  return <div className="parent-page">
    <section className="parent-hero">
      <div className="parent-hero-row">
        <div>
          <span className="parent-kicker"><CheckCircle2 size={18}/><BilingualText value={bi('Family Attendance Summary','ملخص حضور الأسرة')}/></span>
          <h1><BilingualText value={bi('Attendance','الحضور')}/></h1>
          <p><BilingualText value={bi('Attendance percentages are read from the shared provider player summaries. Detailed day-by-day records are not exposed by the current Parent data contract.','يتم قراءة نسب الحضور من ملخصات اللاعبين لدى موفر البيانات المشترك. السجل اليومي التفصيلي غير متاح حاليًا في عقد بيانات ولي الأمر.')}/></p>
        </div>
        <span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('Provider summaries only','ملخصات موفر البيانات فقط')}/></span>
      </div>
      <div className="parent-metrics">
        <Metric label={bi('Family average','متوسط الأسرة')} value={average===null?'—':`${average}%`} tone="green"/>
        <Metric label={bi('Linked children','الأبناء المرتبطون')} value={String(children.length)}/>
        <Metric label={bi('85% or higher','85% أو أكثر')} value={String(strong)} tone="green"/>
        <Metric label={bi('Below 70%','أقل من 70%')} value={String(attention)} tone={attention?'gold':''}/>
      </div>
    </section>

    {children.length ? <section className="parent-grid-2">{children.map((child) => <article className="parent-panel" key={child.id}>
      <div className="parent-card-head">
        <span className="parent-avatar"><UserRound size={18}/></span>
        <div><h2>{child.nameEn}</h2><small lang="ar" dir="rtl">{child.nameAr}</small></div>
        <span className={`parent-status ${child.attendanceRate >= 85 ? 'good' : child.attendanceRate < 70 ? 'warn' : 'neutral'}`} style={{marginInlineStart:'auto'}}>{child.attendanceRate}%</span>
      </div>
      <div className="parent-field-grid" style={{marginTop:14}}>
        <Field label={bi('Attendance rate','نسبة الحضور')} value={`${child.attendanceRate}%`}/>
        <Field label={bi('Player status','حالة اللاعب')} value={`${child.status.en} · ${child.status.ar}`}/>
      </div>
    </article>)}</section> : <EnterpriseEmpty title={bi('No linked children','لا يوجد أبناء مرتبطون')} description={bi('No attendance summary can be shown until an athlete is linked to this Parent record.','لا يمكن عرض ملخص حضور حتى يتم ربط لاعب بسجل ولي الأمر.')} />}

    <section className="parent-panel" style={{marginTop:16}}>
      <div className="parent-panel-head"><div><h2><BilingualText value={bi('Detailed attendance history','سجل الحضور التفصيلي')}/></h2><p><BilingualText value={bi('Not available from the current provider contract. The portal does not fabricate present/late/absent dates.', 'غير متاح من عقد موفر البيانات الحالي. لا تقوم البوابة باختلاق تواريخ حضور أو تأخير أو غياب.')} /></p></div></div>
    </section>
  </div>;
}

function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
function Field({label,value}:{label:{en:string;ar:string};value:string}){return <div className="parent-field"><span><BilingualText value={label}/></span><strong>{value}</strong></div>}
