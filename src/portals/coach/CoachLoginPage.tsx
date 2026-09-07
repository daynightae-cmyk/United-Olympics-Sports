import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, UserRound } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useCoachSession } from './CoachSessionContext';

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

  const handleProvider = async (_provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => ({
    tone: 'info',
    message: bi('Authentication is not connected yet.', 'المصادقة غير متصلة حتى الآن.'),
  });

  const enterPreview = () => {
    if (!selectedCoachId) return;
    login(selectedCoachId);
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
          <p><BilingualText value={bi('The production data service is not connected yet.', 'خدمة بيانات الإنتاج غير متصلة حتى الآن.')} /></p>
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
          <p><BilingualText value={bi('Active coach records will appear here when the data provider supplies them.', 'ستظهر سجلات المدربين النشطين هنا عندما يوفرها مصدر البيانات.')} /></p>
        </div>
      )}
    </div>
  );

  return <PortalAuthPage portal="coach" busy={loading} extraContent={previewContent} onProvider={handleProvider} />;
}
