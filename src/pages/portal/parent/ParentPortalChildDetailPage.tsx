import { Activity, ArrowLeft, CalendarDays, CreditCard, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { EnterpriseStatus } from '../../../components/enterprise/EnterpriseUI';
import { useParentPortalGatewayData } from '../../../portals/parent/useParentPortalGatewayData';

export function ParentPortalChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const {
    parent,
    children,
    familySessions,
    familySubscriptions,
    familyPayments,
    sports,
    groups,
    programs,
    branches,
    loading,
    error,
  } = useParentPortalGatewayData();

  if (loading && !parent) return <div className="parent-page"><div className="parent-empty" role="status"><div><UserRound/><h3><BilingualText value={bi('Loading child record…','جارٍ تحميل سجل الابن…')}/></h3></div></div></div>;
  if (error) return <div className="parent-page"><div className="parent-empty" role="alert"><div><UserRound/><h3><BilingualText value={bi('Family provider unavailable','موفر بيانات الأسرة غير متاح')}/></h3></div></div></div>;

  const child = children.find((item) => item.id === childId);
  if (!parent || !child) return <div className="parent-page"><div className="parent-empty"><div><UserRound/><h3><BilingualText value={bi('Linked child not found','لم يتم العثور على الابن المرتبط')}/></h3><p><BilingualText value={bi('This route does not match an athlete linked to the active Parent provider record.','هذا المسار لا يطابق لاعبًا مرتبطًا بسجل ولي الأمر النشط لدى موفر البيانات.')}/></p><Link className="parent-primary-action" to="/parent/children" style={{marginTop:14}}><ArrowLeft size={14} className="rtl:rotate-180"/><BilingualText value={bi('Back to children','العودة إلى الأبناء')}/></Link></div></div></div>;

  const sport = sports.find((item) => item.id === child.sportId);
  const group = child.groupId ? groups.find((item) => item.id === child.groupId) : undefined;
  const program = child.programId ? programs.find((item) => item.id === child.programId) : undefined;
  const sessions = familySessions.filter((session) => session.groupId === child.groupId);
  const subscriptions = familySubscriptions.filter((subscription) => subscription.playerId === child.id);
  const payments = familyPayments.filter((payment) => payment.playerId === child.id);
  const activeSubscription = subscriptions.find((subscription) => subscription.status === 'active') ?? subscriptions[0];
  const branch = activeSubscription ? branches.find((item) => item.id === activeSubscription.branchId) : undefined;
  const paymentTotal = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return <div className="parent-page">
    <section className="parent-hero">
      <div className="parent-hero-row">
        <div><span className="parent-kicker"><UserRound size={18}/><BilingualText value={bi('Linked Athlete Record','سجل اللاعب المرتبط')}/></span><h1>{child.nameEn}<span lang="ar" dir="rtl"> · {child.nameAr}</span></h1><p><BilingualText value={bi('A relationship-scoped provider view of identity, assignment, attendance summary, performance, schedule and finance references.','عرض من موفر البيانات محكوم بعلاقة الأسرة للهوية والتعيين وملخص الحضور والأداء والجدول والمراجع المالية.')}/></p></div>
        <span className="parent-scope"><ShieldCheck size={12}/>{child.id}</span>
      </div>
      <div className="parent-metrics">
        <Metric label={bi('Attendance','الحضور')} value={`${child.attendanceRate}%`} tone="green"/>
        <Metric label={bi('Performance','الأداء')} value={child.performanceScore===null?'Not measured':`${child.performanceScore}/100`} tone="gold"/>
        <Metric label={bi('Sessions','الحصص')} value={String(sessions.length)}/>
        <Metric label={bi('Payments','المدفوعات')} value={String(payments.length)}/>
      </div>
    </section>

    <div className="parent-grid-2">
      <section className="parent-panel">
        <div className="parent-panel-head"><div><h2><BilingualText value={bi('Athlete identity & assignment','هوية اللاعب والتعيين')}/></h2></div><EnterpriseStatus label={child.status} tone="info"/></div>
        <div className="parent-field-grid" style={{marginTop:14}}>
          <Field label={bi('English name','الاسم بالإنجليزية')} value={child.nameEn}/>
          <Field label={bi('Arabic name','الاسم بالعربية')} value={child.nameAr}/>
          <Field label={bi('Player ID','معرف اللاعب')} value={child.id}/>
          <Field label={bi('Age','العمر')} value={child.age}/>
          <Field label={bi('Sport','الرياضة')} value={sport?`${sport.name.en} · ${sport.name.ar}`:undefined}/>
          <Field label={bi('Training group','المجموعة التدريبية')} value={group?`${group.name.en} · ${group.name.ar}`:undefined}/>
          <Field label={bi('Program','البرنامج')} value={program?`${program.name.en} · ${program.name.ar}`:undefined}/>
          <Field label={bi('Level','المستوى')} value={`${child.level.en} · ${child.level.ar}`}/>
        </div>
      </section>

      <section className="parent-panel">
        <div className="parent-panel-head"><div><h2><BilingualText value={bi('Development summary','ملخص التطور')}/></h2><p><BilingualText value={bi('Only provider summary fields are shown. Detailed metric history is not exposed by the current contract.','يتم عرض حقول الملخص لدى موفر البيانات فقط. سجل المؤشرات التفصيلي غير متاح في العقد الحالي.')}/></p></div></div>
        <div className="parent-field-grid" style={{marginTop:14}}>
          <Field label={bi('Attendance rate','نسبة الحضور')} value={`${child.attendanceRate}%`}/>
          <Field label={bi('Performance score','درجة الأداء')} value={child.performanceScore===null?undefined:`${child.performanceScore}/100`}/>
        </div>
        <div className="parent-truth" style={{marginTop:14}}><Activity size={13}/><BilingualText value={bi('No day-by-day attendance or metric timeline is fabricated in Parent Portal.','لا يتم اختلاق سجل حضور يومي أو خط زمني للمؤشرات داخل بوابة ولي الأمر.')}/></div>
      </section>
    </div>

    <div className="parent-grid-2">
      <section className="parent-panel">
        <div className="parent-panel-head"><div><h2><BilingualText value={bi('Training schedule','جدول التدريب')}/></h2></div><span className="parent-status neutral">{sessions.length}</span></div>
        {sessions.length ? <div className="parent-list" style={{marginTop:14}}>{sessions.map((session)=><div className="parent-list-row" key={session.id}><div><strong>{new Date(session.startsAt).toLocaleString('en-GB')}</strong><small><BilingualText value={sport?.name??bi(session.sportId,session.sportId)}/>{group?<> · <BilingualText value={group.name}/></>:null}</small></div><EnterpriseStatus label={session.status} tone="info"/></div>)}</div> : <div className="parent-truth" style={{marginTop:14}}><CalendarDays size={13}/><BilingualText value={bi('No provider sessions are linked to this child’s group.','لا توجد جلسات لدى موفر البيانات مرتبطة بمجموعة هذا اللاعب.')}/></div>}
      </section>

      <section className="parent-panel">
        <div className="parent-panel-head"><div><h2><BilingualText value={bi('Membership & finance','العضوية والمالية')}/></h2></div></div>
        <div className="parent-field-grid" style={{marginTop:14}}>
          <Field label={bi('Subscription','الاشتراك')} value={activeSubscription?`${activeSubscription.plan.en} · ${activeSubscription.plan.ar}`:undefined}/>
          <Field label={bi('Subscription status','حالة الاشتراك')} value={activeSubscription?.status}/>
          <Field label={bi('Branch','الفرع')} value={branch?`${branch.name.en} · ${branch.name.ar}`:undefined}/>
          <Field label={bi('Payment records','سجلات الدفع')} value={String(payments.length)}/>
          <Field label={bi('Visible payment total','إجمالي المدفوعات الظاهر')} value={payments.length?`${paymentTotal.toFixed(2)} ${payments[0].currency}`:undefined}/>
        </div>
        <div className="parent-truth" style={{marginTop:14}}><CreditCard size={13}/><BilingualText value={bi('Finance data is read-only here; no charge, renewal or refund is executed.','البيانات المالية للقراءة فقط هنا؛ لا يتم تنفيذ خصم أو تجديد أو استرداد.')}/></div>
      </section>
    </div>

    <section className="parent-panel">
      <div className="parent-panel-head"><div><h2><BilingualText value={bi('Detailed coaching feedback','ملاحظات التدريب التفصيلية')}/></h2></div></div>
      <div className="parent-truth" style={{marginTop:14}}><ShieldCheck size={13}/><BilingualText value={bi('Detailed coach-feedback records are not exposed by the current shared provider contract, so this page does not fall back to fixture notes.','سجلات ملاحظات المدرب التفصيلية غير متاحة في عقد موفر البيانات المشترك الحالي، لذلك لا ترجع هذه الصفحة إلى ملاحظات تجريبية ثابتة.')}/></div>
    </section>

    <div className="parent-actions">
      <Link className="parent-secondary-action" to="/parent/children"><ArrowLeft size={14} className="rtl:rotate-180"/><BilingualText value={bi('Back to children','العودة إلى الأبناء')}/></Link>
      <Link className="parent-secondary-action" to="/parent/schedule"><CalendarDays size={14}/><BilingualText value={bi('Family schedule','جدول الأسرة')}/></Link>
      <Link className="parent-secondary-action" to="/parent/performance"><Activity size={14}/><BilingualText value={bi('Family performance','أداء الأسرة')}/></Link>
      <Link className="parent-secondary-action" to="/parent/subscriptions"><WalletCards size={14}/><BilingualText value={bi('Subscriptions','الاشتراكات')}/></Link>
    </div>
  </div>;
}

function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
function Field({label,value}:{label:{en:string;ar:string};value?:string|number}){return <div className="parent-field"><span><BilingualText value={label}/></span><strong className={value===undefined?'missing':''}>{value===undefined?<BilingualText value={bi('Not recorded','غير مسجل')}/>:value}</strong></div>}
