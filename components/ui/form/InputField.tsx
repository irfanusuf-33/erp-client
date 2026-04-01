import React from 'react';

interface InputFieldProps {
  label?: string;
  type?: string;
  id?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
}

export default function InputField({
  label,
  type = 'text',
  id,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  hint,
  className = '',
  disabled = false
}: InputFieldProps) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-xs text-gray-500 dark:text-zinc-400 mb-1">{hint}</p>}
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100 ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-zinc-800'
        } ${disabled ? 'bg-gray-100 dark:bg-zinc-800 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
