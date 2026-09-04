import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerRouteLoader() {
  return (
    <div className="cgpt-route-loader" role="status" aria-live="polite">
      <div className="cgpt-route-loader__mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <BilingualText value={bi('Preparing your athlete space', 'جارٍ تجهيز مساحة اللاعب')} />
    </div>
  );
}
