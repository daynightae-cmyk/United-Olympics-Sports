/**
 * United Olympics Sports — Canonical Field Library (Mission 00).
 * Quiet luxury sports technology form architecture.
 *
 * Supports:
 * - Text, Email, Phone, Password, Number, Currency, Percentage, Search
 * - Select, Multi-Select, Combobox, Checkbox, Radio Group, Toggle/Switch
 * - Textarea, Date, Date Range, Time, Datetime
 * - File Upload, Image Upload, Document Upload, Tags, Chip Selector
 * - Form Section, Error Summary, Stepper, Review List
 *
 * Full accessibility: ARIA describedby/invalid/required, persistent labels,
 * touch targets (48-56px), RTL logical properties, and reduced motion safety.
 */
import {
  useId,
  useState,
  useRef,
  useEffect,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import {
  Eye,
  EyeOff,
  Search,
  X,
  ChevronDown,
  Check,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../domain/contracts';

export interface FieldShellProps {
  label: BilingualValue;
  icon?: ReactNode;
  required?: boolean;
  optional?: boolean;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  valid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  children: (inputId: string) => ReactNode;
}

export function FieldShell({
  label,
  icon,
  required,
  optional,
  helper,
  error,
  valid,
  disabled,
  readOnly,
  className = '',
  children,
}: FieldShellProps) {
  const inputId = useId();
  const describedBy = `${inputId}-meta`;

  return (
    <div
      className={`uos-field ${disabled ? 'uos-field--disabled' : ''} ${error ? 'uos-field--error' : ''} ${valid ? 'uos-field--valid' : ''} ${readOnly ? 'uos-field--readonly' : ''} ${className}`.trim()}
    >
      <div className="uos-field-label-row">
        <label htmlFor={inputId} className="uos-field-label">
          {icon ? <span className="uos-field-icon" aria-hidden="true">{icon}</span> : null}
          <BilingualText value={label} />
          {required ? <span className="uos-field-required" aria-hidden="true"> *</span> : null}
        </label>
        {optional && !required ? (
          <span className="uos-field-optional">
            <BilingualText value={bi('Optional', 'اختياري')} />
          </span>
        ) : null}
      </div>

      {children(inputId)}

      <div id={describedBy} className="uos-field-meta">
        {error ? (
          <span role="alert" className="uos-field-error">
            <AlertCircle size={13} aria-hidden="true" />
            <BilingualText value={error} />
          </span>
        ) : valid ? (
          <span className="uos-field-valid-msg">
            <CheckCircle2 size={13} aria-hidden="true" />
            <BilingualText value={bi('Verified', 'تم التحقق')} />
          </span>
        ) : helper ? (
          <span className="uos-field-helper">
            <BilingualText value={helper} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. TEXT FIELD
───────────────────────────────────────────────────────────────────────────── */
export type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  valid?: boolean;
  optional?: boolean;
  value?: string | number;
  onChange?: ((value: string) => void) | ((e: ChangeEvent<HTMLInputElement>) => void) | any;
  onRawChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  endAdornment?: ReactNode;
};

export function UosTextField({
  label,
  icon,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  readOnly,
  value,
  onChange,
  onRawChange,
  endAdornment,
  type = 'text',
  className = '',
  ...props
}: TextProps) {
  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
      readOnly={readOnly}
      className={className}
    >
      {(inputId) => (
        <div className="uos-input-wrap">
          <input
            id={inputId}
            type={type}
            className={`uos-input uos-halo uos-touch ${endAdornment ? 'uos-input--with-adornment' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={`${inputId}-meta`}
            aria-required={required}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            onChange={(e) => {
              if (onChange) {
                (onChange as any)(e);
              }
              onRawChange?.(e);
            }}
            {...props}
          />
          {endAdornment ? <div className="uos-input-end-adornment">{endAdornment}</div> : null}
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. EMAIL FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosEmailField(props: TextProps) {
  return (
    <UosTextField
      type="email"
      autoComplete="email"
      inputMode="email"
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. PHONE FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosPhoneField({
  countryCode = '+971',
  ...props
}: TextProps & { countryCode?: string }) {
  return (
    <UosTextField
      type="tel"
      autoComplete="tel"
      inputMode="tel"
      endAdornment={<span className="uos-field-prefix-badge" dir="ltr">{countryCode}</span>}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. PASSWORD FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosPasswordField({
  label,
  icon = <Lock size={15} />,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  readOnly,
  autoComplete = 'current-password',
  value,
  onChange,
  ...props
}: TextProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
      readOnly={readOnly}
    >
      {(inputId) => (
        <div className="uos-input-wrap">
          <input
            id={inputId}
            type={visible ? 'text' : 'password'}
            className="uos-input uos-halo uos-touch uos-input--with-action"
            aria-invalid={Boolean(error)}
            aria-describedby={`${inputId}-meta`}
            aria-required={required}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          />
          <button
            type="button"
            className="uos-input-action uos-touch"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password | إخفاء كلمة المرور' : 'Show password | إظهار كلمة المرور'}
            aria-pressed={visible}
            tabIndex={-1}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. NUMBER, CURRENCY & PERCENTAGE FIELDS
───────────────────────────────────────────────────────────────────────────── */
export function UosNumberField({
  min,
  max,
  step = 1,
  value,
  onChange,
  ...props
}: Omit<TextProps, 'value' | 'onChange'> & {
  min?: number;
  max?: number;
  step?: number | string;
  value?: number | string;
  onChange?: (val: number | string) => void;
}) {
  return (
    <UosTextField
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      value={value !== undefined ? String(value) : ''}
      onChange={(v) => onChange?.(v === '' ? '' : Number(v))}
      {...props}
    />
  );
}

export function UosCurrencyField({
  currency = 'AED',
  value,
  onChange,
  ...props
}: Omit<TextProps, 'value' | 'onChange'> & {
  currency?: string;
  value?: number | string;
  onChange?: (val: number | string) => void;
}) {
  return (
    <UosTextField
      type="number"
      inputMode="decimal"
      step="0.01"
      min="0"
      value={value !== undefined ? String(value) : ''}
      onChange={(v) => onChange?.(v === '' ? '' : Number(v))}
      endAdornment={<span className="uos-field-prefix-badge">{currency}</span>}
      {...props}
    />
  );
}

export function UosPercentageField({
  value,
  onChange,
  ...props
}: Omit<TextProps, 'value' | 'onChange'> & {
  value?: number | string;
  onChange?: (val: number | string) => void;
}) {
  return (
    <UosTextField
      type="number"
      inputMode="decimal"
      step="1"
      min="0"
      max="100"
      value={value !== undefined ? String(value) : ''}
      onChange={(v) => onChange?.(v === '' ? '' : Number(v))}
      endAdornment={<span className="uos-field-prefix-badge">%</span>}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. SEARCH FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosSearchField({
  label = bi('Search', 'بحث'),
  value = '',
  onChange,
  onClear,
  ...props
}: TextProps & { onClear?: () => void }) {
  return (
    <FieldShell label={label} icon={<Search size={15} />}>
      {(inputId) => (
        <div className="uos-input-wrap">
          <input
            id={inputId}
            type="search"
            autoComplete="off"
            className="uos-input uos-halo uos-touch uos-input--search"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={`${label.en} · ${label.ar}`}
            {...props}
          />
          {value ? (
            <button
              type="button"
              className="uos-input-action uos-touch"
              onClick={() => {
                onChange?.('');
                onClear?.();
              }}
              aria-label="Clear search | مسح البحث"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. SELECT FIELD
───────────────────────────────────────────────────────────────────────────── */
export type OptionItem = {
  value: string;
  label: BilingualValue;
  disabled?: boolean;
};

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'value' | 'onChange'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  valid?: boolean;
  optional?: boolean;
  options: OptionItem[];
  placeholder?: BilingualValue;
  value?: string;
  onChange?: ((value: string) => void) | ((e: ChangeEvent<HTMLSelectElement>) => void) | any;
};

export function UosSelectField({
  label,
  icon,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  options,
  placeholder = bi('Select an option…', 'اختر خيارًا…'),
  value,
  onChange,
  ...props
}: SelectProps) {
  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
    >
      {(inputId) => (
        <div className="uos-input-wrap">
          <select
            id={inputId}
            className="uos-input uos-halo uos-touch uos-select"
            aria-invalid={Boolean(error)}
            aria-describedby={`${inputId}-meta`}
            aria-required={required}
            required={required}
            disabled={disabled}
            value={value}
            onChange={(e) => {
              if (onChange) {
                (onChange as any)(e);
              }
            }}
            {...props}
          >
            {placeholder ? (
              <option value="">
                {placeholder.en} · {placeholder.ar}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label.en} · {option.label.ar}
              </option>
            ))}
          </select>
          <span className="uos-select-arrow" aria-hidden="true">
            <ChevronDown size={16} />
          </span>
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. COMBOBOX / SEARCHABLE SELECT
───────────────────────────────────────────────────────────────────────────── */
export function UosComboboxField({
  label,
  icon,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  options,
  placeholder = bi('Type or select…', 'اكتب أو اختر…'),
  value,
  onChange,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.en.toLowerCase().includes(filter.toLowerCase()) ||
      opt.label.ar.includes(filter),
  );

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
    >
      {(inputId) => (
        <div className="uos-combobox-wrap" ref={wrapperRef}>
          <button
            id={inputId}
            type="button"
            className="uos-input uos-halo uos-touch uos-combobox-trigger"
            onClick={() => !disabled && setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
          >
            <span className={selectedOption ? 'uos-combobox-selected' : 'uos-combobox-placeholder'}>
              {selectedOption
                ? `${selectedOption.label.en} · ${selectedOption.label.ar}`
                : `${placeholder.en} · ${placeholder.ar}`}
            </span>
            <ChevronDown size={16} className={`uos-combobox-chevron ${open ? 'is-open' : ''}`} />
          </button>

          {open && (
            <div className="uos-combobox-dropdown uos-glass-4">
              <div className="uos-combobox-search-box">
                <Search size={14} aria-hidden="true" />
                <input
                  type="text"
                  className="uos-combobox-search-input"
                  placeholder="Filter… | تصفية…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  autoFocus
                />
                {filter && (
                  <button
                    type="button"
                    className="uos-combobox-clear"
                    onClick={() => setFilter('')}
                    aria-label="Clear filter"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <ul className="uos-combobox-list" role="listbox">
                {filteredOptions.length === 0 ? (
                  <li className="uos-combobox-empty">
                    <BilingualText value={bi('No matches found', 'لم يتم العثور على نتائج')} />
                  </li>
                ) : (
                  filteredOptions.map((opt) => {
                    const isSelected = opt.value === value;
                    return (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        className={`uos-combobox-item ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          onChange?.(opt.value);
                          setOpen(false);
                          setFilter('');
                        }}
                      >
                        <span>
                          {opt.label.en} · {opt.label.ar}
                        </span>
                        {isSelected && <Check size={14} className="uos-combobox-check" />}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. MULTI-SELECT CHIP SELECTOR
───────────────────────────────────────────────────────────────────────────── */
export function UosMultiSelectField({
  label,
  icon,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  options,
  value = [],
  onChange,
  placeholder = bi('Select options…', 'اختر خيارات…'),
}: {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  valid?: boolean;
  optional?: boolean;
  required?: boolean;
  disabled?: boolean;
  options: OptionItem[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: BilingualValue;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange?.(value.filter((v) => v !== val));
    } else {
      onChange?.([...value, val]);
    }
  };

  const removeChip = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== val));
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
    >
      {(inputId) => (
        <div className="uos-combobox-wrap" ref={wrapperRef}>
          <div
            id={inputId}
            className="uos-input uos-halo uos-multiselect-trigger"
            onClick={() => !disabled && setOpen((prev) => !prev)}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen((prev) => !prev);
              }
            }}
          >
            <div className="uos-multiselect-chips">
              {value.length === 0 ? (
                <span className="uos-combobox-placeholder">
                  {placeholder.en} · {placeholder.ar}
                </span>
              ) : (
                value.map((val) => {
                  const opt = options.find((o) => o.value === val);
                  return (
                    <span key={val} className="uos-chip">
                      <span>{opt ? `${opt.label.en}` : val}</span>
                      <button
                        type="button"
                        className="uos-chip-remove"
                        onClick={(e) => removeChip(val, e)}
                        aria-label={`Remove ${val}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })
              )}
            </div>
            <ChevronDown size={16} className={`uos-combobox-chevron ${open ? 'is-open' : ''}`} />
          </div>

          {open && (
            <div className="uos-combobox-dropdown uos-glass-4">
              <ul className="uos-combobox-list" role="listbox" aria-multiselectable="true">
                {options.map((opt) => {
                  const isChecked = value.includes(opt.value);
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isChecked}
                      className={`uos-combobox-item ${isChecked ? 'is-selected' : ''}`}
                      onClick={() => toggleOption(opt.value)}
                    >
                      <div className="uos-checkbox-indicator">
                        {isChecked && <Check size={12} />}
                      </div>
                      <span>
                        {opt.label.en} · {opt.label.ar}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   10. CHECKBOX FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosCheckboxField({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  error,
}: {
  label: BilingualValue;
  description?: BilingualValue;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  error?: BilingualValue | null;
}) {
  const inputId = useId();

  return (
    <div className={`uos-checkbox-shell ${disabled ? 'is-disabled' : ''} ${error ? 'is-error' : ''}`}>
      <label htmlFor={inputId} className="uos-checkbox-label-wrap">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div className={`uos-custom-checkbox ${checked ? 'is-checked' : ''}`}>
          {checked && <Check size={14} />}
        </div>
        <div className="uos-checkbox-text">
          <strong className="uos-checkbox-title">
            <BilingualText value={label} />
          </strong>
          {description && (
            <p className="uos-checkbox-desc">
              <BilingualText value={description} />
            </p>
          )}
        </div>
      </label>
      {error && (
        <span role="alert" className="uos-field-error">
          <AlertCircle size={13} aria-hidden="true" />
          <BilingualText value={error} />
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   11. RADIO GROUP FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosRadioGroupField({
  label,
  options,
  value,
  onChange,
  disabled = false,
  error,
  layout = 'vertical',
}: {
  label: BilingualValue;
  options: Array<{ value: string; label: BilingualValue; description?: BilingualValue }>;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: BilingualValue | null;
  layout?: 'vertical' | 'horizontal';
}) {
  const groupId = useId();

  return (
    <fieldset className={`uos-radiogroup-shell ${layout === 'horizontal' ? 'is-horizontal' : ''}`}>
      <legend className="uos-field-label">
        <BilingualText value={label} />
      </legend>
      <div className="uos-radiogroup-options">
        {options.map((opt) => {
          const isSelected = opt.value === value;
          const optId = `${groupId}-${opt.value}`;
          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={`uos-radio-card ${isSelected ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`}
            >
              <input
                id={optId}
                type="radio"
                name={groupId}
                value={opt.value}
                checked={isSelected}
                onChange={() => onChange?.(opt.value)}
                disabled={disabled}
                className="sr-only"
              />
              <div className={`uos-custom-radio ${isSelected ? 'is-selected' : ''}`}>
                {isSelected && <div className="uos-custom-radio-inner" />}
              </div>
              <div className="uos-radio-text">
                <strong className="uos-radio-title">
                  <BilingualText value={opt.label} />
                </strong>
                {opt.description && (
                  <p className="uos-radio-desc">
                    <BilingualText value={opt.description} />
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && (
        <span role="alert" className="uos-field-error">
          <AlertCircle size={13} aria-hidden="true" />
          <BilingualText value={error} />
        </span>
      )}
    </fieldset>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   12. TOGGLE / SWITCH FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosToggleField({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
}: {
  label: BilingualValue;
  description?: BilingualValue;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const switchId = useId();

  return (
    <div className={`uos-toggle-shell ${disabled ? 'is-disabled' : ''}`}>
      <div className="uos-toggle-info">
        <label htmlFor={switchId} className="uos-toggle-title">
          <BilingualText value={label} />
        </label>
        {description && (
          <p className="uos-toggle-desc">
            <BilingualText value={description} />
          </p>
        )}
      </div>
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`uos-switch ${checked ? 'is-checked' : ''}`}
      >
        <span className="uos-switch-thumb" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   13. TEXTAREA FIELD
───────────────────────────────────────────────────────────────────────────── */
export type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'value' | 'onChange'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  valid?: boolean;
  optional?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
};

export function UosTextAreaField({
  label,
  icon,
  helper,
  error,
  valid,
  optional,
  required,
  disabled,
  readOnly,
  value = '',
  onChange,
  maxLength,
  ...props
}: TextAreaProps) {
  return (
    <FieldShell
      label={label}
      icon={icon}
      required={required}
      optional={optional}
      helper={helper}
      error={error}
      valid={valid}
      disabled={disabled}
      readOnly={readOnly}
    >
      {(inputId) => (
        <div className="uos-textarea-wrap">
          <textarea
            id={inputId}
            className="uos-input uos-halo uos-textarea"
            aria-invalid={Boolean(error)}
            aria-describedby={`${inputId}-meta`}
            aria-required={required}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            value={value}
            maxLength={maxLength}
            onChange={(e) => onChange?.(e.target.value)}
            {...props}
          />
          {maxLength ? (
            <div className="uos-textarea-counter">
              {value.length} / {maxLength}
            </div>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   14. DATE, DATE RANGE, TIME, DATETIME FIELDS
───────────────────────────────────────────────────────────────────────────── */
export function UosDateField(props: TextProps) {
  return (
    <UosTextField
      type="date"
      icon={<Calendar size={15} />}
      {...props}
    />
  );
}

export function UosTimeField(props: TextProps) {
  return (
    <UosTextField
      type="time"
      icon={<Clock size={15} />}
      {...props}
    />
  );
}

export function UosDateTimeField(props: TextProps) {
  return (
    <UosTextField
      type="datetime-local"
      icon={<Calendar size={15} />}
      {...props}
    />
  );
}

export function UosDateRangeField({
  label = bi('Date Range', 'نطاق التاريخ'),
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  required,
  error,
  disabled,
}: {
  label?: BilingualValue;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  required?: boolean;
  error?: BilingualValue | null;
  disabled?: boolean;
}) {
  return (
    <FieldShell label={label} icon={<Calendar size={15} />} required={required} error={error} disabled={disabled}>
      {(inputId) => (
        <div className="uos-date-range-grid" id={inputId}>
          <div className="uos-date-subfield">
            <span className="uos-date-sublabel">
              <BilingualText value={bi('From', 'من')} />
            </span>
            <input
              type="date"
              className="uos-input uos-halo uos-touch"
              value={startDate ?? ''}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              disabled={disabled}
              aria-label="Start date | تاريخ البدء"
            />
          </div>
          <div className="uos-date-subfield">
            <span className="uos-date-sublabel">
              <BilingualText value={bi('To', 'إلى')} />
            </span>
            <input
              type="date"
              className="uos-input uos-halo uos-touch"
              value={endDate ?? ''}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              disabled={disabled}
              aria-label="End date | تاريخ الانتهاء"
            />
          </div>
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   15. FILE, IMAGE & DOCUMENT UPLOAD SLOTS
───────────────────────────────────────────────────────────────────────────── */
export function UosFileUploadField({
  label,
  helper = bi('Accepted formats: PDF, PNG, JPG (Max 10MB)', 'الصيغ المقبولة: PDF, PNG, JPG (بحد أقصى 10 ميجابايت)'),
  accept = '.pdf,.png,.jpg,.jpeg',
  fileName,
  onFileSelect,
  onRemove,
  error,
  disabled = false,
  required = false,
}: {
  label: BilingualValue;
  helper?: BilingualValue;
  accept?: string;
  fileName?: string;
  onFileSelect?: (file: File) => void;
  onRemove?: () => void;
  error?: BilingualValue | null;
  disabled?: boolean;
  required?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files?.[0]) {
      onFileSelect?.(e.dataTransfer.files[0]);
    }
  };

  return (
    <FieldShell label={label} helper={helper} error={error} required={required} disabled={disabled}>
      {(inputId) => (
        <div
          id={inputId}
          className={`uos-dropzone ${dragOver ? 'is-dragover' : ''} ${fileName ? 'has-file' : ''} ${disabled ? 'is-disabled' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !fileName && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileSelect?.(e.target.files[0]);
              }
            }}
          />

          {fileName ? (
            <div className="uos-uploaded-file-row">
              <FileText size={20} className="uos-file-icon" />
              <div className="uos-file-info">
                <span className="uos-file-name">{fileName}</span>
                <span className="uos-file-status">
                  <BilingualText value={bi('Ready for upload', 'جاهز للرفع')} />
                </span>
              </div>
              <button
                type="button"
                className="uos-btn-icon-danger uos-touch"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove?.();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Remove file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="uos-dropzone-prompt">
              <UploadCloud size={28} className="uos-dropzone-icon" />
              <p className="uos-dropzone-title">
                <BilingualText value={bi('Drag & drop or browse to choose file', 'اسحب وأفلت الملف أو تصفح لاختياره')} />
              </p>
              <span className="uos-dropzone-btn">
                <BilingualText value={bi('Choose File', 'اختيار ملف')} />
              </span>
            </div>
          )}
        </div>
      )}
    </FieldShell>
  );
}

export function UosImageUploadField({
  label,
  previewUrl,
  helper = bi('Recommended resolution: 1200x800px (JPG, WebP, PNG)', 'الدقة الموصى بها: 1200x800 بكسل (JPG, WebP, PNG)'),
  onImageSelect,
  onRemove,
  error,
  disabled = false,
}: {
  label: BilingualValue;
  previewUrl?: string;
  helper?: BilingualValue;
  onImageSelect?: (file: File) => void;
  onRemove?: () => void;
  error?: BilingualValue | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <FieldShell label={label} icon={<ImageIcon size={15} />} helper={helper} error={error} disabled={disabled}>
      {(inputId) => (
        <div id={inputId} className="uos-image-upload-shell">
          {previewUrl ? (
            <div className="uos-image-preview-card">
              <img src={previewUrl} alt="Upload preview" className="uos-image-preview-thumb" />
              <div className="uos-image-preview-overlay">
                <button
                  type="button"
                  className="uos-btn-secondary uos-touch"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled}
                >
                  <BilingualText value={bi('Change Image', 'تغيير الصورة')} />
                </button>
                <button
                  type="button"
                  className="uos-btn-danger uos-touch"
                  onClick={onRemove}
                  disabled={disabled}
                >
                  <Trash2 size={15} />
                  <BilingualText value={bi('Remove', 'حذف')} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className="uos-image-placeholder-drop"
              onClick={() => !disabled && inputRef.current?.click()}
            >
              <ImageIcon size={32} className="uos-dropzone-icon" />
              <p>
                <BilingualText value={bi('Upload sport / cover image', 'رفع صورة الرياضة / الغلاف')} />
              </p>
              <span className="uos-dropzone-btn">
                <BilingualText value={bi('Browse Media', 'تصفح الوسائط')} />
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              if (e.target.files?.[0]) onImageSelect?.(e.target.files[0]);
            }}
          />
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   16. TAGS INPUT FIELD
───────────────────────────────────────────────────────────────────────────── */
export function UosTagsField({
  label,
  helper = bi('Press Enter or comma to add tag', 'اضغط Enter أو فاصلة لإضافة الوسم'),
  tags = [],
  onChange,
  error,
  disabled = false,
}: {
  label: BilingualValue;
  helper?: BilingualValue;
  tags?: string[];
  onChange?: (tags: string[]) => void;
  error?: BilingualValue | null;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const trimmed = draft.trim().replace(/^,+|,+$/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed]);
      setDraft('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      onChange?.(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <FieldShell label={label} helper={helper} error={error} disabled={disabled}>
      {(inputId) => (
        <div className="uos-input uos-halo uos-tags-wrap">
          {tags.map((tag) => (
            <span key={tag} className="uos-chip">
              <span>{tag}</span>
              <button
                type="button"
                className="uos-chip-remove"
                onClick={() => removeTag(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            id={inputId}
            type="text"
            className="uos-tags-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={tags.length === 0 ? 'Add tags… | إضافة وسوم…' : ''}
            disabled={disabled}
          />
        </div>
      )}
    </FieldShell>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   17. CHIP SELECTOR
───────────────────────────────────────────────────────────────────────────── */
export function UosChipSelector({
  label,
  options,
  value,
  onChange,
  multiple = false,
  error,
}: {
  label: BilingualValue;
  options: Array<{ id: string; label: BilingualValue }>;
  value: string | string[];
  onChange: (val: any) => void;
  multiple?: boolean;
  error?: BilingualValue | null;
}) {
  const handleSelect = (id: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value : [];
      if (arr.includes(id)) {
        onChange(arr.filter((v) => v !== id));
      } else {
        onChange([...arr, id]);
      }
    } else {
      onChange(id);
    }
  };

  return (
    <div className="uos-chip-selector-group">
      <span className="uos-field-label">
        <BilingualText value={label} />
      </span>
      <div className="uos-chip-selector-list">
        {options.map((opt) => {
          const isSelected = multiple
            ? Array.isArray(value) && value.includes(opt.id)
            : value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              className={`uos-choice-chip ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(opt.id)}
            >
              <BilingualText value={opt.label} />
            </button>
          );
        })}
      </div>
      {error && (
        <span role="alert" className="uos-field-error">
          <AlertCircle size={13} aria-hidden="true" />
          <BilingualText value={error} />
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   18. FORM SECTION SYSTEM (00.3)
───────────────────────────────────────────────────────────────────────────── */
export type SectionStatus = 'complete' | 'in-progress' | 'optional' | 'error';

export function UosFormSection({
  title,
  icon,
  description,
  status,
  columns = 2,
  actions,
  children,
  className = '',
}: {
  title: BilingualValue;
  icon?: ReactNode;
  description?: BilingualValue;
  status?: SectionStatus;
  columns?: 1 | 2 | 3 | 4;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const statusLabels: Record<SectionStatus, BilingualValue> = {
    complete: bi('Completed', 'مكتمل'),
    'in-progress': bi('In Progress', 'قيد الإدخال'),
    optional: bi('Optional', 'اختياري'),
    error: bi('Needs Attention', 'يتطلب المراجعة'),
  };

  return (
    <section className={`uos-form-section uos-glass-1 ${className}`.trim()} aria-label={title.en}>
      <header className="uos-form-section-head">
        <div className="uos-form-section-title-wrap">
          {icon ? <span className="uos-form-section-icon" aria-hidden="true">{icon}</span> : null}
          <div>
            <div className="uos-form-section-title-row">
              <h2 className="uos-form-section-title">
                <BilingualText value={title} />
              </h2>
              {status && (
                <span className={`uos-section-status-badge status--${status}`}>
                  <BilingualText value={statusLabels[status]} />
                </span>
              )}
            </div>
            {description ? (
              <p className="uos-form-section-desc">
                <BilingualText value={description} />
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="uos-form-section-actions">{actions}</div> : null}
      </header>
      <div className={`uos-form-grid uos-grid--cols-${columns}`}>{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   19. STEPPER (00.4)
───────────────────────────────────────────────────────────────────────────── */
export type UosStepItem =
  | { title: BilingualValue; optional?: boolean; description?: BilingualValue }
  | BilingualValue;

export function UosSteps({
  steps,
  current,
  onStepClick,
}: {
  steps: UosStepItem[];
  current: number;
  onStepClick?: (stepIndex: number) => void;
}) {
  return (
    <nav className="uos-steps-container" aria-label="Workflow progress | تقدم الإجراء">
      <ol className="uos-steps" role="list">
        {steps.map((rawStep, index) => {
          const step = (typeof rawStep === 'object' && rawStep !== null && 'title' in rawStep)
            ? (rawStep as { title: BilingualValue; optional?: boolean })
            : { title: rawStep as BilingualValue, optional: false };
          const isDone = index < current;
          const isCurrent = index === current;
          const state = isDone ? 'done' : isCurrent ? 'current' : 'todo';
          const isClickable = onStepClick && isDone;

          return (
            <li
              key={typeof step.title === 'object' && 'en' in step.title ? step.title.en : index}
              className={`uos-step uos-step--${state} ${isClickable ? 'is-clickable' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => isClickable && onStepClick(index)}
            >
              <div className="uos-step-indicator">
                <span className="uos-step-dot" aria-hidden="true">
                  {isDone ? <Check size={14} /> : index + 1}
                </span>
                <div className="uos-step-connector" />
              </div>
              <div className="uos-step-label-group">
                <span className="uos-step-label">
                  <BilingualText value={step.title} />
                </span>
                {step.optional && (
                  <small className="uos-step-sublabel">
                    <BilingualText value={bi('Optional', 'اختياري')} />
                  </small>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   20. FORM ERROR SUMMARY (00.7)
───────────────────────────────────────────────────────────────────────────── */
export function UosFormErrorSummary({
  errors,
  title = bi('Please correct the following fields before proceeding', 'يرجى تصحيح الحقول التالية قبل المتابعة'),
}: {
  errors: Array<{ field?: string; message: BilingualValue }>;
  title?: BilingualValue;
}) {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="uos-error-summary uos-glass-3" role="alert">
      <div className="uos-error-summary-head">
        <AlertCircle size={18} className="uos-error-summary-icon" />
        <strong>
          <BilingualText value={title} />
        </strong>
      </div>
      <ul className="uos-error-summary-list">
        {errors.map((err, idx) => (
          <li key={idx}>
            <BilingualText value={err.message} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   21. REVIEW LIST (Summary step before saving)
───────────────────────────────────────────────────────────────────────────── */
export function UosReviewList({
  items,
}: {
  items: Array<{ label: BilingualValue; value: ReactNode }>;
}) {
  return (
    <dl className="uos-review-list">
      {items.map((item, idx) => (
        <div key={idx} className="uos-review-row">
          <dt className="uos-review-dt">
            <BilingualText value={item.label} />
          </dt>
          <dd className="uos-review-dd">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function uosFieldError(message: BilingualValue): BilingualValue {
  return message;
}

export const uosCommonHelpers = {
  phone: bi('Used for official SMS/WhatsApp notifications.', 'يُستخدم للإشعارات الرسمية عبر الرسائل أو الواتساب.'),
  email: bi('Used for account access and billing notices.', 'يُستخدم للوصول إلى الحساب وإشعارات الفواتير.'),
  address: bi('Specify official street and building info.', 'حدد معلومات الشارع والمبنى الرسمية.'),
  dob: bi('Athlete must meet age eligibility requirements.', 'يجب أن يستوفي الرياضي متطلبات الأهلية العمرية.'),
};
