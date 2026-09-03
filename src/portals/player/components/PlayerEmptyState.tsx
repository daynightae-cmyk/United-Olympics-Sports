import type { ReactNode } from 'react';
import { ArrowRight, CircleOff } from 'lucide-react';
import { BilingualText } from '../../../components/bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../../domain/contracts';

interface PlayerEmptyStateProps {
  title: BilingualValue;
  description: BilingualValue;
  icon?: ReactNode;
  action?: {
    label: BilingualValue;
    onClick: () => void;
  };
  compact?: boolean;
}

export function PlayerEmptyState({ title, description, icon, action, compact = false }: PlayerEmptyStateProps) {
  return (
    <section className={`cgpt-empty-state ${compact ? 'cgpt-empty-state--compact' : ''}`}>
      <div className="cgpt-empty-state__icon" aria-hidden="true">
        {icon ?? <CircleOff size={24} />}
      </div>
      <div className="cgpt-empty-state__copy">
        <h3><BilingualText value={title} /></h3>
        <p><BilingualText value={description} /></p>
      </div>
      {action && (
        <button type="button" className="cgpt-empty-state__action" onClick={action.onClick}>
          <BilingualText value={action.label} />
          <ArrowRight size={14} className="rtl:rotate-180" />
        </button>
      )}
    </section>
  );
}
