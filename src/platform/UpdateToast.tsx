/**
 * Quiet cross-platform update notification.
 * Renders nothing unless a real newer version is detected.
 * Mandatory minimum-version states use a stronger panel.
 */
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { checkForUpdate, type UpdateStatus } from '../platform/version';

export function UpdateToast() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let live = true;
    checkForUpdate().then((result) => {
      if (live) setStatus(result);
    });
    return () => {
      live = false;
    };
  }, []);

  if (!status?.updateAvailable || dismissed || !status.latest) return null;
  if (status.mandatory) {
    return (
      <div className="uos-update-banner" role="alert">
        <strong><BilingualText value={bi('Update required', 'يلزم التحديث')} /></strong>
        <p><BilingualText value={status.latest.notes ?? bi('A newer version is required to continue.', 'يلزم إصدار أحدث للمتابعة.')} /></p>
        <button type="button" className="uos-btn-primary uos-touch" onClick={() => window.location.reload()}>
          <RefreshCw size={15} /><BilingualText value={bi('Update', 'تحديث')} />
        </button>
      </div>
    );
  }
  return (
    <div className="uos-update-toast uos-glass-4" role="status">
      <strong><BilingualText value={bi('New update available', 'يتوفر تحديث جديد')} /></strong>
      <p><BilingualText value={status.latest.notes ?? bi('Improvements are ready.', 'تحسينات جديدة أصبحت متاحة.')} /></p>
      <div className="uos-update-actions">
        <button type="button" className="uos-btn-primary uos-touch" onClick={() => window.location.reload()}>
          <BilingualText value={bi('Update', 'تحديث')} />
        </button>
        <button type="button" className="uos-btn-ghost uos-touch" onClick={() => setDismissed(true)}>
          <BilingualText value={bi('Later', 'لاحقًا')} />
        </button>
      </div>
    </div>
  );
}
