import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { beginSupabaseGoogleOAuth } from '../../../lib/auth-client';
import { PlayerSessionProvider, usePlayerSession } from '../PlayerSessionContext';
import { previewAuthGateway, productionAuthGateway } from './PlayerAuthGateway';

const previewRuntime = import.meta.env.DEV || import.meta.env.VITE_UOS_ADMIN_PREVIEW === 'true';

function PlayerPreviewAccess() {
  const { allPlayers, login, loading } = usePlayerSession();
  const navigate = useNavigate();
  const [selectedAthleteId, setSelectedAthleteId] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!allPlayers.length) {
      setSelectedAthleteId('');
      return;
    }
    setSelectedAthleteId((current) => allPlayers.some((player) => player.id === current) ? current : allPlayers[0].id);
  }, [allPlayers]);

  const enterPreview = async () => {
    if (!selectedAthleteId || !allPlayers.some((player) => player.id === selectedAthleteId)) return;
    setPreviewLoading(true);
    const result = await previewAuthGateway.enterPreviewMode(selectedAthleteId);
    setPreviewLoading(false);
    if (result.success && result.data?.playerId) {
      login(result.data.playerId);
      navigate('/player/home');
    }
  };

  return (
    <div className="portal-auth-preview">
      <div className="portal-auth-preview-header">
        <span><Sparkles aria-hidden="true" /><BilingualText value={bi('Development preview', 'معاينة التطوير')} /></span>
        <span className="portal-auth-preview-badge">Preview</span>
      </div>
      {loading ? (
        <p><BilingualText value={bi('Loading available athlete records…', 'جارٍ تحميل سجلات اللاعبين المتاحة…')} /></p>
      ) : allPlayers.length ? (
        <>
          <label htmlFor="player-preview-identity">
            <BilingualText value={bi('Select an athlete record exposed by the preview provider', 'اختر سجل لاعب متاحًا من مزود المعاينة')} />
          </label>
          <select id="player-preview-identity" value={selectedAthleteId} onChange={(event) => setSelectedAthleteId(event.target.value)}>
            {allPlayers.map((player) => (
              <option key={player.id} value={player.id}>{player.nameEn} — {player.nameAr}</option>
            ))}
          </select>
          <button type="button" onClick={() => void enterPreview()} disabled={previewLoading || !selectedAthleteId}>
            {previewLoading
              ? <BilingualText value={bi('Opening preview…', 'جارٍ فتح المعاينة…')} />
              : <BilingualText value={bi('Enter Preview Athlete Mode', 'الدخول إلى وضع معاينة اللاعب')} />}
          </button>
        </>
      ) : (
        <p><BilingualText value={bi('No athlete records are available from the preview provider.', 'لا توجد سجلات لاعبين متاحة من مزود المعاينة.')} /></p>
      )}
    </div>
  );
}

export function PlayerLoginPage() {
  const navigate = useNavigate();

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider === 'google') {
      try {
        await beginSupabaseGoogleOAuth('/player/home');
        return null;
      } catch {
        return {
          tone: 'error',
          message: bi('Google sign-in could not start. Please try again.', 'تعذر بدء تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.'),
        };
      }
    }

    if (provider !== 'apple') {
      return {
        tone: 'info',
        message: bi('This sign-in method is not available yet.', 'طريقة تسجيل الدخول هذه غير متاحة بعد.'),
      };
    }

    const result = await productionAuthGateway.signInWithApple();
    if (result.success && result.data?.playerId) {
      navigate('/player/home');
      return null;
    }

    return {
      tone: 'info',
      message: result.error
        ? { en: result.error.messageEn, ar: result.error.messageAr }
        : bi('Apple sign-in is not available yet.', 'تسجيل الدخول عبر Apple غير متاح بعد.'),
    };
  };

  return (
    <PortalAuthPage
      portal="player"
      extraContent={previewRuntime ? (
        <PlayerSessionProvider>
          <PlayerPreviewAccess />
        </PlayerSessionProvider>
      ) : undefined}
      onProvider={handleProvider}
    />
  );
}
