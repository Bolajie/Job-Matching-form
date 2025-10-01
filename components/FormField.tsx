import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  required = false,
  placeholder,
  options = [],
}) => {
  const hasError = !!error;
  const inputBaseClasses = "w-full h-11 bg-slate-50 dark:bg-surface-dark border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-16px text-slate-800 dark:text-slate-200 placeholder-slate-400";
  const borderColor = hasError ? "border-danger focus:ring-danger" : "border-slate-300 dark:border-slate-600";
  const paddingClass = icon ? 'pl-11 pr-4' : 'px-4';

  const isSelect = type === 'select';

  const commonProps = {
    id: id,
    name: id,
    value: value,
    onChange: onChange,
    required: required,
    className: `${inputBaseClasses} ${borderColor} ${paddingClass}`,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? `${id}-error` : undefined,
  };

  return (
    <div>
      <label htmlFor={id} className="block text-14px font-semibold text-slate-600 dark:text-slate-300 mb-1">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {React.cloneElement(icon as React.ReactElement<{ className: string }>, { className: "h-5 w-5" })}
          </div>
        )}
        {isSelect ? (
            <select {...commonProps}>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input {...commonProps} type={type} placeholder={placeholder} />
        )}
      </div>
      {hasError && <p id={`${id}-error`} className="mt-1 text-12px text-danger">{error}</p>}
    </div>
  );
};
