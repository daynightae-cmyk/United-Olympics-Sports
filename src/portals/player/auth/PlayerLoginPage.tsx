import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PortalAuthPage, type PortalAuthNotice, type PortalAuthProvider } from '../../../components/auth/PortalAuthPage';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { usePlayerSession } from '../PlayerSessionContext';
import { previewAuthGateway, productionAuthGateway } from './PlayerAuthGateway';

export function PlayerLoginPage() {
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

  const handleProvider = async (provider: PortalAuthProvider): Promise<PortalAuthNotice | null> => {
    if (provider !== 'google' && provider !== 'apple') {
      return {
        tone: 'info',
        message: bi('This sign-in method is not configured in the current environment.', 'طريقة تسجيل الدخول هذه غير مهيأة في البيئة الحالية.'),
      };
    }

    const result = provider === 'google'
      ? await productionAuthGateway.signInWithGoogle()
      : await productionAuthGateway.signInWithApple();

    if (result.success && result.data?.playerId) {
      login(result.data.playerId);
      navigate('/player/home');
      return null;
    }

    return {
      tone: 'error',
      message: result.error
        ? { en: result.error.messageEn, ar: result.error.messageAr }
        : bi('Authentication is unavailable.', 'المصادقة غير متاحة.'),
    };
  };

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

  const previewContent = (
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
            <BilingualText value={bi('Select an athlete record exposed by the shared provider', 'اختر سجل لاعب متاحًا من مزود البيانات المشترك')} />
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
        <p><BilingualText value={bi('No athlete records are available from the current data provider. Preview sign-in cannot create a synthetic athlete.', 'لا توجد سجلات لاعبين متاحة من مزود البيانات الحالي. ولا يمكن لدخول المعاينة إنشاء لاعب اصطناعي.')} /></p>
      )}
    </div>
  );

  return <PortalAuthPage portal="player" busy={previewLoading || loading} extraContent={previewContent} onProvider={handleProvider} />;
}
