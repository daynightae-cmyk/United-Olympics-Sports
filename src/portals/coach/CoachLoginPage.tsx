import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserRound } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth } from '../../lib/auth-client';
import { useCoachSession } from './CoachSessionContext';

const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';

export function CoachLoginPage() {
  const { allCoaches, login, loading, error } = useCoachSession();
  const navigate = useNavigate();
  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    if (!selectedCoachId && allCoaches[0]) setSelectedCoachId(allCoaches[0].id);
    if (selectedCoachId && !allCoaches.some((coach) => coach.id === selectedCoachId)) {
      setSelectedCoachId(allCoaches[0]?.id ?? '');
    }
  }, [allCoaches, selectedCoachId]);

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

  const enterPreview = () => {
    if (!selectedCoachId) return;
    login(selectedCoachId, 'preview');
    navigate('/coach/home');
  };

  const previewContent = (
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

  return (
    <PortalAuthPage
      portal="coach"
      busy={previewRuntime ? loading : false}
      extraContent={previewRuntime ? previewContent : undefined}
      onProvider={handleProvider}
    />
  );
}
