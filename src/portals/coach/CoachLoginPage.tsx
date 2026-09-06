import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { useCoachSession } from './CoachSessionContext';

export function CoachLoginPage() {
  const { allCoaches, login } = useCoachSession();
  const navigate = useNavigate();
  const [selectedCoachId, setSelectedCoachId] = useState(() => allCoaches[0]?.id ?? '');
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    return {
      tone: 'info',
      message: bi('Authentication is unavailable.', 'المصادقة غير متاحة.'),
    };
  };

  const enterPreview = async () => {
    if (!selectedCoachId) return;
    setPreviewLoading(true);
    // Fake async
    await new Promise(r => setTimeout(r, 500));
    setPreviewLoading(false);
    
    login(selectedCoachId);
    navigate('/coach/home');
  };

  const previewContent = (
    <div className="portal-auth-preview">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Development preview', 'معاينة التطوير')} /></span>
        <span className="portal-auth-preview-badge">Preview</span>
      </div>
      <label htmlFor="coach-preview-identity">
        <BilingualText value={bi('Select a clearly labelled preview coach', 'اختر مدرب معاينة موضحًا بوضوح')} />
      </label>
      <select id="coach-preview-identity" value={selectedCoachId} onChange={(event) => setSelectedCoachId(event.target.value)}>
        {allCoaches.map((coach) => (
          <option key={coach.id} value={coach.id}>{coach.nameEn} — {coach.nameAr}</option>
        ))}
      </select>
      <button type="button" onClick={() => void enterPreview()} disabled={previewLoading || !selectedCoachId}>
        {previewLoading
          ? <BilingualText value={bi('Opening preview…', 'جارٍ فتح المعاينة…')} />
          : <BilingualText value={bi('Enter Preview Coach Mode', 'الدخول إلى وضع معاينة المدرب')} />}
      </button>
    </div>
  );

  return <PortalAuthPage portal="coach" busy={previewLoading} extraContent={previewContent} onProvider={handleProvider} />;
}
