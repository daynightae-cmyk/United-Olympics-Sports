import { useState, useEffect } from 'react';
import { ShieldCheck, Cloud, Settings2, LogOut, CheckCircle2, XCircle } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { UiButton } from '../../components/ui/UiPrimitives';
import { initAuth, googleSignIn, logout, getAccessToken } from '../../lib/firebase';
import type { User } from 'firebase/auth';

export function AdminIntegrationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setInitialized(true);
      },
      () => {
        setUser(null);
        setToken(null);
        setInitialized(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const integrations = [
    { name: 'Google Drive', id: 'drive', description: 'Store and access documents and media.' },
    { name: 'Google Sheets', id: 'sheets', description: 'Sync tables and export reports.' },
    { name: 'Google Docs', id: 'docs', description: 'Generate player certificates and contracts.' },
    { name: 'Google Forms', id: 'forms', description: 'Collect registration and feedback forms.' },
    { name: 'Google Meet', id: 'meet', description: 'Schedule remote coaching sessions.' },
    { name: 'Google Chat', id: 'chat', description: 'Internal team communication.' },
    { name: 'Google Tasks', id: 'tasks', description: 'Manage staff operational tasks.' },
    { name: 'Google Slides', id: 'slides', description: 'Curriculum and presentation materials.' },
    { name: 'Gmail', id: 'gmail', description: 'Automated email communications.' },
    { name: 'Google Calendar', id: 'calendar', description: 'Sync training schedules and events.' },
  ];

  return (
    <div className="admin-page settings-page">
      <div className="admin-page-header">
        <div className="admin-page-header-copy">
          <span className="section-icon admin-page-header-icon" aria-hidden="true">
            <Cloud />
          </span>
          <div>
            <BilingualText value={bi('Settings', 'الإعدادات')} className="admin-eyebrow" />
            <h1><BilingualText value={bi('Google Workspace Integrations', 'تكاملات مساحة عمل جوجل')} /></h1>
            <p><BilingualText value={bi('Manage connections to Google productivity tools.', 'إدارة الاتصالات بأدوات إنتاجية جوجل.')} /></p>
          </div>
        </div>
      </div>

      <section className="settings-grid" style={{ gridTemplateColumns: '1fr' }}>
        <article className="setting-card">
          <div className="flex items-center justify-between">
            <div>
              <h3><BilingualText value={bi('Workspace Authentication', 'المصادقة مع مساحة العمل')} /></h3>
              <p>
                <BilingualText 
                  value={bi(
                    'Connect a Google account to enable all Workspace integrations for this session.', 
                    'قم بربط حساب جوجل لتفعيل جميع تكاملات مساحة العمل لهذه الجلسة.'
                  )} 
                />
              </p>
            </div>
            {!initialized ? (
              <div className="text-sm opacity-50">Loading...</div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <UiButton variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                  <BilingualText value={bi('Disconnect', 'قطع الاتصال')} />
                </UiButton>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button"
                style={{ width: '240px' }}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </div>
              </button>
            )}
          </div>
        </article>
      </section>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 px-1"><BilingualText value={bi('Available Integrations', 'التكاملات المتاحة')} /></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <article key={integration.id} className="setting-card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg m-0">{integration.name}</h3>
                {user ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400 opacity-50" />
                )}
              </div>
              <p className="text-sm opacity-80">{integration.description}</p>
              <div className="mt-2 text-xs font-medium">
                {user ? (
                  <span className="text-green-600 dark:text-green-400">Ready to use</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">Requires Authentication</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
