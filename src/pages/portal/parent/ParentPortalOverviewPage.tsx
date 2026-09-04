import { Activity, Bell, CalendarDays, CheckCircle2, CreditCard, MessageCircle, ShieldCheck, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getActiveParent, getChildPerformance, getFamilyAttendance, getFamilyPayments, getFamilySessions, getLinkedChildren, getSport } from '../../../portals/parent/parentData';

export function ParentPortalOverviewPage(){
  const parent=getActiveParent();
  const children=getLinkedChildren(parent);
  const attendance=getFamilyAttendance(children);
  const sessions=getFamilySessions(children);
  const upcoming=sessions.filter(({session})=>new Date(session.startsAt).getTime()>=Date.now());
  const payments=getFamilyPayments(children);
  const feedbackCount=children.reduce((sum,child)=>sum+(child.coachFeedback?.length??0),0);
  if(!parent)return <div className="parent-empty"><div><ShieldCheck/><h3><BilingualText value={bi('Family record unavailable','سجل الأسرة غير متاح')}/></h3></div></div>;

  return <div className="parent-page">
    <section className="parent-hero"><div className="parent-hero-row"><div><span className="parent-kicker"><UsersRound size={18}/><BilingualText value={bi('Family Command Center','مركز الأسرة')}/></span><h1>{parent.nameEn}<span lang="ar" dir="rtl"> · {parent.nameAr}</span></h1><p><BilingualText value={bi('One view for linked athletes, attendance, schedules, development records and account references — without inventing missing operational data.','عرض موحد للأبناء المرتبطين والحضور والجداول وسجلات التطور ومراجع الحساب — دون اختلاق بيانات تشغيلية مفقودة.')}/></p></div><span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('Explicit preview session','جلسة معاينة صريحة')}/></span></div><div className="parent-metrics"><Metric label={bi('Linked children','الأبناء المرتبطون')} value={String(children.length)} tone="gold"/><Metric label={bi('Attendance rate','نسبة الحضور')} value={attendance.rate===null?'Not recorded':`${attendance.rate}%`} tone="green"/><Metric label={bi('Upcoming sessions','الحصص القادمة')} value={String(upcoming.length)}/><Metric label={bi('Feedback records','سجلات الملاحظات')} value={String(feedbackCount)}/></div></section>

    <section className="parent-grid-3">
      <Quick to="/parent/children" icon={<UsersRound/>} title={bi('Children','الأبناء')} text={bi('Linked athlete profiles and assignments','ملفات اللاعبين المرتبطين والتعيينات')}/>
      <Quick to="/parent/schedule" icon={<CalendarDays/>} title={bi('Schedule','الجدول')} text={bi('Family training calendar from linked groups','تقويم تدريبات الأسرة من المجموعات المرتبطة')}/>
      <Quick to="/parent/attendance" icon={<CheckCircle2/>} title={bi('Attendance','الحضور')} text={bi('Recorded attendance only','سجلات الحضور فقط')}/>
      <Quick to="/parent/performance" icon={<Activity/>} title={bi('Performance','الأداء')} text={bi('Recorded sport metrics by child','المؤشرات الرياضية المسجلة لكل ابن')}/>
      <Quick to="/parent/messages" icon={<MessageCircle/>} title={bi('Messages','الرسائل')} text={bi('Secure communication integration state','حالة ربط التواصل الآمن')}/>
      <Quick to="/parent/notifications" icon={<Bell/>} title={bi('Notifications','الإشعارات')} text={bi('Signals derived from family records','إشارات مشتقة من سجلات الأسرة')}/>
    </section>

    <div className="parent-grid-2">
      <section className="parent-panel"><div className="parent-panel-head"><div><h2><BilingualText value={bi('Children snapshot','لمحة عن الأبناء')}/></h2><p><BilingualText value={bi('Identity, sport and current recorded development signal.','الهوية والرياضة ومؤشر التطور المسجل حاليًا.')}/></p></div><Link className="parent-secondary-action" to="/parent/children"><BilingualText value={bi('View all','عرض الكل')}/></Link></div><div className="parent-list" style={{marginTop:14}}>{children.length?children.map(child=>{const performance=getChildPerformance(child);return <Link to={`/parent/children/${child.id}`} className="parent-list-row" key={child.id} style={{textDecoration:'none'}}><div style={{display:'flex',alignItems:'center',gap:10}}><span className="parent-avatar">{child.nameEn.charAt(0)}</span><div><strong>{child.nameEn} · {child.nameAr}</strong><small><BilingualText value={getSport(child.sportId)?.name??bi('Sport not assigned','الرياضة غير معينة')}/></small></div></div><span className="parent-status neutral">{performance.score===null?<BilingualText value={bi('No score','لا توجد درجة')}/>:`${performance.score}/100`}</span></Link>}) : <p style={{color:'#94a3b8',fontSize:11}}><BilingualText value={bi('No linked children','لا يوجد أبناء مرتبطون')}/></p>}</div></section>

      <section className="parent-panel"><div className="parent-panel-head"><div><h2><BilingualText value={bi('Next family activity','النشاط الأسري القادم')}/></h2><p><BilingualText value={bi('Upcoming training and visible finance references.','التدريب القادم ومراجع المالية الظاهرة.')}/></p></div></div><div style={{marginTop:14,display:'grid',gap:12}}>{upcoming.length?<div className="parent-card"><span className="parent-kicker"><CalendarDays size={14}/><BilingualText value={bi('Next session','الحصة القادمة')}/></span><h3>{upcoming[0].child.nameEn} · {upcoming[0].child.nameAr}</h3><p><BilingualText value={getSport(upcoming[0].session.sportId)?.name??bi('Training session','حصة تدريبية')}/></p><strong style={{fontSize:11,color:'#f0cf67'}}>{formatDate(upcoming[0].session.startsAt)}</strong><Link className="parent-secondary-action" to="/parent/schedule"><BilingualText value={bi('Open schedule','فتح الجدول')}/></Link></div>:<div className="parent-truth"><CalendarDays size={13}/><BilingualText value={bi('No future session is currently linked.','لا توجد حصة مستقبلية مرتبطة حاليًا.')}/></div>}<div className="parent-card"><span className="parent-kicker"><CreditCard size={14}/><BilingualText value={bi('Billing records','سجلات الدفع')}/></span><h3><BilingualText value={bi(`${payments.length} linked record(s)`,`${payments.length} سجل مرتبط`)}/></h3><p><BilingualText value={bi('No outstanding balance is inferred from these preview records.','لا يتم استنتاج رصيد مستحق من سجلات المعاينة هذه.')}/></p><Link className="parent-secondary-action" to="/parent/payments"><BilingualText value={bi('Open payments','فتح المدفوعات')}/></Link></div></div></section>
    </div>
  </div>;
}
function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
function Quick({to,icon,title,text}:{to:string;icon:React.ReactNode;title:{en:string;ar:string};text:{en:string;ar:string}}){return <Link to={to} className="parent-card" style={{textDecoration:'none',minHeight:130}}><span className="parent-avatar">{icon}</span><h3><BilingualText value={title}/></h3><p><BilingualText value={text}/></p></Link>}
function formatDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?value:`${date.toLocaleString('en',{dateStyle:'medium',timeStyle:'short'})} · ${date.toLocaleString('ar',{dateStyle:'medium',timeStyle:'short'})}`}
