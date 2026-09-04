import { ArrowLeft, Calendar, Compass, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalNotFoundPage() {
  return (
    <main className="cgpt-not-found" id="player-not-found-page">
      <div className="cgpt-not-found__number" aria-hidden="true">404</div>
      <div className="cgpt-not-found__icon"><Compass size={30} /></div>
      <h1><BilingualText value={bi('This Player Portal route does not exist', 'هذا المسار غير موجود في بوابة اللاعب')} /></h1>
      <p><BilingualText value={bi('The current player session is still active. Choose a valid section below without leaving the portal.', 'جلسة اللاعب الحالية ما زالت نشطة. اختر قسمًا صالحًا أدناه دون مغادرة البوابة.')} /></p>
      <div className="cgpt-fatal-state__actions">
        <Link to="/player/home"><Home size={15} /><BilingualText value={bi('Athlete home', 'الرئيسية')} /></Link>
        <Link to="/player/schedule"><Calendar size={15} /><BilingualText value={bi('Training schedule', 'جدول التدريب')} /></Link>
        <Link to="/player/home"><ArrowLeft size={15} className="rtl:rotate-180" /><BilingualText value={bi('Return safely', 'عودة آمنة')} /></Link>
      </div>
    </main>
  );
}
