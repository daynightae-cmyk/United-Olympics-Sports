import { Sparkles, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParents } from '../../admin/data/adminHooks';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../lib/auth-client';
import { clearParentSession, readParentSession, startParentPreview, startParentProduction } from './parentData';

const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';

function ParentPreviewAccess() {
  const navigate = useNavigate();
  const { data, loading, error } = useParents({ page: 1, pageSize: 500 });
  const parents = data.items.filter((parent) => parent.status === 'active');
  const [parentId, setParentId] = useState('');

  useEffect(() => {
    if (!parents.length) {
      setParentId('');
      return;
    }
    if (!parents.some((parent) => parent.id === parentId)) setParentId(parents[0].id);
  }, [parentId, parents]);

  const selected = parents.find((item) => item.id === parentId) ?? null;

  const enterPreview = () => {
    if (!selected) return;
    startParentPreview(selected.id);
    navigate('/parent', { replace: true });
  };

  return (
    <div className="portal-auth-preview">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Development preview', 'معاينة التطوير')} /></span>
        <span className="portal-auth-preview-badge">Preview</span>
      </div>
      {loading ? (
        <div className="ui-skeleton" role="status" aria-live="polite">
          <BilingualText value={bi('Loading available family records…', 'جارٍ تحميل سجلات الأسر المتاحة…')} />
        </div>
      ) : error ? (
        <div className="enterprise-empty" role="status">
          <UsersRound size={22} />
          <h3><BilingualText value={bi('Family data is unavailable', 'بيانات الأسر غير متاحة')} /></h3>
          <p><BilingualText value={bi('The preview data service is unavailable in this session.', 'خدمة بيانات المعاينة غير متاحة في هذه الجلسة.')} /></p>
        </div>
      ) : parents.length ? (
        <>
          <label htmlFor="parent-preview-identity">
            <BilingualText value={bi('Select an active preview family', 'اختر أسرة معاينة نشطة')} />
          </label>
          <select id="parent-preview-identity" value={parentId} onChange={(event) => setParentId(event.target.value)}>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>{parent.nameEn} — {parent.nameAr}</option>
            ))}
          </select>
          <button type="button" onClick={enterPreview} disabled={!selected}>
            <BilingualText value={bi('Enter Family Preview', 'دخول معاينة الأسرة')} />
          </button>
        </>
      ) : (
        <div className="enterprise-empty" role="status">
          <UsersRound size={22} />
          <h3><BilingualText value={bi('No active family profiles available', 'لا توجد ملفات أسر نشطة متاحة')} /></h3>
          <p><BilingualText value={bi('Active parent records will appear here when the preview provider supplies them.', 'ستظهر سجلات أولياء الأمور النشطة هنا عندما يوفرها مزود المعاينة.')} /></p>
        </div>
      )}
    </div>
  );
}

export function ParentLoginPage() {
  const navigate = useNavigate();

  // Revalidate any persisted production session on mount: a stale or forged
  // local session must never be trusted without a live portal binding lookup.
  // Valid bindings are refreshed (scope + authorized players) before redirect;
  // stale, wrong-portal, or unbound sessions are cleared fail-closed.
  useEffect(() => {
    let active = true;
    (async () => {
      const persisted = readParentSession();
      if (!persisted || persisted.provider !== 'production') return;
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('AUTH_REQUIRED');
        const portal = await fetchPortalIdentity(token);
        if (!active) return;
        if (portal.bindings.guardianIds.length === 1 && portal.bindings.guardianIds[0] === persisted.parentId) {
          startParentProduction(portal.bindings.guardianIds[0], portal.bindings.guardianPlayerIds);
          navigate('/parent', { replace: true });
          return;
        }
        clearParentSession();
        void signOutEverywhere().catch(() => undefined);
      } catch {
        if (active) clearParentSession();
      }
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider !== 'google') {
      return {
        tone: 'info',
        message: bi('This sign-in method is not available yet.', 'طريقة تسجيل الدخول هذه غير متاحة بعد.'),
      };
    }

    try {
      await beginSupabaseGoogleOAuth('/parent');
      return null;
    } catch {
      return {
        tone: 'error',
        message: bi('Google sign-in could not start. Please try again.', 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.'),
      };
    }
  };

  return (
    <PortalAuthPage
      portal="parent"
      extraContent={previewRuntime ? <ParentPreviewAccess /> : undefined}
      onProvider={handleProvider}
    />
  );
}
