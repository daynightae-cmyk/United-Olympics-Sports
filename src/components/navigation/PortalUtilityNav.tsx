import { ArrowLeft, Globe2, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BilingualText, bi } from '../bilingual/BilingualText';

export function PortalUtilityNav({ homeTo, compact = false }: { homeTo: string; compact?: boolean }) {
  const navigate = useNavigate();
  return <nav className={`portal-utility-nav ${compact ? 'is-compact' : ''}`} aria-label="Portal shortcuts | اختصارات البوابة">
    <button type="button" onClick={() => navigate(-1)} aria-label="Back | رجوع"><ArrowLeft /><span><BilingualText value={bi('Back', 'رجوع')} /></span></button>
    <Link to={homeTo} aria-label="Portal home | الرئيسية"><Home /><span><BilingualText value={bi('Home', 'الرئيسية')} /></span></Link>
    <Link to="/" aria-label="Public website | الموقع العام"><Globe2 /><span><BilingualText value={bi('Website', 'الموقع')} /></span></Link>
  </nav>;
}
