import { CalendarDays, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { getFamilyAttendance, getLinkedChildren } from '../../../portals/parent/parentData';

const labels = {
  present: bi('Present', 'حاضر'), late: bi('Late', 'متأخر'), excused: bi('Excused', 'بعذر'), absent: bi('Absent', 'غائب'),
};

type Filter = 'all' | keyof typeof labels;

export function ParentPortalAttendancePage() {
  const children = getLinkedChildren();
  const stats = getFamilyAttendance(children);
  const [filter, setFilter] = useState<Filter>('all');
  const rows = stats.records.filter((row) => filter === 'all' || row.status === filter);

  return <div className="parent-page">
    <section className="parent-hero"><div className="parent-hero-row"><div><span className="parent-kicker"><CheckCircle2 size={18}/><BilingualText value={bi('Family Attendance Records','سجلات حضور الأسرة')}/></span><h1><BilingualText value={bi('Attendance','الحضور')}/></h1><p><BilingualText value={bi('Attendance is calculated only from recorded child attendance entries. Missing dates are not treated as absences.','يتم حساب الحضور فقط من سجلات الحضور الفعلية للأبناء. ولا يتم اعتبار التواريخ المفقودة حالات غياب.')}/></p></div><span className="parent-scope"><ShieldCheck size={12}/><BilingualText value={bi('Recorded entries only','السجلات المسجلة فقط')}/></span></div><div className="parent-metrics"><Metric label={bi('Family rate','نسبة الأسرة')} value={stats.rate===null?'Not recorded':`${stats.rate}%`} tone="green"/><Metric label={bi('Recorded entries','السجلات')} value={String(stats.total)}/><Metric label={bi('Present','حاضر')} value={String(stats.present)}/><Metric label={bi('Late','متأخر')} value={String(stats.late)} tone="gold"/></div></section>

    <section className="parent-panel"><div className="parent-panel-head"><div><h2><BilingualText value={bi('Attendance history','سجل الحضور')}/></h2><p><BilingualText value={bi('Filter recorded attendance across all linked children.','فلترة سجلات الحضور لجميع الأبناء المرتبطين.')}/></p></div></div><div className="parent-filter-row" style={{marginTop:14}}>{(['all','present','late','excused','absent'] as const).map(value=><button type="button" key={value} onClick={()=>setFilter(value)} className={filter===value?'active':''}><BilingualText value={value==='all'?bi('All','الكل'):labels[value]}/></button>)}</div>
      {rows.length ? <div className="parent-list" style={{marginTop:14}}>{rows.map(row=><div className="parent-list-row" key={`${row.child.id}-${row.id}`}><div><strong>{row.child.nameEn} · {row.child.nameAr}</strong><small>{new Date(row.date).toLocaleDateString('en',{year:'numeric',month:'short',day:'numeric'})} · {new Date(row.date).toLocaleDateString('ar',{year:'numeric',month:'short',day:'numeric'})}</small></div><span className={`parent-status ${row.status==='present'?'good':row.status==='late'?'warn':'neutral'}`}>{row.status==='present'?<CheckCircle2 size={12}/>:row.status==='late'?<Clock size={12}/>:row.status==='absent'?<XCircle size={12}/>:<CalendarDays size={12}/>}<BilingualText value={labels[row.status]}/></span></div>)}</div> : <div className="parent-empty" style={{marginTop:14}}><div><CalendarDays/><h3><BilingualText value={bi('No attendance records match','لا توجد سجلات حضور مطابقة')}/></h3><p><BilingualText value={bi('No entry matches the current filter or no attendance has been recorded yet.','لا يوجد سجل يطابق الفلتر الحالي أو لم يتم تسجيل الحضور بعد.')}/></p></div></div>}
    </section>
  </div>;
}

function Metric({label,value,tone='' }:{label:{en:string;ar:string};value:string;tone?:string}){return <div className="parent-metric"><span><BilingualText value={label}/></span><strong className={tone}>{value}</strong></div>}
