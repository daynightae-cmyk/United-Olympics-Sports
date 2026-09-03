import { ShieldCheck, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoParents } from '../../../data/demo/parents';
import { getPlayer } from '../../../data/demo/selectors';

export function ParentPortalChildrenPage() {
  const parent = demoParents[0];
  const children = (parent.playerIds ?? []).map(id => getPlayer(id)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Parent Portal | Children', 'بوابة ولي الأمر | الأطفال')}
        title={bi('Children', 'الأطفال')}
        description={bi('Truthful preview of linked children only.', 'معاينة صادقة للأطفال المرتبطين فقط.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />
      <section aria-label="Children list">
        <div style={{ display: 'grid', gap: 12 }}>
          {children.length ? children.map(child => (
            <Link key={child.id} to={`/parent/children/${child.id}`} className="player-preview-grid" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, border: '1px solid var(--color-border)', display: 'grid', placeItems: 'center', background: 'rgba(212,175,55,0.06)' }}>
                  <ShieldCheck size={22} style={{ color: '#d4b23a' }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <strong>{child.nameEn}<span lang="ar" dir="rtl"> · {child.nameAr}</span></strong>
                  <small style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11 }}>
                    <BilingualText value={child.groupId ? bi('Group', 'المجموعة') : bi('No group', 'لا مجموعة')} />
                    <span style={{ marginLeft: 6 }}>{child.groupId ?? '—'}</span>
                  </small>
                </div>
                <CalendarDays size={18} style={{ marginLeft: 'auto', color: 'var(--color-text-muted)' }} />
              </div>
            </Link>
          )) : (
            <div className="admin-preview-card" style={{ padding: 18 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                <BilingualText value={bi('No verified children linked yet.', 'لا يوجد أطفال موثقون مرتبطون بعد.')} />
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
