import React from 'react';

interface TextAreaProps {
  label?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export default function TextArea({
  label,
  id,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  rows = 4,
  className = '',
  disabled = false
}: TextAreaProps) {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:text-zinc-100 resize-none ${
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
