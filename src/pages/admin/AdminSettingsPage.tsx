import { Building2, RotateCcw, Settings2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useAdminData } from '../../admin/data/AdminDataProvider';
import { useBootstrapOrganization, useOrganization } from '../../admin/data/adminHooks';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UosTextField } from '../../components/fields/UosFields';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { UiButton, UiDialog } from '../../components/ui/UiPrimitives';
import { useUiSettings } from '../../ui/theme/useUiSettings';

export function AdminSettingsPage() {
  const { appearance, bilingualOrder, density, motion, fontScale, sidebarDefault, setSetting, resetSettings } = useUiSettings();
  const [confirmReset, setConfirmReset] = useState(false);
  const { mode } = useAdminData();
  const isPreview = mode === 'preview';
  const { item: organization, loading: orgLoading } = useOrganization();
  const { bootstrap, loading: bootstrapLoading } = useBootstrapOrganization();
  const [orgNameEn, setOrgNameEn] = useState('');
  const [orgNameAr, setOrgNameAr] = useState('');
  const [bootstrapError, setBootstrapError] = useState('');
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const runBootstrap = async () => {
    if (!orgNameEn.trim()) {
      setBootstrapError('Organization name in English is required. | اسم المنظمة بالإنجليزية مطلوب.');
      return;
    }
    setBootstrapError('');
    try {
      await bootstrap({ name: orgNameEn.trim(), ...(orgNameAr.trim() ? { nameAr: orgNameAr.trim() } : {}) });
      setBootstrapDone(true);
    } catch (e) {
      setBootstrapError(e instanceof Error ? e.message : 'First Setup failed. | فشل الإعداد الأول.');
    }
  };
  const option = <T extends string>(value: T, current: T, label: { en: string; ar: string }, onClick: () => void) => <button key={value} type="button" className={current === value ? 'setting-option active' : 'setting-option'} aria-pressed={current === value} onClick={onClick}><BilingualText value={label} /></button>;

  return <div className="admin-page settings-page">
    <div className="admin-page-header"><div className="admin-page-header-copy"><span className="section-icon admin-page-header-icon" aria-hidden="true"><Settings2 /></span><div><BilingualText value={bi('Settings', 'الإعدادات')} className="admin-eyebrow" /><h1><BilingualText value={bi('Interface Settings', 'إعدادات الواجهة')} /></h1><p><BilingualText value={bi('Applied on this browser.', 'تم التطبيق على هذا المتصفح.')} /></p></div></div><div className="page-actions"><span className="truth-badge"><ShieldCheck aria-hidden="true" /><BilingualText value={bi('Stored on This Browser', 'محفوظ على هذا المتصفح')} /></span></div></div>

    <section className="settings-grid">
      <article className="setting-card setting-card-appearance"><h3><BilingualText value={bi('Appearance', 'المظهر')} /></h3><p><BilingualText value={bi('Choose Day, Night or follow the operating system.', 'اختر الوضع النهاري أو الليلي أو اتبع نظام التشغيل.')} /></p><ThemeToggle /><small><BilingualText value={appearance === 'light' ? bi('Day is active', 'الوضع النهاري نشط') : appearance === 'dark' ? bi('Night is active', 'الوضع الليلي نشط') : bi('System preference is active', 'تفضيل النظام نشط')} /></small></article>
      <article className="setting-card"><h3><BilingualText value={bi('Bilingual Display Order', 'ترتيب العرض ثنائي اللغة')} /></h3><p><BilingualText value={bi('Both languages always remain visible.', 'تظل اللغتان ظاهرتين دائمًا.')} /></p><div className="setting-option-group">{option('en-first', bilingualOrder, bi('English First', 'الإنجليزية أولًا'), () => setSetting('bilingualOrder','en-first'))}{option('ar-first', bilingualOrder, bi('Arabic First', 'العربية أولًا'), () => setSetting('bilingualOrder','ar-first'))}</div></article>
      <article className="setting-card"><h3><BilingualText value={bi('Interface Density', 'كثافة الواجهة')} /></h3><p><BilingualText value={bi('Adjust operational spacing without reducing mobile touch targets.', 'اضبط مسافات الواجهات التشغيلية دون تقليل مساحات اللمس على الهاتف.')} /></p><div className="setting-option-group">{option('comfortable', density, bi('Comfortable', 'مريح'), () => setSetting('density','comfortable'))}{option('compact', density, bi('Compact', 'مضغوط'), () => setSetting('density','compact'))}</div></article>
      <article className="setting-card"><h3><BilingualText value={bi('Text Size', 'حجم النص')} /></h3><p><BilingualText value={bi('Use the default or a larger reading scale.', 'استخدم الحجم الافتراضي أو مقياس قراءة أكبر.')} /></p><div className="setting-option-group">{option('default', fontScale, bi('Default', 'افتراضي'), () => setSetting('fontScale','default'))}{option('large', fontScale, bi('Large', 'كبير'), () => setSetting('fontScale','large'))}</div></article>
      <article className="setting-card"><h3><BilingualText value={bi('Motion', 'الحركة')} /></h3><p><BilingualText value={bi('Follow the OS preference or reduce interface motion locally.', 'اتبع تفضيل النظام أو قلل حركة الواجهة محليًا.')} /></p><div className="setting-option-group">{option('system', motion, bi('Follow System', 'اتبع النظام'), () => setSetting('motion','system'))}{option('reduced', motion, bi('Reduce Motion', 'تقليل الحركة'), () => setSetting('motion','reduced'))}</div></article>
      <article className="setting-card"><h3><BilingualText value={bi('Sidebar Default', 'حالة القائمة الجانبية')} /></h3><p><BilingualText value={bi('Choose the default Admin sidebar state for this browser.', 'اختر الحالة الافتراضية للقائمة الجانبية للإدارة على هذا المتصفح.')} /></p><div className="setting-option-group">{option('expanded', sidebarDefault, bi('Expanded', 'موسعة'), () => setSetting('sidebarDefault','expanded'))}{option('collapsed', sidebarDefault, bi('Collapsed', 'مطوية'), () => setSetting('sidebarDefault','collapsed'))}</div></article>
    </section>

    <section className="setting-card settings-reset" aria-label="First Setup">
      <div>
        <h3><BilingualText value={bi('First Setup — Organization', 'الإعداد الأول — المنظمة')} /></h3>
        {orgLoading
          ? <p><BilingualText value={bi('Checking organization state…', 'جارٍ التحقق من حالة المنظمة…')} /></p>
          : organization
            ? <p><BilingualText value={bi(`Organization configured. First Setup is permanently closed.`, `المنظمة مهيأة. الإعداد الأول مغلق نهائيًا.`)} /></p>
            : isPreview
              ? <p><BilingualText value={bi('First Setup is not applicable in Preview mode: a demo organization already exists.', 'الإعداد الأول غير مطبق في وضع المعاينة: توجد منظمة تجريبية.')} /></p>
              : bootstrapDone
                ? <p role="status"><BilingualText value={bi('Organization created. You are now the owner super-admin. Continue with Countries, then Branches.', 'تم إنشاء المنظمة. أنت الآن المالك المشرف. تابع بإضافة الدول ثم الفروع.')} /></p>
                : <>
                    <p><BilingualText value={bi('No organization exists yet. Create the real organization record to initialize production. This can only be done once.', 'لا توجد منظمة بعد. أنشئ سجل المنظمة الحقيقي لتهيئة الإنتاج. لا يمكن فعل ذلك إلا مرة واحدة.')} /></p>
                    <div className="uos-form-grid">
                      <UosTextField label={bi('Organization name (English)', 'اسم المنظمة (إنجليزي)')} value={orgNameEn} onChange={(event) => setOrgNameEn(event.target.value)} placeholder="United Olympics Sports" required disabled={bootstrapLoading} />
                      <UosTextField label={bi('Organization name (Arabic)', 'اسم المنظمة (عربي)')} value={orgNameAr} onChange={(event) => setOrgNameAr(event.target.value)} placeholder="يونايتد أوليمبيكس سبورت" optional disabled={bootstrapLoading} />
                    </div>
                    {bootstrapError && <p role="alert" className="form-error">{bootstrapError}</p>}
                    <p><UiButton variant="primary" onClick={() => void runBootstrap()}><Building2 aria-hidden="true" /><BilingualText value={bi(bootstrapLoading ? 'Creating…' : 'Create Organization', bootstrapLoading ? 'جارٍ الإنشاء…' : 'إنشاء المنظمة')} /></UiButton></p>
                  </>}
      </div>
    </section>

    <section className="setting-card settings-reset"><div><h3><BilingualText value={bi('Reset Interface Settings', 'إعادة ضبط إعدادات الواجهة')} /></h3><p><BilingualText value={bi('Clear only the versioned UI settings stored in this browser.', 'احذف فقط إعدادات الواجهة ذات الإصدار المحفوظة على هذا المتصفح.')} /></p></div><UiButton variant="danger" onClick={() => setConfirmReset(true)}><RotateCcw aria-hidden="true" /><BilingualText value={bi('Reset Settings', 'إعادة الضبط')} /></UiButton></section>

    <UiDialog open={confirmReset} onClose={() => setConfirmReset(false)} title={bi('Reset interface settings?', 'إعادة ضبط إعدادات الواجهة؟')} description={bi('Only local interface preferences will be cleared. No account or business data is affected.', 'سيتم حذف تفضيلات الواجهة المحلية فقط. لن تتأثر أي بيانات حساب أو نشاط.')}><div className="ui-dialog-actions"><UiButton variant="ghost" onClick={() => setConfirmReset(false)}><BilingualText value={bi('Cancel', 'إلغاء')} /></UiButton><UiButton variant="danger" onClick={() => { resetSettings(); setConfirmReset(false); }}><RotateCcw aria-hidden="true" /><BilingualText value={bi('Reset Interface', 'إعادة ضبط الواجهة')} /></UiButton></div></UiDialog>
  </div>;
}
