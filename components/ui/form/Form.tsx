import React from "react";

interface FormProps {
  title?: string;
  desc?: string;
  cols?: 1 | 2;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export default function Form({ title, desc, cols = 2, children, onSubmit, className = "" }: FormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || desc) && (
        <div className="border-b border-gray-200 dark:border-zinc-800 pb-3">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>}
          {desc && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{desc}</p>}
        </div>
      )}
      <form
        onSubmit={onSubmit}
        className={`grid grid-cols-1 ${cols === 2 ? "md:grid-cols-2" : ""} gap-4`}
      >
        {children}
      </form>
    </div>
  );
}
