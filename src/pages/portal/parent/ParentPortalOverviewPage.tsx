import { CalendarDays, CreditCard, FileText, HeartHandshake, MessageSquareText, TrendingUp, UsersRound, Award, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { BmActionCard, BmIdentityCard, BmMetricCard, BmPageHeader, BmSectionLabel } from '../../../components/benchmark/BenchmarkComponents';
import { demoParents } from '../../../data/demo/parents';
import { getPlayer, getSport } from '../../../data/demo/selectors';

export function ParentPortalOverviewPage() {
  const parent = demoParents[0];
  const children = parent.playerIds.map(getPlayer).filter(Boolean);
  const attended = children.reduce((sum, player) => sum + (player?.attendanceSummary?.attended ?? 0), 0);
  const scheduled = children.reduce((sum, player) => sum + (player?.attendanceSummary?.scheduled ?? 0), 0);
  const attendanceRate = scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;

  return <div className="admin-page">
    <BmPageHeader
      eyebrow={bi('Parent Portal', 'بوابة ولي الأمر')}
      title={bi('Family Control Center', 'مركز تحكم الأسرة')}
      description={bi('Children, attendance and communication context in one truthful preview workspace.', 'سياق الأبناء والحضور والتواصل في مساحة معاينة صادقة واحدة.')}
      icon={<HeartHandshake aria-hidden="true" />}
    />

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="01" icon={<UsersRound aria-hidden="true" />} title={bi('Family Snapshot', 'لمحة عن الأسرة')} />
      <div className="bm-grid bm-grid-3">
        <BmIdentityCard
          avatar={<HeartHandshake aria-hidden="true" />}
          name={{ en: parent.nameEn, ar: parent.nameAr }}
          id={parent.id}
          fields={[
            { label: bi('Children', 'الأبناء'), value: children.length },
            { label: bi('Preferred Language', 'اللغة المفضلة'), value: parent.preferredLanguage === 'ar' ? bi('Arabic', 'العربية').en : bi('English', 'الإنجليزية').en },
          ]}
        />
        <BmMetricCard icon={<UsersRound aria-hidden="true" />} label={bi('Linked Children', 'الأبناء المرتبطون')} value={children.length} detail={bi('Active roster', 'القائمة النشطة')} tier="featured" />
        <BmMetricCard icon={<TrendingUp aria-hidden="true" />} label={bi('Attendance Rate', 'معدل الحضور')} value={`${attendanceRate}%`} detail={bi(`${attended}/${scheduled} sessions`, `${attended}/${scheduled} حصص`)} />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="02" icon={<CalendarDays aria-hidden="true" />} title={bi('Quick Actions', 'إجراءات سريعة')} />
      <div className="bm-grid bm-grid-4">
        <BmActionCard icon={<UsersRound aria-hidden="true" />} title={bi('Children', 'الأبناء')} description={bi('Review linked player profiles', 'مراجعة ملفات اللاعبين المرتبطين')} to="/parent/children" />
        <BmActionCard icon={<CalendarDays aria-hidden="true" />} title={bi('Family Schedule', 'جدول الأسرة')} description={bi('Preview training context', 'معاينة سياق التدريب')} to="/parent/schedule" />
        <BmActionCard icon={<TrendingUp aria-hidden="true" />} title={bi('Performance', 'الأداء')} description={bi('Track child progress', 'تتبع تقدم الأبناء')} to="/parent/performance" />
        <BmActionCard icon={<MessageSquareText aria-hidden="true" />} title={bi('Messages', 'الرسائل')} description={bi('Communication-ready inbox', 'صندوق رسائل جاهز')} to="/parent/messages" />
        <BmActionCard icon={<CreditCard aria-hidden="true" />} title={bi('Payments', 'المدفوعات')} description={bi('Preview payment status', 'معاينة حالة المدفوعات')} to="/parent/payments" />
        <BmActionCard icon={<Award aria-hidden="true" />} title={bi('Feedback', 'الملاحظات')} description={bi('Coach feedback for your children', 'ملاحظات المدرب لأبنائك')} to="/parent/feedback" />
        <BmActionCard icon={<FileText aria-hidden="true" />} title={bi('Documents', 'المستندات')} description={bi('Family document center', 'مركز مستندات الأسرة')} to="/parent/documents" />
        <BmActionCard icon={<Bell aria-hidden="true" />} title={bi('Notifications', 'الإشعارات')} description={bi('Stay informed', 'ابقَ على اطلاع')} to="/parent" />
      </div>
    </div>

    <div style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}>
      <BmSectionLabel num="03" icon={<UsersRound aria-hidden="true" />} title={bi('Children Snapshot', 'لمحة عن الأبناء')} />
      <div className="bm-grid bm-grid-2">
        {children.map(player => player && (
          <div key={player.id} className="bm-card bm-card-clickable" style={{ padding: '22px' }} >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <span className="bm-cell-avatar" style={{ width: '48px', height: '48px' }}><UsersRound aria-hidden="true" /></span>
              <div>
                <strong style={{ fontSize: '15px' }}>{player.nameEn}</strong>
                <div style={{ fontSize: '11px', color: 'var(--bm-gold, #d8b35a)', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>{player.nameAr}</div>
                <div style={{ fontSize: '10px', color: 'var(--uos-text-muted, #a5a29c)', marginTop: '3px' }}>{player.id}</div>
              </div>
            </div>
            <div className="bm-grid bm-grid-3" style={{ gap: '10px' }}>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Sport', 'الرياضة')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}><BilingualText value={getSport(player.sportId)?.name ?? bi('—', '—')} /></strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Level', 'المستوى')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}><BilingualText value={player.level} /></strong></div>
              <div><span style={{ fontSize: '9px', color: 'var(--uos-text-muted, #a5a29c)' }}><BilingualText value={bi('Age', 'العمر')} /></span><strong style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>{player.age ?? '—'}</strong></div>
            </div>
            <Link to={`/parent/children/${player.id}`} className="bm-btn bm-btn-tertiary" style={{ width: '100%', marginTop: '14px' }}>
              <BilingualText value={bi('View Child Profile', 'عرض ملف الابن')} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>;
}
