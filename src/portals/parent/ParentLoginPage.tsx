import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { demoParents } from '../../data/demo/parents';
import { startParentPreview } from './parentData';

export function ParentLoginPage() {
  const navigate = useNavigate();
  const [parentId, setParentId] = useState('parent-preview-01');
  const selected = demoParents.find((item) => item.id === parentId) ?? demoParents[0];

  const enterPreview = () => {
    startParentPreview(selected.id);
    navigate('/parent', { replace: true });
  };

  return (
    <main className="parent-login-shell">
      <section className="parent-login-brand">
        <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
        <span className="parent-kicker"><ShieldCheck size={14} /><BilingualText value={bi('Family Access', 'دخول الأسرة')} /></span>
        <h1><BilingualText value={bi('Parent Portal', 'بوابة وليّ الأمر')} /></h1>
        <p><BilingualText value={bi('A focused family workspace for linked athletes, schedules, attendance, development records and account references.', 'مساحة أسرية مركزة للأبناء المرتبطين والجداول والحضور وسجلات التطور ومراجع الحساب.')} /></p>
        <div className="parent-login-points">
          {[bi('Linked children only', 'الأبناء المرتبطون فقط'), bi('Arabic + English', 'العربية + الإنجليزية'), bi('No invented financial or contact data', 'لا بيانات مالية أو تواصل مختلقة')].map((item) => <span key={item.en}><CheckCircle2 size={14} /><BilingualText value={item} /></span>)}
        </div>
      </section>

      <section className="parent-login-card" aria-labelledby="parent-login-title">
        <div className="parent-login-icon"><UsersRound /></div>
        <span className="parent-kicker"><BilingualText value={bi('Preview Family Session', 'جلسة معاينة الأسرة')} /></span>
        <h2 id="parent-login-title"><BilingualText value={bi('Open a linked family profile', 'فتح ملف أسرة مرتبط')} /></h2>
        <p><BilingualText value={bi('Production identity providers are not configured in this repository. Preview mode is explicit and stored only in this browser.', 'موفرو الهوية للإنتاج غير مهيئين في هذا المستودع. وضع المعاينة صريح ويتم حفظه في هذا المتصفح فقط.')} /></p>

        <label className="parent-form-field">
          <span><BilingualText value={bi('Preview family', 'أسرة المعاينة')} /></span>
          <select value={parentId} onChange={(event) => setParentId(event.target.value)}>
            {demoParents.map((parent) => <option key={parent.id} value={parent.id}>{parent.nameEn} · {parent.nameAr}</option>)}
          </select>
        </label>

        <div className="parent-preview-summary">
          <strong>{selected.nameEn}</strong><span lang="ar" dir="rtl">{selected.nameAr}</span>
          <small><BilingualText value={bi(`${selected.playerIds.length} linked athlete profile(s)`, `${selected.playerIds.length} ملف لاعب مرتبط`)} /></small>
        </div>

        <button type="button" className="parent-primary-action" onClick={enterPreview}><BilingualText value={bi('Enter Family Preview', 'دخول معاينة الأسرة')} /><ArrowRight size={16} className="rtl:rotate-180" /></button>

        <div className="parent-auth-boundary"><LockKeyhole size={14} /><BilingualText value={bi('Email/password, OTP, Google and Apple sign-in remain unavailable until a real authentication backend is connected.', 'يبقى تسجيل الدخول بالبريد وكلمة المرور وOTP وGoogle وApple غير متاح حتى يتم ربط نظام مصادقة حقيقي.')} /></div>
      </section>
    </main>
  );
}
