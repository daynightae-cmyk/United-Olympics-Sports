import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserRound } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth, fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../lib/auth-client';
import { CoachSessionProvider, useCoachSession } from './CoachSessionContext';

const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';

const COACH_PRODUCTION_SESSION_KEY = 'uos:coach-portal:session:v1';

function readCoachProductionSession(): { coachId: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COACH_PRODUCTION_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { provider?: string; coachId?: string };
    if (session.provider !== 'production' || typeof session.coachId !== 'string' || !session.coachId) return null;
    return { coachId: session.coachId };
  } catch {
    return null;
  }
}

function clearCoachProductionSession() {
  try { window.localStorage.removeItem(COACH_PRODUCTION_SESSION_KEY); } catch { /* storage may be unavailable */ }
}

function CoachPreviewAccess() {
  const { allCoaches, login, loading, error } = useCoachSession();
  const navigate = useNavigate();
  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    if (!selectedCoachId && allCoaches[0]) setSelectedCoachId(allCoaches[0].id);
    if (selectedCoachId && !allCoaches.some((coach) => coach.id === selectedCoachId)) {
      setSelectedCoachId(allCoaches[0]?.id ?? '');
    }
  }, [allCoaches, selectedCoachId]);

  const enterPreview = () => {
    if (!selectedCoachId) return;
    login(selectedCoachId, 'preview');
    navigate('/coach/home');
  };

  return (
    <div className="portal-auth-preview">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Development preview', 'معاينة التطوير')} /></span>
        <span className="portal-auth-preview-badge">Preview</span>
      </div>
      {loading ? (
        <div className="ui-skeleton" role="status" aria-live="polite"><BilingualText value={bi('Loading available coaches…', 'جارٍ تحميل المدربين المتاحين…')} /></div>
      ) : error ? (
        <div className="enterprise-empty" role="status">
          <UserRound size={22} />
          <h3><BilingualText value={bi('Coach data is unavailable', 'بيانات المدربين غير متاحة')} /></h3>
          <p><BilingualText value={bi('The preview data service is unavailable in this session.', 'خدمة بيانات المعاينة غير متاحة في هذه الجلسة.')} /></p>
        </div>
      ) : allCoaches.length ? (
        <>
          <label htmlFor="coach-preview-identity">
            <BilingualText value={bi('Select an active preview coach', 'اختر مدرب معاينة نشطًا')} />
          </label>
          <select id="coach-preview-identity" value={selectedCoachId} onChange={(event) => setSelectedCoachId(event.target.value)}>
            {allCoaches.map((coach) => (
              <option key={coach.id} value={coach.id}>{coach.nameEn} — {coach.nameAr}</option>
            ))}
          </select>
          <button type="button" onClick={enterPreview} disabled={!selectedCoachId}>
            <BilingualText value={bi('Enter Preview Coach Mode', 'الدخول إلى وضع معاينة المدرب')} />
          </button>
        </>
      ) : (
        <div className="enterprise-empty" role="status">
          <UserRound size={22} />
          <h3><BilingualText value={bi('No active coaches available', 'لا يوجد مدربون نشطون متاحون')} /></h3>
          <p><BilingualText value={bi('Active coach records will appear here when the preview provider supplies them.', 'ستظهر سجلات المدربين النشطين هنا عندما يوفرها مزود المعاينة.')} /></p>
        </div>
      )}
    </div>
  );
}

export function CoachLoginPage() {
  const navigate = useNavigate();

  // Revalidate any persisted production session on mount: a stale or forged
  // local session must never be trusted without a live portal binding lookup.
  // Valid bindings redirect only after verified coach scope; stale, wrong-portal,
  // or unbound sessions are cleared fail-closed.
  useEffect(() => {
    let active = true;
    (async () => {
      const persisted = readCoachProductionSession();
      if (!persisted) return;
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('AUTH_REQUIRED');
        const portal = await fetchPortalIdentity(token);
        if (!active) return;
        if (portal.bindings.coachIds.length === 1 && portal.bindings.coachIds[0] === persisted.coachId) {
          navigate('/coach/home', { replace: true });
          return;
        }
        clearCoachProductionSession();
        void signOutEverywhere().catch(() => undefined);
      } catch {
        if (active) clearCoachProductionSession();
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
      await beginSupabaseGoogleOAuth('/coach/home');
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
      portal="coach"
      extraContent={previewRuntime ? (
        <CoachSessionProvider>
          <CoachPreviewAccess />
        </CoachSessionProvider>
      ) : undefined}
      onProvider={handleProvider}
    />
  );
}
