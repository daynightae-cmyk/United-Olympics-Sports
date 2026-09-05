import { Bell, CalendarDays, CheckCheck, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getFamilySessions, getLinkedChildren } from '../../../portals/parent/parentData';

type FamilyNotification = { id:string; title:{en:string;ar:string}; body:{en:string;ar:string}; timestamp:string; category:'schedule'|'feedback'; action:string };
const READ_KEY='uos:parent-portal:read-notifications:v1';
function loadRead(){ if(typeof window==='undefined') return new Set<string>(); try{return new Set<string>(JSON.parse(localStorage.getItem(READ_KEY)??'[]'))}catch{return new Set<string>()}}

export function ParentPortalNotificationsPage(){
  const children=getLinkedChildren();
  const notifications=useMemo<FamilyNotification[]>(()=>{
    const sessionItems=getFamilySessions(children).filter(({session})=>new Date(session.startsAt).getTime()>=Date.now()).map(({session,child})=>({id:`session:${session.id}`,title:bi('Upcoming training session','حصة تدريبية قادمة'),body:bi(`${child.nameEn} has a linked session on ${new Date(session.startsAt).toLocaleString('en',{dateStyle:'medium',timeStyle:'short'})}.`,`لدى ${child.nameAr} حصة مرتبطة بتاريخ ${new Date(session.startsAt).toLocaleString('ar',{dateStyle:'medium',timeStyle:'short'})}.`),timestamp:session.startsAt,category:'schedule' as const,action:'/parent/schedule'}));
    const feedbackItems=children.flatMap(child=>(child.coachFeedback??[]).map(note=>({id:`feedback:${note.id}`,title:bi('Recorded coach feedback','ملاحظة مدرب مسجلة'),body:bi(`A coaching note is recorded for ${child.nameEn}.`,`تم تسجيل ملاحظة تدريبية لـ ${child.nameAr}.`),timestamp:note.createdAt,category:'feedback' as const,action:'/parent/feedback'})));
    return [...sessionItems,...feedbackItems].sort((a,b)=>b.timestamp.localeCompare(a.timestamp));
  },[children]);
  const [read,setRead]=useState<Set<string>>(()=>loadRead());
  const [filter,setFilter]=useState<'all'|'unread'|'schedule'|'feedback'>('all');
  const unread=notifications.filter(item=>!read.has(item.id)).length;
  const visible=notifications.filter(item=>filter==='all'?true:filter==='unread'?!read.has(item.id):item.category===filter);
  const save=(next:Set<string>)=>{setRead(next);try{localStorage.setItem(READ_KEY,JSON.stringify([...next]))}catch{/* local state only */}};
  const mark=(id:string)=>save(new Set([...read,id]));
  const markAll=()=>save(new Set(notifications.map(item=>item.id)));

  return <div className="parent-page"><section className="parent-hero"><div className="parent-hero-row"><div><span className="parent-kicker"><Bell size={18}/><BilingualText value={bi('Family Record Signals','إشارات سجلات الأسرة')}/></span><h1><BilingualText value={bi('Notifications','الإشعارات')}/></h1><p><BilingualText value={bi('Notifications are derived from existing schedule and feedback records. No push, SMS or email delivery is claimed.','يتم اشتقاق الإشعارات من سجلات الجدول والملاحظات الموجودة. ولا يتم ادعاء إرسال Push أو SMS أو بريد إلكتروني.')}/></p></div>{unread>0?<button type="button" className="parent-primary-action" onClick={markAll}><CheckCheck size={14}/><BilingualText value={bi('Mark all read','تحديد الكل كمقروء')}/></button>:<span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('No unread signals','لا توجد إشارات غير مقروءة')}/></span>}</div><div className="parent-metrics"><Metric label={bi('All signals','كل الإشارات')} value={String(notifications.length)}/><Metric label={bi('Unread','غير المقروء')} value={String(unread)} tone="gold"/><Metric label={bi('Schedule','الجدول')} value={String(notifications.filter(x=>x.category==='schedule').length)}/><Metric label={bi('Feedback','الملاحظات')} value={String(notifications.filter(x=>x.category==='feedback').length)} tone="green"/></div></section>
    <section className="parent-panel"><div className="parent-filter-row">{(['all','unread','schedule','feedback'] as const).map(value=><button key={value} type="button" className={filter===value?'active':''} onClick={()=>setFilter(value)}><BilingualText value={value==='all'?bi('All','الكل'):value==='unread'?bi('Unread','غير مقروء'):value==='schedule'?bi('Schedule','الجدول'):bi('Feedback','الملاحظات')}/></button>)}</div>{visible.length?<div className="parent-list" style={{marginTop:14}}>{visible.map(item=><article className="parent-list-row" key={item.id}><div style={{display:'flex',gap:10,alignItems:'flex-start'}}><span className="parent-avatar" style={{width:38,height:38}}>{item.category==='schedule'?<CalendarDays size={16}/>:<MessageCircle size={16}/>}</span><div><strong><BilingualText value={item.title}/></strong><small><BilingualText value={item.body}/></small><small>{item.timestamp}</small><Link to={item.action} style={{display:'inline-block',marginTop:6,color:'#e4c45d',fontSize:10}}><BilingualText value={bi('Open related section','فتح القسم المرتبط')}/></Link></div></div>{read.has(item.id)?<span className="parent-status good"><CheckCircle2 size={12}/><BilingualText value={bi('Read','مقروء')}/></span>:<button type="button" className="parent-secondary-action" onClick={()=>mark(item.id)}><BilingualText value={bi('Mark read','تحديد كمقروء')}/></button>}</article>)}</div>:<div className="parent-empty" style={{marginTop:14}}><div><Bell/><h3><BilingualText value={bi('No notifications match','لا توجد إشعارات مطابقة')}/></h3><p><BilingualText value={bi('No signal can currently be derived for this filter from linked family records.','لا يمكن حاليًا اشتقاق أي إشارة لهذا الفلتر من سجلات الأسرة المرتبطة.')}/></p></div></div>}</section>
  </div>;
}
function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
