import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  id?: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({
  label,
  id,
  options,
  placeholder,
  defaultValue,
  value,
  onChange,
  required = false,
  error,
  className = '',
  disabled = false
}: SelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value || defaultValue}
        onChange={handleChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100 ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-zinc-800'
        } ${disabled ? 'bg-gray-100 dark:bg-zinc-800 cursor-not-allowed' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
