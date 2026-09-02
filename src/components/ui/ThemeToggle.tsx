import { MonitorSmartphone, MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useUiSettings } from '../../ui/theme/useUiSettings';
import type { UiAppearance } from '../../ui/theme/uiSettings';
import { BilingualText, bi } from '../bilingual/BilingualText';

const options = [
  { value: 'light' as const, icon: SunMedium, label: bi('Day Mode', 'الوضع النهاري') },
  { value: 'dark' as const, icon: MoonStar, label: bi('Night Mode', 'الوضع الليلي') },
  { value: 'system' as const, icon: MonitorSmartphone, label: bi('System', 'حسب النظام') },
];

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { appearance, setAppearance } = useUiSettings();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const active = options.find((option) => option.value === appearance) ?? options[2];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  const choose = (value: UiAppearance) => {
    setAppearance(value);
    setOpen(false);
  };

  if (compact) {
    return <div className="theme-menu" ref={wrapperRef}>
      <button
        type="button"
        className="theme-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Appearance: ${active.label.en} | المظهر: ${active.label.ar}`}
        title={`${active.label.en} | ${active.label.ar}`}
        onClick={() => setOpen((value) => !value)}
      >
        <ActiveIcon aria-hidden="true" />
      </button>
      {open && <div className="theme-menu-popover" role="menu" aria-label="Appearance | المظهر">
        {options.map(({ value, icon: Icon, label }) => <button
          key={value}
          type="button"
          role="menuitemradio"
          aria-checked={appearance === value}
          className={appearance === value ? 'active' : ''}
          onClick={() => choose(value)}
        >
          <Icon aria-hidden="true" />
          <BilingualText value={label} />
        </button>)}
      </div>}
    </div>;
  }

  return <div className="theme-toggle" role="group" aria-label="Appearance | المظهر">
    {options.map(({ value, icon: Icon, label }) => <button
      key={value}
      type="button"
      className={appearance === value ? 'theme-toggle-button active' : 'theme-toggle-button'}
      aria-pressed={appearance === value}
      onClick={() => choose(value)}
    >
      <Icon aria-hidden="true" />
      <BilingualText value={label} />
    </button>)}
  </div>;
}
