/**
 * UOS premium field family (Mission 10X).
 * Field Section -> Field Card -> Field Control -> Feedback.
 * Native semantics preserved (labels, autocomplete, keyboard, RTL free).
 */
import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import type { BilingualText as BilingualValue } from '../../domain/contracts';

export interface FieldShellProps {
  label: BilingualValue;
  icon?: ReactNode;
  required?: boolean;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  disabled?: boolean;
  children: (inputId: string) => ReactNode;
}

export function FieldShell({ label, icon, required, helper, error, disabled, children }: FieldShellProps) {
  const inputId = useId();
  const describedBy = `${inputId}-meta`;
  return (
    <div className={`uos-field${disabled ? ' uos-field--disabled' : ''}${error ? ' uos-field--error' : ''}`}>
      <label htmlFor={inputId} className="uos-field-label">
        {icon ? <span className="uos-field-icon" aria-hidden="true">{icon}</span> : null}
        <BilingualText value={label} />
        {required ? <span className="uos-field-required" aria-hidden="true"> *</span> : null}
      </label>
      {children(inputId)}
      <div id={describedBy} className="uos-field-meta">
        {error ? (
          <span role="alert" className="uos-field-error"><BilingualText value={error} /></span>
        ) : helper ? (
          <span className="uos-field-helper"><BilingualText value={helper} /></span>
        ) : null}
      </div>
    </div>
  );
}

type TextProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
};

export function UosTextField({ label, icon, helper, error, required, disabled, ...props }: TextProps) {
  return (
    <FieldShell label={label} icon={icon} required={required} helper={helper} error={error} disabled={disabled}>
      {(inputId) => (
        <input
          id={inputId}
          className="uos-input uos-halo uos-touch"
          aria-invalid={Boolean(error)}
          aria-describedby={`${inputId}-meta`}
          aria-required={required}
          required={required}
          disabled={disabled}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function UosPasswordField({ label, icon, helper, error, required, disabled, autoComplete = 'current-password', ...props }: TextProps) {
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell label={label} icon={icon} required={required} helper={helper} error={error} disabled={disabled}>
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
            autoComplete={autoComplete}
            {...props}
          />
          <button
            type="button"
            className="uos-input-action uos-touch"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Hide password · إخفاء كلمة المرور' : 'Show password · إظهار كلمة المرور'}
            aria-pressed={visible}
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      )}
    </FieldShell>
  );
}

export function UosSearchField({ label, ...props }: TextProps) {
  return <UosTextField label={label} type="search" autoComplete="off" {...props} />;
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
  options: Array<{ value: string; label: BilingualValue }>;
  placeholder?: BilingualValue;
};

export function UosSelectField({ label, icon, helper, error, required, disabled, options, placeholder, ...props }: SelectProps) {
  return (
    <FieldShell label={label} icon={icon} required={required} helper={helper} error={error} disabled={disabled}>
      {(inputId) => (
        <select
          id={inputId}
          className="uos-input uos-halo uos-touch"
          aria-invalid={Boolean(error)}
          aria-describedby={`${inputId}-meta`}
          aria-required={required}
          required={required}
          disabled={disabled}
          {...props}
        >
          {placeholder ? <option value="">{placeholder.en} · {placeholder.ar}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label.en} · {option.label.ar}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

type AreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: BilingualValue;
  icon?: ReactNode;
  helper?: BilingualValue;
  error?: BilingualValue | null;
};

export function UosTextAreaField({ label, icon, helper, error, required, disabled, ...props }: AreaProps) {
  return (
    <FieldShell label={label} icon={icon} required={required} helper={helper} error={error} disabled={disabled}>
      {(inputId) => (
        <textarea
          id={inputId}
          className="uos-input uos-halo uos-textarea"
          aria-invalid={Boolean(error)}
          aria-describedby={`${inputId}-meta`}
          aria-required={required}
          required={required}
          disabled={disabled}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function UosFormSection({ title, icon, description, children }: { title: BilingualValue; icon?: ReactNode; description?: BilingualValue; children: ReactNode }) {
  return (
    <section className="uos-form-section uos-glass-1" aria-label={title.en}>
      <header className="uos-form-section-head">
        {icon ? <span className="uos-form-section-icon" aria-hidden="true">{icon}</span> : null}
        <div>
          <h2 className="uos-form-section-title"><BilingualText value={title} /></h2>
          {description ? <p className="uos-form-section-desc"><BilingualText value={description} /></p> : null}
        </div>
      </header>
      <div className="uos-form-grid">{children}</div>
    </section>
  );
}

export function uosFieldError(message: BilingualValue): BilingualValue {
  return message;
}

/** Stepper for genuinely multi-step workflows (auth phone -> code, creation wizards). */
export function UosSteps({ steps, current }: { steps: BilingualValue[]; current: number }) {
  return (
    <ol className="uos-steps" aria-label="Progress | التقدم">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li
            key={step.en}
            className={`uos-step uos-step--${state}`}
            aria-current={index === current ? 'step' : undefined}
          >
            <span className="uos-step-dot" aria-hidden="true">{index + 1}</span>
            <span className="uos-step-label"><BilingualText value={step} /></span>
          </li>
        );
      })}
    </ol>
  );
}

export const uosCommonHelpers = {
  phone: bi('Used for account communication.', 'يُستخدم للتواصل المتعلق بالحساب.'),
  email: bi('Used for sign-in and important notices.', 'يُستخدم لتسجيل الدخول والإشعارات المهمة.'),
};
