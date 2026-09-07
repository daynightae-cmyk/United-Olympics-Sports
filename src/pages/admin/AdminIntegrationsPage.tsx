import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cloud, LogOut, ShieldCheck } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiButton } from '../../components/ui/UiPrimitives';
import { auth, googleSignIn, logout } from '../../lib/firebase';

export function AdminIntegrationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => onAuthStateChanged(auth, (nextUser) => { setUser(nextUser); setInitialized(true); }), []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const result = await googleSignIn();
      setUser(result.user);
    } catch (error) {
      console.error('Google authentication failed:', error);
      setAuthError('Google authentication did not complete. | لم تكتمل مصادقة Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const integrations = [
    { name: 'Google Drive', id: 'drive', description: bi('Document and media access when a Drive API integration and scopes are configured.', 'الوصول إلى المستندات والوسائط عند إعداد تكامل Drive API والصلاحيات.') },
    { name: 'Google Sheets', id: 'sheets', description: bi('Table synchronization and exports when the Sheets API is configured.', 'مزامنة الجداول والتصدير عند إعداد Sheets API.') },
    { name: 'Google Docs', id: 'docs', description: bi('Document generation when a Docs API workflow is configured.', 'إنشاء المستندات عند إعداد مسار عمل Docs API.') },
    { name: 'Google Forms', id: 'forms', description: bi('Form ingestion when a Forms API integration is configured.', 'استقبال النماذج عند إعداد تكامل Forms API.') },
    { name: 'Google Meet', id: 'meet', description: bi('Meeting workflow support only after the required Google APIs are configured.', 'دعم مسارات الاجتماعات فقط بعد إعداد واجهات Google المطلوبة.') },
    { name: 'Google Chat', id: 'chat', description: bi('Team messaging only after Chat API credentials and scopes are configured.', 'مراسلة الفريق فقط بعد إعداد بيانات اعتماد وصلاحيات Chat API.') },
    { name: 'Google Tasks', id: 'tasks', description: bi('Task synchronization only after Tasks API configuration.', 'مزامنة المهام فقط بعد إعداد Tasks API.') },
    { name: 'Google Slides', id: 'slides', description: bi('Presentation generation only after Slides API configuration.', 'إنشاء العروض فقط بعد إعداد Slides API.') },
    { name: 'Gmail', id: 'gmail', description: bi('Email actions only after Gmail API scopes and server-side policy are configured.', 'إجراءات البريد فقط بعد إعداد صلاحيات Gmail API وسياسة الخادم.') },
    { name: 'Google Calendar', id: 'calendar', description: bi('Calendar synchronization only after Calendar API configuration.', 'مزامنة التقويم فقط بعد إعداد Calendar API.') },
  ];

  return <div className="admin-page settings-page">
    <div className="admin-page-header"><div className="admin-page-header-copy"><span className="section-icon admin-page-header-icon" aria-hidden="true"><Cloud /></span><div><BilingualText value={bi('Settings', 'الإعدادات')} className="admin-eyebrow" /><h1><BilingualText value={bi('Google Workspace Integrations', 'تكاملات مساحة عمل Google')} /></h1><p><BilingualText value={bi('Google account authentication is tracked separately from service-specific API configuration.', 'يتم تتبع مصادقة حساب Google بشكل منفصل عن إعداد API لكل خدمة.')} /></p></div></div></div>

    <section className="settings-grid" style={{ gridTemplateColumns: '1fr' }}><article className="setting-card"><div className="flex items-center justify-between"><div><h3><BilingualText value={bi('Google Account Authentication', 'مصادقة حساب Google')} /></h3><p><BilingualText value={bi('This verifies an authentication session only. It does not prove that Drive, Sheets, Gmail, Calendar or any other service API is enabled.', 'هذا يثبت جلسة مصادقة فقط. ولا يثبت أن Drive أو Sheets أو Gmail أو Calendar أو أي API خدمة أخرى مفعلة.')} /></p></div>{!initialized ? <div className="text-sm opacity-50"><BilingualText value={bi('Loading authentication state…', 'جارٍ تحميل حالة المصادقة…')} /></div> : user ? <div className="flex items-center gap-4"><div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"><CheckCircle2 className="w-4 h-4" /><span>{user.email ?? user.uid}</span></div><UiButton variant="outline" onClick={() => void logout()}><LogOut className="w-4 h-4" /><BilingualText value={bi('Disconnect Account', 'فصل الحساب')} /></UiButton></div> : <button onClick={() => void handleLogin()} disabled={isLoggingIn} className="gsi-material-button" style={{ width: '240px' }}><div className="gsi-material-button-state" /><div className="gsi-material-button-content-wrapper"><div className="gsi-material-button-icon"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg></div><span className="gsi-material-button-contents">{isLoggingIn ? 'Connecting…' : 'Sign in with Google'}</span></div></button>}</div>{authError && <p className="form-error" role="alert">{authError}</p>}</article></section>

    <div className="preview-warning" role="note"><ShieldCheck size={16} /><BilingualText value={bi('Service cards below are configuration targets. No service is marked Connected until its API integration can be verified independently.', 'بطاقات الخدمات أدناه أهداف للإعداد. لا يتم تمييز أي خدمة على أنها متصلة حتى يمكن التحقق من تكامل API الخاص بها بشكل مستقل.')} /></div>

    <div className="mt-8"><h2 className="text-xl font-bold mb-4 px-1"><BilingualText value={bi('Workspace Service Readiness', 'جاهزية خدمات مساحة العمل')} /></h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{integrations.map((integration) => <article key={integration.id} className="setting-card flex flex-col gap-2"><div className="flex items-center justify-between"><h3 className="text-lg m-0">{integration.name}</h3><AlertCircle className="w-5 h-5 text-amber-500" /></div><p className="text-sm opacity-80"><BilingualText value={integration.description} /></p><div className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400"><BilingualText value={user ? bi('Account authenticated · Service API not verified', 'الحساب موثق · API الخدمة غير متحقق منه') : bi('Account authentication required · Service API not verified', 'يلزم توثيق الحساب · API الخدمة غير متحقق منه')} /></div></article>)}</div></div>
  </div>;
}
