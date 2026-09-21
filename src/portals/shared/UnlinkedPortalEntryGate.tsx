import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link2, RefreshCw, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PortalRouteLoader } from '../../components/portal/PortalRouteState';
import { PortalLayout } from '../../layouts/PortalLayout';
import { fetchPortalIdentity, getAccessToken, signOutEverywhere } from '../../lib/auth-client';
import {
  clearUnlinkedPortalAccess,
  persistLinkedPortalBinding,
  readUnlinkedPortalAccess,
  type OpenPortalKind,
  type UnlinkedPortalAccess,
} from './portal-entry-access';

type GateState = 'linked' | 'checking' | 'unlinked' | 'denied';

function portalHome(portal: OpenPortalKind): string {
  return portal === 'coach' ? '/coach/home' : `/${portal}`;
}

function portalLogin(portal: OpenPortalKind): string {
  return `/${portal}/login`;
}

function isAuthInvalid(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /AUTH_INVALID|AUTH_REQUIRED/.test(message);
}

export function UnlinkedPortalEntryGate({ portal, children }: { portal: OpenPortalKind; children: ReactNode }) {
  const navigate = useNavigate();
  const [access, setAccess] = useState<UnlinkedPortalAccess | null>(() => readUnlinkedPortalAccess(portal));
  const [state, setState] = useState<GateState>(() => access ? 'checking' : 'linked');
  const [checkingLink, setCheckingLink] = useState(false);

  const reconcile = useCallback(async () => {
    const currentAccess = readUnlinkedPortalAccess(portal);
    if (!currentAccess) {
      setAccess(null);
      setState('linked');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      clearUnlinkedPortalAccess(portal);
      setAccess(null);
      setState('denied');
      return;
    }

    try {
      const identity = await fetchPortalIdentity(token);
      const result = persistLinkedPortalBinding(portalHome(portal), identity);
      if (result.linked) {
        setAccess(null);
        setState('linked');
        return;
      }
      const refreshed = readUnlinkedPortalAccess(portal);
      setAccess(refreshed);
      setState('unlinked');
    } catch (error) {
      if (isAuthInvalid(error)) {
        clearUnlinkedPortalAccess(portal);
        setAccess(null);
        setState('denied');
        return;
      }
      // A verified Google/Supabase browser session may enter the zero-private-data
      // shell even while the production data plane is unavailable.
      setAccess(currentAccess);
      setState('unlinked');
    }
  }, [portal]);

  useEffect(() => {
    const currentAccess = readUnlinkedPortalAccess(portal);
    if (!currentAccess) {
      setAccess(null);
      setState('linked');
      return;
    }
    let active = true;
    void reconcile().catch(() => {
      if (active) setState('unlinked');
    });
    return () => { active = false; };
  }, [portal, reconcile]);

  const checkProfileLink = async () => {
    setCheckingLink(true);
    try {
      await reconcile();
    } catch {
      setState('unlinked');
    } finally {
      setCheckingLink(false);
    }
  };

  const useAnotherAccount = async () => {
    clearUnlinkedPortalAccess(portal);
    await signOutEverywhere().catch(() => undefined);
    navigate(portalLogin(portal), { replace: true });
  };

  if (state === 'checking') return <PortalRouteLoader portal={portal} />;
  if (state === 'denied') return <Navigate to={portalLogin(portal)} replace />;
  if (state === 'linked') return <>{children}</>;

  const reason = access?.reason ?? 'not-linked';
  const detail = reason === 'data-unavailable'
    ? bi(
        'Your Google account is verified. The sports data service is temporarily unavailable, so private records are hidden until the connection returns.',
        'تم التحقق من حساب Google. خدمة البيانات الرياضية غير متاحة مؤقتًا، لذلك تظل السجلات الخاصة مخفية حتى عودة الاتصال.',
      )
    : reason === 'ambiguous'
      ? bi(
          'Your Google account is verified. More than one portal record needs administrative review before private records can be shown.',
          'تم التحقق من حساب Google. يوجد أكثر من سجل يحتاج إلى مراجعة الإدارة قبل عرض أي بيانات خاصة.',
        )
      : bi(
          'Your Google account is verified and this portal is ready. Administration has not linked a private profile to this account yet.',
          'تم التحقق من حساب Google والبوابة جاهزة. لم تربط الإدارة ملفًا خاصًا بهذا الحساب حتى الآن.',
        );

  return (
    <PortalLayout portal={portal} statusMode="unlinked">
      <section
        aria-labelledby="portal-unlinked-title"
        style={{
          maxWidth: 820,
          margin: 'clamp(20px, 7vh, 72px) auto',
          padding: 'clamp(24px, 5vw, 48px)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--uos-radius-lg)',
          background: 'var(--uos-glass-2)',
          boxShadow: 'var(--uos-shadow-card)',
          display: 'grid',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            aria-hidden="true"
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              display: 'grid',
              placeItems: 'center',
              color: '#d8b35a',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <ShieldCheck size={27} />
          </span>
          <div>
            <small style={{ color: 'var(--color-text-muted)' }}><BilingualText value={bi('Verified Google access', 'دخول Google موثّق')} /></small>
            <h1 id="portal-unlinked-title" style={{ margin: '4px 0 0', fontSize: 'clamp(24px, 4vw, 38px)' }}>
              <BilingualText value={bi('Welcome to your portal', 'مرحبًا بك في بوابتك')} />
            </h1>
          </div>
        </div>

        <p style={{ margin: 0, lineHeight: 1.85, color: 'var(--color-text-muted)', maxWidth: 720 }}>
          <BilingualText value={detail} />
        </p>

        <div
          role="status"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            padding: '12px 14px',
            borderRadius: 14,
            background: 'rgba(212, 175, 55, 0.07)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          <Link2 size={18} aria-hidden="true" />
          <BilingualText value={bi(
            'No player, family, coach, attendance, schedule, or payment records are exposed until a verified server-side link exists.',
            'لن يتم عرض بيانات لاعب أو أسرة أو مدرب أو حضور أو جدول أو مدفوعات قبل وجود ربط موثّق من الخادم.',
          )} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <button
            type="button"
            className="ui-button ui-button-primary ui-button-size-md"
            onClick={checkProfileLink}
            disabled={checkingLink}
          >
            <RefreshCw size={17} aria-hidden="true" />
            <BilingualText value={checkingLink ? bi('Checking…', 'جارٍ التحقق…') : bi('Check profile link', 'تحقق من ربط الملف')} />
          </button>
          <button type="button" className="ui-button ui-button-secondary ui-button-size-md" onClick={useAnotherAccount}>
            <BilingualText value={bi('Use another Google account', 'استخدم حساب Google آخر')} />
          </button>
        </div>
      </section>
    </PortalLayout>
  );
}