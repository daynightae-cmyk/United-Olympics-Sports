import type { ReactNode } from 'react';
import { BilingualText } from '../../../components/bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../../domain/contracts';

interface PlayerDataStatProps {
  label: BilingualValue;
  value?: ReactNode;
  icon?: ReactNode;
  accent?: 'gold' | 'success' | 'info' | 'neutral';
}

export function PlayerDataStat({ label, value, icon, accent = 'neutral' }: PlayerDataStatProps) {
  const unavailable = value === undefined || value === null || value === '';
  return (
    <div className={`cgpt-player-stat cgpt-player-stat--${accent}`}>
      <div className="cgpt-player-stat__label">
        {icon}
        <BilingualText value={label} />
      </div>
      <div className={`cgpt-player-stat__value ${unavailable ? 'is-unavailable' : ''}`}>
        {unavailable ? <BilingualText value={{ en: 'Not available', ar: 'غير متاح' }} /> : value}
      </div>
    </div>
  );
}
