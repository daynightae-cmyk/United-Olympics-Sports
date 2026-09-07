import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParents } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PortalEmblem } from '../../components/brand/PortalEmblem';
import { startParentPreview } from './parentData';

export function ParentLoginPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useParents({ page: 1, pageSize: 500 });
  const parents = data.items.filter((parent) => parent.status === 'active');
  const [parentId, setParentId] = useState('');

  useEffect(() => {
    if (!parents.length) return;
    if (!parents.some((parent) => parent.id === parentId)) setParentId(parents[0].id);
  }, [parentId, parents]);

  const selected = parents.find((item) => item.id === parentId) ?? null;

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
          {[bi('Linked children only', 'الأبناء المرتبطون فقط'), bi('Arabic + English', 'العربية + الإنجليزية'), bi('Shared Admin preview data', 'بيانات معاينة مشتركة مع الإدارة')].map((item) => <span key={item.en}><CheckCircle2 size={14} /><BilingualText value={item} /></span>)}
        </div>
      </section>

      <section className="parent-login-card" aria-labelledby="parent-login-title">
        <div className="parent-login-icon"><UsersRound /></div>
        <span className="parent-kicker"><BilingualText value={bi('Preview Family Session', 'جلسة معاينة الأسرة')} /></span>
        <h2 id="parent-login-title"><BilingualText value={bi('Open a linked family profile', 'فتح ملف أسرة مرتبط')} /></h2>
        <p><BilingualText value={bi('Preview families are read from the same browser data provider used by Admin. Production identity providers remain unconfigured.', 'يتم قراءة أسر المعاينة من نفس موفر بيانات المتصفح المستخدم في الإدارة. ما زال موفر الهوية الإنتاجي غير مهيأ.')} /></p>

        {error && <div className="parent-auth-boundary" role="alert"><BilingualText value={bi('Family provider is unavailable in this session.', 'موفر بيانات الأسر غير متاح في هذه الجلسة.')} /></div>}

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

        <div className="parent-auth-boundary"><LockKeyhole size={14} /><BilingualText value={bi('Email/password, OTP, Google and Apple sign-in remain unavailable until a real authentication backend is connected.', 'يبقى تسجيل الدخول بالبريد وكلمة المرور وOTP وGoogle وApple غير متاح حتى يتم ربط نظام مصادقة حقيقي.')} /></div>
      </section>
    </main>
  );
}
