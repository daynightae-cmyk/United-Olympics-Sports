import { useSearchParams } from 'react-router-dom';
import { RouteLoadingExperience, type UosLoadingPortal } from '../../components/loading/UosLoadingSystem';

const supportedPortals = new Set<UosLoadingPortal>(['player', 'parent', 'coach', 'admin', 'generic']);

export function LoadingExperienceShowcase() {
  const [params] = useSearchParams();
  const requestedPortal = params.get('portal') as UosLoadingPortal | null;
  const portal = requestedPortal && supportedPortals.has(requestedPortal) ? requestedPortal : 'generic';

  return <RouteLoadingExperience portal={portal} />;
}
