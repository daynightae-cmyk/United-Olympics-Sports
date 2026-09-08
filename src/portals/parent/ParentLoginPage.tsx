import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParents } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PortalEmblem } from '../../components/brand/PortalEmblem';
import { fetchPortalIdentity, firebaseGoogleFallbackToken, signOutEverywhere } from '../../lib/auth-client';
import { startParentPreview, startParentProduction } from './parentData';

export function ParentLoginPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useParents({ page: 1, pageSize: 500 });
  const parents = data.items.filter((parent) => parent.status === 'active');
  const [parentId, setParentId] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!parents.length) return;
    if (!parents.some((parent) => parent.id === parentId)) setParentId(parents[0].id);
  }, [parentId, parents]);

  const selected = parents.find((item) => item.id === parentId) ?? null;

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const token = await firebaseGoogleFallbackToken();
      const portal = await fetchPortalIdentity(token);
      if (portal.bindings.guardianIds.length !== 1) {
        await signOutEverywhere().catch(() => undefined);
        setAuthError(portal.bindings.guardianIds.length === 0
          ? 'Google verified the account, but it is not linked to a Parent / Guardian record. | تم التحقق من الحساب، لكنه غير مرتبط بسجل ولي أمر.'
          : 'This identity is linked to multiple Guardian records. An administrator must resolve the binding first. | هذه الهوية مرتبطة بعدة سجلات أولياء أمور ويجب معالجة الربط أولًا.');
        return;
      }

      const guardianId = portal.bindings.guardianIds[0];
      if (!parents.some((parent) => parent.id === guardianId)) {
        await signOutEverywhere().catch(() => undefined);
        setAuthError('The bound Guardian record is not available from the current production data provider. | سجل ولي الأمر المرتبط غير متاح من مزود بيانات الإنتاج الحالي.');
        return;
      }

      startParentProduction(guardianId);
      navigate('/parent', { replace: true });
    } catch (authFailure: unknown) {
      await signOutEverywhere().catch(() => undefined);
      setAuthError(authFailure instanceof Error ? authFailure.message : 'Parent authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const enterPreview = () => {
    if (!selected) return;
    startParentPreview(selected.id);
    navigate('/parent', { replace: true });
  };

  return (
    <main className="parent-login-shell">
      <section className="parent-login-brand">
        <div style={{ marginBottom: '24px' }}>
          <PortalEmblem portal="parent" size="header" priority role="primary" />
        </div>
        <span className="parent-kicker"><ShieldCheck size={14} /><BilingualText value={bi('Family Access', 'دخول الأسرة')} /></span>
        <h1><BilingualText value={bi('Parent Portal', 'بوابة وليّ الأمر')} /></h1>
        <p><BilingualText value={bi('A focused family workspace for linked athletes, schedules, attendance, development records and account references.', 'مساحة أسرية مركزة للأبناء المرتبطين والجداول والحضور وسجلات التطور ومراجع الحساب.')} /></p>
        <div className="parent-login-points">
          {[bi('Server-bound family identity', 'هوية أسرية مربوطة خادميًا'), bi('Linked children only', 'الأبناء المرتبطون فقط'), bi('Arabic + English', 'العربية + الإنجليزية')].map((item) => <span key={item.en}><CheckCircle2 size={14} /><BilingualText value={item} /></span>)}
        </div>
      </section>

      <section className="parent-login-card" aria-labelledby="parent-login-title">
        <div className="parent-login-icon"><UsersRound /></div>
        <span className="parent-kicker"><BilingualText value={bi('Secure Family Session', 'جلسة أسرة آمنة')} /></span>
        <h2 id="parent-login-title"><BilingualText value={bi('Open your linked family profile', 'افتح ملف الأسرة المرتبط بك')} /></h2>
        <p><BilingualText value={bi('Google verifies identity; the server then requires exactly one Guardian record bound to that identity before production access is created.', 'يتحقق Google من الهوية، ثم يشترط الخادم وجود سجل ولي أمر واحد مرتبط بهذه الهوية قبل إنشاء دخول إنتاجي.')} /></p>

        {error && <div className="parent-auth-boundary" role="alert"><BilingualText value={bi('Family provider is unavailable in this session.', 'موفر بيانات الأسر غير متاح في هذه الجلسة.')} /></div>}
        {authError && <div className="parent-auth-boundary" role="alert">{authError}</div>}

        <button type="button" className="parent-primary-action" disabled={authLoading || loading} onClick={() => void signInWithGoogle()}>
          <BilingualText value={authLoading ? bi('Verifying Google account…', 'جارٍ التحقق من حساب Google…') : bi('Continue securely with Google', 'المتابعة الآمنة باستخدام Google')} />
          <ShieldCheck size={16} />
        </button>

        <div className="parent-auth-boundary"><LockKeyhole size={14} /><BilingualText value={bi('Google sign-in never grants portal access by itself. Access requires a server-side user_uid binding.', 'تسجيل Google وحده لا يمنح دخول البوابة. يلزم ربط user_uid خادميًا بالسجل.')} /></div>

        <div className="portal-auth-preview" style={{ marginTop: 18 }}>
          <span className="parent-kicker"><BilingualText value={bi('Development preview', 'معاينة التطوير')} /></span>
          <label className="parent-form-field">
            <span><BilingualText value={bi('Preview family', 'أسرة المعاينة')} /></span>
            <select value={parentId} disabled={loading || !parents.length} onChange={(event) => setParentId(event.target.value)}>
              {parents.map((parent) => <option key={parent.id} value={parent.id}>{parent.nameEn} · {parent.nameAr}</option>)}
            </select>
          </label>

          {selected ? <div className="parent-preview-summary">
            <strong>{selected.nameEn}</strong><span lang="ar" dir="rtl">{selected.nameAr}</span>
            <small><BilingualText value={bi(`${selected.playerIds.length} linked athlete profile(s)`, `${selected.playerIds.length} ملف لاعب مرتبط`)} /></small>
          </div> : <div className="parent-preview-summary">
            <strong><BilingualText value={loading ? bi('Loading family records…', 'جارٍ تحميل سجلات الأسر…') : bi('No active family profile', 'لا يوجد ملف أسرة نشط')} /></strong>
            <small><BilingualText value={bi('Create or activate a parent profile from Admin first.', 'أنشئ أو فعّل ملف ولي أمر من الإدارة أولًا.')} /></small>
          </div>}

          <button type="button" className="parent-primary-action" disabled={!selected || loading} onClick={enterPreview}><BilingualText value={bi('Enter Family Preview', 'دخول معاينة الأسرة')} /><ArrowRight size={16} className="rtl:rotate-180" /></button>
        </div>
      </section>
    </main>
  );
}
