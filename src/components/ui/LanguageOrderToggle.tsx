import { Languages } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { useUiSettings } from '../../ui/theme/useUiSettings';

export function LanguageOrderToggle({ compact = false }: { compact?: boolean }) {
  const { bilingualOrder, setSetting } = useUiSettings();
  const arabicFirst = bilingualOrder === 'ar-first';
  const nextLabel = arabicFirst
    ? bi('Show English first', 'عرض الإنجليزية أولًا')
    : bi('Show Arabic first', 'عرض العربية أولًا');

  return (
    <button
      type="button"
      className={compact ? 'language-order-toggle is-compact' : 'language-order-toggle'}
      aria-pressed={arabicFirst}
      aria-label={`${nextLabel.en} | ${nextLabel.ar}`}
      title={`${nextLabel.en} | ${nextLabel.ar}`}
      onClick={() => setSetting('bilingualOrder', arabicFirst ? 'en-first' : 'ar-first')}
    >
      <Languages aria-hidden="true" />
      {!compact && <BilingualText value={arabicFirst ? bi('AR First', 'العربية أولًا') : bi('EN First', 'الإنجليزية أولًا')} />}
      {compact && <span aria-hidden="true">{arabicFirst ? 'AR' : 'EN'}</span>}
    </button>
  );
}
