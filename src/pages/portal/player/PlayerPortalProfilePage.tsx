import { ShieldCheck, User, Award, CalendarDays, Activity } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoPlayers } from '../../../data/demo/players';
import { getGroup, getSport } from '../../../data/demo/selectors';

export function PlayerPortalProfilePage() {
  const player = demoPlayers[0];
  const sport = getSport(player.sportId);
  const group = getGroup(player.groupId);
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Player Portal | Profile', 'بوابة اللاعب | الملف الشخصي')}
        title={bi('Profile', 'الملف الشخصي')}
        description={bi('A focused athlete identity preview using anonymized records.', 'معاينة هوية لاعب مركزة باستخدام سجلات تجريبية مجهولة.')}
      />
      <section className="player-identity-card" aria-label="Player identity preview">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ width: 62, height: 62, borderRadius: 18, border: '1px solid rgba(212,175,55,0.28)', display: 'grid', placeItems: 'center', background: 'rgba(212,175,55,0.08)' }}>
            <User size={28} color="#d4b23a" />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 20, overflowWrap: 'anywhere' }}>{player.nameEn}<span lang="ar" dir="rtl"> · {player.nameAr}</span></h2>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
              <BilingualText value={sport ? sport.name : bi('Sport', 'الرياضة')} /> · <BilingualText value={group ? (group.name.en ? { en: group.name.en, ar: group.name.ar } : bi('Group', 'المجموعة')) : bi('Group', 'المجموعة')} />
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
            <ShieldCheck size={18} style={{ color: '#d4b23a', marginBottom: 6 }} />
            <strong style={{ fontSize: 16 }}>Member</strong>
            <small style={{ display: 'block', fontSize: 11, color: 'var(--color-text-muted)' }}><BilingualText value={bi('Verified preview', 'معاينة موثقة')} /></small>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
            <Award size={18} style={{ color: '#d4b23a', marginBottom: 6 }} />
            <strong style={{ fontSize: 16 }}>{player.age ?? '—'}</strong>
            <small style={{ display: 'block', fontSize: 11, color: 'var(--color-text-muted)' }}><BilingualText value={bi('Age Group', 'الفئة العمرية')} /></small>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
            <CalendarDays size={18} style={{ color: '#d4b23a', marginBottom: 6 }} />
            <strong style={{ fontSize: 16 }}>{player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}</strong>
            <small style={{ display: 'block', fontSize: 11, color: 'var(--color-text-muted)' }}><BilingualText value={bi('Enrolled', 'تاريخ التسجيل')} /></small>
          </div>
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 12 }}>
            <Activity size={18} style={{ color: '#d4b23a', marginBottom: 6 }} />
            <strong style={{ fontSize: 16 }}>{player.attendanceSummary ? `${player.attendanceSummary.attended}/${player.attendanceSummary.scheduled}` : '—'}</strong>
            <small style={{ display: 'block', fontSize: 11, color: 'var(--color-text-muted)' }}><BilingualText value={bi('Attendance', 'الحضور')} /></small>
          </div>
        </div>
      </section>
      <section aria-label="Profile actions">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          <a href="#" className="admin-link-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><BilingualText value={bi('Edit Profile', 'تعديل الملف الشخصي')} /></a>
          <a href="#" className="admin-link-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><BilingualText value={bi('View Documents', 'عرض المستندات')} /></a>
        </div>
      </section>
    </div>
  );
}
