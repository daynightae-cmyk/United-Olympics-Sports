import { CalendarDays, CreditCard, HeartHandshake, MessageSquareText, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoParents } from '../../../data/demo/parents';
import { getPlayer, getSport } from '../../../data/demo/selectors';

export function ParentPortalOverviewPage() {
  const parent = demoParents[0]; const children = parent.playerIds.map(getPlayer).filter(Boolean);
  const attended = children.reduce((sum, player) => sum + (player?.attendanceSummary?.attended ?? 0), 0);
  const scheduled = children.reduce((sum, player) => sum + (player?.attendanceSummary?.scheduled ?? 0), 0);
  return <div className="admin-page"><PageHeader eyebrow={bi('Parent Portal', 'بوابة ولي الأمر')} title={bi('Family Overview', 'نظرة عامة للأسرة')} description={bi('Children, attendance and communication context in one truthful preview workspace.', 'سياق الأبناء والحضور والتواصل في مساحة معاينة صادقة واحدة.')} />
    <section className="portal-overview-hero"><article className="portal-overview-primary"><span><HeartHandshake /></span><div><h2>{parent.nameEn}<span lang="ar" dir="rtl"> · {parent.nameAr}</span></h2><p><BilingualText value={bi('A calm family view with no invented invoices, schedules or contact details.', 'واجهة أسرية هادئة دون فواتير أو جداول أو بيانات اتصال مختلقة.')} /></p></div></article><article className="portal-overview-score"><small><BilingualText value={bi('Linked Children', 'الأبناء المرتبطون')} /></small><strong>{children.length}</strong><BilingualText value={bi(`${attended}/${scheduled} preview attendance`, `${attended}/${scheduled} حضور تجريبي`)} /></article></section>
    <section className="portal-action-grid"><Link to="/parent/children"><UsersRound /><BilingualText value={bi('Children', 'الأبناء')} /><small><BilingualText value={bi('Review linked player profiles', 'مراجعة ملفات اللاعبين المرتبطين')} /></small></Link><Link to="/parent/schedule"><CalendarDays /><BilingualText value={bi('Family Schedule', 'جدول الأسرة')} /><small><BilingualText value={bi('Preview training context', 'معاينة سياق التدريب')} /></small></Link><Link to="/parent/messages"><MessageSquareText /><BilingualText value={bi('Messages', 'الرسائل')} /><small><BilingualText value={bi('Communication-ready empty state', 'حالة فارغة جاهزة للتواصل')} /></small></Link></section>
    <section className="portal-overview-list"><header><BilingualText value={bi('Children Snapshot', 'لمحة عن الأبناء')} /><UsersRound /></header><div>{children.map(player => player && <article key={player.id}><strong>{player.nameEn}<span lang="ar" dir="rtl"> · {player.nameAr}</span></strong><small><BilingualText value={getSport(player.sportId)?.name ?? bi('Sport Preview', 'معاينة الرياضة')} /></small></article>)}</div><Link className="admin-link-button" to="/parent/payments"><CreditCard /><BilingualText value={bi('Payments Preview', 'معاينة المدفوعات')} /></Link></section>
  </div>;
}
