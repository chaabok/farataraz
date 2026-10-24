import React from 'react';

interface GroupFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function GroupField({ label, children, className = "" }: GroupFieldProps) {
  const hasPadding = className.includes('p-') || className.includes('px-') || className.includes('py-');
  return (
    <fieldset className={`relative border border-slate-300 dark:border-slate-700 rounded-lg ${hasPadding ? '' : 'p-4 pt-6'} ${className}`}>
      <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2 bg-transparent">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}
